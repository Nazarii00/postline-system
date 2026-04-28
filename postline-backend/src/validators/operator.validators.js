const { body } = require("express-validator");
const {
  LIMITS,
  PATTERNS,
  emailBody,
  optionalBooleanQuery,
  optionalIdQuery,
  optionalIdBody,
  optionalPhoneBody,
  optionalTextBody,
  passwordBody,
  phoneBody,
  requiredEnumBody,
  requiredIdBody,
  requiredTextBody,
  optionalEnumBody,
} = require("./common.validators");

const fullNameCreate = requiredTextBody("fullName", "Повне ім'я", {
  min: LIMITS.nameMin,
  max: LIMITS.nameMax,
  pattern: PATTERNS.personName,
  patternMessage: "Повне ім'я може містити лише літери, пробіли, апостроф та дефіс",
});

const fullNameUpdate = optionalTextBody("fullName", "Повне ім'я", {
  min: LIMITS.nameMin,
  max: LIMITS.nameMax,
  pattern: PATTERNS.personName,
  patternMessage: "Повне ім'я може містити лише літери, пробіли, апостроф та дефіс",
});

const createOperatorValidation = [
  fullNameCreate,
  emailBody("email", "Email"),
  phoneBody("phone", "Телефон"),
  requiredIdBody("departmentId", "ID відділення"),
  requiredEnumBody("role", "Роль", ["operator", "courier"]),
  passwordBody("password", "Пароль"),
];

const updateOperatorValidation = [
  fullNameUpdate,
  optionalPhoneBody("phone", "Телефон"),
  optionalIdBody("departmentId", "ID відділення"),
  optionalEnumBody("role", "Роль", ["operator", "courier"]),
];

const updateOperatorStatusValidation = [
  body("isActive")
    .exists()
    .withMessage("Статус активності є обов'язковим")
    .isBoolean()
    .withMessage("Статус активності має бути true або false")
    .toBoolean(),
];

const listOperatorsValidation = [
  optionalIdQuery("departmentId", "ID відділення"),
  optionalBooleanQuery("includeInactive", "includeInactive"),
];

module.exports = {
  createOperatorValidation,
  updateOperatorValidation,
  updateOperatorStatusValidation,
  listOperatorsValidation,
};
