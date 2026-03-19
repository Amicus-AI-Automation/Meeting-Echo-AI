import React, { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../authConfig";
import "./LoginPage.css";

function LoginPage() {
  const { instance } = useMsal();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (role) => {
    // Prevent multiple clicks while loading
    if (loading) return;
    
    setLoading(true);
    setError("");

    try {
      console.log("📝 Selected role:", role);
      // Store role selection
      localStorage.setItem("userRole", role);
      console.log("✅ Role stored in localStorage:", localStorage.getItem("userRole"));

      // Step 1: Login with Microsoft popup
      console.log("🔓 Opening Microsoft login...");
      const response = await instance.loginPopup(loginRequest);
      console.log("✅ Login successful:", response.account.username);

      // Step 2: Use the ID token from login response (verifiable by backend with CLIENT_ID as audience)
      // Access tokens for OIDC scopes (openid/profile/email) are issued for Microsoft's own
      // user info endpoint and cannot be verified by your backend. ID tokens always have
      // your CLIENT_ID as audience and are verifiable against the tenant JWKS endpoint.
      const idToken = response.idToken;

      // Step 3: Store ID token for backend API calls
      localStorage.setItem("accessToken", idToken);
      localStorage.setItem("userEmail", response.account.username);
      
      console.log("✅ Token acquired and stored");
      console.log("🔄 App.js will detect account change and redirect to Dashboard...");
      // App.js will detect account change and redirect to Dashboard automatically
    } catch (err) {
      console.error("❌ Login error:", err);
      setError(err.message || "Login failed. Please try again.");
      localStorage.removeItem("userRole");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userEmail");
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-page-card">
        <div className="login-page-header">
          <h1>📞 Meeting Assistant</h1>
          <p className="login-page-subtitle">
            Powered by Microsoft Entra ID
          </p>
        </div>

        {error && <div className="login-page-error">{error}</div>}

        <div className="login-page-content">
          <p className="login-page-description">
            Select your role and sign in with your Microsoft account
          </p>

          <div className="login-page-buttons">
            <button
              className="login-page-button admin-button"
              onClick={() => handleLogin("admin")}
              disabled={loading}
            >
              <span className="button-icon">👨‍💼</span>
              <span className="button-text">
                <strong>Admin</strong>
                <small>Upload & manage meetings</small>
              </span>
            </button>

            <button
              className="login-page-button user-button"
              onClick={() => handleLogin("user")}
              disabled={loading}
            >
              <span className="button-icon">👤</span>
              <span className="button-text">
                <strong>User</strong>
                <small>View and chat about meetings</small>
              </span>
            </button>
          </div>

          {loading && (
            <div className="login-page-loading">
              <div className="spinner"></div>
              <p>Redirecting to Microsoft login...</p>
            </div>
          )}
        </div>

        <div className="login-page-footer">
          <p>
            💡 Use your @company.com email account to sign in
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
