
const express = require("express");
const authCheck = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/checkPermission");
const govtOfficerController = require("../controllers/govtOfficerController");

const router = express.Router();

router.get(
  "/elite-ngos",
  authCheck,
  checkPermission("view_elite_ngos"),
  govtOfficerController.viewEliteNgos
);

router.post(
  "/issue-reward",
  authCheck,
  checkPermission("issue_rewards"),
  govtOfficerController.issueRewardCertificate
);

router.get(
  "/verify-impact/:ngoId",
  authCheck,
  checkPermission("verify_impact"),
  govtOfficerController.verifyImpactData
);

router.post(
  "/nominate-award",
  authCheck,
  checkPermission("nominate_awards"),
  govtOfficerController.nominateForAward
);

router.post(
  "/approve-badge",
  authCheck,
  checkPermission("approve_badges"),
  govtOfficerController.approveEliteBadge
);

module.exports = router;
