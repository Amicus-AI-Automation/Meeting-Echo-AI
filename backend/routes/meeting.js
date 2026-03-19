const express = require("express");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const {
  uploadMeeting,
  queryMeeting,
  getMeetings,
  getPipelineStatus,
  deleteMeeting,
} = require("../controllers/meetingController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// ─────────────────────────────────────────
// Multer config
// ─────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const customFilename = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, customFilename);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "video/mp4",
    "audio/wav",
    "audio/mpeg",
    "video/quicktime",
    "video/x-msvideo",
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only MP4, WAV, MP3 are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB
});

// ─────────────────────────────────────────
// Routes
// ─────────────────────────────────────────

// Upload a meeting file → triggers Python pipeline
router.post("/upload-meeting", authMiddleware, upload.single("file"), uploadMeeting);

// Send a chat query to a specific meeting (RAG)
router.post("/query", authMiddleware, queryMeeting);

// Get all meetings the authenticated user can access
router.get("/meetings", authMiddleware, getMeetings);

// Poll the transcription/embedding pipeline status
router.get("/status/:meeting_id", authMiddleware, getPipelineStatus);

// Delete meeting and cancel its processing
router.delete("/meeting/:meeting_id", authMiddleware, deleteMeeting);

module.exports = router;
