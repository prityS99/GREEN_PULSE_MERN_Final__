const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    token: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const TokenModel = mongoose.model("user_token", TokenSchema);

module.exports = TokenModel;