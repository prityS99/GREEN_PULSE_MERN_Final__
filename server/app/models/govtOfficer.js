// models/GovtOfficer.js

const mongoose = require("mongoose");

const GovtOfficerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

   profileImage: {
      url: String,
      coverImageId: String,
    },
    department: {
      type: String,
      required: true,
    },

    designation: {
      type: String,
      required: true,
    },

    joiningDate: {
      type: Date,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GovtOfficer", GovtOfficerSchema);