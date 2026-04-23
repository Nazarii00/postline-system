const { param } = require("express-validator");

const getTrackingValidation = [
  param("trackingNumber")
    .trim()
    .notEmpty()
    .withMessage("Трекінг-номер є обов'язковим")
    .matches(/^PL[A-Z0-9]+$/i)
    .withMessage("Невірний формат трекінг-номера (має починатися з PL та містити лише літери і цифри)")
    .isLength({ min: 5, max: 20 })
    .withMessage("Трекінг-номер має містити від 5 до 20 символів"),
];

module.exports = {
  getTrackingValidation,
};