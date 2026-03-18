import React from "react";
import "./Sidebar.css";

function Sidebar({ meetings, selectedMeeting, onSelectMeeting, openUpload, onLogout, loadingMeetings, isAdmin }) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>📋 Menu</h3>
        <p className="role-badge">{isAdmin ? "👨‍💼 Admin" : "👤 User"}</p>
      </div>

      <div className="sidebar-content">
        {isAdmin && (
          <button className="sidebar-button primary" onClick={openUpload}>
            📁 Upload Meeting
          </button>
        )}

        <button className="sidebar-button logout" onClick={onLogout}>
          🚪 Logout
        </button>
      </div>

      {/* Chat/Meetings List */}
      <div className="sidebar-meetings">
        <div className="meetings-header">
          <h4>💬 Recent Chats</h4>
          {loadingMeetings && <span className="loading-dot">⏳</span>}
        </div>

        <div className="meetings-list">
          {meetings.length === 0 ? (
            <p className="no-meetings">
              {loadingMeetings ? "Loading meetings..." : "No meetings yet. Upload one to start!"}
            </p>
          ) : (
            meetings.map((meeting) => (
              <button
                key={meeting.meeting_id}
                className={`meeting-item ${selectedMeeting?.meeting_id === meeting.meeting_id ? "active" : ""}`}
                onClick={() => onSelectMeeting(meeting)}
                title={`${meeting.title}\n${meeting.participants_count} participant(s)`}
              >
                <div className="meeting-icon">📞</div>
                <div className="meeting-info">
                  <p className="meeting-title">{meeting.title}</p>
                  <p className="meeting-meta">
                    {meeting.participants_count} participant{meeting.participants_count !== 1 ? "s" : ""}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="sidebar-footer">
        <p className="sidebar-info">Meeting Assistant v1.0</p>
      </div>
    </div>
  );
}

export default Sidebar;
