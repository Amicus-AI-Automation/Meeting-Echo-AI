import React, { useState, useEffect } from "react";
import { useMsal, useAccount } from "@azure/msal-react";
import Sidebar from "../components/Sidebar";
import ChatUI from "../components/ChatUI";
import UploadMeeting from "../components/UploadMeeting";
import api from "../services/api";
import "./Dashboard.css";

function Dashboard({ onLogout, account }) {
  const { instance } = useMsal();
  const accountContext = useAccount();
  const [meetings, setMeetings] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [loadingMeetings, setLoadingMeetings] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // Initialize user and fetch meetings
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Get user email from account
        const email = accountContext?.username || "";
        setUserEmail(email);

        // Get role that user selected on LoginPage (stored in localStorage)
        const selectedRole = localStorage.getItem("userRole") || "user";
        setIsAdmin(selectedRole === "admin");

        // Fetch meetings
        await fetchMeetings();
      } catch (err) {
        console.error("Failed to initialize user:", err);
      }
    };

    if (accountContext) {
      initializeUser();
    }
  }, [accountContext]);

  const fetchMeetings = async () => {
    setLoadingMeetings(true);
    try {
      const token = localStorage.getItem("accessToken");
      const email = localStorage.getItem("userEmail");
      const role = localStorage.getItem("userRole");
      
      console.log("📤 Fetching meetings - Sending token to backend");
      console.log("   Email:", email);
      console.log("   Role:", role);
      console.log("   Token (first 20 chars):", token?.substring(0, 20) + "...");
      
      if (!token) {
        console.error("❌ No access token available in localStorage");
        return;
      }

      const res = await api.get("/meetings", {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-User-Email": email,
          "X-User-Role": role,
        },
      });

      console.log("✅ Backend validated token and returned meetings");
      console.log("📊 Meetings received:", res.data.meetings?.length || 0);
      
      if (res.data.meetings && res.data.meetings.length > 0) {
        setMeetings(res.data.meetings);
        setSelectedMeeting(res.data.meetings[0]);
      } else {
        setMeetings([]);
        setSelectedMeeting(null);
      }
    } catch (err) {
      console.error("❌ Failed to fetch meetings from backend:", err);
      if (err.response?.status === 401) {
        console.error("🔐 Token validation FAILED on backend - Unauthorized");
        console.error("Backend error:", err.response.data);
      } else if (err.response?.status === 403) {
        console.error("🚫 Access forbidden - Check role permissions");
      }
      setMeetings([]);
    } finally {
      setLoadingMeetings(false);
    }
  };

  const handleUploadComplete = () => {
    setShowUpload(false);
    fetchMeetings();
  };

  const handleSelectMeeting = (meeting) => {
    setSelectedMeeting(meeting);
  };

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
        userEmail={userEmail}
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
