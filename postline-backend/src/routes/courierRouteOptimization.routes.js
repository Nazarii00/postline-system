const express = require("express");
const {
  optimizeCourierDeliveriesRouteHandler,
} = require("../controllers/courierRouteOptimization.controller");
const { authGuard, authorize } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate.middleware");
const { optimizeCourierRouteValidation } = require("../validators/courierRoute.validators");

const courierRouteOptimizationRouter = express.Router();

courierRouteOptimizationRouter.post(
  "/optimize",
  authGuard,
  authorize("operator", "admin", "courier"),
  optimizeCourierRouteValidation,
  validate,
  optimizeCourierDeliveriesRouteHandler
);

module.exports = { courierRouteOptimizationRouter };
