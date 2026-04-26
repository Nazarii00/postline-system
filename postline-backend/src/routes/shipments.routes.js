const express = require("express");
const {
  createShipmentHandler,
  getShipmentHandler,
  trackShipmentHandler,
  listShipmentsHandler,
  changeStatusHandler,
  cancelShipmentHandler,
  getShipmentHistoryHandler,
  getActivityHandler,
} = require("../controllers/shipments.controller");

const { createShipmentValidation, changeStatusValidation } = require("../validators/shipment.validators");
const { validate } = require("../middleware/validate.middleware");
const { authGuard, authorize } = require("../middleware/auth.middleware"); // ← додай authorize

const shipmentRouter = express.Router();

shipmentRouter.get("/track/:trackingNumber", trackShipmentHandler);

shipmentRouter.use(authGuard);

shipmentRouter.get("/activity", authorize('admin'), getActivityHandler); // ← перед /:id
shipmentRouter.get("/", listShipmentsHandler);
shipmentRouter.post("/", createShipmentValidation, validate, createShipmentHandler);
shipmentRouter.get("/:id", getShipmentHandler);
shipmentRouter.get("/:id/history", getShipmentHistoryHandler);
shipmentRouter.patch("/:id/status", changeStatusValidation, validate, changeStatusHandler);
shipmentRouter.patch("/:id/cancel", cancelShipmentHandler);

module.exports = { shipmentRouter };