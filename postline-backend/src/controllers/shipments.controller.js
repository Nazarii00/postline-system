const {
  createShipment,
  getShipmentById,
  getShipmentByTracking,
  getShipmentsByClient,
  getShipmentsByDepartment,
  getAllShipments,
  changeShipmentStatus,
  cancelShipment,
  getShipmentHistory,
} = require("../repositories/shipments.repository");

// Оператор реєструє відправлення
const createShipmentHandler = async (req, res, next) => {
  try {
    const {
      senderId, receiverId,
      originDeptId, destDeptId,
      tariffId, routeId,
      shipmentType, sizeCategory,
      weightKg, lengthCm, widthCm, heightCm,
      declaredValue, description,
      senderAddress, receiverAddress,
      isCourier,
    } = req.body;

    const shipment = await createShipment({
      senderId, receiverId,
      originDeptId, destDeptId,
      tariffId, routeId,
      shipmentType, sizeCategory,
      weightKg, lengthCm, widthCm, heightCm,
      declaredValue, description,
      senderAddress, receiverAddress,
      isCourier: isCourier || false,
    });

    return res.status(201).json({ data: shipment, message: "Відправлення успішно зареєстровано" });
  } catch (error) {
    return next(error);
  }
};

const getShipmentHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const shipment = await getShipmentById(id);
    if (!shipment) {
      return res.status(404).json({ message: "Відправлення не знайдено" });
    }
    return res.status(200).json({ data: shipment });
  } catch (error) {
    return next(error);
  }
};

// Публічне відстеження за трекінг-номером
const trackShipmentHandler = async (req, res, next) => {
  try {
    const { trackingNumber } = req.params;
    const shipment = await getShipmentByTracking(trackingNumber);
    if (!shipment) {
      return res.status(404).json({ message: "Відправлення не знайдено" });
    }
    return res.status(200).json({ data: shipment });
  } catch (error) {
    return next(error);
  }
};

const listShipmentsHandler = async (req, res, next) => {
  try {
    const { departmentId, status, trackingNumber } = req.query;
    const { role, sub, departmentId: operatorDeptId } = req.user;

    let shipments;

    if (role === 'client') {
      shipments = await getShipmentsByClient(sub);
    } else if (role === 'operator') {
      // Оператор бачить тільки відправлення свого відділення
      shipments = await getShipmentsByDepartment(operatorDeptId, { status, trackingNumber });
    } else {
      // admin
      shipments = await getAllShipments({ departmentId, status, trackingNumber });
    }

    return res.status(200).json({ data: shipments });
  } catch (error) {
    return next(error);
  }
};

// Оператор змінює статус відправлення
const changeStatusHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const operatorId = req.user.sub;
    const departmentId = req.user.departmentId;

    const shipment = await getShipmentById(id);
    if (!shipment) {
      return res.status(404).json({ message: "Відправлення не знайдено" });
    }

    // Перевірка що відправлення належить відділенню оператора (Req7)
    if (req.user.role === 'operator' && shipment.current_dept_id !== departmentId) {
      return res.status(403).json({ message: "Відправлення не належить вашому відділенню" });
    }

    const updated = await changeShipmentStatus(id, { status, operatorId, departmentId, notes });
    return res.status(200).json({ data: updated, message: "Статус успішно оновлено" });
  } catch (error) {
    // Тригер кине exception при недозволеному переході
    if (error.message?.includes('Недопустимий перехід статусу')) {
      return res.status(400).json({ message: error.message });
    }
    return next(error);
  }
};

// Клієнт скасовує відправлення (тільки зі статусу accepted)
const cancelShipmentHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const shipment = await getShipmentById(id);

    if (!shipment) {
      return res.status(404).json({ message: "Відправлення не знайдено" });
    }

    if (shipment.status !== 'accepted') {
      return res.status(400).json({ message: "Скасування можливе лише до початку сортування" });
    }

    const updated = await cancelShipment(id);
    return res.status(200).json({ data: updated, message: "Відправлення скасовано" });
  } catch (error) {
    return next(error);
  }
};

const getShipmentHistoryHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Опціонально: можна додати перевірку на існування самого відправлення
    // const shipment = await getShipmentById(id);
    // if (!shipment) return res.status(404).json({ message: "Відправлення не знайдено" });

    const history = await getShipmentHistory(id);
    
    return res.status(200).json({ data: history });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createShipmentHandler,
  getShipmentHandler,
  trackShipmentHandler,
  listShipmentsHandler,
  changeStatusHandler,
  cancelShipmentHandler,
  getShipmentHistoryHandler,
};