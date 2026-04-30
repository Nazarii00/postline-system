const db = require("../db");
const { ROUTE_NOTE_MARKER } = require("./courierRoutes.repository");
const {
  createCourierDeliveryNotification,
  createShipmentStatusNotifications,
} = require("./notifications.repository");

const courierDeliverySelect = `
  SELECT cd.*,
         s.tracking_number,
         s.status AS shipment_status,
         s.current_dept_id,
         s.dest_dept_id,
         s.failed_attempts,
         current_dept.city AS current_city,
         dest_dept.city AS dest_city,
         receiver.full_name AS receiver_name,
         receiver.phone AS receiver_phone,
         courier.full_name AS courier_name,
         courier.phone AS courier_phone,
         courier_dept.city AS courier_city
  FROM courier_deliveries cd
  JOIN shipments s ON s.id = cd.shipment_id
  JOIN users receiver ON receiver.id = s.receiver_id
  LEFT JOIN departments current_dept ON current_dept.id = s.current_dept_id
  JOIN departments dest_dept ON dest_dept.id = s.dest_dept_id
  LEFT JOIN users courier ON courier.id = cd.courier_id
  LEFT JOIN departments courier_dept ON courier_dept.id = courier.department_id
`;

const ensureProcessingEvent = async (client, {
  shipmentId,
  departmentId,
  operatorId,
  status,
  notes = null,
}) => {
  const { rows: [existingEvent] } = await client.query(
    `SELECT id
     FROM processing_events
     WHERE shipment_id = $1 AND status_set = $2
     ORDER BY created_at DESC, id DESC
     LIMIT 1`,
    [shipmentId, status]
  );

  if (existingEvent) {
    if (notes) {
      await client.query(
        `UPDATE processing_events
         SET notes = $1
         WHERE id = $2`,
        [notes, existingEvent.id]
      );
    }

    return existingEvent;
  }

  const { rows: [createdEvent] } = await client.query(
    `INSERT INTO processing_events
       (shipment_id, department_id, operator_id, status_set, notes)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [shipmentId, departmentId || null, operatorId || null, status, notes || null]
  );

  return createdEvent;
};

const createCourierDelivery = ({ shipmentId, courierId, operatorId, toAddress, notes }) =>
  db.tx(async (client) => {
    const { rows: [delivery] } = await client.query(
      `INSERT INTO courier_deliveries (shipment_id, courier_id, operator_id, to_address, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [shipmentId, courierId, operatorId, toAddress, notes || null]
    );

    if (delivery) {
      await createCourierDeliveryNotification(client, {
        shipmentId: delivery.shipment_id,
        deliveryId: delivery.id,
        type: "courier_delivery_assigned",
        status: delivery.status,
      });
    }

    return delivery;
  });

const getCourierDeliveryById = (id) =>
  db.one(
    `${courierDeliverySelect}
     WHERE cd.id = $1`,
    [id]
  );

const hasBlockingCourierDelivery = (shipmentId) =>
  db.oneOrNone(
    `SELECT id, status
     FROM courier_deliveries
     WHERE shipment_id = $1
       AND status IN ('assigned', 'in_progress', 'delivered')
     ORDER BY attempt_datetime DESC, id DESC
     LIMIT 1`,
    [shipmentId]
  );

const listCourierDeliveries = ({
  shipmentId,
  courierId,
  status,
  departmentId,
  courierDepartmentId,
  confirmedOnly,
} = {}) =>
  db.many(
    `${courierDeliverySelect}
     WHERE ($1::int IS NULL OR cd.shipment_id = $1)
       AND ($2::int IS NULL OR cd.courier_id = $2)
       AND ($3::courier_delivery_status IS NULL OR cd.status = $3::courier_delivery_status)
       AND (
         $4::int IS NULL
         OR (s.current_dept_id = $4 AND s.dest_dept_id = $4)
       )
       AND (
         $5::int IS NULL
         OR (courier_dept.id = $5 AND courier_dept.city = dest_dept.city)
       )
       AND (
         $6::boolean IS NOT TRUE
         OR cd.notes ILIKE '%' || $7::text || '%'
       )
     ORDER BY cd.attempt_datetime DESC`,
    [
      shipmentId || null,
      courierId || null,
      status || null,
      departmentId || null,
      courierDepartmentId || null,
      Boolean(confirmedOnly),
      ROUTE_NOTE_MARKER,
    ]
  );

const updateCourierDeliveryStatus = async (id, { status, failureReason, notes, actorId }) => {
  return db.tx(async (client) => {
    if (actorId) {
      await client.query("SELECT set_config('app.current_user_id', $1, true)", [String(actorId)]);
    }

    const { rows: [shipmentBeforeDeliveryUpdate] } = await client.query(
      `SELECT s.id, s.failed_attempts
       FROM courier_deliveries cd
       JOIN shipments s ON s.id = cd.shipment_id
       WHERE cd.id = $1
       FOR UPDATE OF s`,
      [id]
    );

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

    if (status === "in_progress") {
      return {
        ...delivery,
        shipment,
        failedAttempts: null,
        courierPickupFallback,
      };
    }

    if (status === "delivered") {
      const { rows: [updatedShipment] } = await client.query(
        `UPDATE shipments
         SET status = 'delivered',
             current_dept_id = dest_dept_id
         WHERE id = $1
         RETURNING *`,
        [delivery.shipment_id]
      );
      shipment = updatedShipment;

      if (updatedShipment) {
        await ensureProcessingEvent(client, {
          shipmentId: updatedShipment.id,
          departmentId: updatedShipment.current_dept_id || updatedShipment.dest_dept_id,
          operatorId: actorId,
          status: "delivered",
          notes,
        });
        await createShipmentStatusNotifications(client, updatedShipment, "delivered");
      }
    }

    if (status === "failed") {
      const { rows: [shipmentAfterDeliveryUpdate] } = await client.query(
        `SELECT *
         FROM shipments
         WHERE id = $1`,
        [delivery.shipment_id]
      );

      const previousAttempts = Number(shipmentBeforeDeliveryUpdate?.failed_attempts || 0);
      const attemptsAfterDeliveryUpdate = Number(shipmentAfterDeliveryUpdate?.failed_attempts || 0);
      let updatedShipment = shipmentAfterDeliveryUpdate;

      if (attemptsAfterDeliveryUpdate === previousAttempts) {
        const { rows: [incrementedShipment] } = await client.query(
          `UPDATE shipments
           SET failed_attempts = COALESCE(failed_attempts, 0) + 1
           WHERE id = $1
           RETURNING *`,
          [delivery.shipment_id]
        );
        updatedShipment = incrementedShipment;
      }

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

      await createCourierDeliveryNotification(client, {
        shipmentId: delivery.shipment_id,
        deliveryId: delivery.id,
        type: "courier_delivery_failed",
        status,
        failureReason: failureReason || delivery.failure_reason,
        failedAttempts: updatedShipment?.failed_attempts ?? null,
        courierPickupFallback,
      });
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
  hasBlockingCourierDelivery,
  listCourierDeliveries,
  updateCourierDeliveryStatus,
};
