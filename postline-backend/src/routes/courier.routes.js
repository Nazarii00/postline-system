const express = require("express");
const {
  createCourierDeliveryHandler,
  getCourierDeliveryHandler,
  listCourierDeliveriesHandler,
  updateCourierDeliveryStatusHandler,
} = require("../controllers/courier.controller");
const { createCourierDeliveryValidation, updateCourierDeliveryStatusValidation } = require("../validators/courier.validators");
const { validate } = require("../middleware/validate.middleware");
const { authGuard } = require("../middleware/auth.middleware");

const courierRouter = express.Router();

courierRouter.use(authGuard);

courierRouter.post("/", createCourierDeliveryValidation, validate, createCourierDeliveryHandler);
courierRouter.get("/", listCourierDeliveriesHandler);
courierRouter.get("/:id", getCourierDeliveryHandler);
courierRouter.patch("/:id/status", updateCourierDeliveryStatusValidation, validate, updateCourierDeliveryStatusHandler);

module.exports = { courierRouter };