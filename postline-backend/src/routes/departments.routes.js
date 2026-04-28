const express = require("express");
const {
  createDepartmentHandler,
  getDepartmentHandler,
  listDepartmentsHandler,
  updateDepartmentHandler,
  deleteDepartmentHandler,
} = require("../controllers/departments.controller");
const {
  createDepartmentValidation,
  listDepartmentsValidation,
  updateDepartmentValidation,
} = require("../validators/department.validators");
const { validate } = require("../middleware/validate.middleware");
const { authGuard, authorize } = require("../middleware/auth.middleware");

const departmentsRouter = express.Router();

departmentsRouter.get("/", listDepartmentsValidation, validate, listDepartmentsHandler);
departmentsRouter.get("/:id", getDepartmentHandler);
departmentsRouter.post("/", authGuard, authorize("admin"), createDepartmentValidation, validate, createDepartmentHandler);
departmentsRouter.patch("/:id", authGuard, authorize("admin"), updateDepartmentValidation, validate, updateDepartmentHandler);
departmentsRouter.delete("/:id", authGuard, authorize("admin"), deleteDepartmentHandler);

module.exports = { departmentsRouter };
