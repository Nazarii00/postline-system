const db = require('../db');

const staffSelect = `id, full_name, email, phone, department_id, role, created_at, deleted_at`;
const staffListSelect = `
  u.id,
  u.full_name,
  u.email,
  u.phone,
  u.department_id,
  u.role,
  u.created_at,
  u.deleted_at,
  d.city AS department_city,
  d.address AS department_address
`;

const createOperator = ({ fullName, email, phone, departmentId, role, passwordHash }) =>
  db.one(
    `INSERT INTO users (full_name, email, phone, department_id, role, password_hash)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${staffSelect}`,
    [fullName, email, phone, departmentId, role || 'operator', passwordHash]
  );

const getUserById = (id) =>
  db.one(
    `SELECT ${staffListSelect}
     FROM users u
     LEFT JOIN departments d ON d.id = u.department_id
     WHERE u.id = $1`,
    [id]
  );

const getUserByEmail = (email) =>
  db.one(
    `SELECT ${staffListSelect}
     FROM users u
     LEFT JOIN departments d ON d.id = u.department_id
     WHERE u.email = $1`,
    [email]
  );

const getAllOperators = (includeInactive = false) =>
  db.many(
    `SELECT ${staffListSelect}
     FROM users u
     LEFT JOIN departments d ON d.id = u.department_id
     WHERE u.role IN ('operator', 'courier') ${includeInactive ? '' : 'AND u.deleted_at IS NULL'}
     ORDER BY u.deleted_at NULLS FIRST, u.full_name ASC`
  );

const getOperatorsByDepartment = (departmentId, includeInactive = false) =>
  db.many(
    `SELECT ${staffListSelect}
     FROM users u
     LEFT JOIN departments d ON d.id = u.department_id
     WHERE u.department_id = $1 AND u.role IN ('operator', 'courier') ${includeInactive ? '' : 'AND u.deleted_at IS NULL'}
     ORDER BY u.deleted_at NULLS FIRST, u.full_name ASC`,
    [departmentId]
  );

const updateOperator = (id, { fullName, phone, departmentId, role }) =>
  db.one(
    `UPDATE users
     SET full_name     = COALESCE($2, full_name),
         phone         = COALESCE($3, phone),
         department_id = COALESCE($4, department_id),
         role          = COALESCE($5, role)
     WHERE id = $1 AND role IN ('operator', 'courier')
     RETURNING ${staffSelect}`,
    [id, fullName, phone, departmentId, role]
  );

const setOperatorStatus = (id, isActive) =>
  db.one(
    `UPDATE users
     SET deleted_at = CASE WHEN $2::boolean THEN NULL ELSE COALESCE(deleted_at, NOW()) END
     WHERE id = $1 AND role IN ('operator', 'courier')
     RETURNING ${staffSelect}`,
    [id, isActive]
  );

// deleted_at замість DELETE (Req21)
const deactivateOperator = (id) =>
  setOperatorStatus(id, false);

module.exports = {
  createOperator,
  getUserById,
  getUserByEmail,
  getAllOperators,
  getOperatorsByDepartment,
  updateOperator,
  setOperatorStatus,
  deactivateOperator,
};
