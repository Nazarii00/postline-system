const {
  createRoute,
  getRouteById,
  getAllRoutes,
  getRouteByDepartments,
  updateRoute,
  deleteRoute,
  getRouteStops,
  setRouteStops,
} = require("../repositories/routes.repository");

const createRouteHandler = async (req, res, next) => {
  try {
    const { startDeptId, endDeptId, distanceKm, estTimeHours, stops } = req.body;

    const existing = await getRouteByDepartments(startDeptId, endDeptId);
    if (existing) {
      return res.status(409).json({ message: "Маршрут між цими відділеннями вже існує" });
    }

    const route = await createRoute({ startDeptId, endDeptId, distanceKm, estTimeHours, stops });
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
    const { distanceKm, estTimeHours, stops } = req.body;

    const route = await getRouteById(id);
    if (!route) {
      return res.status(404).json({ message: "Маршрут не знайдено" });
    }

    const updated = await updateRoute(id, { distanceKm, estTimeHours, stops });
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
