const { body } = require("express-validator");

const createOperatorValidation = [
  body("fullName")
    .trim().notEmpty().withMessage("Повне ім'я є обов'язковим")
    .isLength({ min: 2, max: 100 }).withMessage("Ім'я має містити від 2 до 100 символів"),

  body("email")
    .trim().notEmpty().withMessage("Email є обов'язковим")
    .isEmail().withMessage("Некоректний формат email"),

  body("phone")
    .trim().notEmpty().withMessage("Телефон є обов'язковим")
    .matches(/^\+380\d{9}$/).withMessage("Телефон має бути у форматі +380XXXXXXXXX"),

  body("departmentId")
    .notEmpty().withMessage("ID відділення є обов'язковим")
    .isInt().withMessage("ID відділення має бути числом"),

  body("role")
    .notEmpty().withMessage("Роль є обов'язковою")
    .isIn(["operator", "courier"]).withMessage("Роль має бути: operator або courier"),

  body("password")
    .notEmpty().withMessage("Пароль є обов'язковим")
    .isLength({ min: 8 }).withMessage("Пароль має містити мінімум 8 символів"),
];

const updateOperatorValidation = [
  body("fullName")
    .optional().trim()
    .isLength({ min: 2, max: 100 }).withMessage("Ім'я має містити від 2 до 100 символів"),

  body("phone")
    .optional().trim()
    .matches(/^\+380\d{9}$/).withMessage("Телефон має бути у форматі +380XXXXXXXXX"),

  body("departmentId")
    .optional()
    .isInt().withMessage("ID відділення має бути числом"),

  body("role")
    .optional()
    .isIn(["operator", "courier"]).withMessage("Роль має бути: operator або courier"),
];

const updateOperatorStatusValidation = [
  body("isActive")
    .exists().withMessage("Статус активності є обов'язковим")
    .isBoolean().withMessage("Статус активності має бути true або false")
    .toBoolean(),
];

module.exports = { createOperatorValidation, updateOperatorValidation, updateOperatorStatusValidation };
