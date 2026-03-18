const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      code: String,
      expiresAt: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastOtpRequestAt: {
      type: Date,
    },
    meetings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Meeting",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
