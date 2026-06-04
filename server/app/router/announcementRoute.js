
const express = require("express");
const announcementController = require("../controllers/announcementController");
const authCheck = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/checkPermission");
const router = express.Router();


router.post(
  "/",
  authCheck,
  checkPermission("create_annoucements"),
  announcementController.createGlobalAnnouncement,
);

router.get("/:id/edit", announcementController.editAnnouncement);

router.put(
  "/:id",
  authCheck,
  checkPermission("update_annoucements"),
  announcementController.updateAnnouncement,
);

router.delete(
  "/:id",
  authCheck,
  checkPermission("delete_annoucements"),
  announcementController.deleteAnnouncement,
);

module.exports = router;
