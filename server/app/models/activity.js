// models/activity.js

const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: [
        "reward",
        "cleaning",
        "campaign",
        "announcement",
        "ngo",
      ],
      required: true,
    },

    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Activity",
  ActivitySchema
);