const { body } = require("express-validator");

const fullNameRules = body("fullName")
  .trim()
  .notEmpty()
  .withMessage("Поле fullName є обов'язковим")
  .isLength({ min: 2, max: 80 })
  .withMessage("fullName має містити від 2 до 80 символів")
  .matches(/^[A-Za-zА-Яа-яІіЇїЄє' -]+$/)
  .withMessage("fullName може містити лише літери, пробіли, апостроф та дефіс");

const emailRules = body("email")
  .trim()
  .notEmpty()
  .withMessage("Поле email є обов'язковим")
  .isEmail()
  .withMessage("Некоректний формат email")
  .normalizeEmail();

const phoneRules = body("phone")
  .trim()
  .notEmpty()
  .withMessage("Поле phone є обов'язковим")
  .matches(/^\+380\d{9}$/)
  .withMessage("phone має бути у форматі +380XXXXXXXXX");

const roleRules = body("role")
  .optional()
  .isIn(["client", "operator", "admin"])
  .withMessage("role має бути одним із: client, operator, admin");

const passwordRules = body("password")
  .notEmpty()
  .withMessage("Поле password є обов'язковим")
  .isLength({ min: 8, max: 64 })
  .withMessage("password має містити від 8 до 64 символів")
  .matches(/[A-Z]/)
  .withMessage("password має містити хоча б одну велику літеру")
  .matches(/[a-z]/)
  .withMessage("password має містити хоча б одну малу літеру")
  .matches(/\d/)
  .withMessage("password має містити хоча б одну цифру")
  .matches(/[!@#$%^&*(),.?":{}|<>_\-\\[\]/+=~`]/)
  .withMessage("password має містити хоча б один спеціальний символ");

const registerValidation = [fullNameRules, emailRules, phoneRules, roleRules, passwordRules];

const loginValidation = [
  body("email").trim().notEmpty().withMessage("Поле email є обов'язковим").isEmail().withMessage("Некоректний формат email"),
  body("password").notEmpty().withMessage("Поле password є обов'язковим"),
];

const updateProfileValidation = [fullNameRules, emailRules, phoneRules];

module.exports = { registerValidation, loginValidation, updateProfileValidation };
