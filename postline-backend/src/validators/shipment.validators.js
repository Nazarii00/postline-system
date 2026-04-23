const { body } = require("express-validator");

const createShipmentValidation = [
  body("senderId").notEmpty().isInt().withMessage("ID відправника має бути числом"),
  body("receiverId").notEmpty().isInt().withMessage("ID отримувача має бути числом"),
  body("originDeptId").notEmpty().isInt().withMessage("ID відділення відправки має бути числом"),
  body("destDeptId").notEmpty().isInt().withMessage("ID відділення призначення має бути числом"),
  body("tariffId").notEmpty().isInt().withMessage("ID тарифу має бути числом"),

  body("shipmentType")
    .notEmpty().withMessage("Тип відправлення є обов'язковим")
    .isIn(["letter", "parcel", "package"])
    .withMessage("Тип має бути: letter, parcel або package"),

  body("sizeCategory")
    .notEmpty().withMessage("Категорія розміру є обов'язковою")
    .isIn(["S", "M", "L", "XL"])
    .withMessage("Розмір має бути: S, M, L або XL"),

  body("weightKg")
    .notEmpty().withMessage("Вага є обов'язковою")
    .isFloat({ min: 0.1 }).withMessage("Вага має бути більшою за 0"),

  body("lengthCm").notEmpty().isFloat({ min: 0.1 }).withMessage("Довжина має бути більшою за 0"),
  body("widthCm").notEmpty().isFloat({ min: 0.1 }).withMessage("Ширина має бути більшою за 0"),
  body("heightCm").notEmpty().isFloat({ min: 0.1 }).withMessage("Висота має бути більшою за 0"),

  body("senderAddress")
    .trim().notEmpty().withMessage("Адреса відправника є обов'язковою")
    .isLength({ max: 200 }).withMessage("Максимум 200 символів"),

  body("receiverAddress")
    .trim().notEmpty().withMessage("Адреса отримувача є обов'язковою")
    .isLength({ max: 200 }).withMessage("Максимум 200 символів"),

  body("declaredValue")
    .optional().isFloat({ min: 0 }).withMessage("Оголошена цінність має бути числом"),

  body("description")
    .optional().trim().isLength({ max: 500 }).withMessage("Максимум 500 символів"),

  body("isCourier")
    .optional().isBoolean().withMessage("isCourier має бути boolean"),
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