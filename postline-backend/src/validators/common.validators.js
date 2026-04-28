const { body, query, param } = require("express-validator");

const LIMITS = {
  nameMin: 2,
  nameMax: 100,
  cityMin: 2,
  cityMax: 100,
  addressMin: 5,
  addressMax: 200,
  emailMax: 100,
  passwordMin: 8,
  passwordMax: 64,
  noteMax: 500,
  trackingMin: 5,
  trackingMax: 20,
  moneyMax: 100000,
  weightMin: 0.1,
  weightMax: 1000,
  dimensionMin: 1,
  dimensionMax: 300,
  distanceKmMax: 10000,
  durationHoursMax: 240,
  routeStopsMax: 10,
};

const PATTERNS = {
  personName: /^[A-Za-zА-Яа-яІіЇїЄєҐґ' -]+$/,
  city: /^[A-Za-zА-Яа-яІіЇїЄєҐґ' -]+$/,
  phone: /^\+380\d{9}$/,
  time: /^([01]\d|2[0-3]):[0-5]\d$/,
  date: /^\d{4}-\d{2}-\d{2}$/,
  trackingNumber: /^PL[A-Z0-9]+$/i,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-[\]/+=~`\\]).{8,64}$/,
};

const optional = { checkFalsy: true, nullable: true };

const requiredTextBody = (field, label, { min = 1, max, pattern, patternMessage } = {}) => {
  let chain = body(field)
    .trim()
    .notEmpty()
    .withMessage(`${label} є обов'язковим`)
    .isLength({ min, max })
    .withMessage(`${label} має містити від ${min} до ${max} символів`);

  if (pattern) {
    chain = chain.matches(pattern).withMessage(patternMessage || `${label} має некоректний формат`);
  }

  return chain;
};

const optionalTextBody = (field, label, { min = 0, max, pattern, patternMessage } = {}) => {
  let chain = body(field)
    .optional(optional)
    .trim()
    .isLength({ min, max })
    .withMessage(`${label} має містити не більше ${max} символів`);

  if (pattern) {
    chain = chain.matches(pattern).withMessage(patternMessage || `${label} має некоректний формат`);
  }

  return chain;
};

const requiredIdBody = (field, label) =>
  body(field)
    .notEmpty()
    .withMessage(`${label} є обов'язковим`)
    .isInt({ min: 1 })
    .withMessage(`${label} має бути додатним цілим числом`)
    .toInt();

const optionalIdBody = (field, label) =>
  body(field)
    .optional(optional)
    .isInt({ min: 1 })
    .withMessage(`${label} має бути додатним цілим числом`)
    .toInt();

const requiredFloatBody = (field, label, { min = 0, max } = {}) =>
  body(field)
    .notEmpty()
    .withMessage(`${label} є обов'язковим`)
    .isFloat({ min, max })
    .withMessage(`${label} має бути числом від ${min} до ${max}`)
    .toFloat();

const optionalFloatBody = (field, label, { min = 0, max } = {}) =>
  body(field)
    .optional(optional)
    .isFloat({ min, max })
    .withMessage(`${label} має бути числом від ${min} до ${max}`)
    .toFloat();

const phoneBody = (field = "phone", label = "Телефон") =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage(`${label} є обов'язковим`)
    .matches(PATTERNS.phone)
    .withMessage(`${label} має бути у форматі +380XXXXXXXXX`);

const optionalPhoneBody = (field = "phone", label = "Телефон") =>
  body(field)
    .optional(optional)
    .trim()
    .matches(PATTERNS.phone)
    .withMessage(`${label} має бути у форматі +380XXXXXXXXX`);

const emailBody = (field = "email", label = "Email") =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage(`${label} є обов'язковим`)
    .isLength({ max: LIMITS.emailMax })
    .withMessage(`${label} має містити не більше ${LIMITS.emailMax} символів`)
    .isEmail()
    .withMessage(`${label} має некоректний формат`)
    .normalizeEmail();

const passwordBody = (field = "password", label = "Пароль") =>
  body(field)
    .notEmpty()
    .withMessage(`${label} є обов'язковим`)
    .isLength({ min: LIMITS.passwordMin, max: LIMITS.passwordMax })
    .withMessage(`${label} має містити від ${LIMITS.passwordMin} до ${LIMITS.passwordMax} символів`)
    .matches(PATTERNS.password)
    .withMessage(`${label} має містити велику і малу літеру, цифру та спецсимвол`);

const timeBody = (field, label) =>
  body(field)
    .optional(optional)
    .matches(PATTERNS.time)
    .withMessage(`${label} має бути у форматі HH:MM`);

const optionalDateQuery = (field, label) =>
  query(field)
    .optional(optional)
    .matches(PATTERNS.date)
    .withMessage(`${label} має бути у форматі YYYY-MM-DD`);

const optionalEnumQuery = (field, label, values) =>
  query(field)
    .optional(optional)
    .isIn(["all", ...values])
    .withMessage(`${label} має некоректне значення`);

const optionalTextQuery = (field, label, { max = LIMITS.cityMax, pattern } = {}) => {
  let chain = query(field)
    .optional(optional)
    .trim()
    .isLength({ max })
    .withMessage(`${label} має містити не більше ${max} символів`);

  if (pattern) {
    chain = chain.matches(pattern).withMessage(`${label} має некоректний формат`);
  }

  return chain;
};

const optionalIdQuery = (field, label) =>
  query(field)
    .optional(optional)
    .isInt({ min: 1 })
    .withMessage(`${label} має бути додатним цілим числом`)
    .toInt();

const optionalBooleanQuery = (field, label) =>
  query(field)
    .optional(optional)
    .isBoolean()
    .withMessage(`${label} має бути true або false`);

const optionalTrackingQuery = (field = "trackingNumber", label = "Трекінг-номер") =>
  query(field)
    .optional(optional)
    .trim()
    .isLength({ min: LIMITS.trackingMin, max: LIMITS.trackingMax })
    .withMessage(`${label} має містити від ${LIMITS.trackingMin} до ${LIMITS.trackingMax} символів`)
    .matches(PATTERNS.trackingNumber)
    .withMessage(`${label} має починатися з PL та містити лише літери і цифри`);

const requiredEnumBody = (field, label, values) =>
  body(field)
    .notEmpty()
    .withMessage(`${label} є обов'язковим`)
    .isIn(values)
    .withMessage(`${label} має некоректне значення`);

const optionalEnumBody = (field, label, values) =>
  body(field)
    .optional(optional)
    .isIn(values)
    .withMessage(`${label} має некоректне значення`);

const idParam = (field = "id", label = "ID") =>
  param(field)
    .isInt({ min: 1 })
    .withMessage(`${label} має бути додатним цілим числом`)
    .toInt();

module.exports = {
  LIMITS,
  PATTERNS,
  requiredTextBody,
  optionalTextBody,
  requiredIdBody,
  optionalIdBody,
  requiredFloatBody,
  optionalFloatBody,
  phoneBody,
  optionalPhoneBody,
  emailBody,
  passwordBody,
  timeBody,
  optionalDateQuery,
  optionalEnumQuery,
  optionalTextQuery,
  optionalIdQuery,
  optionalBooleanQuery,
  optionalTrackingQuery,
  requiredEnumBody,
  optionalEnumBody,
  idParam,
};
