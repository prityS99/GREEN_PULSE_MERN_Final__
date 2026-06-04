const express = require("express");
const BadgeController = require("../controllers/BadgeController");
const checkPermission = require("../middleware/checkPermission");
const authCheck = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/create",
  authCheck,
  checkPermission("create_badge_for_ngo"),
  BadgeController.createBadge,
);


router.post(
  "/update/:badgeId",
  authCheck,
  checkPermission("update_badge_for_ngo"),
  BadgeController.updateBadge,
);

router.delete(
  "/delete/:badgeId",
  authCheck,
  checkPermission("delete_badge_for_ngo"),
  BadgeController.deleteBadge,
);
router.post(
  "/update-ngo-badge/:ngoId",
  authCheck,
  BadgeController.updateNgoBadge
);
router.get(
  "/ngo-analytics",
  authCheck,
  checkPermission("view_all_badge_change_ngo"),
  BadgeController.getNgoBadgeAnalytics
);

router.get("/single/:badgeId", authCheck, BadgeController.getSingleBadge);
router.get("/all", authCheck, BadgeController.getAllBadges);
router.get("/search", authCheck, BadgeController.searchBadges);

module.exports = router;
