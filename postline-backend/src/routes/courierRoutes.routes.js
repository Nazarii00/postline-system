const express = require("express");
const {
  confirmCourierRouteHandler,
} = require("../controllers/courierRoutes.controller");
const { authGuard, authorize } = require("../middleware/auth.middleware");

const courierRoutesRouter = express.Router();

courierRoutesRouter.post(
  "/confirm",
  authGuard,
  authorize("operator", "admin", "courier"),
  confirmCourierRouteHandler
);

module.exports = { courierRoutesRouter };
