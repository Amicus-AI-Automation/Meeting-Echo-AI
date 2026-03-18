const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Data directory for JSON storage
const DATA_DIR = path.join(__dirname, "../data");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Generate meeting ID in ES format (ES + timestamp + random)
const generateMeetingId = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ES${timestamp}${random}`;
};

// Save meeting to JSON file
const saveMeeting = (meetingData) => {
  try {
    const meetingId = generateMeetingId();
    const meetingPath = path.join(DATA_DIR, `${meetingId}.json`);
    
    const meeting = {
      meeting_id: meetingId,
      source_file: meetingData.source_file,
      file_path: meetingData.file_path,
      meeting_info: meetingData.meeting_info,
      participants: meetingData.participants,
      access_control: meetingData.access_control,
      ingestion_info: meetingData.ingestion_info,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    fs.writeFileSync(meetingPath, JSON.stringify(meeting, null, 2));
    console.log(`💾 Meeting saved to JSON: ${meetingPath}`);
    
    return meeting;
  } catch (err) {
    console.error("Error saving meeting to JSON:", err);
    throw err;
  }
};

// Get all meetings for a user
const getMeetingsByUser = (userEmail) => {
  try {
    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith(".json"));
    const meetings = [];

    files.forEach(file => {
      const filePath = path.join(DATA_DIR, file);
      const content = fs.readFileSync(filePath, "utf8");
      const meeting = JSON.parse(content);

      // Check if user is:
      // 1. In allowed_users list
      // 2. The uploader
      // 3. A participant in the meeting
      const isInAllowedUsers = meeting.access_control?.allowed_users?.includes(userEmail);
      const isUploader = meeting.ingestion_info?.uploaded_by === userEmail;
      const isParticipant = meeting.participants?.some(p => p.name === userEmail);

      if (isInAllowedUsers || isUploader || isParticipant) {
        meetings.push(meeting);
      }
    });

    return meetings;
  } catch (err) {
    console.error("Error retrieving meetings from JSON:", err);
    throw err;
  }
};

// Get all meetings (admin only - for query)
const getAllMeetings = () => {
  try {
    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith(".json"));
    const meetings = [];

    files.forEach(file => {
      const filePath = path.join(DATA_DIR, file);
      const content = fs.readFileSync(filePath, "utf8");
      const meeting = JSON.parse(content);
      meetings.push(meeting);
    });

    return meetings;
  } catch (err) {
    console.error("Error retrieving all meetings from JSON:", err);
    throw err;
  }
};

// Delete meeting
const deleteMeeting = (meetingId) => {
  try {
    const filePath = path.join(DATA_DIR, `${meetingId}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Meeting deleted: ${meetingId}`);
      return true;
    }
    return false;
  } catch (err) {
    console.error("Error deleting meeting from JSON:", err);
    throw err;
  }
};

module.exports = {
  saveMeeting,
  getMeetingsByUser,
  getAllMeetings,
  deleteMeeting,
};
