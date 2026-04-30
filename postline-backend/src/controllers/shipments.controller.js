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
const { getRouteByDepartments, getRouteStops } = require("../repositories/routes.repository");
const { listCourierDeliveries } = require("../repositories/courier.repository");

const getOperatorDepartmentId = async (operatorId) => {
  const operator = await findUserById(operatorId);
  return operator?.department_id ? Number(operator.department_id) : null;
};

const terminalStatuses = new Set(["delivered", "returned", "cancelled"]);

const normalizeDepartmentId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const formatDepartmentPoint = (point) =>
  [point?.city, point?.address].filter(Boolean).join(", ");

const appendPoint = (points, point) => {
  const id = normalizeDepartmentId(point?.id);
  if (!id || points.some((existing) => existing.id === id)) return;

  points.push({
    id,
    city: point.city || null,
    address: point.address || null,
  });
};

const getShipmentRoutePoints = async (shipment) => {
  const points = [];
  appendPoint(points, {
    id: shipment.origin_dept_id,
    city: shipment.origin_city,
    address: shipment.origin_address,
  });

  if (shipment.route_id) {
    const routeStops = await getRouteStops(shipment.route_id);
    for (const stop of routeStops) {
      appendPoint(points, {
        id: stop.id,
        city: stop.city,
        address: stop.address,
      });
    }
  }

  appendPoint(points, {
    id: shipment.dest_dept_id,
    city: shipment.dest_city,
    address: shipment.dest_address,
  });

  return points;
};

const getRouteProgress = async (shipment) => {
  const points = await getShipmentRoutePoints(shipment);
  const currentDeptId = normalizeDepartmentId(shipment.current_dept_id)
    || normalizeDepartmentId(shipment.origin_dept_id);
  const currentIndex = Math.max(
    0,
    points.findIndex((point) => point.id === currentDeptId)
  );
  const currentPoint = points[currentIndex] || points[0] || null;
  const nextPoint = points[currentIndex + 1] || null;
  const destinationId = normalizeDepartmentId(shipment.dest_dept_id);

  return {
    points,
    currentPoint,
    nextPoint,
    currentDeptId,
    destinationId,
    isAtDestination: Boolean(currentDeptId && destinationId && currentDeptId === destinationId),
  };
};

const mergeNotes = (...parts) =>
  parts
    .map((part) => (typeof part === "string" ? part.trim() : ""))
    .filter(Boolean)
    .join(" ");

const buildStatusTransitionPlan = async (shipment, nextStatus, rawNotes) => {
  if (terminalStatuses.has(shipment.status)) {
    return { allowed: false, message: "Фінальний статус відправлення вже встановлено" };
  }

  const progress = await getRouteProgress(shipment);
  const currentDeptId = progress.currentDeptId;
  const currentPoint = progress.currentPoint;
  const nextPoint = progress.nextPoint;
  const destinationId = progress.destinationId;

  const plan = ({
    status = nextStatus,
    requiredDepartmentId = currentDeptId,
    currentDepartmentId = currentDeptId,
    eventDepartmentId = currentDeptId,
    notes = rawNotes,
    extraEvents = [],
  }) => ({
    allowed: true,
    status,
    requiredDepartmentId,
    currentDepartmentId,
    eventDepartmentId,
    notes,
    extraEvents,
  });

  if (nextStatus === "returned" && ["sorting", "in_transit", "arrived", "ready_for_pickup"].includes(shipment.status)) {
    return plan({
      currentDepartmentId: currentDeptId,
      eventDepartmentId: currentDeptId,
      notes: mergeNotes("Відправлення повертається.", rawNotes),
    });
  }

  if (shipment.status === "accepted" && nextStatus === "sorting") {
    return plan({
      notes: mergeNotes("Відправлення передано на сортування.", rawNotes),
    });
  }

  if (shipment.status === "sorting" && nextStatus === "in_transit") {
    const targetPoint = nextPoint || currentPoint;
    return plan({
      requiredDepartmentId: currentDeptId,
      currentDepartmentId: targetPoint?.id || currentDeptId,
      eventDepartmentId: currentDeptId,
      notes: mergeNotes(
        targetPoint && targetPoint.id !== currentDeptId
          ? `Відправлення прямує до наступної точки маршруту: ${formatDepartmentPoint(targetPoint)}.`
          : "Відправлення передано до міжміського транспортування.",
        rawNotes
      ),
    });
  }

  if (shipment.status === "in_transit" && nextStatus === "in_transit") {
    if (progress.isAtDestination) {
      return {
        allowed: false,
        message: "Відправлення вже у кінцевому відділенні. Наступний статус має бути arrived",
      };
    }

    if (!nextPoint) {
      return {
        allowed: false,
        message: "Для відправлення не знайдено наступну точку маршруту",
      };
    }

    return plan({
      requiredDepartmentId: currentDeptId,
      currentDepartmentId: nextPoint.id,
      eventDepartmentId: currentDeptId,
      extraEvents: [
        {
          status: "sorting",
          departmentId: currentDeptId,
          notes: mergeNotes(
            `Відправлення оброблено у проміжному відділенні: ${formatDepartmentPoint(currentPoint)}.`,
            rawNotes
          ),
        },
      ],
      notes: mergeNotes(
        `Після транзитної обробки відправлення прямує до наступної точки маршруту: ${formatDepartmentPoint(nextPoint)}.`,
        rawNotes
      ),
    });
  }

  if (shipment.status === "in_transit" && nextStatus === "arrived") {
    if (!progress.isAtDestination) {
      return {
        allowed: false,
        message: "Відправлення ще не досягло кінцевого відділення. Спочатку обробіть проміжну точку маршруту",
      };
    }

    return plan({
      requiredDepartmentId: destinationId,
      currentDepartmentId: destinationId,
      eventDepartmentId: destinationId,
      notes: mergeNotes("Відправлення прибуло до кінцевого відділення.", rawNotes),
    });
  }

  if (shipment.status === "arrived" && nextStatus === "ready_for_pickup") {
    return plan({
      requiredDepartmentId: destinationId,
      currentDepartmentId: destinationId,
      eventDepartmentId: destinationId,
      notes: mergeNotes("Відправлення готове до видачі отримувачу.", rawNotes),
    });
  }

  if (shipment.status === "ready_for_pickup" && nextStatus === "delivered") {
    return plan({
      requiredDepartmentId: destinationId,
      currentDepartmentId: destinationId,
      eventDepartmentId: destinationId,
      notes: mergeNotes("Відправлення видано отримувачу.", rawNotes),
    });
  }

  return {
    allowed: false,
    message: `Недопустимий перехід статусу: ${shipment.status} -> ${nextStatus}`,
  };
};

const canDepartmentAccessShipment = (departmentId, shipment) =>
  Number(shipment.current_dept_id) === Number(departmentId);

const canAccessShipment = async (user, shipment) => {
  if (!user || !shipment) return false;

  if (user.role === "admin") return true;

  if (user.role === "client") {
    return Number(shipment.sender_id) === Number(user.sub)
      || Number(shipment.receiver_id) === Number(user.sub);
  }

  if (user.role === "operator") {
    const operatorDepartmentId = await getOperatorDepartmentId(user.sub);
    return Boolean(operatorDepartmentId)
      && canDepartmentAccessShipment(operatorDepartmentId, shipment);
  }

  if (user.role === "courier") {
    const courier = await findUserById(user.sub);
    const courierDepartmentId = courier?.department_id ? Number(courier.department_id) : null;
    if (!courierDepartmentId) return false;

    const deliveries = await listCourierDeliveries({
      shipmentId: Number(shipment.id),
      courierId: Number(user.sub),
      courierDepartmentId,
    });
    return deliveries.length > 0;
  }

  return false;
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
      senderAddress: null,
      receiverAddress: isCourier ? receiverAddress.trim() : null,
      operatorId: req.user.sub,
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

    if (!(await canAccessShipment(req.user, shipment))) {
      return res.status(403).json({ message: "Немає прав для перегляду цього відправлення" });
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

    const actorDepartmentId = req.user.role === "operator"
      ? await getOperatorDepartmentId(req.user.sub)
      : req.user.departmentId || null;

    const transitionPlan = await buildStatusTransitionPlan(shipment, status, notes);
    if (!transitionPlan.allowed) {
      return res.status(400).json({ message: transitionPlan.message });
    }

    if (req.user.role === "operator" && !actorDepartmentId) {
      return res.status(400).json({ message: "Оператору не призначено відділення" });
    }

    // Перевірка що відправлення належить відділенню оператора (Req7)
    if (
      req.user.role === 'operator'
      && Number(actorDepartmentId) !== Number(transitionPlan.requiredDepartmentId)
    ) {
      return res.status(403).json({ message: "Відправлення не належить вашому відділенню" });
    }

    const updated = await changeShipmentStatus(id, {
      status: transitionPlan.status,
      operatorId,
      departmentId: transitionPlan.currentDepartmentId,
      currentDeptId: transitionPlan.currentDepartmentId,
      eventDepartmentId: transitionPlan.eventDepartmentId,
      notes: transitionPlan.notes,
      extraEvents: transitionPlan.extraEvents,
    });

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

    if (req.user.role === 'client' && Number(shipment.sender_id) !== Number(req.user.sub)) {
      return res.status(403).json({ message: "Скасувати може тільки відправник" });
    }

    const updated = await cancelShipment(id, {
      operatorId: req.user.sub,
      departmentId: shipment.current_dept_id,
    });
    return res.status(200).json({ data: updated, message: "Відправлення скасовано" });
  } catch (error) {
    return next(error);
  }
};

const getShipmentHistoryHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    const shipment = await getShipmentById(id);
    if (!shipment) {
      return res.status(404).json({ message: "Відправлення не знайдено" });
    }

    if (!(await canAccessShipment(req.user, shipment))) {
      return res.status(403).json({ message: "Немає прав для перегляду історії цього відправлення" });
    }

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
