const express = require("express");
const volunteerRequestController = require("../controllers/volunteerRequestController");
const authCheck = require("../middleware/authMiddleware");

const router = express.Router();


router.post(
  "/apply/:campaignId",
  authCheck, volunteerRequestController.applyForCampaign);


router.get(
  "/all-requests",
  authCheck,
  checkPermission("view_all_user"),
  volunteerRequestController.getAllVolunteerRequests
);


router.get(
  "/ngo-requests",
  authCheck,
  checkPermission("view_own_requests"),
  volunteerRequestController.getNgoVolunteerRequests
);


router.put(
  "/approve/:requestId",
  authCheck,
  checkPermission("update_ngo"),
  volunteerRequestController.approveVolunteer
);


router.put(
  "/reject/:requestId",
  authCheck,
  checkPermission("update_ngo"),
  volunteerRequestController.rejectVolunteer
);

module.exports = router;