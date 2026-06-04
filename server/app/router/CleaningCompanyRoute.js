const express = require("express");
const cleaningCompanyController = require("../controllers/cleaningCompanyController");
const authCheck = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const checkPermission = require("../middleware/checkPermission");

const router = express.Router();

// --- PROFILE SETUP & ARCHIVE DISPATCH ---
router.get(
  "/all", 
  cleaningCompanyController.getAllCompanies
);

router.get("/me", authCheck, cleaningCompanyController.getMyCompanyProfile);

router.get("/requests/me", authCheck, cleaningCompanyController.getCompanyCleaningRequests);
router.post(
  "/add", 
  authCheck, 
  upload.single("coverImage"), 
  cleaningCompanyController.addCleaningCompany
);

router.put("/update", authCheck, upload.single("coverImage"), cleaningCompanyController.updateCleaningCompany);

router.delete(
  "/delete", 
  authCheck, 
  checkPermission("delete_cleaning_company"), 
  cleaningCompanyController.deleteCleaningCompany
);

// --- METRICS & TARGET READ LOGISTICS ---
// Added authCheck here so checkPermission can read the role property safely!
router.get(
  "/single/:id", 
  authCheck, 
  cleaningCompanyController.getSingleCompany
);


// --- TICKET PIPELINE DISPATCH ---
router.put(
  "/accept-request/:requestId", 
  authCheck, 
  checkPermission("accept_cleaning_request"), 
  cleaningCompanyController.acceptCleaningRequest
);

router.put(
  "/reject-request/:requestId", 
  authCheck, 
  cleaningCompanyController.rejectCleaningRequest
);

router.put(
  "/update-status/:requestId", 
  authCheck, 
  cleaningCompanyController.updateCleaningStatus
);

router.put(
  "/upload-proof/:requestId",
  authCheck, 
  upload.single("image"), 
  cleaningCompanyController.uploadWorkProof
);

// --- REVIEW & DASHBOARD ASSIGNMENT ---
router.post(
  "/review", 
  authCheck, 
  cleaningCompanyController.companyReview
);

// router.get(
//   "/assigned-tasks", 
//   authCheck, 
//   cleaningCompanyController.getAssignedTasks
// );

module.exports = router;