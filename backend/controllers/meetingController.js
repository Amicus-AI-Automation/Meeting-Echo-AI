const fs = require("fs");
const path = require("path");
const jsonStorage = require("../services/jsonStorage");

// Upload meeting
const uploadMeeting = async (req, res) => {
  try {
    const { title, date, durationSeconds, language = "en", participants, allowedUsers } = req.body;
    const email = req.user?.email;
    const userRoles = req.user?.roles || [];
    const frontendRole = req.user?.frontendRole || "";
    const file = req.file;

    console.log(`📥 Meeting upload request from: ${email}`);

    // Check if user has admin role (from Entra ID or frontend)
    const isAdmin = userRoles.includes("admin") || frontendRole === "admin";
    
    if (!isAdmin) {
      if (file) fs.unlinkSync(file.path);
      console.warn(`🚫 Non-admin user ${email} attempted to upload meeting. Entra ID roles: [${userRoles.join(", ")}], Frontend role: ${frontendRole}`);
      return res.status(403).json({ 
        message: "Forbidden. Only admins can upload meetings",
        userRoles: userRoles,
        frontendRole: frontendRole,
      });
    }

    console.log(`✅ Admin user ${email} authorized to upload. Role source: ${frontendRole ? "Frontend" : "Entra ID"}`);

    // Validate inputs
    if (!title || !title.trim()) {
      if (file) fs.unlinkSync(file.path);
      return res.status(400).json({ message: "Meeting title is required" });
    }

    if (!file) {
      return res.status(400).json({ message: "File is required" });
    }

    if (!date) {
      if (file) fs.unlinkSync(file.path);
      return res.status(400).json({ message: "Meeting date is required" });
    }

    if (!durationSeconds || durationSeconds <= 0) {
      if (file) fs.unlinkSync(file.path);
      return res.status(400).json({ message: "Duration in seconds is required and must be positive" });
    }

    // Validate file type
    const allowedMimeTypes = ["video/mp4", "audio/wav", "audio/mpeg"];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      fs.unlinkSync(file.path);
      return res.status(400).json({ message: "Invalid file type. Only MP4, WAV, and MP3 are allowed" });
    }

    // Parse participants array
    let participantsArray = [];
    try {
      participantsArray = typeof participants === "string" ? JSON.parse(participants) : participants || [];
      
      // Validate participant structure
      if (Array.isArray(participantsArray)) {
        participantsArray = participantsArray.filter(p => p.user_id && p.name);
      } else {
        participantsArray = [];
      }
    } catch (err) {
      fs.unlinkSync(file.path);
      return res.status(400).json({ message: "Invalid participants format. Expected array of {user_id, name}" });
    }

    // Parse allowed users array
    let allowedUsersList = [];
    try {
      allowedUsersList = typeof allowedUsers === "string" ? JSON.parse(allowedUsers) : allowedUsers || [];
      if (!Array.isArray(allowedUsersList)) {
        allowedUsersList = [];
      }
    } catch (err) {
      allowedUsersList = [];
    }

    // Create meeting document
    const meeting = jsonStorage.saveMeeting({
      source_file: file.originalname,
      file_path: file.path,
      meeting_info: {
        title: title.trim(),
        date: new Date(date).toISOString(),
        duration_seconds: parseInt(durationSeconds),
        language: language || "en",
      },
      participants: participantsArray,
      access_control: {
        allowed_users: allowedUsersList.length > 0 ? allowedUsersList : [email],
      },
      ingestion_info: {
        uploaded_by: email,
        uploaded_at: new Date().toISOString(),
        pipeline_version: "v1_whisper_only",
      },
    });

    console.log(`✅ Meeting uploaded successfully: ${meeting.meeting_id}`);

    res.status(201).json({
      message: "Meeting uploaded successfully",
      success: true,
      meeting: {
        meeting_id: meeting.meeting_id,
        source_file: meeting.source_file,
        file_path: meeting.file_path,
        meeting_info: meeting.meeting_info,
        participants: meeting.participants,
        access_control: meeting.access_control,
        ingestion_info: meeting.ingestion_info,
        created_at: meeting.createdAt,
      },
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error("Error deleting file:", err);
      }
    }

    console.error("Upload meeting error:", error);
    res.status(500).json({
      message: "Failed to upload meeting",
      error: error.message,
    });
  }
};

// Query meetings
const queryMeeting = async (req, res) => {
  try {
    const email = req.user?.email;
    const { query } = req.body;
    
    console.log(`🔍 Query request from: ${email}, Query: ${query}`);

    // Validate input
    if (!query || !query.trim()) {
      return res.status(400).json({ message: "Query is required" });
    }

    // Find meetings where user has access
    const allMeetings = jsonStorage.getAllMeetings();
    const meetings = allMeetings.filter(
      m => {
        const isInAllowedUsers = m.access_control?.allowed_users?.includes(email);
        const isUploader = m.ingestion_info?.uploaded_by === email;
        const isParticipant = m.participants?.some(p => p.name === email);
        return isInAllowedUsers || isUploader || isParticipant;
      }
    );

    if (meetings.length === 0) {
      return res.status(200).json({
        answer: "No meetings found. Please upload a meeting first.",
        meetings_searched: 0,
      });
    }

    // Build response mentioning available meetings
    const meetingList = meetings.map(m => `${m.meeting_info.title}`).join(", ");
    const answer = `I found ${meetings.length} meeting(s): ${meetingList}. Searching for information about "${query}" in these meetings...`;

    res.status(200).json({
      success: true,
      answer,
      meetings_searched: meetings.length,
      meeting_ids: meetings.map(m => m.meeting_id),
    });
  } catch (error) {
    console.error("Query meeting error:", error);
    res.status(500).json({
      message: "Failed to process query",
      error: error.message,
    });
  }
};

// Get user's meetings
const getMeetings = async (req, res) => {
  try {
    const email = req.user?.email;
    console.log(`📊 Get meetings request from: ${email}`);

    // Find all meetings accessible to this user
    const meetings = jsonStorage.getMeetingsByUser(email);

    res.status(200).json({
      success: true,
      count: meetings.length,
      meetings: meetings.map(m => ({
        meeting_id: m.meeting_id,
        source_file: m.source_file,
        title: m.meeting_info.title,
        date: m.meeting_info.date,
        duration_seconds: m.meeting_info.duration_seconds,
        participants_count: m.participants.length,
        uploaded_by: m.ingestion_info.uploaded_by,
        uploaded_at: m.ingestion_info.uploaded_at,
        created_at: m.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get meetings error:", error);
    res.status(500).json({
      message: "Failed to fetch meetings",
      error: error.message,
    });
  }
};

module.exports = {
  uploadMeeting,
  queryMeeting,
  getMeetings,
};
