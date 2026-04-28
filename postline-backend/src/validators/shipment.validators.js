const { body } = require("express-validator");
const {
  LIMITS,
  PATTERNS,
  optionalBooleanQuery,
  optionalDateQuery,
  optionalEnumQuery,
  optionalFloatBody,
  optionalIdQuery,
  optionalTextBody,
  optionalTextQuery,
  optionalTrackingQuery,
  phoneBody,
  requiredEnumBody,
  requiredFloatBody,
  requiredIdBody,
  requiredTextBody,
} = require("./common.validators");

const shipmentStatuses = [
  "sorting",
  "in_transit",
  "arrived",
  "ready_for_pickup",
  "delivered",
  "returned",
];

const nameRule = (field, label) =>
  requiredTextBody(field, label, {
    min: LIMITS.nameMin,
    max: LIMITS.nameMax,
    pattern: PATTERNS.personName,
    patternMessage: `${label} може містити лише літери, пробіли, апостроф та дефіс`,
  });

const createShipmentValidation = [
  phoneBody("senderPhone", "Телефон відправника"),
  nameRule("senderName", "Ім'я відправника"),
  phoneBody("receiverPhone", "Телефон одержувача"),
  nameRule("receiverName", "Ім'я одержувача"),
  requiredIdBody("originDeptId", "ID відділення відправки"),
  requiredIdBody("destDeptId", "ID відділення призначення"),
  requiredIdBody("tariffId", "ID тарифу"),
  requiredEnumBody("shipmentType", "Тип відправлення", ["letter", "parcel", "package"]),
  requiredEnumBody("sizeCategory", "Розмір", ["S", "M", "L", "XL"]),
  requiredFloatBody("weightKg", "Вага", { min: LIMITS.weightMin, max: LIMITS.weightMax }),
  requiredFloatBody("lengthCm", "Довжина", { min: LIMITS.dimensionMin, max: LIMITS.dimensionMax }),
  requiredFloatBody("widthCm", "Ширина", { min: LIMITS.dimensionMin, max: LIMITS.dimensionMax }),
  requiredFloatBody("heightCm", "Висота", { min: LIMITS.dimensionMin, max: LIMITS.dimensionMax }),
  optionalFloatBody("declaredValue", "Оголошена вартість", { min: 0, max: LIMITS.moneyMax }),
  optionalTextBody("description", "Опис", { max: LIMITS.noteMax }),
  optionalTextBody("receiverAddress", "Адреса доставки", {
    min: LIMITS.addressMin,
    max: LIMITS.addressMax,
  }),
  body("isCourier").optional().isBoolean().withMessage("isCourier має бути true або false").toBoolean(),
];

const changeStatusValidation = [
  requiredEnumBody("status", "Статус", shipmentStatuses),
  optionalTextBody("notes", "Примітки", { max: LIMITS.noteMax }),
];

const listShipmentsValidation = [
  optionalBooleanQuery("courierOnly", "courierOnly"),
  optionalIdQuery("departmentId", "ID відділення"),
  optionalEnumQuery("status", "Статус", [
    "accepted",
    ...shipmentStatuses,
    "cancelled",
  ]),
  optionalTrackingQuery("trackingNumber", "Трекінг-номер"),
  optionalTextQuery("clientName", "Ім'я клієнта", {
    max: LIMITS.nameMax,
    pattern: PATTERNS.personName,
  }),
  optionalTextQuery("search", "Пошук", { max: LIMITS.nameMax }),
  optionalDateQuery("dateFrom", "Дата від"),
  optionalDateQuery("dateTo", "Дата до"),
  optionalEnumQuery("sortBy", "Поле сортування", [
    "created_at",
    "tracking_number",
    "status",
    "total_cost",
    "weight_kg",
  ]),
  optionalEnumQuery("sortOrder", "Напрям сортування", ["asc", "desc"]),
];

module.exports = {
  createShipmentValidation,
  changeStatusValidation,
  listShipmentsValidation,
};
