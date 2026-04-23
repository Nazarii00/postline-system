const express = require("express");
const {
  createRouteHandler,
  getRouteHandler,
  listRoutesHandler,
  updateRouteHandler,
  deleteRouteHandler,
} = require("../controllers/routes.controller");
const { createRouteValidation, updateRouteValidation } = require("../validators/route.validators");
const { validate } = require("../middleware/validate.middleware");
const { authGuard } = require("../middleware/auth.middleware");

const routeRouter = express.Router();

routeRouter.use(authGuard);

routeRouter.post("/", createRouteValidation, validate, createRouteHandler);
routeRouter.get("/", listRoutesHandler);
routeRouter.get("/:id", getRouteHandler);
routeRouter.patch("/:id", updateRouteValidation, validate, updateRouteHandler);
routeRouter.delete("/:id", deleteRouteHandler);

module.exports = { routeRouter };