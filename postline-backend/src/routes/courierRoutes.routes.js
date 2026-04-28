const express = require("express");
const {
  confirmCourierRouteHandler,
} = require("../controllers/courierRoutes.controller");
const { authGuard, authorize } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate.middleware");
const { confirmCourierRouteValidation } = require("../validators/courierRoute.validators");

const courierRoutesRouter = express.Router();

courierRoutesRouter.post(
  "/confirm",
  authGuard,
  authorize("operator", "admin", "courier"),
  confirmCourierRouteValidation,
  validate,
  confirmCourierRouteHandler
);

module.exports = { courierRoutesRouter };
