const express = require("express");
const CertificateController = require("../controllers/CertificateController");
const checkPermission = require("../middleware/checkPermission");
const authCheck = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/issue",
  authCheck,
  checkPermission("issue_reward_certificate"),
  CertificateController.issueCertificate,
);

router.get(
  "/all",
  authCheck,
  checkPermission("view_system_analytics"),
  CertificateController.getAllCertificates,
);

router.get(
  "/single/:certificateId",
  authCheck,
  CertificateController.getSingleCertificate,
);

router.get(
  "/user/:userId",
  authCheck,
  checkPermission("view_own_certificates"),
  CertificateController.getUserCertificates,
);

router.put(
  "/update/:certificateId",
  authCheck,
  checkPermission("issue_reward_certificate"),
  CertificateController.updateCertificate,
);

router.delete(
  "/delete/:certificateId",
  authCheck,
  checkPermission("issue_reward_certificate"),
  CertificateController.deleteCertificate,
);

router.get(
  "/analytics",
  authCheck,
  checkPermission("view_system_analytics"),
  CertificateController.certificateAnalytics,
);

router.put(
  "/approve/:certificateId",
  authCheck,
  checkPermission("approve_reward"),
  CertificateController.approveCertificate,
);

router.put(
  "/reject/:certificateId",
  authCheck,
  checkPermission("reject_reward"),
  CertificateController.rejectCertificate,
);
router.get("/approved", CertificateController.getApprovedCertificates);

module.exports = router;
