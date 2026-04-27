const {
  listNotificationsForUser,
  markNotificationRead,
  markAllNotificationsRead,
} = require("../repositories/notifications.repository");

const listNotificationsHandler = async (req, res, next) => {
  try {
    const notifications = await listNotificationsForUser(req.user.sub);
    return res.status(200).json({ data: notifications });
  } catch (error) {
    return next(error);
  }
};

const markNotificationReadHandler = async (req, res, next) => {
  try {
    const notification = await markNotificationRead(req.params.id, req.user.sub);
    if (!notification) {
      return res.status(404).json({ message: "Сповіщення не знайдено" });
    }

    return res.status(200).json({ data: notification });
  } catch (error) {
    return next(error);
  }
};

const markAllNotificationsReadHandler = async (req, res, next) => {
  try {
    const updatedCount = await markAllNotificationsRead(req.user.sub);
    return res.status(200).json({ data: { updatedCount } });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listNotificationsHandler,
  markNotificationReadHandler,
  markAllNotificationsReadHandler,
};
