const VolunteerRequest = require("../models/volunteerRequest");
const Campaign = require("../models/campaigns");
const mongoose = require("mongoose");

class VolunteerController {
  // ---------------- APPLY FOR CAMPAIGN ---------------- //
  async applyForCampaign(req, res) {
    try {
      const { campaignId } = req.params;

      const {
        name,
        age,
        phone,
        address,
      } = req.body;

      const campaign =
        await Campaign.findById(campaignId);

      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: "Campaign not found",
        });
      }

      // -------- CHECK EXISTING APPLICATION -------- //
      const alreadyApplied =
        await VolunteerRequest.findOne({
          campaignId,
          userId: req.user.id,
        });

      if (alreadyApplied) {
        return res.status(400).json({
          success: false,
          message:
            "You already applied for this campaign",
        });
      }

      // -------- CREATE REQUEST -------- //
      const volunteerRequest =
        await VolunteerRequest.create({
          campaignId,
          ngoId: campaign.ngoId,
          userId: req.user.id,
          name,
          age,
          phone,
          address,
        });

      return res.status(201).json({
        success: true,
        message:
          "Volunteer request submitted successfully",
        data: volunteerRequest,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          "Failed to apply for campaign",
        error: error.message,
      });
    }
  }

  // ---------------- ADMIN DASHBOARD ---------------- //
  async getAllVolunteerRequests(req, res) {
    try {
      const requests =
        await VolunteerRequest.aggregate([
          {
            $lookup: {
              from: "campaigns",
              localField: "campaignId",
              foreignField: "_id",
              as: "campaignDetails",
            },
          },

          {
            $unwind: "$campaignDetails",
          },

          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "userDetails",
            },
          },

          {
            $unwind: "$userDetails",
          },

          {
            $lookup: {
              from: "ngos",
              localField: "ngoId",
              foreignField: "_id",
              as: "ngoDetails",
            },
          },

          {
            $unwind: {
              path: "$ngoDetails",
              preserveNullAndEmptyArrays: true,
            },
          },

          {
            $project: {
              name: 1,
              age: 1,
              phone: 1,
              address: 1,
              status: 1,

              campaignTitle:
                "$campaignDetails.title",

              ngoName:
                "$ngoDetails.ngoName",

              applicantName:
                "$userDetails.name",

              applicantEmail:
                "$userDetails.email",

              createdAt: 1,
            },
          },

          {
            $sort: {
              createdAt: -1,
            },
          },
        ]);

      return res.status(200).json({
        success: true,
        total: requests.length,
        data: requests,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch volunteer requests",
        error: error.message,
      });
    }
  }

  // ---------------- NGO DASHBOARD ---------------- //
  async getNgoVolunteerRequests(req, res) {
    try {
      const ngoId = req.user.id;

      const requests =
        await VolunteerRequest.aggregate([
          {
            $match: {
              ngoId:
                new mongoose.Types.ObjectId(
                  ngoId
                ),
            },
          },

          {
            $lookup: {
              from: "campaigns",
              localField: "campaignId",
              foreignField: "_id",
              as: "campaignDetails",
            },
          },

          {
            $unwind: "$campaignDetails",
          },

          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "userDetails",
            },
          },

          {
            $unwind: "$userDetails",
          },

          {
            $project: {
              name: 1,
              age: 1,
              phone: 1,
              address: 1,
              status: 1,

              campaignTitle:
                "$campaignDetails.title",

              applicantName:
                "$userDetails.name",

              applicantEmail:
                "$userDetails.email",

              createdAt: 1,
            },
          },

          {
            $sort: {
              createdAt: -1,
            },
          },
        ]);

      return res.status(200).json({
        success: true,
        total: requests.length,
        data: requests,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch NGO requests",
        error: error.message,
      });
    }
  }

  // ---------------- APPROVE VOLUNTEER ---------------- //
  async approveVolunteer(req, res) {
    try {
      const { requestId } = req.params;

      const request =
        await VolunteerRequest.findById(
          requestId
        );

      if (!request) {
        return res.status(404).json({
          success: false,
          message:
            "Volunteer request not found",
        });
      }

      request.status = "approved";
      await request.save();

      // -------- ADD USER TO CAMPAIGN -------- //
      
      await Campaign.findByIdAndUpdate(
        request.campaignId,
        {
          $addToSet: {
            volunteers: request.userId,
          },
        }
      );

      return res.status(200).json({
        success: true,
        message:
          "Volunteer approved successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          "Failed to approve volunteer",
        error: error.message,
      });
    }
  }

  // ---------------- REJECT VOLUNTEER ---------------- //
  async rejectVolunteer(req, res) {
    try {
      const { requestId } = req.params;

      const request =
        await VolunteerRequest.findById(
          requestId
        );

      if (!request) {
        return res.status(404).json({
          success: false,
          message:
            "Volunteer request not found",
        });
      }

      request.status = "rejected";

      await request.save();

      return res.status(200).json({
        success: true,
        message:
          "Volunteer rejected successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          "Failed to reject volunteer",
        error: error.message,
      });
    }
  }
}

module.exports = new VolunteerController();