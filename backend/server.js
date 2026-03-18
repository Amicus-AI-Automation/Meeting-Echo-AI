require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

// Import routes
const authRoutes = require("./routes/auth");
const meetingRoutes = require("./routes/meeting");

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);

// MongoDB connection disabled - using JSON file storage instead
// Meetings are saved as JSON files in /data directory

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ 
    message: "Server is running",
    status: "✅ OTP & Meetings Features Ready (JSON Storage)",
    storage: "JSON files in /data directory",
    timestamp: new Date() 
  });
});

// Routes
app.use("/", authRoutes);
app.use("/", meetingRoutes);

// Uploads directory for serving files (optional)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);

  // Multer errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "File size exceeds maximum limit of 500MB" });
  }

  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: "File upload error: " + err.message });
  }

  // Generic error
  res.status(500).json({
    message: err.message || "Internal server error",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📧 Email Service: Gmail OTP`);
  console.log(`🔐 OTP Storage: Email-based authentication`);
  console.log(`📊 MongoDB: Connected for meetings & storage`);
  console.log(`📁 Upload Directory: ./uploads`);
  console.log(`${"=".repeat(60)}\n`);
});

module.exports = app;
