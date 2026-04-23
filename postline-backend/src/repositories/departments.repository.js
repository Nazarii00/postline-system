const db = require('../db');

const createBranch = ({ name, address, phone, city, latitude, longitude }) =>
  db.one(
    `INSERT INTO branches (name, address, phone, city, latitude, longitude)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [name, address, phone, city, latitude || null, longitude || null]
  );

const getBranchById = (id) =>
  db.one('SELECT * FROM branches WHERE id = $1 AND deleted_at IS NULL', [id]);

const getAllBranches = () =>
  db.many('SELECT * FROM branches WHERE deleted_at IS NULL ORDER BY name ASC', []);

const getBranchesByCity = (city) =>
  db.many('SELECT * FROM branches WHERE city = $1 AND deleted_at IS NULL ORDER BY name ASC', [city]);

const updateBranch = (id, { name, address, phone, city, latitude, longitude }) =>
  db.one(
    `UPDATE branches 
     SET name = COALESCE($2, name),
         address = COALESCE($3, address),
         phone = COALESCE($4, phone),
         city = COALESCE($5, city),
         latitude = COALESCE($6, latitude),
         longitude = COALESCE($7, longitude),
         updated_at = NOW()
     WHERE id = $1 AND deleted_at IS NULL
     RETURNING *`,
    [id, name, address, phone, city, latitude, longitude]
  );

const deleteBranch = (id) =>
  db.run(
    'UPDATE branches SET deleted_at = NOW() WHERE id = $1',
    [id]
  );

module.exports = {
  createBranch,
  getBranchById,
  getAllBranches,
  getBranchesByCity,
  updateBranch,
  deleteBranch,
};
