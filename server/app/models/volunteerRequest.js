// models/VolunteerRequest.js

const mongoose = require("mongoose");

const VolunteerRequestSchema =
  new mongoose.Schema(
    {
      campaignId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Campaign",
        required: true,
      },

      ngoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ngo",
      },

      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      name: {
        type: String,
        required: true,
      },

      age: {
        type: Number,
        required: true,
      },

      phone: {
        type: String,
        required: true,
      },

      address: {
        type: String,
        required: true,
      },

      status: {
        type: String,
        enum: [
          "pending",
          "approved",
          "rejected",
        ],
        default: "pending",
      },
    },
    { timestamps: true }
  );

module.exports = mongoose.model(
  "VolunteerRequest",
  VolunteerRequestSchema
);