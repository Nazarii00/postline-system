const db = require("../db");
const {
  geocodeAddress,
  optimizeMultiStopRoute,
} = require("../services/maps.service");
const { assertMapboxQuotaAvailable } = require("../services/mapboxQuota.service");
const { findUserById } = require("../repositories/users.repository");

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const normalizeDeliveryIds = (deliveryIds) => {
  if (!Array.isArray(deliveryIds)) {
    throw createError(400, "deliveryIds має бути масивом");
  }

  if (deliveryIds.length < 2) {
    throw createError(400, "Оберіть щонайменше 2 доставки");
  }

  if (deliveryIds.length > 10) {
    throw createError(400, "Можна оптимізувати не більше 10 доставок за раз");
  }

  const normalized = deliveryIds.map((id) => Number(id));
  if (normalized.some((id) => !Number.isInteger(id) || id <= 0)) {
    throw createError(400, "deliveryIds має містити тільки числові ID");
  }

  if (new Set(normalized).size !== normalized.length) {
    throw createError(400, "deliveryIds не має містити дублікати");
  }

  return normalized;
};

const fetchCourierDeliveries = (deliveryIds) =>
  db.many(
    `SELECT cd.id,
            cd.courier_id,
            cd.shipment_id,
            cd.to_address,
            cd.status,
            s.tracking_number,
            s.current_dept_id,
            s.dest_dept_id
     FROM courier_deliveries cd
     JOIN shipments s ON s.id = cd.shipment_id
     WHERE cd.id = ANY($1::int[])`,
    [deliveryIds]
  );

const optimizeCourierDeliveriesRouteHandler = async (req, res, next) => {
  try {
    const courierId = Number(req.body.courierId);
    const startAddress = String(req.body.startAddress || "").trim();
    const deliveryIds = normalizeDeliveryIds(req.body.deliveryIds);

    if (!Number.isInteger(courierId) || courierId <= 0) {
      throw createError(400, "courierId є обов'язковим");
    }

    if (!startAddress) {
      throw createError(400, "startAddress є обов'язковим");
    }

    if (req.user.role === "courier" && Number(req.user.sub) !== courierId) {
      throw createError(403, "Кур'єр може оптимізувати тільки власний маршрут");
    }

    const rows = await fetchCourierDeliveries(deliveryIds);
    if (rows.length !== deliveryIds.length) {
      throw createError(404, "Не всі вибрані доставки знайдено");
    }

    const rowsById = new Map(rows.map((row) => [Number(row.id), row]));
    const deliveries = deliveryIds.map((id) => rowsById.get(id));

    if (deliveries.some((delivery) => Number(delivery.courier_id) !== courierId)) {
      throw createError(400, "Усі доставки мають належати вибраному кур'єру");
    }

    if (req.user.role === "operator") {
      const operator = await findUserById(req.user.sub);
      const operatorDepartmentId = operator?.department_id ? Number(operator.department_id) : null;

      if (!operatorDepartmentId) {
        throw createError(400, "Оператору не призначено відділення");
      }

      if (deliveries.some((delivery) =>
        Number(delivery.current_dept_id) !== operatorDepartmentId
        || Number(delivery.dest_dept_id) !== operatorDepartmentId
      )) {
        throw createError(403, "Маршрут можна формувати тільки для доставок свого відділення");
      }
    }

    if (deliveries.some((delivery) => delivery.status !== "assigned")) {
      throw createError(400, "Оптимізувати можна тільки доставки зі статусом assigned");
    }

    await assertMapboxQuotaAvailable(deliveries.length + 2);

    const start = await geocodeAddress(startAddress);
    const stops = await Promise.all(
      deliveries.map(async (delivery) => ({
        delivery,
        geocoded: await geocodeAddress(delivery.to_address),
      }))
    );

    const optimizedRoute = await optimizeMultiStopRoute({
      startPoint: { lat: start.lat, lng: start.lng },
      stops: stops.map((stop) => ({ lat: stop.geocoded.lat, lng: stop.geocoded.lng })),
    });

    const orderedDeliveries = optimizedRoute.waypoints
      .map((waypoint, inputIndex) => ({ waypoint, inputIndex }))
      .filter(({ inputIndex }) => inputIndex > 0)
      .sort((left, right) => {
        const leftIndex = Number(left.waypoint.waypoint_index ?? left.inputIndex);
        const rightIndex = Number(right.waypoint.waypoint_index ?? right.inputIndex);
        return leftIndex - rightIndex;
      })
      .map(({ inputIndex }, index) => {
        const stop = stops[inputIndex - 1];
        return {
          order: index + 1,
          id: stop.delivery.id,
          shipmentId: stop.delivery.shipment_id,
          trackingNumber: stop.delivery.tracking_number,
          toAddress: stop.delivery.to_address,
          resolvedAddress: stop.geocoded.resolvedAddress,
          lat: stop.geocoded.lat,
          lng: stop.geocoded.lng,
        };
      });

    return res.status(200).json({
      data: {
        start: {
          address: start.resolvedAddress,
          lat: start.lat,
          lng: start.lng,
        },
        distanceMeters: optimizedRoute.distanceMeters,
        durationSeconds: optimizedRoute.durationSeconds,
        geometry: optimizedRoute.geometry,
        orderedDeliveries,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  optimizeCourierDeliveriesRouteHandler,
};
