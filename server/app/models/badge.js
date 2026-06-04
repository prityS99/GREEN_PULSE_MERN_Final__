const mongoose = require("mongoose");

const BadgeSchema = new mongoose.Schema(
  {
    badgeName: {
      type: String,

      enum: [
        "Good",
        "Excellent",
        "Elite",
      ],

      required: true,
      unique: true,
      trim: true,
    },

    badgeImage: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    badgeColor: {
      type: String,
      default: "#000000",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model(
  "Badge",
  BadgeSchema
);