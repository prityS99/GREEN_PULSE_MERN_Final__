const express = require("express");
const authCheck = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/checkPermission");
const adminController = require("../controllers/adminController");

const router = express.Router();

// --- VIEW ALL (PUBLIC REGISTRIES / GENERAL CHECKS) ---- //
router.get("/companies-all", adminController.getAllCompanies);
router.get("/ngos-all", adminController.getAllNgo);
router.get('/campaigns', adminController.getAllCampaigns);
router.get('/cleaning-request', adminController.getAllCleaningRequests);

// -------- VIEW ALL USERS -------- //
router.get(
  "/users",
  authCheck,
  checkPermission("view_all_user"),
  adminController.viewAllUsers
);

// -------- VIEW SINGLE USER -------- //
router.get(
  "/users/:userId",
  authCheck,
  checkPermission("view_all_user"),
  adminController.viewSingleUser
);

// -------- UPDATE USER ROLE -------- //
router.put(
  "/users/update-role/:userId",
  authCheck,
  checkPermission("update_user_role"),
  adminController.updateUserRole
);

// -------- DELETE USER -------- //
router.delete(
  "/users/delete/:userId",
  authCheck,
  checkPermission("delete_user"),
  adminController.deleteUser
);

// -------- RESTORE USER -------- //
router.put(
  "/users/restore/:userId",
  authCheck,
  checkPermission("update_user"),
  adminController.restoreUser
);

// -------- VERIFY USER -------- //
router.put(
  "/users/verify/:userId",
  authCheck,
  checkPermission("update_user"),
  adminController.verifyUser
);

// -------- APPROVE CLEANING REQUEST -------- //
router.put(
  "/cleaning-request/approve/:requestId",
  authCheck,
  checkPermission("approve_cleaning_request"),
  adminController.approveCleaningRequest
);

// -------- REJECT CLEANING REQUEST -------- //
router.put(
  "/cleaning-request/reject/:requestId",
  authCheck,
  checkPermission("disapprove_waste_cleaning_request"),
  adminController.rejectCleaningRequest
);

// -------- VIEW ALL CLEANING COMPANIES (ADMIN GRID) -------- //
router.get(
  "/companies",
  authCheck,
  checkPermission("view_system_analytics"),
  adminController.viewAllCompanies
);

// -------- APPROVE NGO -------- //
router.put(
  "/ngo/approve/:ngoId",
  authCheck,
  checkPermission("approve_ngo"), 
  adminController.approveNgo
);

// -------- APPROVE COMPANY PROFILE -------- //
router.put(
  "/company/approve/:id",
  authCheck,
  checkPermission("approve_company"),
  adminController.approveCompany 
);

// -------- APPROVE CAMPAIGN ---- //
router.put(
  "/campaign/approve/:campaignId",
  authCheck,
  adminController.approveCampaign
);


// -------- APPROVE REWARD -------- //
router.put(
  "/reward/approve/:rewardId",
  authCheck,
  checkPermission("approve_reward"),
  adminController.approveReward
);



// -------- REJECT REWARD -------- //
router.put(
  "/reward/reject/:rewardId",
  authCheck,
  checkPermission("approve_reward"),
  adminController.rejectReward
);

// -------- CREATE ANNOUNCEMENT -------- //
router.post(
  "/announcement/create",
  authCheck,
  checkPermission("create_annoucements"), 
  adminController.createAnnouncement
);

// -------- VIEW ALL ANNOUNCEMENTS -------- //
router.get(
  "/announcements",
  authCheck,
  checkPermission("view_all_annoucements"),
  adminController.viewAllAnnouncements
);


// -------- VIEW GLOBAL ACTIVITIES -------- //
router.get(
  "/activities",
  authCheck,
  checkPermission("view_system_analytics"),
  adminController.viewGlobalActivities
);

// -------- DASHBOARD ANALYTICS -------- //
router.get(
  "/dashboard-analytics",
  authCheck,
  checkPermission("view_system_analytics"),
  adminController.dashboardAnalytics
);

module.exports = router;