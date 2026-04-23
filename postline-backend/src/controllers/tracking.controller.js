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

// Хелпер для захисту ПІБ
const maskName = (fullName) => {
  if (!fullName) return "Невідомо";
  const parts = fullName.split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2) + "***";
  return `${parts[0].substring(0, 3)}*** ${parts[1].charAt(0)}.`;
};

const getTrackingHandler = async (req, res) => {
  try {
    const { trackingNumber } = req.params;

    // 1. Беремо дані з репозиторію
    const parcel = await trackingRepository.getShipmentByTrackingNumber(trackingNumber);

    if (!parcel) {
      return res.status(404).json({ message: "Відправлення не знайдено" });
    }

    // 2. Беремо історію з репозиторію
    const historyRows = await trackingRepository.getShipmentHistory(parcel.id);

    // 3. Будуємо таймлайн (Пройдені етапи)
    let timeline = historyRows.map((h) => ({
      status: statusMap[h.status_set] || h.status_set,
      date: new Date(h.created_at).toLocaleString("uk-UA", {
        day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
      }),
      location: h.city && h.address ? `${h.city}, ${h.address}` : h.notes || "Транзит",
      isCompleted: true,
      isAlert: false,
    }));

    // Додаємо інформацію про кур'єра, якщо були невдалі спроби
    if (parcel.is_courier && parcel.failed_attempts > 0) {
      timeline.push({
        status: "Невдала спроба доставки",
        date: null,
        location: `Спроб: ${parcel.failed_attempts} з 3. Зв'яжіться з кур'єром.`,
        isCompleted: true,
        isAlert: true,
      });
    }

    // Будуємо майбутні (сірі) кроки
    const isFinished = ["delivered", "cancelled", "returned"].includes(parcel.status);
    if (!isFinished) {
      const flow = parcel.is_courier
        ? ["accepted", "sorting", "in_transit", "delivered"]
        : ["accepted", "sorting", "in_transit", "arrived", "ready_for_pickup", "delivered"];

      const currentIndex = flow.indexOf(parcel.status);
      if (currentIndex !== -1) {
        for (let i = currentIndex + 1; i < flow.length; i++) {
          const futureStatus = flow[i];
          let expectedLoc = "Очікується";

          if (futureStatus === "ready_for_pickup" || futureStatus === "arrived") {
            expectedLoc = `${parcel.dest_city}, ${parcel.dest_address}`;
          } else if (futureStatus === "delivered" && parcel.is_courier) {
            expectedLoc = "Кур'єрська доставка на адресу";
          }

          timeline.push({
            status: statusMap[futureStatus],
            location: expectedLoc,
            isCompleted: false,
          });
        }
      }
    }

    // 4. Формуємо красиву відповідь
    return res.status(200).json({
      trackingNumber: parcel.tracking_number,
      status: statusMap[parcel.status],
      rawStatus: parcel.status,
      registrationDate: new Date(parcel.created_at).toLocaleDateString("uk-UA"),
      type: parcel.shipment_type === "parcel" ? "Посилка" : parcel.shipment_type === "package" ? "Вантаж" : "Лист",
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
        declaredValue: `${parcel.declared_value} грн`,
      },
      financials: {
        cost: `${parcel.total_cost} грн`,
        deliveryType: parcel.is_courier ? "Кур'єрська" : "У відділення",
        description: "Оплата під час отримання",
      },
      history: timeline,
    });
  } catch (error) {
    console.error("Помилка в getTrackingHandler:", error);
    return res.status(500).json({ message: "Внутрішня помилка сервера" });
  }
};

module.exports = {
  getTrackingHandler,
};