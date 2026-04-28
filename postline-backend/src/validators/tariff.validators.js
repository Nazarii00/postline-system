const {
  LIMITS,
  PATTERNS,
  optionalFloatBody,
  optionalTextQuery,
  requiredEnumBody,
  requiredFloatBody,
  requiredTextBody,
} = require("./common.validators");

const cityRule = (field, label) =>
  requiredTextBody(field, label, {
    min: LIMITS.cityMin,
    max: LIMITS.cityMax,
    pattern: PATTERNS.city,
    patternMessage: `${label} може містити лише літери, пробіли, апостроф та дефіс`,
  });

const moneyRule = (field, label) =>
  requiredFloatBody(field, label, { min: 0, max: LIMITS.moneyMax });

const optionalMoneyRule = (field, label) =>
  optionalFloatBody(field, label, { min: 0, max: LIMITS.moneyMax });

const createTariffValidation = [
  cityRule("cityFrom", "Місто відправлення"),
  cityRule("cityTo", "Місто призначення"),
  requiredEnumBody("shipmentType", "Тип відправлення", ["letter", "parcel", "package"]),
  requiredEnumBody("sizeCategory", "Категорія розміру", ["S", "M", "L", "XL"]),
  moneyRule("basePrice", "Базова ціна"),
  moneyRule("pricePerKg", "Ціна за кг"),
  moneyRule("courierBaseFee", "Базова ціна кур'єрської доставки"),
  moneyRule("courierFeePerKg", "Ціна кур'єра за кг"),
];

const updateTariffValidation = [
  optionalMoneyRule("basePrice", "Базова ціна"),
  optionalMoneyRule("pricePerKg", "Ціна за кг"),
  optionalMoneyRule("courierBaseFee", "Базова ціна кур'єра"),
  optionalMoneyRule("courierFeePerKg", "Ціна кур'єра за кг"),
];

const listTariffsValidation = [
  optionalTextQuery("cityFrom", "Місто відправлення", {
    max: LIMITS.cityMax,
    pattern: PATTERNS.city,
  }),
  optionalTextQuery("cityTo", "Місто призначення", {
    max: LIMITS.cityMax,
    pattern: PATTERNS.city,
  }),
];

module.exports = {
  createTariffValidation,
  updateTariffValidation,
  listTariffsValidation,
};
