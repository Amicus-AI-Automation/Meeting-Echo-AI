const express = require("express");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const {
  uploadMeeting,
  queryMeeting,
  getMeetings,
} = require("../controllers/meetingController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Configure multer for file uploads
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
  const allowedMimeTypes = ["video/mp4", "audio/wav", "audio/mpeg"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
});

// Routes
router.post("/upload-meeting", authMiddleware, upload.single("file"), uploadMeeting);
router.post("/query", authMiddleware, queryMeeting);
router.get("/meetings", authMiddleware, getMeetings);

module.exports = router;
