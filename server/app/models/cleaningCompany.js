// models/Company.js

const mongoose = require("mongoose");

const CleaningCompanySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    companyName: {
      type: String,
      required: true,
    },
    about: {
      type: String,
      default: "",
    },
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
    },

    coverImage: {
      url: String,
      coverImageId: String,
    },

    workersCount: {
      type: Number,
      default: 0,
    },

    phone: {
      type: String,
    },

    address: {
      type: String,
    },

    city: {
      type: String,
    },

    state: {
      type: String,
    },

    experienceYears: {
      type: Number,
      default: 0,
    },

    completedProjects: {
      type: Number,
      default: 0,
    },

    points: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },

    cleaningRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CleaningRequest",
      },
    ],

    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("CleaningCompany", CleaningCompanySchema);
