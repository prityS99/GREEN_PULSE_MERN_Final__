const Campaign = require("../models/campaigns");
const VolunteerRequest = require("../models/volunteerRequest");
const Notification = require("../models/notification");
const { getIO } = require("../sockets/socket");
const mongoose = require("mongoose");

class CampaignController {
  // --------  CREATE CAMPAIGN (NGO) --------- //
 async createCampaign(req, res) {
    try {
      const { title, description, ngoId, location, date } = req.body;

      // FIX: Explicitly pass all default state keys so MongoDB is forced to write them to the document shell
      const campaign = await Campaign.create({
        title,
        description,
        ngoId,
        location,
        date,
        createdBy: req.user.id,
        status: "pending",
        isApprovedByAdmin: false, // CRUCIAL FIX: Forces MongoDB to save this flag as false from day one
      });

      const adminNotif = await Notification.create({
        title: "New Campaign Awaiting Approval ⏳",
        message: `An NGO has submitted a new campaign: "${title}". Needs Admin approval.`,
        type: "campaign",
        isGlobal: false,
        createdBy: req.user.id,
        creatorModel: "Ngo",
      });

      const io = getIO();
      io.to("admin_room").emit("admin_activity", adminNotif);

      return res.status(201).json({
        success: true,
        message: "Campaign submitted for admin approval successfully",
        data: campaign,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to create campaign",
        error: error.message,
      });
    }
  }

  // --------  APPROVE CAMPAIGN (ADMIN ONLY) -------- //
  // async approveCampaign(req, res) {
  //   try {
  //     const { campaignId } = req.params;

  //     const campaign = await Campaign.findById(campaignId);
  //     if (!campaign) {
  //       return res
  //         .status(404)
  //         .json({ success: false, message: "Campaign not found" });
  //     }

  //     if (campaign.status !== "pending") {
  //       return res
  //         .status(400)
  //         .json({ success: false, message: "Campaign is already processed" });
  //     }

  //     campaign.status = "upcoming";
  //     await campaign.save();

  //     const ngoNotif = await Notification.create({
  //       receiverId: campaign.ngoId,
  //       receiverModel: "Ngo",
  //       title: "Campaign Approved! 🚀",
  //       message: `Your campaign "${campaign.title}" has been approved and is now live.`,
  //       type: "campaign",
  //       isGlobal: false,
  //       createdBy: req.user.id,
  //       creatorModel: "User",
  //     });

  //     const io = getIO();
  //     io.to(campaign.ngoId.toString()).emit("new_notification", ngoNotif);

  //     return res.status(200).json({
  //       success: true,
  //       message: "Campaign approved and published successfully",
  //       data: campaign,
  //     });
  //   } catch (error) {
  //     return res.status(500).json({
  //       success: false,
  //       message: "Failed to approve campaign",
  //       error: error.message,
  //     });
  //   }
  // }

  // --- GLOBAL DASHBOARD ----- //
  async getAllCampaigns(req, res) {
    try {
      const campaigns = await Campaign.aggregate([
       {
        // Comment out or remove the pending check temporarily to test UI
        $match: {}, 
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
          $lookup: {
            from: "users",
            localField: "createdBy",
            foreignField: "_id",
            as: "creatorDetails",
          },
        },
        {
          $unwind: {
            path: "$creatorDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
{
  $project: {
    _id: 1,
    title: 1,
    description: 1,
    location: 1,
    date: 1,
    status: 1,
    isApprovedByAdmin: 1,

    ngoName: "$ngoDetails.ngoName",
    ngoLogo: "$ngoDetails.profilePicture",
    createdBy: "$creatorDetails.name",

    totalVolunteers: {
      $size: {
        $ifNull: ["$volunteers", []],
      },
    },
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
        total: campaigns.length,
        data: campaigns,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch campaigns",
        error: error.message,
      });
    }
  }

  // ----------- APPLY FOR CAMPAIGN (USER) ------- //

  async applyForCampaign(req, res) {
    try {
      const { campaignId } = req.params;
      const { name, age, phone, address } = req.body;

    
      const campaignExists = await Campaign.findById(campaignId);

      if (!campaignExists || campaignExists.status === "pending") {
        return res.status(404).json({
          success: false,
          message: "Campaign not found or not open for applications",
        });
      }
      const alreadyApplied = await VolunteerRequest.findOne({
        campaignId,
        userId: req.user.id,
      });

      if (alreadyApplied) {
        return res.status(400).json({
          success: false,
          message: "You have already joined this campaign",
        });
      }

      const volunteerRequest = new VolunteerRequest({
        campaignId,
        userId: req.user.id,
        ngoId: campaignExists.ngoId,
        name,
        age,
        phone,
        address,
      });
      
      // Explicitly override any schema defaults before saving
      volunteerRequest.status = "approved"; 
      await volunteerRequest.save();

      const updatedCampaign = await Campaign.findByIdAndUpdate(
        campaignId,
        {
          $addToSet: { volunteers: req.user.id },
        },
        { returnDocument: "after" } 
      );

      // 5. Generate Real-time Socket Notification documents
      const activityNotif = await Notification.create({
        receiverId: campaignExists.ngoId,
        receiverModel: "Ngo",
        title: "New Volunteer Joined! 🎉",
        message: `${name} has joined your campaign: "${campaignExists.title}".`,
        type: "campaign",
        isGlobal: false,
        createdBy: req.user.id,
        creatorModel: "User",
      });

      const io = getIO();
      io.to("admin_room").emit("admin_activity", activityNotif);
      io.to(campaignExists.ngoId.toString()).emit("new_notification", activityNotif);

      return res.status(201).json({
        success: true,
        message: "Success! You have directly joined the campaign.",
        volunteerData: volunteerRequest,
        campaignVolunteersCount: updatedCampaign.volunteers.length
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to apply for campaign",
        error: error.message,
      });
    }
  }

  // ---------------- ADMIN DASHBOARD REQUESTS ---------------- //
  async getAllVolunteerRequests(req, res) {
    try {
      const requests = await VolunteerRequest.aggregate([
        {
          $lookup: {
            from: "campaigns",
            localField: "campaignId",
            foreignField: "_id",
            as: "campaignDetails",
          },
        },
        { $unwind: "$campaignDetails" },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        { $unwind: "$userDetails" },
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
            campaignTitle: "$campaignDetails.title",
            applicantName: "$userDetails.name",
            applicantEmail: "$userDetails.email",
            ngoName: "$ngoDetails.ngoName",
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
        message: "Failed to fetch volunteer requests",
        error: error.message,
      });
    }
  }

  // ------ NGO DASHBOARD REQUESTS ------ //
  async getNgoVolunteerRequests(req, res) {
    try {
      const ngoId = req.user.id;

      const requests = await VolunteerRequest.aggregate([
        {
          $match: {
            ngoId: new mongoose.Types.ObjectId(ngoId),
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
        { $unwind: "$campaignDetails" },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        { $unwind: "$userDetails" },
        {
          $project: {
            name: 1,
            age: 1,
            phone: 1,
            address: 1,
            status: 1,
            campaignTitle: "$campaignDetails.title",
            applicantName: "$userDetails.name",
            applicantEmail: "$userDetails.email",
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
        message: "Failed to fetch NGO volunteer requests",
        error: error.message,
      });
    }
  }
}

module.exports = new CampaignController();


