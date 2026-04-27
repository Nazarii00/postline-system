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
const { authGuard, authorize } = require("../middleware/auth.middleware");

const tariffRouter = express.Router();

tariffRouter.get("/", listTariffsHandler);
tariffRouter.get("/:id", getTariffHandler);
tariffRouter.post("/", authGuard, authorize("admin"), createTariffValidation, validate, createTariffHandler);
tariffRouter.patch("/:id", authGuard, authorize("admin"), updateTariffValidation, validate, updateTariffHandler);
tariffRouter.delete("/:id", authGuard, authorize("admin"), deleteTariffHandler);

module.exports = { tariffRouter };
