const db = require('../db');
const crypto = require('crypto');

const generateTrackingNumber = () =>
  'PL' + Date.now().toString(36).toUpperCase() + crypto.randomBytes(2).toString('hex').toUpperCase();

// Пише в shipments + shipment_details в одній транзакції
const createShipment = ({
  senderId, receiverId,
  originDeptId, destDeptId,
  tariffId, routeId,
  shipmentType, sizeCategory,
  weightKg, lengthCm, widthCm, heightCm,
  declaredValue, description,
  senderAddress, receiverAddress,
  isCourier,
}) =>
  db.tx(async (client) => {
    // Беремо тариф для розрахунку вартості
    const { rows: [tariff] } = await client.query(
      'SELECT * FROM tariffs WHERE id = $1', [tariffId]
    );
    if (!tariff) throw new Error('Тариф не знайдено');

    const totalCost = parseFloat(tariff.base_price) + parseFloat(tariff.price_per_kg) * weightKg;
    const trackingNumber = generateTrackingNumber();

    const { rows: [shipment] } = await client.query(
      `INSERT INTO shipments
       (tracking_number, sender_id, receiver_id, origin_dept_id, dest_dept_id,
        current_dept_id, tariff_id, route_id, total_cost)
       VALUES ($1, $2, $3, $4, $5, $4, $6, $7, $8)
       RETURNING *`,
      [trackingNumber, senderId, receiverId, originDeptId, destDeptId, tariffId, routeId || null, totalCost]
    );

    await client.query(
      `INSERT INTO shipment_details
       (shipment_id, shipment_type, size_category, weight_kg,
        length_cm, width_cm, height_cm, declared_value, description,
        sender_address, receiver_address, is_courier)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [shipment.id, shipmentType, sizeCategory, weightKg,
       lengthCm, widthCm, heightCm, declaredValue || null, description || null,
       senderAddress, receiverAddress, isCourier]
    );

    return shipment;
  });

// Повна інформація з деталями і хронологією
const getShipmentById = (id) =>
  db.one(
    `SELECT s.*,
            sd.shipment_type, sd.size_category, sd.weight_kg,
            sd.length_cm, sd.width_cm, sd.height_cm,
            sd.declared_value, sd.description,
            sd.sender_address, sd.receiver_address, sd.is_courier,
            sender.full_name   AS sender_name,
            sender.phone       AS sender_phone,
            receiver.full_name AS receiver_name,
            receiver.phone     AS receiver_phone,
            origin.city        AS origin_city,
            origin.address     AS origin_address,
            dest.city          AS dest_city,
            dest.address       AS dest_address
     FROM shipments s
     JOIN shipment_details sd ON sd.shipment_id = s.id
     JOIN users sender         ON sender.id = s.sender_id
     JOIN users receiver       ON receiver.id = s.receiver_id
     JOIN departments origin   ON origin.id = s.origin_dept_id
     JOIN departments dest     ON dest.id = s.dest_dept_id
     WHERE s.id = $1`,
    [id]
  );

const getShipmentByTracking = (trackingNumber) =>
  db.one(
    `SELECT s.*,
            sd.shipment_type, sd.weight_kg, sd.is_courier,
            sd.sender_address, sd.receiver_address,
            origin.city AS origin_city,
            dest.city   AS dest_city
     FROM shipments s
     JOIN shipment_details sd ON sd.shipment_id = s.id
     JOIN departments origin  ON origin.id = s.origin_dept_id
     JOIN departments dest    ON dest.id = s.dest_dept_id
     WHERE s.tracking_number = $1`,
    [trackingNumber]
  );

const getShipmentsByClient = (clientId) =>
  db.many(
    `SELECT s.id, s.tracking_number, s.status, s.total_cost, s.created_at,
            sd.shipment_type, sd.weight_kg,
            sender.full_name   AS sender_name,
            receiver.full_name AS receiver_name,
            origin.city AS origin_city,
            dest.city   AS dest_city
     FROM shipments s
     JOIN shipment_details sd ON sd.shipment_id = s.id
     JOIN users sender        ON sender.id = s.sender_id
     JOIN users receiver      ON receiver.id = s.receiver_id
     JOIN departments origin  ON origin.id = s.origin_dept_id
     JOIN departments dest    ON dest.id = s.dest_dept_id
     WHERE s.sender_id = $1 OR s.receiver_id = $1
     ORDER BY s.created_at DESC`,
    [clientId]
  );

const getShipmentsByDepartment = (departmentId, { status, trackingNumber } = {}) =>
  db.many(
    `SELECT s.id, s.tracking_number, s.status, s.total_cost, s.created_at,
            sd.shipment_type, sd.weight_kg,
            sender.full_name   AS sender_name,
            receiver.full_name AS receiver_name
     FROM shipments s
     JOIN shipment_details sd ON sd.shipment_id = s.id
     JOIN users sender        ON sender.id = s.sender_id
     JOIN users receiver      ON receiver.id = s.receiver_id
     WHERE s.current_dept_id = $1
       AND ($2::shipment_status IS NULL OR s.status = $2::shipment_status)
       AND ($3::varchar IS NULL OR s.tracking_number ILIKE '%' || $3 || '%')
     ORDER BY s.created_at DESC`,
    [departmentId, status || null, trackingNumber || null]
  );

const getAllShipments = ({ departmentId, status, trackingNumber } = {}) =>
  db.many(
    `SELECT s.id, s.tracking_number, s.status, s.total_cost, s.created_at,
            sd.shipment_type, sd.weight_kg,
            sender.full_name   AS sender_name,
            receiver.full_name AS receiver_name,
            origin.city        AS origin_city,
            dest.city          AS dest_city
     FROM shipments s
     JOIN shipment_details sd ON sd.shipment_id = s.id
     JOIN users sender        ON sender.id = s.sender_id
     JOIN users receiver      ON receiver.id = s.receiver_id
     JOIN departments origin  ON origin.id = s.origin_dept_id
     JOIN departments dest    ON dest.id = s.dest_dept_id
     WHERE ($1::int IS NULL OR s.current_dept_id = $1)
       AND ($2::shipment_status IS NULL OR s.status = $2::shipment_status)
       AND ($3::varchar IS NULL OR s.tracking_number ILIKE '%' || $3 || '%')
     ORDER BY s.created_at DESC`,
    [departmentId || null, status || null, trackingNumber || null]
  );

// app.current_user_id потрібен для тригера fn_log_status_change
const changeShipmentStatus = (id, { status, operatorId, departmentId, notes }) =>
  db.tx(async (client) => {
    await client.query(`SET LOCAL app.current_user_id = '${operatorId}'`);

    const { rows: [updated] } = await client.query(
      `UPDATE shipments
       SET status = $2, current_dept_id = $3
       WHERE id = $1
       RETURNING *`,
      [id, status, departmentId]
    );

    // notes в processing_events якщо є
    if (notes) {
      await client.query(
        `UPDATE processing_events SET notes = $1
         WHERE shipment_id = $2 AND status_set = $3
         ORDER BY created_at DESC LIMIT 1`,
        [notes, id, status]
      );
    }

    return updated;
  });

const cancelShipment = (id) =>
  db.one(
    `UPDATE shipments SET status = 'cancelled' WHERE id = $1 RETURNING *`,
    [id]
  );

// Хронологія змін статусів
const getShipmentHistory = (shipmentId) =>
  db.many(
    `SELECT pe.status_set, pe.notes, pe.created_at,
            d.city    AS department_city,
            d.address AS department_address,
            u.full_name AS operator_name
     FROM processing_events pe
     LEFT JOIN departments d ON d.id = pe.department_id
     LEFT JOIN users u       ON u.id = pe.operator_id
     WHERE pe.shipment_id = $1
     ORDER BY pe.created_at ASC`,
    [shipmentId]
  );

module.exports = {
  createShipment,
  getShipmentById,
  getShipmentByTracking,
  getShipmentsByClient,
  getShipmentsByDepartment,
  getAllShipments,
  changeShipmentStatus,
  cancelShipment,
  getShipmentHistory,
};