import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import api from "../services/api";
import "./UploadMeeting.css";

function UploadMeeting({ onClose }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [durationSeconds, setDurationSeconds] = useState("");
  const [language, setLanguage] = useState("en");
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const addParticipant = () => {
    setParticipants([...participants, { user_id: uuidv4(), name: "", id: uuidv4() }]);
  };

  const removeParticipant = (id) => {
    setParticipants(participants.filter((p) => p.id !== id));
  };

  const updateParticipant = (id, field, value) => {
    const updated = participants.map((p) =>
      p.id === id ? { ...p, [field]: value } : p
    );
    setParticipants(updated);
  };

  const validateForm = () => {
    if (!title.trim()) {
      setError("Meeting title is required");
      return false;
    }

    if (!date) {
      setError("Meeting date is required");
      return false;
    }

    if (!durationSeconds || parseInt(durationSeconds) <= 0) {
      setError("Duration must be a positive number (in seconds)");
      return false;
    }

    if (!file) {
      setError("Please select a file to upload");
      return false;
    }

    if (!["video/mp4", "audio/wav", "audio/mpeg"].includes(file.type)) {
      setError("File must be MP4, WAV, or MP3 format");
      return false;
    }

    if (participants.length === 0) {
      setError("Please add at least one participant");
      return false;
    }

    const invalidParticipants = participants.filter(
      (p) => !p.name.trim()
    );

    if (invalidParticipants.length > 0) {
      setError("Please enter name for all participants");
      return false;
    }

    return true;
  };

  const upload = async () => {
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("date", date);
      formData.append("durationSeconds", durationSeconds);
      formData.append("language", language);
      
      // Format participants as array (backend will extract user_id and name)
      const participantsData = participants.map(p => ({
        user_id: p.user_id,
        name: p.name
      }));
      formData.append("participants", JSON.stringify(participantsData));

      const res = await api.post("/upload-meeting", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess(`✓ Meeting "${res.data.meeting.meeting_info.title}" uploaded successfully! 🎉`);
      setTimeout(() => {
        resetForm();
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload meeting. Please try again.");
      console.error("Upload error:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setTitle("");
    setDate("");
    setDurationSeconds("");
    setLanguage("en");
    setParticipants([]);
    setError("");
    setSuccess("");
  };

  return (
    <div className="upload-meeting-container">
      <div className="upload-card">
        <div className="upload-header">
          <h2>Upload Meeting</h2>
          <button className="close-button" onClick={onClose} disabled={loading}>
            ✕
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form className="upload-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label>Meeting Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Project Discussion - ES2003a"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Duration (seconds) *</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g., 1800"
                value={durationSeconds}
                onChange={(e) => setDurationSeconds(e.target.value)}
                disabled={loading}
                min="1"
              />
            </div>

            <div className="form-group">
              <label>Language</label>
              <select
                className="form-input"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={loading}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="zh">Chinese</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Meeting File (MP4 or WAV) *</label>
            <input
              type="file"
              className="form-input"
              accept=".mp4,.wav,.mp3"
              onChange={(e) => setFile(e.target.files[0])}
              disabled={loading}
            />
            {file && <p className="file-info">📄 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>}
          </div>

          <div className="form-group">
            <label>Participants *</label>
            <p className="participants-info">Add names of meeting participants</p>

            <div className="participants-list">
              {participants.length === 0 ? (
                <p className="empty-participants">No participants added yet</p>
              ) : (
                participants.map((p, i) => (
                  <div key={p.id} className="participant-input-group">
                    <input
                      type="text"
                      className="form-input participant-input"
                      placeholder="e.g., Alice"
                      value={p.name}
                      onChange={(e) => updateParticipant(p.id, "name", e.target.value)}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="remove-button"
                      onClick={() => removeParticipant(p.id)}
                      disabled={loading}
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>

            <button
              type="button"
              className="add-participant-button"
              onClick={addParticipant}
              disabled={loading}
            >
              + Add Participant
            </button>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="upload-button"
              onClick={upload}
              disabled={loading}
            >
              {loading ? "Uploading..." : "Upload Meeting"}
            </button>
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UploadMeeting;
