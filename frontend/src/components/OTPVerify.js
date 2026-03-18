import React, { useState } from "react";
import api from "../services/api";
import "./OTPVerify.css";

function OTPVerify({ setAuthenticated, setStep }) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const email = localStorage.getItem("email");
  const role = localStorage.getItem("role") || "user";

  const verifyOTP = async () => {
    setError("");

    // Validate OTP format (typically 6 digits)
    if (!otp || otp.length < 4) {
      setError("Please enter a valid OTP");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/verify-otp", { email, otp });

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", role);
        setAuthenticated(true);
      } else {
        setError(res.data.message || "OTP verification failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
      console.error("Verify OTP error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      verifyOTP();
    }
  };

  const goBackToLogin = () => {
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    setStep("login");
  };

  return (
    <div className="otp-container">
      <div className="otp-card">
        <h2>Verify Your Email</h2>
        <p className="otp-subtitle">Enter the OTP sent to {email}</p>

        {error && <div className="error-message">{error}</div>}

        <input
          className="otp-input"
          type="text"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => {
            setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
            setError("");
          }}
          onKeyPress={handleKeyPress}
          disabled={loading}
          maxLength="6"
        />

        <button
          className="otp-button"
          onClick={verifyOTP}
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <button
          className="otp-back-button"
          onClick={goBackToLogin}
          disabled={loading}
        >
          Back to Login
        </button>

        <p className="otp-info">
          Didn't receive the code? Check your spam folder
        </p>
      </div>
    </div>
  );
}

export default OTPVerify;
