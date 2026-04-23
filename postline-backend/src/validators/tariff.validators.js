const { body } = require("express-validator");

const createTariffValidation = [
  body("cityFrom")
    .trim().notEmpty().withMessage("Місто відправлення є обов'язковим")
    .isLength({ max: 100 }).withMessage("Максимум 100 символів"),

  body("cityTo")
    .trim().notEmpty().withMessage("Місто призначення є обов'язковим")
    .isLength({ max: 100 }).withMessage("Максимум 100 символів"),

  body("shipmentType")
    .notEmpty().withMessage("Тип відправлення є обов'язковим")
    .isIn(["letter", "parcel", "package"])
    .withMessage("Тип має бути: letter, parcel або package"),

  body("sizeCategory")
    .notEmpty().withMessage("Категорія розміру є обов'язковою")
    .isIn(["S", "M", "L", "XL"])
    .withMessage("Розмір має бути: S, M, L або XL"),

  body("basePrice")
    .notEmpty().withMessage("Базова ціна є обов'язковою")
    .isFloat({ min: 0 }).withMessage("Базова ціна має бути >= 0"),

  body("pricePerKg")
    .notEmpty().withMessage("Ціна за кг є обов'язковою")
    .isFloat({ min: 0 }).withMessage("Ціна за кг має бути >= 0"),
];

const updateTariffValidation = [
  body("basePrice")
    .optional()
    .isFloat({ min: 0 }).withMessage("Базова ціна має бути >= 0"),

  body("pricePerKg")
    .optional()
    .isFloat({ min: 0 }).withMessage("Ціна за кг має бути >= 0"),
];

module.exports = { createTariffValidation, updateTariffValidation };