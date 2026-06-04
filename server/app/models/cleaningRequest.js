// models/CleaningRequest.js

const mongoose = require("mongoose");

const CleaningRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CleaningCompany",
    },

    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NGO",
    },

    location: {
      type: String,
      required: true,
    },
    wasteType: [
      {
        type: String,
        enum: ["plastic", "chemical", "organic", "electronic", "mixed"],
        default: "mixed",
      },
    ],
    description: {
      type: String,
      required: true,
    },
    images: [
      {
        url: {
          type: String,
          default: "",
        },
      },
    ],

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "accepted",
        "in_progress",
        "completed",
        "rejected",
      ],
      default: "pending",
      lowercase: true,
      trim: true,
    },
    isApprovedByAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("CleaningRequest", CleaningRequestSchema);
