const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "ngo", "cleaning_company", "govt_officer", "user"],
      default: "user",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationToken: {
      type: String,
    },

    verificationExpiry: {
      type: Date,
    },

    isTemporaryPassword: { type: Boolean, default: false },



    // forgotPasswordExpiry: {
    //   type: Date,
    // },

    // resetPasswordToken: {
    //   type: String,
    // },

    // resetPasswordExpiry: {
    //   type: Date,
    // },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
