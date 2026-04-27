const db = require("../db");

const listNotificationsForUser = (recipientId) =>
  db.many(
    `WITH status_notifications AS (
       SELECT
         ('shipment-status-' || s.id || '-' || s.status::text) AS id,
         s.id AS shipment_id,
         CASE
           WHEN s.status = 'ready_for_pickup' THEN 'shipment_ready_for_pickup'
           WHEN s.status = 'delivered' THEN 'shipment_delivered'
         END AS type,
         CASE
           WHEN s.status = 'ready_for_pickup' THEN 'Відправлення готове до видачі'
           WHEN s.status = 'delivered' THEN 'Відправлення доставлено'
         END AS title,
         CASE
           WHEN s.status = 'ready_for_pickup'
             THEN 'Ваше відправлення ' || s.tracking_number || ' готове до видачі.'
           WHEN s.status = 'delivered'
             THEN 'Відправлення ' || s.tracking_number || ' успішно доставлено отримувачу.'
         END AS message,
         NULL::timestamp AS read_at,
         COALESCE(last_event.created_at, s.created_at) AS created_at,
         s.tracking_number,
         s.status AS shipment_status
       FROM shipments s
       LEFT JOIN LATERAL (
         SELECT pe.created_at
         FROM processing_events pe
         WHERE pe.shipment_id = s.id
           AND pe.status_set = s.status
         ORDER BY pe.created_at DESC
         LIMIT 1
       ) last_event ON TRUE
       WHERE s.receiver_id = $1
         AND s.status IN ('ready_for_pickup', 'delivered')
     ),
     failed_delivery_notifications AS (
       SELECT
         ('courier-failed-' || cd.id) AS id,
         cd.shipment_id,
         'courier_delivery_failed' AS type,
         'Невдала кур''єрська доставка' AS title,
         'Кур''єрська доставка відправлення ' || s.tracking_number ||
           ' не відбулася.' ||
           COALESCE(' Причина: ' || NULLIF(cd.failure_reason, '') || '.', '') ||
           ' Спроб: ' || s.failed_attempts || ' з 3.' AS message,
         NULL::timestamp AS read_at,
         cd.attempt_datetime AS created_at,
         s.tracking_number,
         s.status AS shipment_status
       FROM courier_deliveries cd
       JOIN shipments s ON s.id = cd.shipment_id
       WHERE s.receiver_id = $1
         AND cd.status = 'failed'
     )
     SELECT *
     FROM status_notifications
     UNION ALL
     SELECT *
     FROM failed_delivery_notifications
     ORDER BY created_at DESC`,
    [recipientId]
  );

const markNotificationRead = async (id) => ({
  id,
  read_at: new Date().toISOString(),
});

const markAllNotificationsRead = async () => 0;

module.exports = {
  listNotificationsForUser,
  markNotificationRead,
  markAllNotificationsRead,
};
