const { body } = require("express-validator");
const {
  LIMITS,
  PATTERNS,
  emailBody,
  optionalEnumBody,
  passwordBody,
  phoneBody,
  requiredTextBody,
} = require("./common.validators");

const fullNameRules = requiredTextBody("fullName", "fullName", {
  min: LIMITS.nameMin,
  max: LIMITS.nameMax,
  pattern: PATTERNS.personName,
  patternMessage: "fullName може містити лише літери, пробіли, апостроф та дефіс",
});

const roleRules = optionalEnumBody("role", "role", ["client", "operator", "admin"]);

const loginPasswordRules = body("password")
  .notEmpty()
  .withMessage("Поле password є обов'язковим")
  .isLength({ min: LIMITS.passwordMin, max: LIMITS.passwordMax })
  .withMessage(`password має містити від ${LIMITS.passwordMin} до ${LIMITS.passwordMax} символів`);

const currentPasswordRules = body("currentPassword")
  .notEmpty()
  .withMessage("Поле currentPassword є обов'язковим")
  .isLength({ min: LIMITS.passwordMin, max: LIMITS.passwordMax })
  .withMessage(`currentPassword має містити від ${LIMITS.passwordMin} до ${LIMITS.passwordMax} символів`);

const newPasswordRules = passwordBody("newPassword", "newPassword")
  .custom((value, { req }) => value !== req.body.currentPassword)
  .withMessage("Новий пароль має відрізнятися від поточного");

const registerValidation = [
  fullNameRules,
  emailBody("email", "email"),
  phoneBody("phone", "phone"),
  roleRules,
  passwordBody("password", "password"),
];

const loginValidation = [
  emailBody("email", "email"),
  loginPasswordRules,
];

const updateProfileValidation = [
  fullNameRules,
  emailBody("email", "email"),
  phoneBody("phone", "phone"),
];

const changePasswordValidation = [
  currentPasswordRules,
  newPasswordRules,
];

module.exports = {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
};
