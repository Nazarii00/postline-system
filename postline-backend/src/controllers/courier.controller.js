const {
  createCourierDelivery,
  getCourierDeliveryById,
  hasBlockingCourierDelivery,
  listCourierDeliveries,
  updateCourierDeliveryStatus,
} = require("../repositories/courier.repository");
const {
  ROUTE_NOTE_MARKER,
  appendCourierRouteMeta,
  hasRouteMeta,
  listConfirmedRouteDeliveriesByRouteId,
  parseLegacyRouteNote,
} = require("../repositories/courierRoutes.repository");
const { getShipmentById } = require("../repositories/shipments.repository");
const { findUserById } = require("../repositories/users.repository");
const { getDepartmentById } = require("../repositories/departments.repository");
const { geocodeAddress } = require("../services/maps.service");

const allowedCourierStatusTransitions = {
  assigned: ["in_progress"],
  in_progress: ["delivered", "failed"],
  delivered: [],
  failed: [],
};

const getOperatorDepartmentId = async (operatorId) => {
  const operator = await findUserById(operatorId);
  return operator?.department_id ? Number(operator.department_id) : null;
};

const getUserDepartmentId = async (userId) => {
  const user = await findUserById(userId);
  return user?.department_id ? Number(user.department_id) : null;
};

const isDeliveryInOperatorDepartment = (delivery, departmentId) =>
  Number(delivery.current_dept_id) === Number(departmentId)
  && Number(delivery.dest_dept_id) === Number(departmentId);

const isDeliveryInCourierCity = (delivery) =>
  Boolean(delivery.courier_city)
  && Boolean(delivery.dest_city)
  && delivery.courier_city === delivery.dest_city;

const backfillConfirmedRouteMetadata = async (deliveries) => {
  const routeIds = new Set();

  for (const delivery of deliveries) {
    if (!delivery.notes?.includes(ROUTE_NOTE_MARKER) || hasRouteMeta(delivery.notes)) continue;

    const routeInfo = parseLegacyRouteNote(delivery.notes);
    if (routeInfo?.routeId) {
      routeIds.add(routeInfo.routeId);
    }
  }

  if (routeIds.size === 0) return false;

  for (const routeId of routeIds) {
    try {
      const routeDeliveries = await listConfirmedRouteDeliveriesByRouteId(routeId);
      const routeStops = routeDeliveries
        .map((delivery) => ({ delivery, routeInfo: parseLegacyRouteNote(delivery.notes) }))
        .filter((item) => item.routeInfo && !hasRouteMeta(item.delivery.notes))
        .sort((left, right) => left.routeInfo.order - right.routeInfo.order);

      if (routeStops.length === 0) continue;

      const routeInfo = routeStops[0].routeInfo;
      const routeCity = routeStops[0].delivery.dest_city || routeStops[0].delivery.courier_city || null;
      const start = await geocodeAddress(routeInfo.startAddress, { city: routeCity });
      const geocodedStops = await Promise.all(
        routeStops.map(async ({ delivery, routeInfo: stopRouteInfo }) => ({
          delivery,
          routeInfo: stopRouteInfo,
          geocoded: await geocodeAddress(delivery.to_address, { city: delivery.dest_city }),
        }))
      );

      const geometry = {
        type: "LineString",
        coordinates: [
          [start.lng, start.lat],
          ...geocodedStops.map(({ geocoded }) => [geocoded.lng, geocoded.lat]),
        ],
      };

      for (const { delivery, routeInfo: stopRouteInfo, geocoded } of geocodedStops) {
        await appendCourierRouteMeta({
          deliveryId: delivery.id,
          meta: {
            routeId,
            courierId: delivery.courier_id,
            operatorId: delivery.operator_id || null,
            startAddress: start.resolvedAddress || routeInfo.startAddress,
            distanceMeters: routeInfo.distanceMeters,
            durationSeconds: routeInfo.durationSeconds,
            confirmedAt: routeInfo.confirmedAt,
            geometry,
            stop: {
              deliveryId: delivery.id,
              order: stopRouteInfo.order,
              toAddress: delivery.to_address,
              resolvedAddress: geocoded.resolvedAddress,
              lat: geocoded.lat,
              lng: geocoded.lng,
            },
          },
        });
      }
    } catch (error) {
      console.warn(`Не вдалося відновити координати маршруту ${routeId}:`, error.message);
    }
  }

  return true;
};

const createCourierDeliveryHandler = async (req, res, next) => {
  try {
    const { shipmentId, courierId, toAddress, notes } = req.body;
    const operatorId = req.user.sub;

    const shipment = await getShipmentById(shipmentId);
    if (!shipment) {
      return res.status(404).json({ message: "Відправлення не знайдено" });
    }

    if (!shipment.is_courier) {
      return res.status(400).json({ message: "Це відправлення не оформлене як кур'єрська доставка" });
    }

    if (shipment.status !== "ready_for_pickup" || Number(shipment.current_dept_id) !== Number(shipment.dest_dept_id)) {
      return res.status(400).json({
        message: "Кур'єра можна призначити тільки після прибуття у кінцеве відділення та статусу ready_for_pickup",
      });
    }

    if (Number(shipment.failed_attempts || 0) >= 3) {
      return res.status(400).json({
        message: "Після трьох невдалих кур'єрських спроб відправлення доступне тільки для самовивозу",
      });
    }

    const blockingDelivery = await hasBlockingCourierDelivery(shipmentId);
    if (blockingDelivery) {
      return res.status(409).json({
        message: blockingDelivery.status === "delivered"
          ? "Відправлення вже було видане кур'єром"
          : "Для цього відправлення вже є активна кур'єрська доставка",
      });
    }

    if (req.user.role === "operator") {
      const operatorDepartmentId = await getOperatorDepartmentId(operatorId);
      if (!operatorDepartmentId || Number(operatorDepartmentId) !== Number(shipment.dest_dept_id)) {
        return res.status(403).json({ message: "Відправлення не належить кінцевому відділенню оператора" });
      }
    }

    const courier = await findUserById(courierId);
    if (!courier || courier.role !== "courier") {
      return res.status(400).json({ message: "Обраного кур'єра не знайдено" });
    }

    const courierDepartment = courier.department_id
      ? await getDepartmentById(courier.department_id)
      : null;
    if (!courierDepartment || courierDepartment.city !== shipment.dest_city) {
      return res.status(403).json({ message: "Кур'єр може доставляти тільки посилки свого міста" });
    }

    const delivery = await createCourierDelivery({
      shipmentId,
      courierId,
      operatorId,
      toAddress,
      notes,
    });

    return res.status(201).json({
      data: delivery,
      message: "Кур'єрська доставка успішно створена",
    });
  } catch (error) {
    return next(error);
  }
};

const getCourierDeliveryHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const delivery = await getCourierDeliveryById(id);
    if (!delivery) {
      return res.status(404).json({ message: "Кур'єрська доставка не знайдена" });
    }
    if (req.user.role === "operator") {
      const operatorDepartmentId = await getOperatorDepartmentId(req.user.sub);
      if (!operatorDepartmentId || !isDeliveryInOperatorDepartment(delivery, operatorDepartmentId)) {
        return res.status(403).json({ message: "Кур'єрська доставка не належить відділенню оператора" });
      }
    }
    if (
      req.user.role === "courier"
      && (
        Number(delivery.courier_id) !== Number(req.user.sub)
        || !isDeliveryInCourierCity(delivery)
      )
    ) {
      return res.status(403).json({ message: "Немає прав для перегляду цієї доставки" });
    }
    return res.status(200).json({ data: delivery });
  } catch (error) {
    return next(error);
  }
};

const listCourierDeliveriesHandler = async (req, res, next) => {
  try {
    const { shipmentId, courierId, status } = req.query;
    const effectiveCourierId = req.user.role === "courier" ? req.user.sub : courierId;
    const confirmedOnly = req.user.role === "courier"
      ? true
      : req.query.confirmedOnly === "true";
    const courierDepartmentId = req.user.role === "courier"
      ? await getUserDepartmentId(req.user.sub)
      : null;
    const departmentId = req.user.role === "operator"
      ? await getOperatorDepartmentId(req.user.sub)
      : null;

    if (req.user.role === "operator" && !departmentId) {
      return res.status(400).json({ message: "Оператору не призначено відділення" });
    }

    if (req.user.role === "courier" && !courierDepartmentId) {
      return res.status(400).json({ message: "Кур'єру не призначено відділення" });
    }

    let deliveries = await listCourierDeliveries({
      shipmentId: shipmentId ? Number(shipmentId) : null,
      courierId: effectiveCourierId ? Number(effectiveCourierId) : null,
      status: status || null,
      departmentId,
      courierDepartmentId,
      confirmedOnly,
    });

    if (req.user.role === "courier" && confirmedOnly) {
      const metadataBackfilled = await backfillConfirmedRouteMetadata(deliveries);
      if (metadataBackfilled) {
        deliveries = await listCourierDeliveries({
          shipmentId: shipmentId ? Number(shipmentId) : null,
          courierId: effectiveCourierId ? Number(effectiveCourierId) : null,
          status: status || null,
          departmentId,
          courierDepartmentId,
          confirmedOnly,
        });
      }
    }

    return res.status(200).json({ data: deliveries });
  } catch (error) {
    return next(error);
  }
};

const updateCourierDeliveryStatusHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, failureReason, notes } = req.body;

    const delivery = await getCourierDeliveryById(id);
    if (!delivery) {
      return res.status(404).json({ message: "Кур'єрська доставка не знайдена" });
    }

    if (req.user.role === "operator") {
      const operatorDepartmentId = await getOperatorDepartmentId(req.user.sub);
      if (!operatorDepartmentId || !isDeliveryInOperatorDepartment(delivery, operatorDepartmentId)) {
        return res.status(403).json({ message: "Кур'єрська доставка не належить відділенню оператора" });
      }
    }

    if (
      req.user.role === "courier"
      && (
        Number(delivery.courier_id) !== Number(req.user.sub)
        || !isDeliveryInCourierCity(delivery)
      )
    ) {
      return res.status(403).json({ message: "Немає прав для оновлення цієї доставки" });
    }

    const isCourierActor = req.user.role === "courier";
    const isOperatorActor = ["operator", "admin"].includes(req.user.role);

    if (isCourierActor && status !== "in_progress") {
      return res.status(403).json({
        message: "Кур'єр може лише позначити, що відвідав адресу. Результат доставки фіксує оператор.",
      });
    }

    if (isCourierActor && !delivery.notes?.includes(ROUTE_NOTE_MARKER)) {
      return res.status(400).json({
        message: "Кур'єр може відмічати тільки доставки з підтвердженого маршруту",
      });
    }

    if (isOperatorActor && status === "in_progress") {
      return res.status(403).json({
        message: "Позначку про відвідування адреси виконує кур'єр",
      });
    }

    if (isOperatorActor && delivery.status !== "in_progress") {
      return res.status(400).json({
        message: "Оператор може фіксувати результат тільки після позначки кур'єра про відвідування адреси",
      });
    }

    const allowedStatuses = allowedCourierStatusTransitions[delivery.status] || [];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: `Недопустима зміна статусу кур'єрської доставки: ${delivery.status} -> ${status}`,
      });
    }

    const shipment = await getShipmentById(delivery.shipment_id);
    if (!shipment) {
      return res.status(400).json({
        message: "Відправлення для кур'єрської доставки не знайдено",
      });
    }

    if (status === "in_progress" && ["delivered", "returned", "cancelled"].includes(shipment.status)) {
      return res.status(400).json({
        message: "Не можна позначити відвідування для завершеного або скасованого відправлення",
      });
    }

    if (
      status !== "in_progress"
      && (
        shipment.status !== "ready_for_pickup"
        || Number(shipment.current_dept_id) !== Number(shipment.dest_dept_id)
      )
    ) {
      return res.status(400).json({
        message: "Результат кур'єрської доставки можна вказати тільки після прибуття посилки у кінцеве відділення",
      });
    }

    const updated = await updateCourierDeliveryStatus(id, {
      status,
      failureReason,
      notes,
      actorId: req.user.sub,
    });
    if (!updated) {
      return res.status(404).json({ message: "Кур'єрська доставка не знайдена" });
    }

    return res.status(200).json({
      data: updated,
      message: updated.courierPickupFallback
        ? "Третя невдала спроба зафіксована, відправлення переведено у самовивіз"
        : "Статус доставки оновлено",
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createCourierDeliveryHandler,
  getCourierDeliveryHandler,
  listCourierDeliveriesHandler,
  updateCourierDeliveryStatusHandler,
};
