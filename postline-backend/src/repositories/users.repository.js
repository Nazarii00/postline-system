const db = require('../db');

const findUserByEmail = (email) =>
  db.oneOrNone('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);

const findUserByPhone = (phone) =>
  db.oneOrNone('SELECT * FROM users WHERE phone = $1', [phone]);

const findUserById = (id) =>
  db.oneOrNone('SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL', [id]);

const createUser = ({ fullName, phone, email, passwordHash }) =>
  db.one(
    `INSERT INTO users (full_name, phone, email, role, password_hash)
     VALUES ($1, $2, $3, 'client', $4)
     RETURNING *`,
    [fullName, phone, email, passwordHash]
  );

const activatePlaceholderClient = (id, { fullName, email, passwordHash }) =>
  db.oneOrNone(
    `UPDATE users
     SET full_name = $2,
         email = $3,
         password_hash = $4,
         deleted_at = NULL
     WHERE id = $1
       AND role = 'client'
       AND COALESCE(password_hash, '') = ''
     RETURNING *`,
    [id, fullName, email, passwordHash]
  );


const findOrCreateClient = async (phone, fullName) => {
  const existing = await db.oneOrNone('SELECT id FROM users WHERE phone = $1 LIMIT 1', [phone]);
  if (existing) return existing.id;

  const newUser = await db.one(
    `INSERT INTO users (phone, full_name, email, role, password_hash)
     VALUES ($1, $2, $3, 'client', '')
     RETURNING id`,
    [phone, fullName, `${phone}@postline.local`]
  );
  return newUser.id;
};

// ДОДАНО: Функція оновлення профілю
const updateUser = (id, { fullName, phone, email }) =>
  db.one(
    `UPDATE users 
     SET full_name = $1, 
         phone = $2, 
         email = $3
     WHERE id = $4 AND deleted_at IS NULL
     RETURNING *`,
    [fullName, phone, email, id]
  );

const updateUserPassword = (id, passwordHash) =>
  db.one(
    `UPDATE users
     SET password_hash = $1
     WHERE id = $2 AND deleted_at IS NULL
     RETURNING *`,
    [passwordHash, id]
  );

const findOrCreateUserByPhone = async ({ phone, fullName }) => {
  const existing = await db.oneOrNone(
    'SELECT * FROM users WHERE phone = $1 AND deleted_at IS NULL',
    [phone]
  );
  if (existing) return existing;

  return db.one(
    `INSERT INTO users (full_name, phone, email, role, password_hash)
     VALUES ($1, $2, $3, 'client', '')
     ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name
     RETURNING *`,
    [fullName, phone, `${phone}@postline.local`]
  );
};
  
module.exports = { 
  findUserByEmail, 
  findUserByPhone,
  findUserById, 
  createUser, 
  activatePlaceholderClient,
  findOrCreateClient,
  updateUser,
  updateUserPassword,
  findOrCreateUserByPhone,
};
