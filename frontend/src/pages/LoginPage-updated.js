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
    if (loading) {
      console.log("⏳ Login already in progress, preventing double-click");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      console.log("🔐 Starting login flow with role:", role);
      
      // Store role selection BEFORE opening popup
      localStorage.setItem("userRole", role);
      console.log("💾 Stored role in localStorage:", role);

      // Open Microsoft login popup
      const response = await instance.loginPopup(loginRequest);

      if (response && response.account) {
        console.log("✅ Microsoft authentication successful");
        console.log("👤 User logged in:", response.account.username);
        console.log("🔄 App.js will now acquire token and redirect to Dashboard");
        // App.js useEffect will detect account change and handle everything else
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      console.error("Error details:", err.errorCode, err.errorMessage);
      
      setError(err.errorMessage || err.message || "Login failed. Please try again.");
      localStorage.removeItem("userRole");
      setLoading(false); // Re-enable button on error
    }
    // NOTE: setLoading(false) is NOT called on success
    // because App.js will detect the account and handle redirect
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
