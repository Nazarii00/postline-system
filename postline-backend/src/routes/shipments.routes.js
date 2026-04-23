const express = require("express");
const {
  createShipmentHandler,
  getShipmentHandler,
  trackShipmentHandler,
  listShipmentsHandler,
  changeStatusHandler,
  cancelShipmentHandler,
  getShipmentHistoryHandler,
} = require("../controllers/shipments.controller");

const { createShipmentValidation, changeStatusValidation } = require("../validators/shipment.validators");
const { validate } = require("../middleware/validate.middleware");
const { authGuard } = require("../middleware/auth.middleware");
const { getShipmentHistory } = require('../repositories/shipments.repository');
const shipmentRouter = express.Router();

// Публічне відстеження — без авторизації
shipmentRouter.get("/track/:trackingNumber", trackShipmentHandler);

shipmentRouter.use(authGuard);

shipmentRouter.post("/", createShipmentValidation, validate, createShipmentHandler);
shipmentRouter.get("/", listShipmentsHandler);
shipmentRouter.get("/:id", getShipmentHandler);
shipmentRouter.get('/:id/history', getShipmentHistoryHandler);

shipmentRouter.patch("/:id/status", changeStatusValidation, validate, changeStatusHandler);
shipmentRouter.patch("/:id/cancel", cancelShipmentHandler);

module.exports = { shipmentRouter };