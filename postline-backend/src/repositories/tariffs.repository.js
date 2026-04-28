const db = require('../db');

const createTariff = ({
  cityFrom,
  cityTo,
  shipmentType,
  sizeCategory,
  basePrice,
  pricePerKg,
  courierBaseFee,
  courierFeePerKg,
}) =>
  db.one(
    `INSERT INTO tariffs (
       city_from, city_to, shipment_type, size_category,
       base_price, price_per_kg, courier_base_fee, courier_fee_per_kg
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [cityFrom, cityTo, shipmentType, sizeCategory, basePrice, pricePerKg, courierBaseFee, courierFeePerKg]
  );

const getTariffById = (id) =>
  db.one('SELECT * FROM tariffs WHERE id = $1 AND deleted_at IS NULL', [id]);

const getAllTariffs = () =>
  db.many(
    `SELECT * FROM tariffs WHERE deleted_at IS NULL
     ORDER BY city_from, city_to, shipment_type, size_category`
  );

const getTariffsByRoute = (cityFrom, cityTo) =>
  db.many(
    `SELECT * FROM tariffs
     WHERE city_from = $1 AND city_to = $2 AND deleted_at IS NULL
     ORDER BY shipment_type, size_category`,
    [cityFrom, cityTo]
  );

// Для розрахунку вартості при реєстрації відправлення
const getTariffByParams = (cityFrom, cityTo, shipmentType, sizeCategory) =>
  db.one(
    `SELECT * FROM tariffs
     WHERE city_from = $1 AND city_to = $2
       AND shipment_type = $3 AND size_category = $4
       AND deleted_at IS NULL`,
    [cityFrom, cityTo, shipmentType, sizeCategory]
  );

const updateTariff = (id, { basePrice, pricePerKg, courierBaseFee, courierFeePerKg }) =>
  db.one(
    `UPDATE tariffs
     SET base_price         = COALESCE($2, base_price),
         price_per_kg       = COALESCE($3, price_per_kg),
         courier_base_fee   = COALESCE($4, courier_base_fee),
         courier_fee_per_kg = COALESCE($5, courier_fee_per_kg)
     WHERE id = $1 AND deleted_at IS NULL
     RETURNING *`,
    [id, basePrice, pricePerKg, courierBaseFee, courierFeePerKg]
  );

const deleteTariff = (id) =>
  db.one(
    `UPDATE tariffs
     SET deleted_at = COALESCE(deleted_at, NOW())
     WHERE id = $1
     RETURNING *`,
    [id]
  );

module.exports = {
  createTariff,
  getTariffById,
  getAllTariffs,
  getTariffsByRoute,
  getTariffByParams,
  updateTariff,
  deleteTariff,
};
