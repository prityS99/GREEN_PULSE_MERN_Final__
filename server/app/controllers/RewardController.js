const Reward = require("../models/reward");
const Ngo = require("../models/ngo");
const Notification = require("../models/notification");

class RewardController {
  // ---------------- CREATE REWARD ---------------- //

  async createReward(req, res) {
    try {
      const {
        ngoId,
        title,
        description,
        pointsRequired,
        rewardImage,
        sanctionedAmount,
        currency,
      } = req.body;

      // validation
      if (!ngoId) {
        return res.status(400).json({
          success: false,
          message: "NGO ID is required",
        });
      }

      if (!title || !pointsRequired) {
        return res.status(400).json({
          success: false,
          message: "Title and points are required",
        });
      }

      // check ngo exists
      const ngo = await Ngo.findById(ngoId);

      if (!ngo) {
        return res.status(404).json({
          success: false,
          message: "NGO not found",
        });
      }

      const reward = await Reward.create({
        ngoId,
        title,
        description,
        pointsRequired,
        rewardImage,
        sanctionedAmount,
        currency,
        isActive: false, // admin approval pending
        createdBy: req.user.id,
      });

      // notification for NGO
      await Notification.create({
        receiverId: ngo.userId,
        title: "Reward Created",
        message: `A reward "${title}" has been created for your NGO and is waiting for admin approval.`,
        type: "reward",
      });

      return res.status(201).json({
        success: true,
        message: "Reward created and waiting for admin approval",
        data: reward,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to create reward",
        error: error.message,
      });
    }
  }

  // ---------------- APPROVE REWARD ---------------- //
 
  async approveReward(req, res) {
    try {
      const { rewardId } = req.params;

      const reward = await Reward.findById(rewardId);

      if (!reward) {
        return res.status(404).json({
          success: false,
          message: "Reward not found",
        });
      }

      reward.isActive = true;

      await reward.save();

      // get NGO
      const ngo = await Ngo.findById(reward.ngoId);

      // notification
      if (ngo) {
        await Notification.create({
          receiverId: ngo.userId,
          title: "Reward Approved",
          message: `Your NGO reward "${reward.title}" has been approved by admin.`,
          type: "reward",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Reward approved successfully",
        data: reward,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to approve reward",
        error: error.message,
      });
    }
  }

  // ---------------- UPDATE REWARD ---------------- //
  
  async updateReward(req, res) {
    try {
      const { rewardId } = req.params;

      const reward = await Reward.findById(rewardId);

      if (!reward) {
        return res.status(404).json({
          success: false,
          message: "Reward not found",
        });
      }

      const updatedReward = await Reward.findByIdAndUpdate(
        rewardId,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      return res.status(200).json({
        success: true,
        message: "Reward updated successfully",
        data: updatedReward,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to update reward",
        error: error.message,
      });
    }
  }

  // ---------------- DELETE REWARD ---------------- //
  async deleteReward(req, res) {
    try {
      const { rewardId } = req.params;

      const reward = await Reward.findById(rewardId);

      if (!reward) {
        return res.status(404).json({
          success: false,
          message: "Reward not found",
        });
      }

      await reward.deleteOne();

      return res.status(200).json({
        success: true,
        message: "Reward deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete reward",
        error: error.message,
      });
    }
  }

  // ---------------- GET SINGLE REWARD ---------------- //
  async getSingleReward(req, res) {
    try {
      const { rewardId } = req.params;

      const reward = await Reward.findById(rewardId).populate(
        "ngoId",
        "ngoName city state"
      );

      if (!reward) {
        return res.status(404).json({
          success: false,
          message: "Reward not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: reward,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch reward",
        error: error.message,
      });
    }
  }

  // ---------------- GET ALL REWARDS ---------------- //
  async getAllRewards(req, res) {
    try {
      const rewards = await Reward.find()
        .populate("ngoId", "ngoName")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        totalRewards: rewards.length,
        data: rewards,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch rewards",
        error: error.message,
      });
    }
  }

  // ---------------- NGO REWARD DASHBOARD ---------------- //
  async getNgoRewardDashboard(req, res) {
    try {
      const { ngoId } = req.params;

      const rewards = await Reward.find({
        ngoId,
        isActive: true,
      });

      const totalRewards = rewards.length;

      const totalSanctionedAmount = rewards.reduce(
        (acc, item) => acc + (item.sanctionedAmount || 0),
        0
      );

      return res.status(200).json({
        success: true,
        totalRewards,
        totalSanctionedAmount,
        data: rewards,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch NGO dashboard",
        error: error.message,
      });
    }
  }

  // ---------------- GLOBAL REWARD DASHBOARD ---------------- //
  async getGlobalRewardDashboard(req, res) {
    try {
      const rewards = await Reward.find({
        isActive: true,
      });

      const totalRewards = rewards.length;

      const totalSanctionedAmount = rewards.reduce(
        (acc, item) => acc + (item.sanctionedAmount || 0),
        0
      );

      // aggregation
      const monthlyStats = await Reward.aggregate([
        {
          $match: {
            isActive: true,
          },
        },
        {
          $group: {
            _id: {
              month: { $month: "$createdAt" },
              year: { $year: "$createdAt" },
            },
            totalAmount: {
              $sum: "$sanctionedAmount",
            },
            totalRewards: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            "_id.year": -1,
            "_id.month": -1,
          },
        },
      ]);

      return res.status(200).json({
        success: true,
        totalRewards,
        totalSanctionedAmount,
        monthlyStats,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch global dashboard",
        error: error.message,
      });
    }
  }
}

module.exports = new RewardController();