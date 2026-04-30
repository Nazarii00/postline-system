const trackingRepository = require("../repositories/tracking.repository");

const statusMap = {
  accepted: "Прийнято",
  sorting: "На сортуванні",
  in_transit: "В дорозі",
  arrived: "Прибуло до транзитного центру",
  ready_for_pickup: "Готове до видачі",
  delivered: "Доставлено",
  returned: "Повернено",
  cancelled: "Скасовано",
};

const typeMap = {
  parcel: "Посилка",
  package: "Вантаж",
  letter: "Лист",
};

const maskName = (fullName) => {
  if (!fullName) return "Невідомо";
  const parts = fullName.split(" ");
  if (parts.length === 1) return `${parts[0].substring(0, 2)}***`;
  return `${parts[0].substring(0, 3)}*** ${parts[1].charAt(0)}.`;
};

const getTrackingHandler = async (req, res, next) => {
  try {
    const { trackingNumber } = req.params;
    const parcel = await trackingRepository.getShipmentByTrackingNumber(trackingNumber);

    if (!parcel) {
      return res.status(404).json({ message: "Відправлення не знайдено" });
    }

    const historyRows = await trackingRepository.getShipmentHistory(parcel.id);
    const timeline = historyRows.map((item) => ({
      status: statusMap[item.status_set] || item.status_set,
      date: new Date(item.created_at).toLocaleString("uk-UA", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      location: item.city && item.address ? `${item.city}, ${item.address}` : item.notes || "Транзит",
      isCompleted: true,
      isAlert: false,
    }));

    const hasUnresolvedCourierFailure =
      parcel.is_courier
      && Number(parcel.failed_attempts || 0) > 0
      && parcel.status !== "delivered";

    if (hasUnresolvedCourierFailure) {
      timeline.push({
        status: "Невдала спроба доставки",
        date: null,
        location: `Спроб: ${parcel.failed_attempts} з 3. Зв'яжіться з кур'єром.`,
        isCompleted: true,
        isAlert: true,
      });
    }

    const isFinished = ["delivered", "cancelled", "returned"].includes(parcel.status);
    if (!isFinished) {
      const flow = parcel.is_courier
        ? ["accepted", "sorting", "in_transit", "delivered"]
        : ["accepted", "sorting", "in_transit", "arrived", "ready_for_pickup", "delivered"];

      const currentIndex = flow.indexOf(parcel.status);
      if (currentIndex !== -1) {
        for (let i = currentIndex + 1; i < flow.length; i++) {
          const futureStatus = flow[i];
          let expectedLocation = "Очікується";

          if (futureStatus === "ready_for_pickup" || futureStatus === "arrived") {
            expectedLocation = `${parcel.dest_city}, ${parcel.dest_address}`;
          } else if (futureStatus === "delivered" && parcel.is_courier) {
            expectedLocation = "Кур'єрська доставка на адресу";
          }

          timeline.push({
            status: statusMap[futureStatus],
            location: expectedLocation,
            isCompleted: false,
          });
        }
      }
    }

    return res.status(200).json({
      shipmentId: parcel.id,
      trackingNumber: parcel.tracking_number,
      status: statusMap[parcel.status],
      rawStatus: parcel.status,
      canCancel: Boolean(
        req.user?.role === "client"
        && Number(req.user.sub) === Number(parcel.sender_id)
        && parcel.status === "accepted"
      ),
      registrationDate: new Date(parcel.created_at).toLocaleDateString("uk-UA"),
      type: typeMap[parcel.shipment_type] || parcel.shipment_type,
      route: `${parcel.origin_city} → ${parcel.dest_city}`,
      sender: {
        name: maskName(parcel.sender_name),
        city: parcel.origin_city,
        branch: parcel.origin_address,
      },
      receiver: {
        name: maskName(parcel.receiver_name),
        city: parcel.dest_city,
        branch: parcel.is_courier ? "Кур'єрська доставка" : parcel.dest_address,
      },
      details: {
        weight: `${parcel.weight_kg} кг`,
        dimensions: `${parcel.length_cm}×${parcel.width_cm}×${parcel.height_cm} см`,
        declaredValue: `${parcel.declared_value ?? 0} грн`,
      },
      financials: {
        cost: `${parcel.total_cost} грн`,
        deliveryType: parcel.is_courier ? "Кур'єрська" : "У відділення",
        description: "Оплата під час отримання",
      },
      history: timeline,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getTrackingHandler,
};
