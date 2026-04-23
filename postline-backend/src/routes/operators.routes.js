const express = require("express");
const {
  createOperatorHandler,
  getOperatorHandler,
  listOperatorsHandler,
  updateOperatorHandler,
  deactivateOperatorHandler,
} = require("../controllers/operators.controller");
const { createOperatorValidation, updateOperatorValidation } = require("../validators/operator.validators");
const { validate } = require("../middleware/validate.middleware");
const { authGuard } = require("../middleware/auth.middleware");

const operatorRouter = express.Router();

operatorRouter.use(authGuard);

operatorRouter.post("/", createOperatorValidation, validate, createOperatorHandler);
operatorRouter.get("/", listOperatorsHandler);
operatorRouter.get("/:id", getOperatorHandler);
operatorRouter.patch("/:id", updateOperatorValidation, validate, updateOperatorHandler);
operatorRouter.delete("/:id", deactivateOperatorHandler);

module.exports = { operatorRouter };