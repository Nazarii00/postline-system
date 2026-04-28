const { body } = require("express-validator");
const {
  LIMITS,
  optionalEnumQuery,
  optionalIdQuery,
  optionalTextBody,
  requiredEnumBody,
  requiredIdBody,
  requiredTextBody,
} = require("./common.validators");

const createCourierDeliveryValidation = [
  requiredIdBody("shipmentId", "ID відправлення"),
  requiredIdBody("courierId", "ID кур'єра"),
  requiredTextBody("toAddress", "Адреса доставки", {
    min: LIMITS.addressMin,
    max: LIMITS.addressMax,
  }),
  optionalTextBody("notes", "Примітки", { max: LIMITS.noteMax }),
];

const updateCourierDeliveryStatusValidation = [
  requiredEnumBody("status", "Статус", ["delivered", "failed"]),
  body("failureReason")
    .if(body("status").equals("failed"))
    .trim()
    .notEmpty()
    .withMessage("Причина невдачі є обов'язковою при статусі failed")
    .isLength({ max: LIMITS.noteMax })
    .withMessage(`Причина невдачі має містити не більше ${LIMITS.noteMax} символів`),
  optionalTextBody("notes", "Примітки", { max: LIMITS.noteMax }),
];

const listCourierDeliveriesValidation = [
  optionalIdQuery("shipmentId", "ID відправлення"),
  optionalIdQuery("courierId", "ID кур'єра"),
  optionalEnumQuery("status", "Статус", ["assigned", "in_progress", "delivered", "failed"]),
];

module.exports = {
  createCourierDeliveryValidation,
  updateCourierDeliveryStatusValidation,
  listCourierDeliveriesValidation,
};
