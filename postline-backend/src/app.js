const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("./db");
const { authRouter } = require("./routes/auth.routes");
const { departmentsRouter } = require("./routes/departments.routes"); // ← було branchRouter
const { shipmentRouter } = require("./routes/shipments.routes");
const { routeRouter } = require("./routes/routes.routes");
const { courierRouter } = require("./routes/courier.routes");
const { courierRoutesRouter } = require("./routes/courierRoutes.routes");
const { courierRouteOptimizationRouter } = require("./routes/courierRouteOptimization.routes");
const { operatorRouter } = require("./routes/operators.routes");
const { tariffRouter } = require("./routes/tariffs.routes");
const { trackingRouter } = require("./routes/tracking.routes");
const { notificationsRouter } = require("./routes/notifications.routes");
const { reportsRouter } = require("./routes/reports.routes");
const { errorHandler } = require("./middleware/error.middleware");

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || true, credentials: true }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => res.status(200).json({ status: "ok" }));
app.use("/api/auth", authRouter);
app.use("/api/departments", departmentsRouter); // ← було /api/branches
app.use("/api/shipments", shipmentRouter);
app.use("/api/routes", routeRouter);
app.use("/api/courier-deliveries", courierRouter);
app.use("/api/courier-routes", courierRoutesRouter);
app.use("/api/courier-route-optimization", courierRouteOptimizationRouter);
app.use("/api/operators", operatorRouter);
app.use("/api/tariffs", tariffRouter);
app.use("/api/tracking", trackingRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/reports", reportsRouter);
app.use(errorHandler);

module.exports = { app };
