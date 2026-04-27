const {
  createCourierDelivery,
  getCourierDeliveryById,
  listCourierDeliveries,
  updateCourierDeliveryStatus,
} = require("../repositories/courier.repository");

const createCourierDeliveryHandler = async (req, res, next) => {
  try {
    const { shipmentId, courierId, toAddress, notes } = req.body;
    const operatorId = req.user.sub;

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
    return res.status(200).json({ data: delivery });
  } catch (error) {
    return next(error);
  }
};

const listCourierDeliveriesHandler = async (req, res, next) => {
  try {
    const { shipmentId, courierId, status } = req.query;
    const effectiveCourierId = req.user.role === "courier" ? req.user.sub : courierId;

    const deliveries = await listCourierDeliveries({
      shipmentId: shipmentId ? Number(shipmentId) : null,
      courierId: effectiveCourierId ? Number(effectiveCourierId) : null,
      status: status || null,
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

    if (req.user.role === "courier" && delivery.courier_id !== req.user.sub) {
      return res.status(403).json({ message: "Немає прав для оновлення цієї доставки" });
    }

    const updated = await updateCourierDeliveryStatus(id, { status, failureReason, notes });
    return res.status(200).json({
      data: updated,
      message: "Статус доставки оновлено",
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
