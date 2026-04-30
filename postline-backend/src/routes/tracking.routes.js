const express = require("express");
const { getTrackingHandler } = require("../controllers/tracking.controller");
const { getTrackingValidation } = require("../validators/tracking.validators");
const { validate } = require("../middleware/validate.middleware");
const { optionalAuthGuard } = require("../middleware/auth.middleware");

const trackingRouter = express.Router();

// Зверни увагу: authGuard тут НЕМАЄ, бо це публічний маршрут.
// Але є getTrackingValidation та validate, щоб фільтрувати некоректні трекінг-номери.
trackingRouter.get("/:trackingNumber", optionalAuthGuard, getTrackingValidation, validate, getTrackingHandler);

module.exports = { trackingRouter };
