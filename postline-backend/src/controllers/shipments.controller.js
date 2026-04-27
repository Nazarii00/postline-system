const {
  createShipment,
  getShipmentById,
  getShipmentByTracking,
  getShipmentsByClient,
  getShipmentsByDepartment,
  getCourierShipmentsForCurrentDepartment,
  getAllShipments,
  changeShipmentStatus,
  cancelShipment,
  getShipmentHistory,
  getRecentActivity
} = require("../repositories/shipments.repository");

const { findOrCreateUserByPhone, findUserById } = require("../repositories/users.repository");
const { getRouteByDepartments } = require("../repositories/routes.repository");
const { notifyShipmentStatusChange } = require("../services/notification.service");

const getOperatorDepartmentId = async (operatorId) => {
  const operator = await findUserById(operatorId);
  return operator?.department_id ? Number(operator.department_id) : null;
};

// Оператор реєструє відправлення
const createShipmentHandler = async (req, res, next) => {
  try {
    const {
      senderPhone, senderName, originDeptId,
      receiverPhone, receiverName, destDeptId,
      tariffId, shipmentType, sizeCategory,
      weightKg, lengthCm, widthCm, heightCm,
      declaredValue, description, isCourier, receiverAddress,
    } = req.body;

    const operatorDepartmentId = req.user.role === "operator"
      ? await getOperatorDepartmentId(req.user.sub)
      : null;
    const effectiveOriginDeptId =
      req.user.role === "operator" ? operatorDepartmentId : Number(originDeptId);
    const destinationDeptId = Number(destDeptId);

    if (!effectiveOriginDeptId) {
      return res.status(400).json({ message: "Оператору не призначено відділення" });
    }

    if (req.user.role === "operator" && Number(originDeptId) !== effectiveOriginDeptId) {
      return res.status(403).json({ message: "Оператор може створювати відправлення тільки зі свого відділення" });
    }

    const route = effectiveOriginDeptId === destinationDeptId
      ? null
      : await getRouteByDepartments(effectiveOriginDeptId, destinationDeptId);

    if (effectiveOriginDeptId !== destinationDeptId && !route) {
      return res.status(400).json({ message: "Для цих відділень не призначено маршрут" });
    }

    if (isCourier && !receiverAddress?.trim()) {
      return res.status(400).json({ message: "Адреса доставки є обов'язковою для кур'єрської доставки" });
    }

    // Знаходимо або створюємо відправника і одержувача
    const [sender, receiver] = await Promise.all([
      findOrCreateUserByPhone({ phone: senderPhone, fullName: senderName }),
      findOrCreateUserByPhone({ phone: receiverPhone, fullName: receiverName }),
    ]);

    const shipment = await createShipment({
      senderId: sender.id,
      receiverId: receiver.id,
      originDeptId: effectiveOriginDeptId,
      destDeptId: destinationDeptId,
      tariffId,
      routeId: route?.id || null,
      shipmentType, sizeCategory,
      weightKg, lengthCm, widthCm, heightCm,
      declaredValue, description,
      senderAddress: sender.full_name,
      receiverAddress: receiverAddress?.trim() || receiver.full_name,
      isCourier: isCourier || false,
    });

    return res.status(201).json({ data: shipment, message: 'Відправлення успішно зареєстровано' });
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
    const history = await getShipmentHistory(shipment.id);
    return res.status(200).json({ data: { shipment, history } });
  } catch (error) {
    return next(error);
  }
};

const listShipmentsHandler = async (req, res, next) => {
  try {
    const {
      courierOnly,
      departmentId,
      status,
      trackingNumber,
      clientName,
      dateFrom,
      dateTo,
      search,
      sortBy,
      sortOrder,
    } = req.query;
    const { role, sub } = req.user;
    const shipmentFilters = {
      status: status === 'all' ? null : status,
      trackingNumber,
      clientName,
      dateFrom,
      dateTo,
      search,
      sortBy,
      sortOrder,
    };

    let shipments;

    if (role === 'client') {
      shipments = await getShipmentsByClient(sub, shipmentFilters);
    } else if (role === 'operator') {
      const operatorDeptId = await getOperatorDepartmentId(sub);
      if (!operatorDeptId) {
        return res.status(400).json({ message: "Оператору не призначено відділення" });
      }

      shipments = courierOnly === 'true'
        ? await getCourierShipmentsForCurrentDepartment(operatorDeptId, { trackingNumber })
        : await getShipmentsByDepartment(operatorDeptId, shipmentFilters);
    } else if (role === 'courier') {
      shipments = [];
    } else {
      // admin
      shipments = await getAllShipments({ departmentId, ...shipmentFilters });
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

    const shipment = await getShipmentById(id);
    if (!shipment) {
      return res.status(404).json({ message: "Відправлення не знайдено" });
    }

    const departmentId = req.user.role === "operator"
      ? await getOperatorDepartmentId(req.user.sub)
      : req.user.departmentId || shipment.current_dept_id;

    if (!departmentId) {
      return res.status(400).json({ message: "Оператору не призначено відділення" });
    }

    // Перевірка що відправлення належить відділенню оператора (Req7)
    if (req.user.role === 'operator' && shipment.current_dept_id !== departmentId) {
      return res.status(403).json({ message: "Відправлення не належить вашому відділенню" });
    }

    const updated = await changeShipmentStatus(id, { status, operatorId, departmentId, notes });
    await notifyShipmentStatusChange(updated);

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

const getActivityHandler = async (req, res, next) => {
  try {
    const rows = await getRecentActivity(); // ← напряму, не через shipmentRepository
    res.json({ data: rows });
  } catch (error) {
    next(error);
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
  getActivityHandler,
};
