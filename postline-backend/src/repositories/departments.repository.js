const db = require('../db');

const createDepartment = ({ city, address, type, phone, openingTime, closingTime }) =>
  db.one(
    `INSERT INTO departments (city, address, type, phone, opening_time, closing_time)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [city, address, type, phone || null, openingTime || null, closingTime || null]
  );

const getDepartmentById = (id) =>
  db.one('SELECT * FROM departments WHERE id = $1 AND deleted_at IS NULL', [id]);

const getAllDepartments = () =>
  db.many('SELECT * FROM departments WHERE deleted_at IS NULL ORDER BY city ASC');

const getDepartmentsByCity = (city) =>
  db.many(
    'SELECT * FROM departments WHERE city = $1 AND deleted_at IS NULL ORDER BY address ASC',
    [city]
  );

const updateDepartment = (id, { city, address, type, phone, openingTime, closingTime }) =>
  db.one(
    `UPDATE departments
     SET city         = COALESCE($2, city),
         address      = COALESCE($3, address),
         type         = COALESCE($4::department_type, type),
         phone        = COALESCE($5, phone),
         opening_time = COALESCE($6, opening_time),
         closing_time = COALESCE($7, closing_time)
     WHERE id = $1 AND deleted_at IS NULL
     RETURNING *`,
    [id, city, address, type, phone, openingTime, closingTime]
  );

const deleteDepartment = (id) =>
  db.one(
    `UPDATE departments
     SET deleted_at = COALESCE(deleted_at, NOW())
     WHERE id = $1
     RETURNING *`,
    [id]
  );

module.exports = {
  createDepartment,
  getDepartmentById,
  getAllDepartments,
  getDepartmentsByCity,
  updateDepartment,
  deleteDepartment,
};
