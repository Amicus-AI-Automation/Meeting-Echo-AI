const nodemailer = require("nodemailer");
require("dotenv").config();

// Configure your email service here
// For Gmail: use "Gmail" and enable "Less secure app access" or use App Passwords
// For SendGrid: use "SendGrid" API key
// For Other SMTP: configure host, port, secure settings

const createEmailTransporter = () => {
  // Test mode: don't actually send emails
  if (process.env.TEST_MODE === "true") {
    return null;
  }

  // Gmail configuration (recommended for development)
  if (process.env.EMAIL_SERVICE === "gmail") {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // Use Gmail App Password
      },
    });
  }

  // Generic SMTP configuration
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

const sendOTPEmail = async (email, otp) => {
  try {
    // Test mode: log to console instead of sending
    if (process.env.TEST_MODE === "true") {
      console.log(`\n${"=".repeat(60)}`);
      console.log(`📧 TEST MODE - OTP Email Would Be Sent`);
      console.log(`To: ${email}`);
      console.log(`OTP: ${otp}`);
      console.log(`${"=".repeat(60)}\n`);
      return true;
    }

    const transporter = createEmailTransporter();

    if (!transporter) {
      throw new Error("Email transporter not configured");
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Meeting Assistant - Your One-Time Password (OTP)",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
          <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin: 0 0 20px 0;">Meeting Assistant</h2>
            
            <p style="color: #666; margin: 0 0 15px 0;">Your One-Time Password (OTP) is:</p>
            
            <div style="background: #667eea; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; font-size: 32px; font-weight: bold; letter-spacing: 6px;">
              ${otp}
            </div>
            
            <p style="color: #666; margin: 20px 0; font-size: 14px;">
              This OTP will expire in <strong>10 minutes</strong>. Do not share this code with anyone.
            </p>
            
            <p style="color: #999; margin: 20px 0 0 0; font-size: 12px;">
              If you didn't request this code, please ignore this email.
            </p>
          </div>
        </div>
      `,
    });

    console.log(`OTP sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};

module.exports = { sendOTPEmail };
