import React, { useState } from "react";
import api from "../services/api";
import "./Login.css";

function Login({ setStep }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user"); // "user" or "admin"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendOTP = async () => {
    setError("");

    // Validate email format
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      await api.post("/send-otp", { email });
      localStorage.setItem("email", email);
      localStorage.setItem("role", role);
      setStep("otp");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
      console.error("Send OTP error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      sendOTP();
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Meeting Assistant</h2>
        <p className="login-subtitle">Login with your email</p>

        {error && <div className="error-message">{error}</div>}

        <input
          className="login-input"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />

        {/* Role Selection */}
        <div className="role-selection">
          <label>Select Role:</label>
          <div className="role-buttons">
            <button
              className={`role-button ${role === "user" ? "active" : ""}`}
              onClick={() => setRole("user")}
              disabled={loading}
            >
              👤 User
            </button>
            <button
              className={`role-button ${role === "admin" ? "active" : ""}`}
              onClick={() => setRole("admin")}
              disabled={loading}
            >
              👨‍💼 Admin
            </button>
          </div>
        </div>

        <button
          className="login-button"
          onClick={sendOTP}
          disabled={loading}
        >
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>

        <p className="login-info">
          We'll send a one-time password to your email
        </p>
      </div>
    </div>
  );
}

export default Login;
