import React, { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../authConfig";
import "./LoginPage.css";

function LoginPage({ onLoginSuccess }) {
  const { instance } = useMsal();
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await instance.loginPopup(loginRequest);

      const idToken = result.idToken;
      const email =
        result.account.username ||
        result.idTokenClaims?.preferred_username ||
        result.idTokenClaims?.email ||
        "";

      localStorage.setItem("idToken", idToken);
      localStorage.setItem("email", email);
      localStorage.setItem("role", role);

      onLoginSuccess();
    } catch (err) {
      if (err.errorCode === "user_cancelled") {
        setError("Sign-in was cancelled.");
      } else {
        setError(err.message || "Failed to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo / Brand */}
        <div className="login-brand">
          <div className="login-brand-icon">🎙️</div>
          <h1 className="login-brand-name">MeetingRAG</h1>
          <p className="login-brand-sub">AI Meeting Assistant</p>
        </div>

        <h2 className="login-title">Welcome</h2>
        <p className="login-subtitle">Select your role and sign in with Microsoft</p>

        {error && <div className="login-error">{error}</div>}

        {/* Role selector */}
        <div className="role-section">
          <p className="role-label">I am a…</p>
          <div className="role-buttons">
            <button
              className={`role-btn ${role === "user" ? "active" : ""}`}
              onClick={() => setRole("user")}
              disabled={loading}
            >
              <span className="role-icon">👤</span>
              <span className="role-text">User</span>
              <span className="role-desc">View &amp; query meetings</span>
            </button>
            <button
              className={`role-btn ${role === "admin" ? "active" : ""}`}
              onClick={() => setRole("admin")}
              disabled={loading}
            >
              <span className="role-icon">👨‍💼</span>
              <span className="role-text">Admin</span>
              <span className="role-desc">Upload &amp; manage meetings</span>
            </button>
          </div>
        </div>

        {/* Sign-in button */}
        <button
          className="microsoft-signin-btn"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <span className="signin-spinner" />
          ) : (
            <svg className="ms-logo" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
              <rect x="1"  y="1"  width="9" height="9" fill="#f25022" />
              <rect x="11" y="1"  width="9" height="9" fill="#7fba00" />
              <rect x="1"  y="11" width="9" height="9" fill="#00a4ef" />
              <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
            </svg>
          )}
          {loading ? "Signing in…" : "Sign in with Microsoft"}
        </button>

        <p className="login-footer-note">
          Your organisation's Microsoft account is required.
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
