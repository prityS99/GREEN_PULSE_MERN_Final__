const express = require("express");
const notificationController = require("../controllers/notificationController");
const checkPermission = require("../middleware/checkPermission");
const authCheck = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/my", authCheck, notificationController.getMyNotifications);

router.put(
  "/read/:notificationId",
  authCheck,
  notificationController.markAsRead,
);

router.delete(
  "/delete/:notificationId",
  authCheck,
  notificationController.deleteNotification,
);

router.get(
  "/all",
  authCheck,
  checkPermission("view_system_analytics"),
  notificationController.getAllNotifications,
);

module.exports = router;
