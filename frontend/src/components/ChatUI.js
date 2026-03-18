import React, { useState, useEffect, useRef } from "react";
import api from "../services/api";
import "./ChatUI.css";

function ChatUI({ meeting }) {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  // Reset chat when meeting changes
  useEffect(() => {
    if (meeting) {
      setChat([]);
      setError("");
    }
  }, [meeting]);

  const sendMessage = async () => {
    if (!message.trim() || !meeting) return;

    setError("");
    const userMessage = message;
    setMessage("");

    // Add user message to chat
    setChat((prev) => [...prev, { user: userMessage, bot: null, loading: true }]);
    setLoading(true);

    try {
      const res = await api.post("/query", { 
        query: userMessage,
        meeting_id: meeting.meeting_id 
      });

      setChat((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        updated[lastIndex] = {
          user: userMessage,
          bot: res.data.answer || "No response received",
          loading: false,
        };
        return updated;
      });
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to send query. Please try again.";
      setError(errorMsg);
      setChat((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        updated[lastIndex] = {
          user: userMessage,
          bot: null,
          loading: false,
          error: true,
        };
        return updated;
      });
      console.error("Query error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading && message.trim()) {
      sendMessage();
    }
  };

  if (!meeting) {
    return (
      <div className="chat-ui-container">
        <div className="empty-state">
          <h2>📽️ No Meeting Selected</h2>
          <p>Upload or select a meeting from the left to start chatting!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-ui-container">
      <div className="chat-header">
        <div className="meeting-title-section">
          <h2>📞 {meeting.title}</h2>
          <div className="meeting-details">
            <span className="detail-item">👥 {meeting.participants_count} participant{meeting.participants_count !== 1 ? "s" : ""}</span>
            <span className="detail-item">⏱️ {Math.floor(meeting.duration_seconds / 60)} min</span>
            <span className="detail-item">📅 {new Date(meeting.date).toLocaleDateString()}</span>
          </div>
        </div>
        <p className="chat-subtitle">Ask questions about this meeting</p>
      </div>

      <div className="chat-messages">
        {chat.length === 0 && (
          <div className="empty-state">
            <p>No messages yet. Start asking questions about "{meeting.title}"!</p>
          </div>
        )}

        {chat.map((c, i) => (
          <div key={i} className="message-group">
            <div className="user-message">
              <strong>You:</strong>
              <p>{c.user}</p>
            </div>

            {c.loading && (
              <div className="bot-message loading">
                <strong>Assistant:</strong>
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            {!c.loading && c.bot && (
              <div className="bot-message">
                <strong>Assistant:</strong>
                <p>{c.bot}</p>
              </div>
            )}

            {!c.loading && c.error && (
              <div className="bot-message error">
                <strong>Error:</strong>
                <p>Failed to get response. Please try again.</p>
              </div>
            )}
          </div>
        ))}

        <div ref={chatEndRef} />
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="chat-input-section">
        <input
          type="text"
          className="chat-input"
          placeholder={`Ask about ${meeting.title}...`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
        <button
          className="chat-send-button"
          onClick={sendMessage}
          disabled={loading || !message.trim()}
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default ChatUI;
