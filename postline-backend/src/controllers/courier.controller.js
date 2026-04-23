const {
  createCourierDelivery,
  getCourierDeliveryById,
  getCourierDeliveriesByShipment,
  getCourierDeliveriesByCourier,
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

    return res.status(201).json({ data: delivery, message: "Кур'єрська доставка успішно створена" });
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
    const { shipmentId, courierId } = req.query;

    let deliveries;
    if (shipmentId) {
      deliveries = await getCourierDeliveriesByShipment(shipmentId);
    } else if (courierId) {
      deliveries = await getCourierDeliveriesByCourier(courierId);
    } else {
      return res.status(400).json({ message: "Вкажіть shipmentId або courierId" });
    }

    return res.status(200).json({ data: deliveries });
  } catch (error) {
    return next(error);
  }
};

// Оператор вносить результат після повернення кур'єра
const updateCourierDeliveryStatusHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, failureReason, notes } = req.body;

    const delivery = await getCourierDeliveryById(id);
    if (!delivery) {
      return res.status(404).json({ message: "Кур'єрська доставка не знайдена" });
    }

    const updated = await updateCourierDeliveryStatus(id, { status, failureReason, notes });
    return res.status(200).json({ data: updated, message: "Статус доставки оновлено" });
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