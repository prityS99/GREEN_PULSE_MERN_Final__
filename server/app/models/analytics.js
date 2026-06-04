const mongoose = require("mongoose");

const AnalyticsSchema = new mongoose.Schema(
  {
    totalUsers: {
      type: Number,
      default: 0,
    },

    totalNGOs: {
      type: Number,
      default: 0,
    },

    totalCompanies: {
      type: Number,
      default: 0,
    },

    totalCampaigns: {
      type: Number,
      default: 0,
    },

    totalCleaningRequests: {
      type: Number,
      default: 0,
    },

    completedCleaningRequests: {
      type: Number,
      default: 0,
    },

    totalCertificatesIssued: {
      type: Number,
      default: 0,
    },

    totalDonations: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Analytics", AnalyticsSchema);