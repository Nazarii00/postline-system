const express = require("express");
const {
  createCourierDeliveryHandler,
  getCourierDeliveryHandler,
  listCourierDeliveriesHandler,
  updateCourierDeliveryStatusHandler,
} = require("../controllers/courier.controller");
const {
  createCourierDeliveryValidation,
  listCourierDeliveriesValidation,
  updateCourierDeliveryStatusValidation,
} = require("../validators/courier.validators");
const { validate } = require("../middleware/validate.middleware");
const { authGuard, authorize } = require("../middleware/auth.middleware");

const courierRouter = express.Router();

courierRouter.use(authGuard);

courierRouter.post("/", authorize("admin", "operator"), createCourierDeliveryValidation, validate, createCourierDeliveryHandler);
courierRouter.get("/", authorize("admin", "operator", "courier"), listCourierDeliveriesValidation, validate, listCourierDeliveriesHandler);
courierRouter.get("/:id", authorize("admin", "operator", "courier"), getCourierDeliveryHandler);
courierRouter.patch("/:id/status", authorize("admin", "operator", "courier"), updateCourierDeliveryStatusValidation, validate, updateCourierDeliveryStatusHandler);

module.exports = { courierRouter };
