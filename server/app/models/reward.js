const mongoose = require("mongoose");

const RewardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    pointsRequired: {
      type: Number,
      required: true,
      min: 0,
    },

    rewardImage: {
      type: String,
    },

    // monthly sanctioned amount for NGO
    sanctionedAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    // optional currency field
    currency: {
      type: String,
      default: "INR",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reward", RewardSchema);