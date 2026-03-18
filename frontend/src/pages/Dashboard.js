import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ChatUI from "../components/ChatUI";
import UploadMeeting from "../components/UploadMeeting";
import api from "../services/api";
import "./Dashboard.css";

function Dashboard({ onLogout }) {
  const [showUpload, setShowUpload] = useState(false);
  const [meetings, setMeetings] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [loadingMeetings, setLoadingMeetings] = useState(false);

  // Fetch meetings on component mount
  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    setLoadingMeetings(true);
    try {
      const res = await api.get("/meetings");
      if (res.data.meetings && res.data.meetings.length > 0) {
        setMeetings(res.data.meetings);
        // Auto-select first meeting
        setSelectedMeeting(res.data.meetings[0]);
      }
    } catch (err) {
      console.error("Failed to fetch meetings:", err);
    } finally {
      setLoadingMeetings(false);
    }
  };

  const handleUploadComplete = () => {
    setShowUpload(false);
    // Refresh meetings list
    fetchMeetings();
  };

  const handleSelectMeeting = (meeting) => {
    setSelectedMeeting(meeting);
  };

  const userRole = localStorage.getItem("role") || "user";
  const isAdmin = userRole === "admin";

  return (
    <div className="dashboard">
      <Sidebar
        meetings={meetings}
        selectedMeeting={selectedMeeting}
        onSelectMeeting={handleSelectMeeting}
        openUpload={() => setShowUpload(true)}
        onLogout={onLogout}
        loadingMeetings={loadingMeetings}
        isAdmin={isAdmin}
      />

      <div className="dashboard-content">
        {showUpload ? (
          <UploadMeeting onClose={handleUploadComplete} />
        ) : (
          <ChatUI meeting={selectedMeeting} />
        )}
      </div>
    </div>
  );
}

export default Dashboard;
