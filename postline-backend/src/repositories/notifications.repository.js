const db = require("../db");

const createNotification = ({
  shipmentId,
  recipientId,
  type,
  title,
  message,
  metadata,
}) =>
  db.one(
    `INSERT INTO notifications
     (shipment_id, recipient_id, type, title, message, metadata)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb)
     RETURNING *`,
    [
      shipmentId,
      recipientId,
      type,
      title,
      message,
      JSON.stringify(metadata || {}),
    ]
  );

const listNotificationsForUser = (recipientId) =>
  db.many(
    `SELECT n.*,
            s.tracking_number,
            s.status AS shipment_status
     FROM notifications n
     JOIN shipments s ON s.id = n.shipment_id
     WHERE n.recipient_id = $1
     ORDER BY n.created_at DESC`,
    [recipientId]
  );

const markNotificationRead = (id, recipientId) =>
  db.oneOrNone(
    `UPDATE notifications
     SET read_at = COALESCE(read_at, NOW())
     WHERE id = $1 AND recipient_id = $2
     RETURNING *`,
    [id, recipientId]
  );

const markAllNotificationsRead = (recipientId) =>
  db.run(
    `UPDATE notifications
     SET read_at = COALESCE(read_at, NOW())
     WHERE recipient_id = $1 AND read_at IS NULL`,
    [recipientId]
  );

module.exports = {
  createNotification,
  listNotificationsForUser,
  markNotificationRead,
  markAllNotificationsRead,
};
