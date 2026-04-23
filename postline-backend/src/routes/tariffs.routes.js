const express = require("express");
const {
  createTariffHandler,
  getTariffHandler,
  listTariffsHandler,
  updateTariffHandler,
  deleteTariffHandler,
} = require("../controllers/tariffs.controller");
const { createTariffValidation, updateTariffValidation } = require("../validators/tariff.validators");
const { validate } = require("../middleware/validate.middleware");
const { authGuard } = require("../middleware/auth.middleware");

const tariffRouter = express.Router();

tariffRouter.get("/", listTariffsHandler);
tariffRouter.get("/:id", getTariffHandler);
tariffRouter.post("/", authGuard, createTariffValidation, validate, createTariffHandler);
tariffRouter.patch("/:id", authGuard, updateTariffValidation, validate, updateTariffHandler);
tariffRouter.delete("/:id", authGuard, deleteTariffHandler);

module.exports = { tariffRouter };