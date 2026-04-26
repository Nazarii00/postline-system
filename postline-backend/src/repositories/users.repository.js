const db = require('../db');

// ВИПРАВЛЕНО: oneOrNone замість one, щоб не було помилки, якщо юзера не існує
const findUserByEmail = (email) =>
  db.oneOrNone('SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL', [email]);

const findUserById = (id) =>
  db.oneOrNone('SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL', [id]);

const createUser = ({ fullName, phone, email, passwordHash }) =>
  db.one(
    `INSERT INTO users (full_name, phone, email, role, password_hash)
     VALUES ($1, $2, $3, 'client', $4)
     RETURNING *`,
    [fullName, phone, email, passwordHash]
  );

const findOrCreateClient = async (phone, fullName) => {
  const existing = await db.oneOrNone('SELECT id FROM users WHERE phone = $1 LIMIT 1', [phone]);
  if (existing) return existing.id;

  const newUser = await db.one(
    `INSERT INTO users (phone, full_name, role)
     VALUES ($1, $2, 'client')
     RETURNING id`,
    [phone, fullName] 
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

const findOrCreateUserByPhone = async ({ phone, fullName }) => {
  const existing = await db.one(
    'SELECT * FROM users WHERE phone = $1 AND deleted_at IS NULL',
    [phone]
  );
  if (existing) return existing;

  return db.one(
    `INSERT INTO users (full_name, phone, email, role, password_hash)
     VALUES ($1, $2, $3, 'client', '')
     RETURNING *`,
    [fullName, phone, `${phone}@postline.local`]
  );
};
  
module.exports = { 
  findUserByEmail, 
  findUserById, 
  createUser, 
  findOrCreateClient,
  updateUser,
  findOrCreateUserByPhone,
};