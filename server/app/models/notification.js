const mongoose = require("mongoose");

const NotificationSchema =
  new mongoose.Schema(
    {
      receiverId: {
        type: mongoose.Schema.Types.ObjectId,

        refPath: "receiverModel",
      },

      receiverModel: {
        type: String,

        enum: [
          "User",
          "Ngo",
          "GovtOfficer",
          "CleaningCompany",
        ],
      },

      title: {
        type: String,
        required: true,
      },

      message: {
        type: String,
        required: true,
      },

      type: {
        type: String,

        enum: [
          "badge",
          "campaign",
          "award",
          "certificate",
          "announcement",
          'ngo',
          "cleaning_company",
          "cleaning_request",
        ],

        default: "system",
      },

      isGlobal: {
        type: Boolean,
        default: false,
      },

      isRead: {
        type: Boolean,
        default: false,
      },

      redirectLink: String,

      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
    { timestamps: true }
  );

module.exports = mongoose.model(
  "Notification",
  NotificationSchema
);