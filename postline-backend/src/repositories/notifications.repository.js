const db = require("../db");

const notificationSelect = `
  SELECT n.id::text AS id,
         n.shipment_id,
         n.recipient_id,
         n.type,
         n.title,
         n.message,
         n.channel,
         n.metadata,
         n.read_at,
         n.created_at,
         s.tracking_number,
         s.status AS shipment_status
  FROM notifications n
  JOIN shipments s ON s.id = n.shipment_id
`;

const shipmentStatusContent = {
  accepted: {
    type: "shipment_accepted",
    title: "Відправлення прийнято",
    message: (trackingNumber) => `Відправлення ${trackingNumber} зареєстровано в PostLine.`,
  },
  sorting: {
    type: "shipment_sorting",
    title: "Відправлення сортується",
    message: (trackingNumber) => `Відправлення ${trackingNumber} передано на сортування.`,
  },
  in_transit: {
    type: "shipment_in_transit",
    title: "Відправлення в дорозі",
    message: (trackingNumber) => `Відправлення ${trackingNumber} прямує до відділення призначення.`,
  },
  arrived: {
    type: "shipment_arrived",
    title: "Відправлення прибуло",
    message: (trackingNumber) => `Відправлення ${trackingNumber} прибуло до відділення призначення.`,
  },
  ready_for_pickup: {
    type: "shipment_ready_for_pickup",
    title: "Відправлення готове до видачі",
    message: (trackingNumber) => `Відправлення ${trackingNumber} готове до видачі.`,
  },
  delivered: {
    type: "shipment_delivered",
    title: "Відправлення доставлено",
    message: (trackingNumber) => `Відправлення ${trackingNumber} успішно доставлено.`,
  },
  returned: {
    type: "shipment_returned",
    title: "Відправлення повертається",
    message: (trackingNumber) => `Відправлення ${trackingNumber} повертається відправнику.`,
  },
  cancelled: {
    type: "shipment_cancelled",
    title: "Відправлення скасовано",
    message: (trackingNumber) => `Відправлення ${trackingNumber} скасовано.`,
  },
};

const listNotificationsForUser = (recipientId) =>
  db.many(
    `${notificationSelect}
     WHERE n.recipient_id = $1
     ORDER BY n.created_at DESC, n.id DESC`,
    [recipientId]
  );

const markNotificationRead = (id, recipientId) =>
  db.one(
    `WITH updated AS (
       UPDATE notifications
       SET read_at = COALESCE(read_at, NOW())
       WHERE id = $1 AND recipient_id = $2
       RETURNING *
     )
     SELECT updated.id::text AS id,
            updated.shipment_id,
            updated.recipient_id,
            updated.type,
            updated.title,
            updated.message,
            updated.channel,
            updated.metadata,
            updated.read_at,
            updated.created_at,
            s.tracking_number,
            s.status AS shipment_status
     FROM updated
     JOIN shipments s ON s.id = updated.shipment_id`,
    [id, recipientId]
  );

const markAllNotificationsRead = async (recipientId) => {
  const result = await db.one(
    `WITH updated AS (
       UPDATE notifications
       SET read_at = COALESCE(read_at, NOW())
       WHERE recipient_id = $1 AND read_at IS NULL
       RETURNING id
     )
     SELECT COUNT(*)::int AS updated_count
     FROM updated`,
    [recipientId]
  );

  return result?.updated_count || 0;
};

const getShipmentForNotification = async (client, shipmentOrId) => {
  if (shipmentOrId && typeof shipmentOrId === "object") {
    return shipmentOrId;
  }

  const { rows: [shipment] } = await client.query(
    `SELECT id, tracking_number, sender_id, receiver_id, status
     FROM shipments
     WHERE id = $1`,
    [shipmentOrId]
  );

  return shipment || null;
};

const insertNotification = async (client, {
  shipmentId,
  recipientId,
  type,
  title,
  message,
  metadata = {},
}) => {
  if (!shipmentId || !recipientId || !type) return null;

  const metadataJson = JSON.stringify(metadata);
  const dedupeKey = `${shipmentId}:${recipientId}:${type}:${metadataJson}`;
  await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [dedupeKey]);

  const { rows: [existing] } = await client.query(
    `SELECT id::text AS id
     FROM notifications
     WHERE shipment_id = $1
       AND recipient_id = $2
       AND type = $3
       AND metadata @> $4::jsonb
     LIMIT 1`,
    [shipmentId, recipientId, type, metadataJson]
  );

  if (existing) return existing;

  const { rows: [notification] } = await client.query(
    `INSERT INTO notifications
       (shipment_id, recipient_id, type, title, message, channel, metadata)
     VALUES ($1, $2, $3, $4, $5, 'database', $6::jsonb)
     RETURNING id::text AS id`,
    [shipmentId, recipientId, type, title, message, metadataJson]
  );

  return notification;
};

const getShipmentRecipients = (shipment) =>
  Array.from(new Set([shipment.sender_id, shipment.receiver_id].filter(Boolean).map(Number)));

const createShipmentStatusNotifications = async (client, shipmentOrId, statusOverride) => {
  const shipment = await getShipmentForNotification(client, shipmentOrId);
  if (!shipment) return [];

  const status = statusOverride || shipment.status;
  const content = shipmentStatusContent[status] || {
    type: "shipment_status_updated",
    title: "Статус відправлення змінено",
    message: (trackingNumber) => `Поточний статус відправлення ${trackingNumber}: ${status}.`,
  };
  const trackingNumber = shipment.tracking_number;
  const recipients = getShipmentRecipients(shipment);

  const created = [];

  for (const recipientId of recipients) {
    created.push(
      await insertNotification(client, {
        shipmentId: shipment.id,
        recipientId,
        type: content.type,
        title: content.title,
        message: content.message(trackingNumber),
        metadata: { trackingNumber, status },
      })
    );
  }

  return created;
};

const createCourierDeliveryNotification = async (client, {
  shipmentId,
  deliveryId,
  type,
  status,
  failureReason,
  failedAttempts,
  courierPickupFallback,
}) => {
  const shipment = await getShipmentForNotification(client, shipmentId);
  if (!shipment) return [];

  const trackingNumber = shipment.tracking_number;
  const recipients = getShipmentRecipients(shipment);
  const content = type === "courier_delivery_failed"
    ? {
        type: "courier_delivery_failed",
        title: "Кур'єрська доставка не виконана",
        message: () => {
          const reason = failureReason ? ` Причина: ${failureReason}.` : "";
          const attempts = failedAttempts ? ` Спроба ${failedAttempts}.` : "";
          const fallback = courierPickupFallback
            ? " Після трьох невдалих спроб відправлення доступне для отримання у відділенні."
            : "";

          return `Кур'єрська доставка для відправлення ${trackingNumber} завершилась невдало.${reason}${attempts}${fallback}`;
        },
      }
    : {
        type: "courier_delivery_assigned",
        title: "Кур'єра призначено",
        message: () => `Для відправлення ${trackingNumber} призначено кур'єрську доставку.`,
      };

  const created = [];

  for (const recipientId of recipients) {
    created.push(
      await insertNotification(client, {
        shipmentId: shipment.id,
        recipientId,
        type: content.type,
        title: content.title,
        message: content.message(),
        metadata: { trackingNumber, courierDeliveryId: deliveryId, status },
      })
    );
  }

  return created;
};

module.exports = {
  listNotificationsForUser,
  markNotificationRead,
  markAllNotificationsRead,
  createShipmentStatusNotifications,
  createCourierDeliveryNotification,
};
