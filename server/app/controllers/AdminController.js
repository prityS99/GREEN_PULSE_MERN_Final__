const mongoose = require("mongoose");
const User = require("../models/users");
const CleaningRequest = require("../models/cleaningRequest");
const Reward = require("../models/reward");
const Notification = require("../models/notification");
const Announcement = require("../models/annoucement");
const Activity = require("../models/activity");
const Ngo = require("../models/ngo");
const CleaningCompany = require("../models/cleaningCompany"); // Added missing import
const Campaign = require("../models/campaigns"); // Added missing import
const { getIO } = require("../sockets/socket");

const io = getIO();

class AdminController {
  // -------- VIEW ALL USERS ------- //
  async viewAllUsers(req, res) {
    try {
      const users = await User.find({ isDeleted: false })
        .select("-password")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        totalUsers: users.length,
        users,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // ----- VIEW SINGLE USER ---- //
  async viewSingleUser(req, res) {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId).select("-password");

      if (!user || user.isDeleted) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      return res.status(200).json({ success: true, user });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // ---------------- UPDATE USER ROLE ---------------- //
  async updateUserRole(req, res) {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      const allowedRoles = [
        "admin",
        "ngo",
        "cleaning_company",
        "govt_officer",
        "user",
      ];

      if (!allowedRoles.includes(role)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid role" });
      }

      const user = await User.findById(userId);

      if (!user || user.isDeleted) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      user.role = role;
      await user.save();

      io.to(user._id.toString()).emit("role_updated", {
        success: true,
        message: "Your role has been updated",
        role: user.role,
      });

      return res.status(200).json({
        success: true,
        message: "User role updated successfully",
        user,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // ---------------- DELETE USER ---------------- //
  async deleteUser(req, res) {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);

      if (!user || user.isDeleted) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      user.isDeleted = true;
      user.deletedAt = new Date();
      await user.save();

      io.to(user._id.toString()).emit("account_deleted", {
        success: true,
        message: "Your account has been deleted by admin",
      });

      return res
        .status(200)
        .json({ success: true, message: "User deleted successfully" });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // ---------------- RESTORE USER ---------------- //
  async restoreUser(req, res) {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      user.isDeleted = false;
      user.deletedAt = null;
      await user.save();

      io.to(user._id.toString()).emit("account_restored", {
        success: true,
        message: "Your account has been restored",
      });

      return res
        .status(200)
        .json({ success: true, message: "User restored successfully" });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // ---------------- VERIFY USER ---------------- //
  async verifyUser(req, res) {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);

      if (!user || user.isDeleted) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      user.isVerified = true;
      await user.save();

      io.to(user._id.toString()).emit("account_verified", {
        success: true,
        message: "Your account has been verified",
      });

      return res
        .status(200)
        .json({ success: true, message: "User verified successfully" });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // ---------------- APPROVE CLEANING REQUEST (ENUM OPTION) ---------------- //
  async approveCleaningRequest(req, res) {
    try {
      const { requestId } = req.params;
      const cleaningRequest = await CleaningRequest.findById(requestId);

      if (!cleaningRequest) {
        return res
          .status(404)
          .json({ success: false, message: "Cleaning request not found" });
      }

      // Update status to "approved" (Now safe since we added it to the model's enum array)
      cleaningRequest.status = "approved";

     
      if ("isApprovedByAdmin" in cleaningRequest) {
        cleaningRequest.isApprovedByAdmin = true;
      }

      await cleaningRequest.save();

      // Deep populate relevant references for socket streaming and notifications
      const populatedRequest = await CleaningRequest.findById(
        cleaningRequest._id,
      ).populate([
        { path: "userId", select: "name email role" },
        { path: "companyId", select: "companyName phone" },
      ]);

      // Safely extract target user ID falling back gracefully to original raw field
      const targetNgoId =
        populatedRequest.userId?._id ||
        populatedRequest.userId ||
        cleaningRequest.userId;

      // 1. Persist notification log for the creator
      await Notification.create({
        receiverId: targetNgoId,
        title: "Cleaning Request Approved",
        message: "Your cleaning request has been approved",
        type: "cleaning_request",
      });

      // Synchronize live WebSocket event channels
      if (io) {
        io.emit("cleaning:approve", {
          requestId: populatedRequest._id,
          userId: targetNgoId,
          request: populatedRequest,
        });

        io.to(targetNgoId.toString()).emit("cleaning_request_approved", {
          success: true,
          message: "Your cleaning request has been approved",
          cleaningRequest: populatedRequest,
        });
      }

      // 2. Safely alert the Cleaning Company only if it exists and is fully populated
      if (
        populatedRequest.companyId &&
        (populatedRequest.companyId._id ||
          typeof populatedRequest.companyId === "string")
      ) {
        const targetCompanyProfileId =
          populatedRequest.companyId._id || populatedRequest.companyId;

        await Notification.create({
          receiverId: targetCompanyProfileId,
          title: "New Cleaning Task",
          message: "A new cleaning task has been assigned",
          type: "cleaning_request",
        });

        if (io) {
          io.to(targetCompanyProfileId.toString()).emit("new_cleaning_task", {
            success: true,
            message: "A new cleaning task has been assigned",
            cleaningRequest: populatedRequest,
          });
        }
      }

      // 3. Create global analytics log entity
      const activity = await Activity.create({
        title: "Cleaning Request Approved",
        description: "A new cleaning mission has been approved",
        type: "cleaning",
        relatedId: populatedRequest._id,
      });

      if (io) {
        io.to("global_dashboard").emit("new_global_activity", activity);
      }

      return res.status(200).json({
        success: true,
        message:
          "Cleaning request approved successfully, real-time channels synchronized.",
        cleaningRequest: populatedRequest,
      });
    } catch (error) {
      console.error(
        "Critical error in approveCleaningRequest execution pipeline:",
        error,
      );
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // ----- REJECT CLEANING REQUEST ----- //
  async rejectCleaningRequest(req, res) {
    try {
      const { requestId } = req.params;
      const { reason } = req.body;

      const cleaningRequest = await CleaningRequest.findById(requestId);

      if (!cleaningRequest) {
        return res
          .status(404)
          .json({ success: false, message: "Cleaning request not found" });
      }

      cleaningRequest.status = "rejected";
      await cleaningRequest.save();

      await Notification.create({
        receiverId: cleaningRequest.ngoId,
        title: "Cleaning Request Rejected",
        message: reason || "Your cleaning request has been rejected",
        type: "cleaning_request",
      });

      io.to(cleaningRequest.ngoId.toString()).emit(
        "cleaning_request_rejected",
        {
          success: false,
          message: reason || "Your cleaning request has been rejected",
          cleaningRequest,
        },
      );

      return res
        .status(200)
        .json({
          success: true,
          message: "Cleaning request rejected successfully",
        });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // -------- APPROVE NGO -------- //
  async approveNgo(req, res) {
    try {
      const { ngoId } = req.params;
      const ngo = await Ngo.findById(ngoId);

      if (!ngo) {
        return res
          .status(404)
          .json({ success: false, message: "NGO not found" });
      }

      ngo.isApproved = true;
      await ngo.save();

      await Notification.create({
        receiverId: ngo.userId,
        title: "NGO Approved",
        message: "Your NGO has been approved by admin",
        type: "ngo",
      });

      io.to(ngo.userId.toString()).emit("ngo_approved", {
        success: true,
        message: "Your NGO has been approved",
        ngo,
      });

      return res
        .status(200)
        .json({ success: true, message: "NGO approved successfully", ngo });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // -------- APPROVE COMPANY -------- //
async approveCompany(req, res) {
  try {
    // ✅ FIX: Destructure "id" instead of "companyId" to match your router file exactly!
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Cleaning Company ID parameter is missing from the request routing configuration.",
      });
    }

    // Clean any hidden or accidental whitespace characters
    const cleanId = id.trim();

    // Look up the profile via the verified ID
    const company = await CleaningCompany.findById(cleanId);

    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Cleaning Company not found" });
    }

    // Toggle the approval flag status state safely
    company.isApproved = true;
    await company.save();

    // Create internal notification log for the company's owner account
    if (company.userId) {
      await Notification.create({
        receiverId: company.userId,
        title: "Company Profile Approved",
        message: `Your cleaning company "${company.companyName}" has been officially approved by admin`,
        type: "cleaning_company",
      });

      // Fire a live Socket.io event directly to the company owner's client room
      if (typeof io !== "undefined") {
        io.to(company.userId.toString()).emit("company_approved", {
          success: true,
          message: "Your cleaning company has been approved",
          company,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Cleaning company approved successfully",
      company,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
  // ------ APPROVE REWARD ------ //
  async approveReward(req, res) {
    try {
      const { rewardId } = req.params;
      const reward = await Reward.findById(rewardId);

      if (!reward) {
        return res
          .status(404)
          .json({ success: false, message: "Reward not found" });
      }

      reward.approvalStatus = "approved";
      await reward.save();

      await Notification.create({
        receiverId: reward.ngoId,
        title: "Reward Approved",
        message: "Congratulations! Your NGO reward has been approved.",
        type: "reward",
      });

      io.to(reward.ngoId.toString()).emit("reward_approved", {
        success: true,
        message: "Congratulations! Reward approved.",
        reward,
      });

      const activity = await Activity.create({
        title: "NGO Achievement",
        description: "An NGO received environmental recognition reward",
        type: "reward",
        relatedId: reward._id,
      });

      io.to("global_dashboard").emit("new_global_activity", activity);

      return res
        .status(200)
        .json({
          success: true,
          message: "Reward approved successfully",
          reward,
        });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // ----- REJECT REWARD ---- //
  async rejectReward(req, res) {
    try {
      const { rewardId } = req.params;
      const { reason } = req.body;

      const reward = await Reward.findById(rewardId);

      if (!reward) {
        return res
          .status(404)
          .json({ success: false, message: "Reward not found" });
      }

      reward.approvalStatus = "rejected";
      await reward.save();

      await Notification.create({
        receiverId: reward.ngoId,
        title: "Reward Rejected",
        message: reason || "Reward request rejected by admin",
        type: "reward",
      });

      io.to(reward.ngoId.toString()).emit("reward_rejected", {
        success: false,
        message: reason || "Reward request rejected by admin",
        reward,
      });

      return res
        .status(200)
        .json({ success: true, message: "Reward rejected successfully" });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // ----- APPROVE CAMPAIGNS ---- //

async approveCampaign(req, res) {
  try {
    const rawId = req.params.id || req.params.campaignId;

    if (!rawId) {
      return res.status(400).json({
        success: false,
        message: "Campaign ID parameter is missing from the request URL routing configuration.",
      });
    }

    const cleanId = rawId.trim();
    if (!mongoose.Types.ObjectId.isValid(cleanId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Document ObjectId structure format.",
      });
    }

    const campaign = await Campaign.findById(cleanId);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found in database.",
      });
    }

    // FIX: Update flags safely to match your schema constraints
    campaign.isApprovedByAdmin = true;
    campaign.status = "upcoming"; // Changed from "approved" to "upcoming" so your enum validation passes!
    
    await campaign.save();

    return res.status(200).json({
      success: true,
      message: "Campaign approved successfully!",
      campaign,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

  // -- FETCH ALL APPROVALS ---//
  async fetchAllApprovalsData(req, res) {
    try {
      setLoading(true);

      const [ngoRes, companyRes, campaignRes, activitiesRes] =
        await Promise.all([
          ngoService.getAllNgo(),
          adminService.viewAllCompanies(),
          adminService.getAllCampaigns(),
          adminService.viewGlobalActivities(),
        ]);

      setNgos(ngoRes?.data || ngoRes?.ngos || ngoRes || []);
      setCompanies(
        companyRes?.companies || companyRes?.data || companyRes || [],
      );
      setCampaigns(
        campaignRes?.data || campaignRes?.campaigns || campaignRes || [],
      );

      // SAFELY EXTRACT AND VALIDATE THE ARRAY FOR REQUESTS
      const extractedRequests =
        activitiesRes?.cleaningRequests || activitiesRes?.data || activitiesRes;
      setRequests(Array.isArray(extractedRequests) ? extractedRequests : []);

      setCerts([]);
    } catch (err) {
      console.error(
        "Centralized dashboard approval pipelines aggregation failure:",
        err,
      );
    } finally {
      setLoading(false);
    }
  }

  // ------- CREATE ANNOUNCEMENT ---- //
  async createAnnouncement(req, res) {
    try {
      const { title, message, targetAudience } = req.body;

      const announcement = await Announcement.create({
        title,
        message,
        targetAudience,
        createdBy: req.user._id,
      });

      const activity = await Activity.create({
        title: "New Announcement",
        description: title,
        type: "announcement",
        relatedId: announcement._id,
      });

      io.to("global_dashboard").emit("new_announcement", announcement);
      io.to("global_dashboard").emit("new_global_activity", activity);

      return res.status(201).json({
        success: true,
        message: "Announcement created successfully",
        announcement,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // --------- VIEW ALL ANNOUNCEMENTS -------- //
  async viewAllAnnouncements(req, res) {
    try {
      const announcements = await Announcement.find({ isActive: true }).sort({
        createdAt: -1,
      });

      return res.status(200).json({
        success: true,
        totalAnnouncements: announcements.length,
        announcements,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async viewAllCompanies(req, res) {
    try {
      const companies = await CleaningCompany.find().sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        totalCompanies: companies.length,
        companies,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // ---  GET ALL CLEANING COMPANIES --- //
  async getAllCompanies(req, res) {
    try {
      const companies = await CleaningCompany.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "owner",
          },
        },
        { $unwind: "$owner" },
        {
          $project: {
            companyName: 1,
            about: 1,
            city: 1,
            state: 1,
            country: 1,
            workersCount: 1,
            completedProjects: 1,
            totalReviews: 1,
            points: 1,
            isApproved: 1,
            coverImage: 1,
            ownerName: "$owner.name",
            ownerEmail: "$owner.email",
          },
        },
        { $sort: { createdAt: -1 } },
      ]);

      res.status(200).json({
        success: true,
        total: companies.length,
        data: companies,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // ---  GET ALL NGO --- //
  async getAllNgo(req, res) {
    try {
      // Fixed lowercase model naming reference bug from NGO to Ngo
      const ngos = await Ngo.find()
        .populate("badges")
        .populate("rewards")
        .populate("certificates")
        .populate({
          path: "userId",
          select: "name email",
        })
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        total: ngos.length,
        data: ngos,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // ---  GET ALL CLEANING CAMPAIGNS --- //
  async getAllCampaigns(req, res) {
    try {
      const campaigns = await Campaign.aggregate([
        { $match: {} },
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
      $size: { $ifNull: ["$volunteers", []] },
    },
  },
},
        { $sort: { createdAt: -1 } },
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

  // ----- CLEANING COMPANIES ---//
  async getAllCleaningRequests(req, res) {
    try {
      // FIXED: Added multi-field layout population logic for companyId to fit the UI
      const cleaningRequests = await CleaningRequest.find()
        .populate("userId", "name email role")
        .populate("companyId", "companyName phone")
        .sort({ createdAt: -1 })
        .lean();

      return res.status(200).json({
        success: true,
        count: cleaningRequests.length,
        cleaningRequests,
      });
    } catch (error) {
      console.error("Error inside getAllCleaningRequests controller:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve pending waste remediation field requests.",
        error: error.message,
      });
    }
  }

  // ------- VIEW GLOBAL ACTIVITIES ------ //
  async viewGlobalActivities(req, res) {
    try {
      const activities = await Activity.find({ isPublic: true }).sort({
        createdAt: -1,
      });

      return res.status(200).json({
        success: true,
        totalActivities: activities.length,
        activities,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // ----- DASHBOARD ANALYTICS ------ //
  async dashboardAnalytics(req, res) {
    try {
      const totalUsers = await User.countDocuments({ isDeleted: false });
      const totalAdmins = await User.countDocuments({
        role: "admin",
        isDeleted: false,
      });
      const totalNgo = await User.countDocuments({
        role: "ngo",
        isDeleted: false,
      });
      const totalCleaningCompanies = await User.countDocuments({
        role: "cleaning_company",
        isDeleted: false,
      });
      const totalGovtOfficers = await User.countDocuments({
        role: "govt_officer",
        isDeleted: false,
      });
      const verifiedUsers = await User.countDocuments({
        isVerified: true,
        isDeleted: false,
      });
      const totalApprovedCleaningRequests =
        await CleaningRequest.countDocuments({ status: "approved" });
      const totalApprovedRewards = await Reward.countDocuments({
        approvalStatus: "approved",
      });

      return res.status(200).json({
        success: true,
        analytics: {
          totalUsers,
          totalAdmins,
          totalNgo,
          totalCleaningCompanies,
          totalGovtOfficers,
          verifiedUsers,
          totalApprovedCleaningRequests,
          totalApprovedRewards,
        },
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new AdminController();
