const express = require("express");
const authCheck = require("../middleware/authMiddleware");
const ReviewController = require("../controllers/ReviewController");
const checkPermission = require("../middleware/checkPermission");

const router = express.Router();

router.post(
  "/create",
  authCheck,
  checkPermission("create_reviews"),
  ReviewController.createReview,
);

router.put(
  "/update/:reviewId",
  authCheck,
  checkPermission("update_reviews"),
  ReviewController.updateReview,
);
router.delete(
  "/delete/:reviewId",
  authCheck,
  checkPermission("delete_reviews"),
  ReviewController.deleteReview,
);

router.get("/single/:reviewId", authCheck, ReviewController.getSingleReview);

router.get(
  "/company/:companyId",
  authCheck,
  ReviewController.getCompanyReviews,
);

router.get("/ngo/:ngoId", authCheck, ReviewController.getNgoReviews);

router.get("/my-reviews", authCheck, ReviewController.getOwnReviews);

module.exports = router;
