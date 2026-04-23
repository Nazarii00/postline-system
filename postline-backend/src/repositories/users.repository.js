const db = require('../db');

const findUserByEmail = (email) =>
  db.one('SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL', [email]);

const findUserById = (id) =>
  db.one('SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL', [id]);

const createUser = ({ fullName, phone, email, passwordHash }) =>
  db.one(
    `INSERT INTO users (full_name, phone, email, role, password_hash)
     VALUES ($1, $2, $3, 'client', $4)
     RETURNING *`,
    [fullName, phone, email, passwordHash]
  );

module.exports = { findUserByEmail, findUserById, createUser }; 