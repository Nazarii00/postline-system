const { createNotification } = require("../repositories/notifications.repository");

const STATUS_NOTIFICATIONS = {
  ready_for_pickup: {
    type: "shipment_ready_for_pickup",
    title: "Відправлення готове до видачі",
    message: (shipment) =>
      `Ваше відправлення ${shipment.tracking_number} готове до видачі.`,
  },
  delivered: {
    type: "shipment_delivered",
    title: "Відправлення доставлено",
    message: (shipment) =>
      `Відправлення ${shipment.tracking_number} успішно доставлено отримувачу.`,
  },
};

const writeNotification = async (payload) => {
  try {
    return await createNotification(payload);
  } catch (error) {
    console.error("Не вдалося записати сповіщення:", error.message);
    return null;
  }
};

const notifyShipmentStatusChange = async (shipment) => {
  const template = STATUS_NOTIFICATIONS[shipment?.status];
  if (!shipment || !template || !shipment.receiver_id) return null;

  return writeNotification({
    shipmentId: shipment.id,
    recipientId: shipment.receiver_id,
    type: template.type,
    title: template.title,
    message: template.message(shipment),
    metadata: {
      status: shipment.status,
      trackingNumber: shipment.tracking_number,
    },
  });
};

const notifyCourierDeliveryFailed = async ({
  shipment,
  failureReason,
  failedAttempts,
  courierPickupFallback,
}) => {
  if (!shipment?.receiver_id) return null;

  const fallbackText = courierPickupFallback
    ? " Після трьох невдалих спроб відправлення автоматично переведено у самовивіз."
    : "";

  return writeNotification({
    shipmentId: shipment.id,
    recipientId: shipment.receiver_id,
    type: "courier_delivery_failed",
    title: "Невдала кур'єрська доставка",
    message:
      `Кур'єрська доставка відправлення ${shipment.tracking_number} не відбулася.` +
      (failureReason ? ` Причина: ${failureReason}.` : "") +
      ` Спроба ${failedAttempts || 1} з 3.` +
      fallbackText,
    metadata: {
      status: "failed",
      failedAttempts,
      courierPickupFallback: Boolean(courierPickupFallback),
      trackingNumber: shipment.tracking_number,
    },
  });
};

module.exports = {
  notifyShipmentStatusChange,
  notifyCourierDeliveryFailed,
};
