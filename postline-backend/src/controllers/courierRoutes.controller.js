const {
  ROUTE_NOTE_MARKER,
  fetchDeliveriesForRoute,
  createConfirmedCourierRoute,
} = require("../repositories/courierRoutes.repository");
const { findUserById } = require("../repositories/users.repository");

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const normalizeStops = (stops) => {
  if (!Array.isArray(stops) || stops.length < 1) {
    throw createError(400, "stops має містити щонайменше одну зупинку");
  }

  const normalized = stops.map((stop, index) => {
    const deliveryId = Number(stop.deliveryId ?? stop.id);
    const order = Number(stop.order ?? index + 1);
    const toAddress = String(stop.toAddress || "").trim();

    if (!Number.isInteger(deliveryId) || deliveryId <= 0) {
      throw createError(400, "Кожна зупинка має містити коректний deliveryId");
    }

    if (!Number.isInteger(order) || order <= 0) {
      throw createError(400, "Кожна зупинка має містити коректний order");
    }

    if (!toAddress) {
      throw createError(400, "Кожна зупинка має містити адресу доставки");
    }

    return {
      deliveryId,
      order,
      toAddress,
      resolvedAddress: stop.resolvedAddress ? String(stop.resolvedAddress).trim() : null,
      lat: stop.lat === undefined || stop.lat === null ? null : Number(stop.lat),
      lng: stop.lng === undefined || stop.lng === null ? null : Number(stop.lng),
    };
  });

  if (new Set(normalized.map((stop) => stop.deliveryId)).size !== normalized.length) {
    throw createError(400, "Зупинки не мають містити дублікати доставок");
  }

  if (new Set(normalized.map((stop) => stop.order)).size !== normalized.length) {
    throw createError(400, "Порядок зупинок не має містити дублікати");
  }

  return normalized.sort((left, right) => left.order - right.order);
};

const confirmCourierRouteHandler = async (req, res, next) => {
  try {
    const courierId = Number(req.body.courierId);
    const startAddress = String(req.body.startAddress || "").trim();
    const distanceMeters = req.body.distanceMeters ? Number(req.body.distanceMeters) : null;
    const durationSeconds = req.body.durationSeconds ? Number(req.body.durationSeconds) : null;
    const stops = normalizeStops(req.body.stops);

    if (!Number.isInteger(courierId) || courierId <= 0) {
      throw createError(400, "courierId є обов'язковим");
    }

    if (!startAddress) {
      throw createError(400, "startAddress є обов'язковим");
    }

    if (req.user.role === "courier" && Number(req.user.sub) !== courierId) {
      throw createError(403, "Кур'єр може підтвердити тільки власний маршрут");
    }

    const deliveries = await fetchDeliveriesForRoute(stops.map((stop) => stop.deliveryId));
    if (deliveries.length !== stops.length) {
      throw createError(404, "Не всі доставки маршруту знайдено");
    }

    const deliveriesById = new Map(deliveries.map((delivery) => [Number(delivery.id), delivery]));
    if (stops.some((stop) => !deliveriesById.has(stop.deliveryId))) {
      throw createError(404, "Маршрут містить невідому доставку");
    }

    if (deliveries.some((delivery) => Number(delivery.courier_id) !== courierId)) {
      throw createError(400, "Усі доставки мають належати одному кур'єру");
    }

    if (deliveries.some((delivery) => !delivery.courier_city || delivery.courier_city !== delivery.dest_city)) {
      throw createError(403, "Кур'єр може підтвердити маршрут тільки для посилок свого міста");
    }

    if (deliveries.some((delivery) => delivery.status !== "assigned")) {
      throw createError(400, "Підтвердити можна тільки доставки зі статусом assigned");
    }

    if (deliveries.some((delivery) => delivery.notes?.includes(ROUTE_NOTE_MARKER))) {
      throw createError(400, "Одна або кілька доставок уже мають підтверджений маршрут у примітках");
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
        throw createError(403, "Маршрут можна підтвердити тільки для доставок свого відділення");
      }
    }

    const route = await createConfirmedCourierRoute({
      courierId,
      operatorId: req.user.role === "courier" ? null : req.user.sub,
      startAddress,
      distanceMeters,
      durationSeconds,
      geometry: req.body.geometry || null,
      stops,
    });

    return res.status(201).json({
      data: route,
      message: "Маршрут підтверджено та зафіксовано",
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  confirmCourierRouteHandler,
};
