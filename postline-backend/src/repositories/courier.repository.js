const db = require("../db");

const courierDeliverySelect = `
  SELECT cd.*,
         s.tracking_number,
         s.status AS shipment_status,
         s.current_dept_id,
         s.dest_dept_id,
         s.failed_attempts,
         receiver.full_name AS receiver_name,
         receiver.phone AS receiver_phone,
         courier.full_name AS courier_name,
         courier.phone AS courier_phone
  FROM courier_deliveries cd
  JOIN shipments s ON s.id = cd.shipment_id
  JOIN users receiver ON receiver.id = s.receiver_id
  LEFT JOIN users courier ON courier.id = cd.courier_id
`;

const createCourierDelivery = ({ shipmentId, courierId, operatorId, toAddress, notes }) =>
  db.one(
    `INSERT INTO courier_deliveries (shipment_id, courier_id, operator_id, to_address, notes)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [shipmentId, courierId, operatorId, toAddress, notes || null]
  );

const getCourierDeliveryById = (id) =>
  db.one(
    `${courierDeliverySelect}
     WHERE cd.id = $1`,
    [id]
  );

const listCourierDeliveries = ({ shipmentId, courierId, status, departmentId } = {}) =>
  db.many(
    `${courierDeliverySelect}
     WHERE ($1::int IS NULL OR cd.shipment_id = $1)
       AND ($2::int IS NULL OR cd.courier_id = $2)
       AND ($3::courier_delivery_status IS NULL OR cd.status = $3::courier_delivery_status)
       AND (
         $4::int IS NULL
         OR (s.current_dept_id = $4 AND s.dest_dept_id = $4)
       )
     ORDER BY cd.attempt_datetime DESC`,
    [shipmentId || null, courierId || null, status || null, departmentId || null]
  );

const updateCourierDeliveryStatus = async (id, { status, failureReason, notes }) => {
  return db.tx(async (client) => {
    const { rows: [delivery] } = await client.query(
      `UPDATE courier_deliveries
       SET status = $2,
           failure_reason = COALESCE($3, failure_reason),
           notes = COALESCE($4, notes)
       WHERE id = $1
       RETURNING *`,
      [id, status, failureReason || null, notes || null]
    );

    if (!delivery) return null;

    let shipment = null;
    let courierPickupFallback = false;

    if (status === "delivered") {
      const { rows: [updatedShipment] } = await client.query(
        `UPDATE shipments
         SET status = 'delivered'
         WHERE id = $1
         RETURNING *`,
        [delivery.shipment_id]
      );
      shipment = updatedShipment;
    }

    if (status === "failed") {
      const { rows: [updatedShipment] } = await client.query(
        `UPDATE shipments
         SET failed_attempts = COALESCE(failed_attempts, 0) + 1
         WHERE id = $1
         RETURNING *`,
        [delivery.shipment_id]
      );
      shipment = updatedShipment;

      if (Number(updatedShipment.failed_attempts) >= 3) {
        await client.query(
          `UPDATE shipment_details
           SET is_courier = FALSE
           WHERE shipment_id = $1`,
          [delivery.shipment_id]
        );
        courierPickupFallback = true;
      }
    }

    return {
      ...delivery,
      shipment,
      failedAttempts: shipment?.failed_attempts ?? null,
      courierPickupFallback,
    };
  });
};

module.exports = {
  createCourierDelivery,
  getCourierDeliveryById,
  listCourierDeliveries,
  updateCourierDeliveryStatus,
};
