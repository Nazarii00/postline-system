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
const { authGuard, authorize } = require("../middleware/auth.middleware");

const routeRouter = express.Router();

routeRouter.use(authGuard);

routeRouter.post("/", authorize("admin", "operator"), createRouteValidation, validate, createRouteHandler);
routeRouter.get("/", authorize("admin", "operator"), listRoutesHandler);
routeRouter.get("/:id", authorize("admin", "operator"), getRouteHandler);
routeRouter.patch("/:id", authorize("admin", "operator"), updateRouteValidation, validate, updateRouteHandler);
routeRouter.delete("/:id", authorize("admin", "operator"), deleteRouteHandler);

module.exports = { routeRouter };
