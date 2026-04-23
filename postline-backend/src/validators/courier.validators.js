const { body } = require("express-validator");

const createCourierDeliveryValidation = [
  body("shipmentId")
    .notEmpty().withMessage("ID відправлення є обов'язковим")
    .isInt().withMessage("ID відправлення має бути числом"),

  body("courierId")
    .notEmpty().withMessage("ID кур'єра є обов'язковим")
    .isInt().withMessage("ID кур'єра має бути числом"),

  body("toAddress")
    .trim()
    .notEmpty().withMessage("Адреса доставки є обов'язковою")
    .isLength({ max: 200 }).withMessage("Адреса має містити максимум 200 символів"),

  body("notes")
    .optional().trim()
    .isLength({ max: 500 }).withMessage("Примітки мають містити максимум 500 символів"),
];

const updateCourierDeliveryStatusValidation = [
  body("status")
    .notEmpty().withMessage("Статус є обов'язковим")
    .isIn(["in_progress", "delivered", "failed"])
    .withMessage("Статус має бути: in_progress, delivered або failed"),

  body("failureReason")
    .if(body("status").equals("failed"))
    .notEmpty().withMessage("Причина невдачі є обов'язковою при статусі failed")
    .isLength({ max: 500 }).withMessage("Максимум 500 символів"),

  body("notes")
    .optional().trim()
    .isLength({ max: 500 }).withMessage("Примітки мають містити максимум 500 символів"),
];

module.exports = { createCourierDeliveryValidation, updateCourierDeliveryStatusValidation };