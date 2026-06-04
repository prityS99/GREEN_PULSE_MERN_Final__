const express = require("express");

const router = express.Router();

const RewardController = require("../controllers/rewardController");
const checkPermission = require("../middleware/checkPermission");
const authCheck = require("../middleware/authMiddleware");


router.post(
  "/create",
  authCheck, checkPermission("issue_reward_certificate"), RewardController.createReward );


router.patch(
  "/approve/:rewardId", authCheck, checkPermission("approve_reward"),
  RewardController.approveReward
);

router.put(
  "/update/:rewardId",
  authCheck,
  checkPermission("approve_reward"),
  RewardController.updateReward
);

router.delete(
  "/delete/:rewardId",
  authCheck,
  checkPermission("approve_reward"),
  RewardController.deleteReward
);

router.get( "/single/:rewardId", authCheck, RewardController.getSingleReward);
router.get( "/all", authCheck, RewardController.getAllRewards );

router.get( "/ngo-dashboard/:ngoId",
  authCheck, RewardController.getNgoRewardDashboard);

router.get( "/global-dashboard", authCheck, RewardController.getGlobalRewardDashboard);

module.exports = router;