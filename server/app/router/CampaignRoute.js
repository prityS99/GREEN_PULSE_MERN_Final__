const express = require("express");
const authCheck = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/checkPermission");
const campaignController = require("../controllers/campaignController");
const router = express.Router();

router.post(
  "/create",
  authCheck,
  checkPermission("create_campaign_announcement"),
  campaignController.createCampaign,
);

// ----- Global Dashboard ----- //
router.get("/all", campaignController.getAllCampaigns);

// router.put(
//   "/approve-campaign/:campaignId",
//   authCheck,
//   checkPermission("view_all_user"),
//   campaignController.approveCampaign,
// );

// ---- Fill Volunteer Form --- //
router.post(
  "/apply/:campaignId",
  authCheck,
  campaignController.applyForCampaign,
);

// ---- Admin Dashboard Feed ---- //
router.get(
  "/volunteer-requests",
  authCheck,
  checkPermission("view_all_user"),
  campaignController.getAllVolunteerRequests,
);

// ---- NGO Dashboard ---- //
router.get(
  "/ngo/volunteer-requests",
  authCheck,
  checkPermission("view_own_requests"),
  campaignController.getNgoVolunteerRequests,
);


module.exports = router;
