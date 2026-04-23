const db = require('../db');

const createOperator = ({ fullName, email, phone, departmentId, role, passwordHash }) =>
  db.one(
    `INSERT INTO users (full_name, email, phone, department_id, role, password_hash)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, full_name, email, phone, department_id, role, created_at`,
    [fullName, email, phone, departmentId, role || 'operator', passwordHash]
  );

const getUserById = (id) =>
  db.one(
    `SELECT id, full_name, email, phone, department_id, role, created_at, deleted_at
     FROM users WHERE id = $1`,
    [id]
  );

const getUserByEmail = (email) =>
  db.one(
    `SELECT id, full_name, email, phone, department_id, role, created_at, deleted_at
     FROM users WHERE email = $1`,
    [email]
  );

const getAllOperators = () =>
  db.many(
    `SELECT id, full_name, email, phone, department_id, role, created_at
     FROM users
     WHERE role IN ('operator', 'courier') AND deleted_at IS NULL
     ORDER BY full_name ASC`
  );

const getOperatorsByDepartment = (departmentId) =>
  db.many(
    `SELECT id, full_name, email, phone, department_id, role, created_at
     FROM users
     WHERE department_id = $1 AND role IN ('operator', 'courier') AND deleted_at IS NULL
     ORDER BY full_name ASC`,
    [departmentId]
  );

const updateOperator = (id, { fullName, phone, departmentId }) =>
  db.one(
    `UPDATE users
     SET full_name     = COALESCE($2, full_name),
         phone         = COALESCE($3, phone),
         department_id = COALESCE($4, department_id)
     WHERE id = $1 AND deleted_at IS NULL
     RETURNING id, full_name, email, phone, department_id, role, created_at`,
    [id, fullName, phone, departmentId]
  );

// deleted_at замість DELETE (Req21)
const deactivateOperator = (id) =>
  db.run(
    'UPDATE users SET deleted_at = NOW() WHERE id = $1',
    [id]
  );

module.exports = {
  createOperator,
  getUserById,
  getUserByEmail,
  getAllOperators,
  getOperatorsByDepartment,
  updateOperator,
  deactivateOperator,
};