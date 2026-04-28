const {
  LIMITS,
  PATTERNS,
  optionalEnumBody,
  optionalPhoneBody,
  optionalTextQuery,
  optionalTextBody,
  requiredEnumBody,
  requiredTextBody,
  timeBody,
} = require("./common.validators");

const createDepartmentValidation = [
  requiredTextBody("city", "Місто", {
    min: LIMITS.cityMin,
    max: LIMITS.cityMax,
    pattern: PATTERNS.city,
    patternMessage: "Місто може містити лише літери, пробіли, апостроф та дефіс",
  }),
  requiredTextBody("address", "Адреса", {
    min: LIMITS.addressMin,
    max: LIMITS.addressMax,
  }),
  requiredEnumBody("type", "Тип відділення", ["sorting_center", "post_office", "pickup_point"]),
  optionalPhoneBody("phone", "Телефон"),
  timeBody("openingTime", "Час відкриття"),
  timeBody("closingTime", "Час закриття"),
];

const updateDepartmentValidation = [
  optionalTextBody("city", "Місто", {
    min: LIMITS.cityMin,
    max: LIMITS.cityMax,
    pattern: PATTERNS.city,
    patternMessage: "Місто може містити лише літери, пробіли, апостроф та дефіс",
  }),
  optionalTextBody("address", "Адреса", {
    min: LIMITS.addressMin,
    max: LIMITS.addressMax,
  }),
  optionalEnumBody("type", "Тип відділення", ["sorting_center", "post_office", "pickup_point"]),
  optionalPhoneBody("phone", "Телефон"),
  timeBody("openingTime", "Час відкриття"),
  timeBody("closingTime", "Час закриття"),
];

const listDepartmentsValidation = [
  optionalTextQuery("city", "Місто", {
    max: LIMITS.cityMax,
    pattern: PATTERNS.city,
  }),
];

module.exports = {
  createDepartmentValidation,
  updateDepartmentValidation,
  listDepartmentsValidation,
};
