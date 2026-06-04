const mongoose = require("mongoose");

const GovtOfficer = require("../models/govtOfficer");
const Ngo = require("../models/ngo");
const User = require("../models/users");
const Badge = require("../models/badge");
const Reward = require("../models/reward");
const Certificate = require("../models/certificate");
const Notification = require("../models/notification");

class GovtOfficerController {

  // --- VIEW ELITE NGOS ---//

  async viewEliteNgos(req, res) {
    try {
      const ngos = await Ngo.aggregate([
        {
          $lookup: {
            from: "badges",
            localField: "badgeId",
            foreignField: "_id",
            as: "badge",
          },
        },

        {
          $unwind: {
            path: "$badge",
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $match: {
            "badge.badgeName": "Elite NGO",
          },
        },

        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },

        {
          $unwind: "$user",
        },

        {
          $project: {
            ngoName: 1,
            ngoLogo: 1,
            impactPoints: 1,
            location: 1,

            badgeName: "$badge.badgeName",
            badgeImage: "$badge.badgeImage",

            "user.name": 1,
            "user.email": 1,
          },
        },

        {
          $sort: {
            impactPoints: -1,
          },
        },
      ]);

      return res.status(200).json({
        success: true,
        message: "Elite NGOs fetched successfully",
        total: ngos.length,
        data: ngos,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch elite NGOs",
        error: error.message,
      });
    }
  }


  // ---- ISSUE REWARD + CERTIFICATE ---- // 

  async issueRewardCertificate(req, res) {
    try {
      const officerUserId = req.user.id;

      const {
        ngoId,
        rewardId,
        campaignId,
        certificateFile,
      } = req.body;

      // Govt Officer
      const officer = await GovtOfficer.findOne({
        userId: officerUserId,
      });

      if (!officer) {
        return res.status(404).json({
          success: false,
          message: "Government officer not found",
        });
      }

      // NGO
      const ngo = await Ngo.findById(ngoId);

      if (!ngo) {
        return res.status(404).json({
          success: false,
          message: "NGO not found",
        });
      }

      // Reward
      const reward = await Reward.findById(rewardId);

      if (!reward) {
        return res.status(404).json({
          success: false,
          message: "Reward not found",
        });
      }

      // Certificate
      const certificate = await Certificate.create({
        userId: ngo.userId,
        campaignId,
        issuedBy: officer._id,

        certificateNumber:
          "CERT-" + Date.now(),

        certificateFile,
      });

      // NGO Notification
      await Notification.create({
        receiverId: ngo.userId,

        title: "Reward & Certificate Received",

        message: `Congratulations! Your NGO received "${reward.title}" reward from Government Officer.`,

        type: "reward",
      });

      // Admin Notification
      const admin = await User.findOne({
        role: "admin",
      });

      if (admin) {
        await Notification.create({
          receiverId: admin._id,

          title: "NGO Rewarded",

          message: `${ngo.ngoName} has been rewarded by government officer.`,

          type: "reward",
        });
      }

      return res.status(201).json({
        success: true,
        message:
          "Reward and certificate issued successfully",

        data: {
          reward,
          certificate,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          "Failed to issue reward and certificate",

        error: error.message,
      });
    }
  }

  // ---- VERIFY NGO IMPACT DATA ---- //

  async verifyImpactData(req, res) {
    try {
      const { ngoId } = req.params;

      const ngo = await Ngo.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(ngoId),
          },
        },

        {
          $lookup: {
            from: "campaigns",
            localField: "_id",
            foreignField: "ngoId",
            as: "campaigns",
          },
        },

        {
          $addFields: {
            totalCampaigns: {
              $size: "$campaigns",
            },

            completedCampaigns: {
              $size: {
                $filter: {
                  input: "$campaigns",
                  as: "campaign",
                  cond: {
                    $eq: [
                      "$$campaign.status",
                      "completed",
                    ],
                  },
                },
              },
            },
          },
        },

        {
          $project: {
            ngoName: 1,
            impactPoints: 1,
            totalCampaigns: 1,
            completedCampaigns: 1,
            createdAt: 1,
          },
        },
      ]);

      return res.status(200).json({
        success: true,
        message: "NGO impact verified successfully",
        data: ngo,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to verify NGO impact",
        error: error.message,
      });
    }
  }

  // -----  NOMINATE NGO FOR AWARD ---- // 

  async nominateForAward(req, res) {
    try {
      const { ngoId } = req.body;

      const ngo = await Ngo.findById(ngoId);

      if (!ngo) {
        return res.status(404).json({
          success: false,
          message: "NGO not found",
        });
      }

      await Notification.create({
        receiverId: ngo.userId,

        title: "Award Nomination",

        message:
          "Your NGO has been nominated for a government award.",

        type: "award",
      });

      return res.status(200).json({
        success: true,
        message:
          "NGO nominated for award successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to nominate NGO",
        error: error.message,
      });
    }
  }


  // ---- APPROVE ELITE BADGE ---- //

  async approveEliteBadge(req, res) {
    try {
      const { ngoId, badgeId } = req.body;

      const ngo = await Ngo.findById(ngoId);

      if (!ngo) {
        return res.status(404).json({
          success: false,
          message: "NGO not found",
        });
      }

      const badge = await Badge.findById(badgeId);

      if (!badge) {
        return res.status(404).json({
          success: false,
          message: "Badge not found",
        });
      }

      // Assign Badge
      ngo.badgeId = badge._id;

      await ngo.save();

      // Notification
      await Notification.create({
        receiverId: ngo.userId,

        title: "Elite Badge Approved",

        message: `Your NGO received "${badge.badgeName}" badge.`,

        type: "badge",
      });

      return res.status(200).json({
        success: true,
        message: "Elite badge approved successfully",
        data: ngo,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to approve badge",
        error: error.message,
      });
    }
  }
}

module.exports = new GovtOfficerController();