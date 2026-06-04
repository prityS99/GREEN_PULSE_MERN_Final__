const express = require("express");
const ngoController = require("../controllers/ngoController");
const checkPermission = require("../middleware/checkPermission");
const authCheck = require("../middleware/authMiddleware");
const Upload = require("../middleware/upload");

const router = express.Router();

// GET ALL NGO
router.get("/all",  ngoController.getAllNgo);

// CREATE NGO PROFILE
router.post(
  "/add",
  authCheck,
  Upload.single("coverImage"),
  ngoController.addNgo,
);

// UPDATE NGO PROFILE

router.put("/update", authCheck, Upload.single("coverImage"), ngoController.updateNgo);

// DELETE NGO PROFILE
router.delete(
  "/delete",
  authCheck,
  ngoController.deleteNgo,
);


router.get("/me", authCheck, ngoController.getMyNgo);

// GET SINGLE NGO
router.get(
  "/single/:id",
  authCheck,
  ngoController.getSingleNgo,
);



// CREATE CAMPAIGN
router.post(
  "/campaign/create",
  authCheck,
  checkPermission("create_campaign_announcement"),
  ngoController.createCampaign,
);


// UPDATE CAMPAIGN
router.put(
  "/campaign/update/:id",
  authCheck,
  checkPermission("create_campaign_announcement"),
  ngoController.updateCampaign,
);

// DELETE CAMPAIGN
router.delete(
  "/campaign/delete/:id",
  authCheck,
  checkPermission("create_campaign_announcement"),
  ngoController.deleteCampaign,
);

// GET OWN CAMPAIGN -- /
router.get(
  "/campaign/my",
  authCheck,
  ngoController.getOwnCampaigns
);

// CREATE CLEANING REQUEST
router.post(
  "/cleaning-request/create",
  authCheck,
  checkPermission("create_cleaning_request"),
  Upload.array("images", 5), 
  ngoController.createCleaningRequest,
);

// GET OWN CLEANING REQUESTS
router.get(
  "/cleaning-request/my-requests",
  authCheck,
  checkPermission("view_own_requests"),
  ngoController.getOwnCleaningRequests,
);
// CREATE REVIEW
router.post(
  "/review/create",
  authCheck,
  ngoController.createReview,
);

// UPDATE REVIEW
router.put(
  "/review/update/:id",
  authCheck,
  ngoController.updateReview,
);

// DELETE REVIEW
router.delete(
  "/review/delete/:id",
  authCheck,
  ngoController.deleteReview,
);

// VIEW CERTIFICATES
router.get(
  "/certificates",
  authCheck,
  ngoController.viewCertificates,
);

// VIEW BADGES
router.get(
  "/badges",
  authCheck,
  checkPermission("view_badges"),
  ngoController.viewBadges,
);

// HIRE CLEANING COMPANY
router.post(
  "/hire-company",
  authCheck,
  checkPermission("hire_cleaning_company"),
  ngoController.hireCleaningCompany,
);

// VIEW ALL CAMPAIGNS FOR BADGE DECISION
router.get(
  "/admin/view-campaigns",
  authCheck,
  checkPermission("view_all_ngo"),
  ngoController.viewCampaignsForAdmin,
);

module.exports = router;
