const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'postline_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '1111',
});

pool.query('SELECT 1').then(() => {
  console.log('БД підключена');
}).catch((err) => {
  console.error('Помилка підключення до БД:', err.message);
});

const db = {
  one: async (text, params) => {
    const { rows } = await pool.query(text, params);
    return rows[0] || null;
  },
  oneOrNone: async (text, params) => {
    const { rows } = await pool.query(text, params);
    return rows[0] || null;
  },
  many: async (text, params) => {
    const { rows } = await pool.query(text, params);
    return rows;
  },
  run: async (text, params) => {
    const result = await pool.query(text, params);
    return result.rowCount;
  },
  tx: async (callback) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },
};

module.exports = db;
