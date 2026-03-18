const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const meetingSchema = new mongoose.Schema(
  {
    meeting_id: {
      type: String,
      default: () => {
        // Generate ID like ES2003a
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substring(2, 5);
        return ("ES" + timestamp + random).toUpperCase();
      },
      unique: true,
      required: true,
    },

    source_file: {
      type: String,
      required: true,
      description: "Original filename of the uploaded file",
    },

    file_path: {
      type: String,
      required: true,
      description: "Path where file is stored on server",
    },

    meeting_info: {
      title: {
        type: String,
        required: true,
        description: "Meeting or session title",
      },
      date: {
        type: Date,
        required: true,
        description: "Date of the meeting",
      },
      duration_seconds: {
        type: Number,
        required: true,
        description: "Duration of meeting in seconds",
      },
      language: {
        type: String,
        default: "en",
        description: "Language of the meeting",
      },
    },

    participants: [
      {
        user_id: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
      },
    ],

    access_control: {
      allowed_users: [
        {
          type: String,
          description: "User IDs with access to this meeting",
        },
      ],
    },

    ingestion_info: {
      uploaded_by: {
        type: String,
        required: true,
        description: "User ID who uploaded the file",
      },
      uploaded_at: {
        type: Date,
        default: Date.now,
        description: "Timestamp when file was uploaded",
      },
      pipeline_version: {
        type: String,
        default: "v1_whisper_only",
        description: "Version of processing pipeline used",
      },
    },
  },
  { 
    timestamps: true,
    collection: "meetings"
  }
);

module.exports = mongoose.model("Meeting", meetingSchema);
