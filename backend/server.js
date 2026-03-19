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

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    message: "Server is running",
    status: "✅ MeetingRAG Backend Ready",
    storage: "JSON files in backend/data",
    python_api: process.env.PYTHON_API_URL || "http://localhost:8000",
    timestamp: new Date(),
  });
});

// Routes
app.use("/", authRoutes);
app.use("/", meetingRoutes);

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "File size exceeds maximum limit of 500MB" });
  }

  const multer = require("multer");
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: "File upload error: " + err.message });
  }

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
  console.log(`🚀 Node.js Server  → http://localhost:${PORT}`);
  console.log(`🐍 Python API      → ${process.env.PYTHON_API_URL || "http://localhost:8000"}`);
  console.log(`📧 Email Service   : Gmail OTP`);
  console.log(`📁 Uploads         : ./uploads`);
  console.log(`📊 Storage         : JSON files in ./data`);
  console.log(`${"=".repeat(60)}\n`);
});

module.exports = app;
