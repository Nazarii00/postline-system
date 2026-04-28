const { body } = require("express-validator");
const {
  LIMITS,
  optionalFloatBody,
  requiredIdBody,
} = require("./common.validators");

const createRouteValidation = [
  requiredIdBody("startDeptId", "Стартове відділення"),
  requiredIdBody("endDeptId", "Кінцеве відділення"),
  optionalFloatBody("distanceKm", "Відстань", { min: 0, max: LIMITS.distanceKmMax }),
  optionalFloatBody("estTimeHours", "Час", { min: 0, max: LIMITS.durationHoursMax }),
  body("stops")
    .optional({ nullable: true })
    .isArray({ max: LIMITS.routeStopsMax })
    .withMessage(`Зупинки мають бути масивом до ${LIMITS.routeStopsMax} елементів`),
  body("stops.*.departmentId")
    .isInt({ min: 1 })
    .withMessage("ID відділення зупинки має бути додатним цілим числом")
    .toInt(),
  body("stops.*.distanceFromPrev")
    .optional({ nullable: true })
    .isFloat({ min: 0, max: LIMITS.distanceKmMax })
    .withMessage(`Відстань має бути числом від 0 до ${LIMITS.distanceKmMax}`)
    .toFloat(),
];

const updateRouteValidation = [
  optionalFloatBody("distanceKm", "Відстань", { min: 0, max: LIMITS.distanceKmMax }),
  optionalFloatBody("estTimeHours", "Час", { min: 0, max: LIMITS.durationHoursMax }),
];

module.exports = { createRouteValidation, updateRouteValidation };
