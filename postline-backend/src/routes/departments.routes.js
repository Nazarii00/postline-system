const express = require("express");
const {
  createDepartmentHandler,
  getDepartmentHandler,
  listDepartmentsHandler,
  updateDepartmentHandler,
  deleteDepartmentHandler,
} = require("../controllers/departments.controller");
const { createDepartmentValidation, updateDepartmentValidation } = require("../validators/department.validators");
const { validate } = require("../middleware/validate.middleware");
const { authGuard } = require("../middleware/auth.middleware");

const departmentsRouter = express.Router();

departmentsRouter.get("/", listDepartmentsHandler);
departmentsRouter.get("/:id", getDepartmentHandler);
departmentsRouter.post("/", authGuard, createDepartmentValidation, validate, createDepartmentHandler);
departmentsRouter.patch("/:id", authGuard, updateDepartmentValidation, validate, updateDepartmentHandler);
departmentsRouter.delete("/:id", authGuard, deleteDepartmentHandler);

module.exports = { departmentsRouter };