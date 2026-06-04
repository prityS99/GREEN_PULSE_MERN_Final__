const express = require("express");
const controller = require("../controllers/CleaningRequest");
// const authCheck = require("../middleware/authMiddleware");
const Upload = require("../middleware/upload");
const CleaningRequest = require("../controllers/CleaningRequest");

const router = express.Router();

// 1. NGOs create requests
router.post(
  "/create", 
  Upload.array("images", 5), 
  CleaningRequest.createRequest
);

// 2. Everyone queries this universal endpoint (the controller filters the output automatically!)
router.get(
  "/my-requests", 
  CleaningRequest.getARequests
);



// 3. Cleaning companies or Admins update progress statuses
router.patch(
  "/:id/status", 
  CleaningRequest.updateStatus
);

module.exports = router;