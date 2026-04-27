const express = require("express");
const {
  optimizeCourierDeliveriesRouteHandler,
} = require("../controllers/courierRouteOptimization.controller");
const { authGuard, authorize } = require("../middleware/auth.middleware");

const courierRouteOptimizationRouter = express.Router();

courierRouteOptimizationRouter.post(
  "/optimize",
  authGuard,
  authorize("operator", "admin", "courier"),
  optimizeCourierDeliveriesRouteHandler
);

module.exports = { courierRouteOptimizationRouter };
