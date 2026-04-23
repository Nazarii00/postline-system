const db = require('../db');

const createCourierDelivery = ({ shipmentId, courierId, operatorId, toAddress, notes }) =>
  db.one(
    `INSERT INTO courier_deliveries (shipment_id, courier_id, operator_id, to_address, notes)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [shipmentId, courierId, operatorId, toAddress, notes || null]
  );

const getCourierDeliveryById = (id) =>
  db.one('SELECT * FROM courier_deliveries WHERE id = $1', [id]);

const getCourierDeliveriesByShipment = (shipmentId) =>
  db.many(
    `SELECT cd.*, 
            u.full_name AS courier_name,
            u.phone AS courier_phone
     FROM courier_deliveries cd
     LEFT JOIN users u ON u.id = cd.courier_id
     WHERE cd.shipment_id = $1
     ORDER BY cd.attempt_datetime DESC`,
    [shipmentId]
  );

const getCourierDeliveriesByCourier = (courierId) =>
  db.many(
    `SELECT cd.*,
            s.tracking_number,
            s.status AS shipment_status
     FROM courier_deliveries cd
     JOIN shipments s ON s.id = cd.shipment_id
     WHERE cd.courier_id = $1
     ORDER BY cd.attempt_datetime DESC`,
    [courierId]
  );

// Оператор вносить результат: delivered або failed
const updateCourierDeliveryStatus = (id, { status, failureReason, notes }) =>
  db.one(
    `UPDATE courier_deliveries
     SET status         = $2,
         failure_reason = COALESCE($3, failure_reason),
         notes          = COALESCE($4, notes)
     WHERE id = $1
     RETURNING *`,
    [id, status, failureReason || null, notes || null]
  );

module.exports = {
  createCourierDelivery,
  getCourierDeliveryById,
  getCourierDeliveriesByShipment,
  getCourierDeliveriesByCourier,
  updateCourierDeliveryStatus,
};