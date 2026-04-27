const express = require("express");
const {
  createOperatorHandler,
  getOperatorHandler,
  listOperatorsHandler,
  updateOperatorHandler,
  updateOperatorStatusHandler,
  deactivateOperatorHandler,
} = require("../controllers/operators.controller");
const {
  createOperatorValidation,
  updateOperatorValidation,
  updateOperatorStatusValidation,
} = require("../validators/operator.validators");
const { validate } = require("../middleware/validate.middleware");
const { authGuard, authorize } = require("../middleware/auth.middleware");

const operatorRouter = express.Router();

operatorRouter.use(authGuard);

operatorRouter.post("/", authorize("admin"), createOperatorValidation, validate, createOperatorHandler);
operatorRouter.get("/", authorize("admin", "operator"), listOperatorsHandler);
operatorRouter.get("/:id", authorize("admin", "operator"), getOperatorHandler);
operatorRouter.patch("/:id/status", authorize("admin"), updateOperatorStatusValidation, validate, updateOperatorStatusHandler);
operatorRouter.patch("/:id", authorize("admin"), updateOperatorValidation, validate, updateOperatorHandler);
operatorRouter.delete("/:id", authorize("admin"), deactivateOperatorHandler);

module.exports = { operatorRouter };
