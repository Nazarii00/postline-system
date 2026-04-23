const { body } = require("express-validator");

const createDepartmentValidation = [
  body("city")
    .trim().notEmpty().withMessage("Місто є обов'язковим")
    .isLength({ min: 2, max: 100 }).withMessage("Місто має містити від 2 до 100 символів"),

  body("address")
    .trim().notEmpty().withMessage("Адреса є обов'язковою")
    .isLength({ min: 5, max: 200 }).withMessage("Адреса має містити від 5 до 200 символів"),

  body("type")
    .notEmpty().withMessage("Тип відділення є обов'язковим")
    .isIn(["sorting_center", "post_office", "pickup_point"])
    .withMessage("Тип має бути: sorting_center, post_office або pickup_point"),

  body("phone")
    .optional()
    .matches(/^\+380\d{9}$/).withMessage("Телефон має бути у форматі +380XXXXXXXXX"),

  body("openingTime")
    .optional()
    .matches(/^\d{2}:\d{2}$/).withMessage("Час має бути у форматі HH:MM"),

  body("closingTime")
    .optional()
    .matches(/^\d{2}:\d{2}$/).withMessage("Час має бути у форматі HH:MM"),
];

const updateDepartmentValidation = [
  body("city")
    .optional().trim()
    .isLength({ min: 2, max: 100 }).withMessage("Місто має містити від 2 до 100 символів"),

  body("address")
    .optional().trim()
    .isLength({ min: 5, max: 200 }).withMessage("Адреса має містити від 5 до 200 символів"),

  body("type")
    .optional()
    .isIn(["sorting_center", "post_office", "pickup_point"])
    .withMessage("Тип має бути: sorting_center, post_office або pickup_point"),

  body("phone")
    .optional()
    .matches(/^\+380\d{9}$/).withMessage("Телефон має бути у форматі +380XXXXXXXXX"),

  body("openingTime")
    .optional()
    .matches(/^\d{2}:\d{2}$/).withMessage("Час має бути у форматі HH:MM"),

  body("closingTime")
    .optional()
    .matches(/^\d{2}:\d{2}$/).withMessage("Час має бути у форматі HH:MM"),
];

module.exports = { createDepartmentValidation, updateDepartmentValidation };