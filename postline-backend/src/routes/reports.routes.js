const express = require("express");
const { getOverviewReportHandler } = require("../controllers/reports.controller");
const { authGuard, authorize } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate.middleware");
const { overviewReportValidation } = require("../validators/report.validators");

const reportsRouter = express.Router();

reportsRouter.use(authGuard, authorize("admin"));

reportsRouter.get("/overview", overviewReportValidation, validate, getOverviewReportHandler);

module.exports = { reportsRouter };
