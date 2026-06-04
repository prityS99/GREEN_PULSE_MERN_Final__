
const Analytics = require("../models/analytics");
const User = require("../models/users");
const NGO = require("../models/ngo");
const CleaningCompany = require("../models/cleaningCompany");
const Campaign = require("../models/campaigns");
const CleaningRequest = require("../models/cleaningRequest");
const Certificate = require("../models/certificate");
// const Donation = require("../models/donation");

class AnalyticsController {

  async updateAnalytics(req, res) {
    try {
      // ---------- COUNT TOTALS ------------ //

      const totalUsers = await User.countDocuments();

      const totalNGOs = await NGO.countDocuments();

      const totalCompanies = await Company.countDocuments();

      const totalCampaigns = await Campaign.countDocuments();

      const totalCleaningRequests =
        await CleaningRequest.countDocuments();

      const completedCleaningRequests =
        await CleaningRequest.countDocuments({
          status: "completed",
        });

      const totalCertificatesIssued =
        await Certificate.countDocuments();

      // ---------- TOTAL DONATIONS ---------- //

      const donationResult = await Donation.aggregate([
        {
          $group: {
            _id: null,
            totalAmount: {
              $sum: "$amount",
            },
          },
        },
      ]);

      const totalDonations =
        donationResult.length > 0
          ? donationResult[0].totalAmount
          : 0;

      // ---------- UPDATE / CREATE ---------- //

      let analytics = await Analytics.findOne();

      if (!analytics) {
        analytics = await Analytics.create({
          totalUsers,
          totalNGOs,
          totalCompanies,
          totalCampaigns,
          totalCleaningRequests,
          completedCleaningRequests,
          totalCertificatesIssued,
          totalDonations,
        });
      } else {
        analytics.totalUsers = totalUsers;
        analytics.totalNGOs = totalNGOs;
        analytics.totalCompanies = totalCompanies;
        analytics.totalCampaigns = totalCampaigns;
        analytics.totalCleaningRequests =
          totalCleaningRequests;
        analytics.completedCleaningRequests =
          completedCleaningRequests;
        analytics.totalCertificatesIssued =
          totalCertificatesIssued;
        analytics.totalDonations = totalDonations;

        await analytics.save();
      }

      return res.status(200).json({
        success: true,
        message: "Analytics updated successfully",
        analytics,
      });
    } catch (error) {
      console.log("Update Analytics Error:", error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // ======================================================
  // GET ALL ANALYTICS
  // ======================================================

  async getAnalytics(req, res) {
    try {
      const analytics = await Analytics.findOne();

      return res.status(200).json({
        success: true,
        analytics,
      });
    } catch (error) {
      console.log("Get Analytics Error:", error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }


  async getMonthlyUserGrowth(req, res) {
    try {
      const users = await User.aggregate([
        {
          $group: {
            _id: {
              month: { $month: "$createdAt" },
              year: { $year: "$createdAt" },
            },

            totalUsers: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
          },
        },
      ]);

      return res.status(200).json({
        success: true,
        users,
      });
    } catch (error) {
      console.log("Monthly User Growth Error:", error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }


  async getMonthlyDonations(req, res) {
    try {
      const donations = await Donation.aggregate([
        {
          $group: {
            _id: {
              month: { $month: "$createdAt" },
              year: { $year: "$createdAt" },
            },

            totalDonation: {
              $sum: "$amount",
            },
          },
        },

        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
          },
        },
      ]);

      return res.status(200).json({
        success: true,
        donations,
      });
    } catch (error) {
      console.log("Monthly Donation Error:", error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }


  async cleaningRequestStatusAnalytics(req, res) {
    try {
      const data = await CleaningRequest.aggregate([
        {
          $group: {
            _id: "$status",

            total: {
              $sum: 1,
            },
          },
        },
      ]);

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      console.log("Cleaning Analytics Error:", error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }


  async topDonatingUsers(req, res) {
    try {
      const topUsers = await Donation.aggregate([
        {
          $group: {
            _id: "$userId",

            totalDonated: {
              $sum: "$amount",
            },
          },
        },

        {
          $sort: {
            totalDonated: -1,
          },
        },

        {
          $limit: 10,
        },

        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },

        {
          $unwind: "$user",
        },

        {
          $project: {
            _id: 1,
            totalDonated: 1,
            name: "$user.name",
            email: "$user.email",
          },
        },
      ]);

      return res.status(200).json({
        success: true,
        topUsers,
      });
    } catch (error) {
      console.log("Top Donating Users Error:", error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async campaignAnalytics(req, res) {
    try {
      const campaigns = await Campaign.aggregate([
        {
          $group: {
            _id: "$status",

            totalCampaigns: {
              $sum: 1,
            },
          },
        },
      ]);

      return res.status(200).json({
        success: true,
        campaigns,
      });
    } catch (error) {
      console.log("Campaign Analytics Error:", error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

module.exports = new AnalyticsController();