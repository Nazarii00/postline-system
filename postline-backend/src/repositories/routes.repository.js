const db = require('../db');

const createRoute = ({ startDeptId, endDeptId, distanceKm, estTimeHours, stops }) =>
  db.tx(async (client) => {
    const { rows: [route] } = await client.query(
      `INSERT INTO routes (start_dept_id, end_dept_id, distance_km, est_time_hours)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [startDeptId, endDeptId, distanceKm || null, estTimeHours || null]
    );

    if (stops?.length) {
      for (let i = 0; i < stops.length; i++) {
        await client.query(
          `INSERT INTO route_stops (route_id, department_id, sequence_order, distance_from_prev_km)
           VALUES ($1, $2, $3, $4)`,
          [route.id, stops[i].departmentId, i + 1, stops[i].distanceFromPrev || null]
        );
      }
    }

    return route;
  });

const getRouteById = (id) =>
  db.one(
    `SELECT r.*,
            sd.city    AS start_city,
            sd.address AS start_address,
            ed.city    AS end_city,
            ed.address AS end_address
     FROM routes r
     JOIN departments sd ON sd.id = r.start_dept_id
     JOIN departments ed ON ed.id = r.end_dept_id
     WHERE r.id = $1 AND r.deleted_at IS NULL`,
    [id]
  );

const getRouteByDepartments = (startDeptId, endDeptId) =>
  db.one(
    `SELECT * FROM routes
     WHERE start_dept_id = $1 AND end_dept_id = $2 AND deleted_at IS NULL`,
    [startDeptId, endDeptId]
  );

const getAllRoutes = () =>
  db.many(
    `SELECT r.*,
            sd.city AS start_city,
            ed.city AS end_city
     FROM routes r
     JOIN departments sd ON sd.id = r.start_dept_id
     JOIN departments ed ON ed.id = r.end_dept_id
     WHERE r.deleted_at IS NULL
     ORDER BY sd.city, ed.city`
  );

const getRouteStops = (routeId) =>
  db.many(
    `SELECT rs.sequence_order, rs.distance_from_prev_km,
            d.id, d.city, d.address, d.type
     FROM route_stops rs
     JOIN departments d ON d.id = rs.department_id
     WHERE rs.route_id = $1
     ORDER BY rs.sequence_order ASC`,
    [routeId]
  );

const updateRoute = (id, { distanceKm, estTimeHours }) =>
  db.one(
    `UPDATE routes
     SET distance_km    = COALESCE($2, distance_km),
         est_time_hours = COALESCE($3, est_time_hours)
     WHERE id = $1 AND deleted_at IS NULL
     RETURNING *`,
    [id, distanceKm, estTimeHours]
  );

const deleteRoute = (id) =>
  db.run('UPDATE routes SET deleted_at = NOW() WHERE id = $1', [id]);

module.exports = {
  createRoute,
  getRouteById,
  getRouteByDepartments,
  getAllRoutes,
  getRouteStops,
  updateRoute,
  deleteRoute,
};