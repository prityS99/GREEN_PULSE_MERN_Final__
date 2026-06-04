const express = require("express");
const UserController = require("../controllers/UserController");
const authCheck = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const router = express.Router();


router.get("/profile", authCheck, UserController.getProfile);
router.put("/update-profile", authCheck, UserController.updateProfile);
router.delete("/delete-profile", authCheck, UserController.deleteProfile);

router.post(
  "/upload-profile-picture",
  authCheck,
  upload.single("profileImage"),
  UserController.uploadProfilePicture
);

router.get(
  "/dashboard",
  authCheck,
  UserController.getUserDashboard
);

module.exports = router