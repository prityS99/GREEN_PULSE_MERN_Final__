const express = require("express");
const PaymentController = require("../controllers/paymentController");
const authCheck = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/checkPermission");

const router = express.Router();


router.post("/donate/order", authCheck,  PaymentController.createDonationOrder);


router.post("/donate/verify", authCheck, PaymentController.verifyDonation);

router.post(
  "/ngo-elite",
  authCheck,
  checkPermission("create_payment"),
  PaymentController.createEliteBadgePayment,
);

router.post(
  "/hire-cleaning-company",
  authCheck,
  checkPermission("create_payment"),
  PaymentController.hireCleaningCompanyPayment,
);

router.post(
  "/company-subscription",
  authCheck,
  checkPermission("create_payment"),
  PaymentController.companySubscriptionPayment,
);

router.post(
  "/verify",
  authCheck,
  checkPermission("create_payment"),
  PaymentController.verifyPayment,
);

router.get(
  "/",
  authCheck,
  checkPermission("view_all_payments"),
  PaymentController.getAllPayments,
);

router.get(
  "/:paymentId",
  authCheck,
  checkPermission("view_single_payment"),
  PaymentController.getSinglePayment,
);

module.exports = router;
