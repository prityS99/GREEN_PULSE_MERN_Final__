const express = require("express");
const authCheck = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/checkPermission");
const analyticsController = require("../controllers/analyticsController");

const router = express.Router();

router.get(
  "/",
  authCheck,
  checkPermission("manage_analytics"),
  analyticsController.getAnalytics,
);

router.put(
  "/update",
  authCheck,
  checkPermission("manage_analytics"),
  analyticsController.updateAnalytics,
);

router.get(
  "/monthly-users",
  authCheck,
  checkPermission("manage_analytics"),
  analyticsController.getMonthlyUserGrowth,
);

router.get(
  "/monthly-donations",
  authCheck,
  checkPermission("manage_analytics"),
  analyticsController.getMonthlyDonations,
);

router.get(
  "/cleaning-status",
  authCheck,
  checkPermission("manage_analytics"),
  analyticsController.cleaningRequestStatusAnalytics,
);

router.get(
  "/top-donors",
  authCheck,
  checkPermission("manage_analytics"),
  analyticsController.topDonatingUsers,
);

router.get(
  "/campaigns",
  authCheck,
  checkPermission("manage_analytics"),
  analyticsController.campaignAnalytics,
);

module.exports = router;
