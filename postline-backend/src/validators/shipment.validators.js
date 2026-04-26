const { body } = require("express-validator");

// shipment.validators.js
const createShipmentValidation = [
  body("senderPhone")
    .notEmpty().withMessage("Телефон відправника є обов'язковим")
    .matches(/^\+380\d{9}$/).withMessage("Формат: +380XXXXXXXXX"),

  body("senderName")
    .trim().notEmpty().withMessage("Ім'я відправника є обов'язковим")
    .isLength({ min: 2, max: 100 }),

  body("receiverPhone")
    .notEmpty().withMessage("Телефон одержувача є обов'язковим")
    .matches(/^\+380\d{9}$/).withMessage("Формат: +380XXXXXXXXX"),

  body("receiverName")
    .trim().notEmpty().withMessage("Ім'я одержувача є обов'язковим")
    .isLength({ min: 2, max: 100 }),

  body("originDeptId").notEmpty().isInt().withMessage("ID відділення відправки має бути числом"),
  body("destDeptId").notEmpty().isInt().withMessage("ID відділення призначення має бути числом"),
  body("tariffId").notEmpty().isInt().withMessage("ID тарифу має бути числом"),

  body("shipmentType")
    .notEmpty()
    .isIn(["letter", "parcel", "package"])
    .withMessage("Тип має бути: letter, parcel або package"),

  body("sizeCategory")
    .notEmpty()
    .isIn(["S", "M", "L", "XL"])
    .withMessage("Розмір має бути: S, M, L або XL"),

  body("weightKg").notEmpty().isFloat({ min: 0.1 }).withMessage("Вага має бути більшою за 0"),
  body("lengthCm").notEmpty().isFloat({ min: 0.1 }),
  body("widthCm").notEmpty().isFloat({ min: 0.1 }),
  body("heightCm").notEmpty().isFloat({ min: 0.1 }),

  body("declaredValue").optional().isFloat({ min: 0 }),
  body("description").optional().trim().isLength({ max: 500 }),
  body("isCourier").optional().isBoolean(),
];

const changeStatusValidation = [
  body("status")
    .notEmpty().withMessage("Статус є обов'язковим")
    .isIn(["sorting", "in_transit", "arrived", "ready_for_pickup", "delivered", "returned"])
    .withMessage("Недозволений статус"),

  body("notes")
    .optional().trim().isLength({ max: 500 }).withMessage("Максимум 500 символів"),
];

module.exports = { createShipmentValidation, changeStatusValidation };