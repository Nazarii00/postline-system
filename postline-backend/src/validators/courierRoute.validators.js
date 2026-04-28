const { body } = require("express-validator");
const {
  LIMITS,
  optionalFloatBody,
  optionalTextBody,
  requiredIdBody,
  requiredTextBody,
} = require("./common.validators");

const routeMeterMax = LIMITS.distanceKmMax * 1000;
const routeSecondMax = LIMITS.durationHoursMax * 60 * 60;

const positiveIdArray = (field, label, { min = 1, max = LIMITS.routeStopsMax } = {}) => [
  body(field)
    .isArray({ min, max })
    .withMessage(`${label} має бути масивом від ${min} до ${max} елементів`)
    .custom((items) => new Set(items.map((item) => Number(item))).size === items.length)
    .withMessage(`${label} не має містити дублікати`),
  body(`${field}.*`)
    .isInt({ min: 1 })
    .withMessage(`${label} має містити тільки додатні цілі ID`)
    .toInt(),
];

const optimizeCourierRouteValidation = [
  requiredIdBody("courierId", "ID кур'єра"),
  requiredTextBody("startAddress", "Стартова адреса", {
    min: LIMITS.addressMin,
    max: LIMITS.addressMax,
  }),
  ...positiveIdArray("deliveryIds", "deliveryIds", { min: 2, max: LIMITS.routeStopsMax }),
];

const confirmCourierRouteValidation = [
  requiredIdBody("courierId", "ID кур'єра"),
  requiredTextBody("startAddress", "Стартова адреса", {
    min: LIMITS.addressMin,
    max: LIMITS.addressMax,
  }),
  optionalFloatBody("distanceMeters", "Дистанція", { min: 0, max: routeMeterMax }),
  optionalFloatBody("durationSeconds", "Тривалість", { min: 0, max: routeSecondMax }),
  body("geometry")
    .optional({ nullable: true })
    .isObject()
    .withMessage("geometry має бути об'єктом"),
  body("stops")
    .isArray({ min: 1, max: LIMITS.routeStopsMax })
    .withMessage(`stops має бути масивом від 1 до ${LIMITS.routeStopsMax} елементів`)
    .custom((stops) => new Set(stops.map((stop) => Number(stop.deliveryId ?? stop.id))).size === stops.length)
    .withMessage("stops не має містити дублікати доставок")
    .custom((stops) => new Set(stops.map((stop, index) => Number(stop.order ?? index + 1))).size === stops.length)
    .withMessage("stops не має містити дублікати порядку"),
  body("stops.*.deliveryId")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("deliveryId зупинки має бути додатним цілим числом")
    .toInt(),
  body("stops.*.id")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("id зупинки має бути додатним цілим числом")
    .toInt(),
  body("stops.*")
    .custom((stop) => Number.isInteger(Number(stop.deliveryId ?? stop.id)) && Number(stop.deliveryId ?? stop.id) > 0)
    .withMessage("Кожна зупинка має містити deliveryId або id"),
  body("stops.*.order")
    .optional({ nullable: true })
    .isInt({ min: 1, max: LIMITS.routeStopsMax })
    .withMessage(`Порядок зупинки має бути числом від 1 до ${LIMITS.routeStopsMax}`)
    .toInt(),
  body("stops.*.toAddress")
    .trim()
    .notEmpty()
    .withMessage("Адреса зупинки є обов'язковою")
    .isLength({ min: LIMITS.addressMin, max: LIMITS.addressMax })
    .withMessage(`Адреса зупинки має містити від ${LIMITS.addressMin} до ${LIMITS.addressMax} символів`),
  optionalTextBody("stops.*.resolvedAddress", "Уточнена адреса", {
    min: LIMITS.addressMin,
    max: LIMITS.addressMax,
  }),
  body("stops.*.lat")
    .optional({ nullable: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage("lat має бути числом від -90 до 90")
    .toFloat(),
  body("stops.*.lng")
    .optional({ nullable: true })
    .isFloat({ min: -180, max: 180 })
    .withMessage("lng має бути числом від -180 до 180")
    .toFloat(),
];

module.exports = {
  optimizeCourierRouteValidation,
  confirmCourierRouteValidation,
};
