const express = require("express");
const {
  listNotificationsHandler,
  markNotificationReadHandler,
  markAllNotificationsReadHandler,
} = require("../controllers/notifications.controller");
const { authGuard } = require("../middleware/auth.middleware");

const notificationsRouter = express.Router();

notificationsRouter.use(authGuard);

notificationsRouter.get("/", listNotificationsHandler);
notificationsRouter.patch("/read-all", markAllNotificationsReadHandler);
notificationsRouter.patch("/:id/read", markNotificationReadHandler);

module.exports = { notificationsRouter };
