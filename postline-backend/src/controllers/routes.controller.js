const {
  createRoute,
  getRouteById,
  getAllRoutes,
  getRouteByDepartments,
  updateRoute,
  deleteRoute,
  getRouteStops,
} = require("../repositories/routes.repository");
const { getDepartmentById } = require("../repositories/departments.repository");
const { geocodeAddress, calculateOrderedRouteMetrics } = require("../services/maps.service");

const roundKm = (meters) =>
  Number((Number(meters || 0) / 1000).toFixed(1));

const roundHours = (seconds) =>
  Number((Number(seconds || 0) / 3600).toFixed(2));

const formatDepartmentAddress = (department) =>
  [department.city, department.address].filter(Boolean).join(", ");

const loadRouteDepartments = async ({ startDeptId, endDeptId, stops = [] }) => {
  const stopDepartmentIds = stops
    .map((stop) => Number(stop.departmentId))
    .filter((id) => Number.isInteger(id) && id > 0);
  const ids = [Number(startDeptId), ...stopDepartmentIds, Number(endDeptId)];
  const uniqueIds = new Set(ids);

  if (uniqueIds.size !== ids.length) {
    const error = new Error("Відділення маршруту не повинні дублюватися");
    error.status = 400;
    throw error;
  }

  const departments = await Promise.all(ids.map((id) => getDepartmentById(id)));
  const missingId = ids.find((id, index) => !departments[index]);
  if (missingId) {
    const error = new Error(`Відділення маршруту не знайдено: ${missingId}`);
    error.status = 400;
    throw error;
  }

  return {
    startDepartment: departments[0],
    stopDepartments: departments.slice(1, -1),
    endDepartment: departments[departments.length - 1],
  };
};

const calculateRoutePayload = async ({ startDeptId, endDeptId, stops = [] }) => {
  const { startDepartment, stopDepartments, endDepartment } = await loadRouteDepartments({
    startDeptId,
    endDeptId,
    stops,
  });

  const departmentsInOrder = [startDepartment, ...stopDepartments, endDepartment];
  const geocodedPoints = await Promise.all(
    departmentsInOrder.map((department) =>
      geocodeAddress(formatDepartmentAddress(department), { city: department.city })
    )
  );

  const metrics = await calculateOrderedRouteMetrics({ points: geocodedPoints });
  const segmentDistances = metrics.segmentDistancesMeters || [];
  const stopsWithMetrics = stops.map((stop, index) => ({
    departmentId: Number(stop.departmentId),
    distanceFromPrev: roundKm(segmentDistances[index]),
  }));

  return {
    distanceKm: roundKm(metrics.distanceMeters),
    estTimeHours: roundHours(metrics.durationSeconds),
    stops: stopsWithMetrics,
  };
};

const createRouteHandler = async (req, res, next) => {
  try {
    const { startDeptId, endDeptId, stops } = req.body;

    const existing = await getRouteByDepartments(startDeptId, endDeptId);
    if (existing) {
      return res.status(409).json({ message: "Маршрут між цими відділеннями вже існує" });
    }

    const calculated = await calculateRoutePayload({ startDeptId, endDeptId, stops: stops || [] });
    const route = await createRoute({ startDeptId, endDeptId, ...calculated });
    return res.status(201).json({ data: route, message: "Маршрут успішно створено" });
  } catch (error) {
    return next(error);
  }
};

const getRouteHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [route, stops] = await Promise.all([
      getRouteById(id),
      getRouteStops(id),
    ]);
    if (!route) {
      return res.status(404).json({ message: "Маршрут не знайдено" });
    }
    return res.status(200).json({ data: { ...route, stops } });
  } catch (error) {
    return next(error);
  }
};

const listRoutesHandler = async (req, res, next) => {
  try {
    const routes = await getAllRoutes();
    return res.status(200).json({ data: routes });
  } catch (error) {
    return next(error);
  }
};

const updateRouteHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { distanceKm, estTimeHours } = req.body;

    const route = await getRouteById(id);
    if (!route) {
      return res.status(404).json({ message: "Маршрут не знайдено" });
    }

    const updated = await updateRoute(id, { distanceKm, estTimeHours });
    return res.status(200).json({ data: updated, message: "Маршрут успішно оновлено" });
  } catch (error) {
    return next(error);
  }
};

const deleteRouteHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const route = await getRouteById(id);
    if (!route) {
      return res.status(404).json({ message: "Маршрут не знайдено" });
    }

    const updated = await deleteRoute(id);
    return res.status(200).json({ data: updated, message: "Маршрут успішно деактивовано" });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createRouteHandler,
  getRouteHandler,
  listRoutesHandler,
  updateRouteHandler,
  deleteRouteHandler,
};
