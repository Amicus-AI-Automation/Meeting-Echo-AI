const jwt = require("jsonwebtoken");
const { sendOTPEmail } = require("../config/email");
require("dotenv").config();

// In-memory storage (replace with database later)
const otpStore = {};

// Generate random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP to email
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    // Rate limit: Check if OTP was recently requested (within 1 minute)
    if (otpStore[email] && otpStore[email].requestedAt) {
      const timeDiff = Date.now() - otpStore[email].requestedAt;
      if (timeDiff < 60000) {
        return res.status(429).json({
          message: "Please wait before requesting another OTP",
        });
      }
    }

    // Generate OTP
    const otp = generateOTP();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in memory
    otpStore[email] = {
      code: otp,
      expiresAt: expiryTime,
      requestedAt: Date.now(),
    };

    // Send OTP via email
    try {
      await sendOTPEmail(email, otp);
      console.log(`✅ OTP sent successfully to ${email}`);
    } catch (emailError) {
      console.error("Email service error:", emailError);
      return res.status(500).json({
        message: "Failed to send OTP email. Please check your email configuration.",
        error: emailError.message,
      });
    }

    res.status(200).json({
      message: "OTP sent successfully",
      success: true,
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({
      message: "Failed to send OTP",
      error: error.message,
    });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate inputs
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    // Check if OTP exists for this email
    const storedOTP = otpStore[email];
    if (!storedOTP) {
      return res.status(401).json({ message: "OTP not found. Please request a new one" });
    }

    // Check if OTP is expired
    if (storedOTP.expiresAt < new Date()) {
      delete otpStore[email];
      return res.status(401).json({ message: "OTP has expired. Please request a new one" });
    }

    // Verify OTP
    if (storedOTP.code !== otp) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    // OTP is valid - generate JWT token
    delete otpStore[email]; // Clear OTP after verification

    const token = jwt.sign(
      { email: email },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "OTP verified successfully",
      success: true,
      token,
      user: {
        email: email,
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({
      message: "Failed to verify OTP",
      error: error.message,
    });
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
};
