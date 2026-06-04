const mongoose = require("mongoose");

const NgoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    ngoName: {
      type: String,
      required: true,
      trim: true,
    },

    about: {
      type: String,
      default: "",
    },

    address: {
      type: String,
    },

    city: {
      type: String,
    },

    country: {
      type: String,
      default: "India",
    },

    coverImage: {
      url: String,
      coverImageId: String,
    },

    rewards: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Reward",
        },
      ],
      default: [],
    },
    certificates: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Certificate",
        },
      ],
      default: [],
    },

    campaignsJoined: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Campaign",
        },
      ],
      default: [],
    },

    cleaningRequests: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "CleaningRequest",
        },
      ],
      default: [],
    },

    inaugurationDate: {
      type: Date,
    },

    members: {
      children: {
        type: Number,
        default: 0,
      },

      elders: {
        type: Number,
        default: 0,
      },

      adults: {
        type: Number,
        default: 0,
      },
    },

    ngoType: {
      type: [String],

      enum: [
        "environment",
        "child_welfare",
        "old_age",
        "animal_welfare",
        "education",
      ],

      default: ["environment"],
    },
    badges: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Badge",
        },
      ],
      default: [],
    },

    isApproved: {
      type: Boolean,
      default: false,
      index: true,
    },
  },

  { timestamps: true },
);

module.exports = mongoose.model("NGO", NgoSchema);
