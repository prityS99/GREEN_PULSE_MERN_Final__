const express = require("express");
const authController = require("../controllers/authController");
const authCheck = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/checkPermission");
const Upload = require("../middleware/upload");
const refreshController = require("../controllers/refreshController");

const router = express.Router();


// Authentication & Registration
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/logout", authController.logout); 
router.post("/refresh-token", authController.refreshToken);
// router.post("/refresh", refreshController.refresh); 

router.get("/verify-email/:token", authController.verifyMail);

// Password Recovery (Added missing routes)
router.post("/forgot-password", authController.forgotPassword);
router.patch("/reset-password/:token", authController.resetPassword); 

router.get("/profile", authCheck, authController.profile);

router.get(
  "/admin-dashboard",
  authCheck,
  authController.adminDashboard
);
router.put("/update-profile", authCheck, Upload.single("image"), authController.updateProfile);
router.get(
  "/user-dashboard",
  authCheck,
  authController.userDashboard
);

router.get(
  "/ngo-dashboard",
  authCheck,
  authController.ngoDashboard
);

router.get("/me", authController.getMe)

router.get(
  "/cleaning-company-dashboard",
  authController.cleaningCompanyDashboard
);

module.exports = router;