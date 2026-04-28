const {
  createCourierDelivery,
  getCourierDeliveryById,
  listCourierDeliveries,
  updateCourierDeliveryStatus,
} = require("../repositories/courier.repository");
const { getShipmentById } = require("../repositories/shipments.repository");
const { findUserById } = require("../repositories/users.repository");
const { getDepartmentById } = require("../repositories/departments.repository");

const allowedCourierStatusTransitions = {
  assigned: ["delivered", "failed"],
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

    const deliveries = await listCourierDeliveries({
      shipmentId: shipmentId ? Number(shipmentId) : null,
      courierId: effectiveCourierId ? Number(effectiveCourierId) : null,
      status: status || null,
      departmentId,
      courierDepartmentId,
    });

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

    const allowedStatuses = allowedCourierStatusTransitions[delivery.status] || [];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: `Недопустима зміна статусу кур'єрської доставки: ${delivery.status} -> ${status}`,
      });
    }

    const shipment = await getShipmentById(delivery.shipment_id);
    if (
      !shipment
      || shipment.status !== "ready_for_pickup"
      || Number(shipment.current_dept_id) !== Number(shipment.dest_dept_id)
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
