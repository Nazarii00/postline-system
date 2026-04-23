const { body } = require("express-validator");

const createRouteValidation = [
  body("startDeptId")
    .notEmpty().withMessage("Стартове відділення є обов'язковим")
    .isInt().withMessage("ID відділення має бути числом"),

  body("endDeptId")
    .notEmpty().withMessage("Кінцеве відділення є обов'язковим")
    .isInt().withMessage("ID відділення має бути числом"),

  body("distanceKm")
    .optional()
    .isFloat({ min: 0 }).withMessage("Відстань має бути числом більшим за 0"),

  body("estTimeHours")
    .optional()
    .isFloat({ min: 0 }).withMessage("Час має бути числом більшим за 0"),

  body("stops")
    .optional()
    .isArray().withMessage("Зупинки мають бути масивом"),

  body("stops.*.departmentId")
    .isInt().withMessage("ID відділення зупинки має бути числом"),

  body("stops.*.distanceFromPrev")
    .optional()
    .isFloat({ min: 0 }).withMessage("Відстань має бути числом більшим за 0"),
];

const updateRouteValidation = [
  body("distanceKm")
    .optional()
    .isFloat({ min: 0 }).withMessage("Відстань має бути числом більшим за 0"),

  body("estTimeHours")
    .optional()
    .isFloat({ min: 0 }).withMessage("Час має бути числом більшим за 0"),
];

module.exports = { createRouteValidation, updateRouteValidation };