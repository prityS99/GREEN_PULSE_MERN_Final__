const mongoose = require("mongoose");

const CertificateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
    },

    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GovtOfficer",
    },

    certificateNumber: {
      type: String,
      unique: true,
      required: true,
    },

    issueDate: {
      type: Date,
      default: Date.now,
    },

    certificateFile: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Certificate", CertificateSchema);