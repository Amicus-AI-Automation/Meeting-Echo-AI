import React, { useEffect, useState } from "react";
import { MsalProvider, useMsal, useAccount } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "./authConfig";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import "./App.css";

// Initialize MSAL
const pca = new PublicClientApplication(msalConfig);

function AppContent() {
  const { instance, inProgress } = useMsal();
  const account = useAccount();
  const [authenticated, setAuthenticated] = useState(false);
  const [tokenAcquired, setTokenAcquired] = useState(false);

  // Check authentication status
  useEffect(() => {
    if (account) {
      setAuthenticated(true);
      // Try to acquire token silently
      acquireToken();
    } else {
      setAuthenticated(false);
      setTokenAcquired(false);
    }
  }, [account, instance]);

  const acquireToken = async () => {
    try {
      console.log("🔑 Acquiring token for backend authentication...");
      
      // Try to acquire token silently first
      const response = await instance.acquireTokenSilent({
        scopes: ["openid", "profile", "email"],
        account: account,
      });
      
      if (response && response.accessToken) {
        localStorage.setItem("accessToken", response.accessToken);
        localStorage.setItem("userEmail", account?.username || "");
        console.log("✅ Token acquired successfully for:", account?.username);
        console.log("🔐 Token will be sent to backend in Authorization header");
        setTokenAcquired(true);
      }
    } catch (error) {
      console.error("❌ Silent token acquisition failed:", error);
      
      // Fallback to popup if silent fails
      try {
        console.log("🔄 Trying popup token acquisition...");
        const popupResponse = await instance.acquireTokenPopup({
          scopes: ["openid", "profile", "email"],
          account: account,
        });
        
        if (popupResponse && popupResponse.accessToken) {
          localStorage.setItem("accessToken", popupResponse.accessToken);
          localStorage.setItem("userEmail", account?.username || "");
          console.log("✅ Token acquired via popup for:", account?.username);
          setTokenAcquired(true);
        }
      } catch (popupError) {
        console.error("❌ Popup token acquisition failed:", popupError);
        setTokenAcquired(false);
      }
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    setAuthenticated(false);
    setTokenAcquired(false);
    
    await instance.logoutPopup({
      postLogoutRedirectUri: "/",
    }).catch(err => console.error("Logout error:", err));
  };

  if (inProgress !== "none") {
    return (
      <div className="app-loading">
        <h2>Loading...</h2>
        <p>Authenticating with Microsoft Entra ID</p>
      </div>
    );
  }

  return authenticated && tokenAcquired ? (
    <Dashboard onLogout={handleLogout} account={account} />
  ) : (
    <LoginPage />
  );
}

function App() {
  return (
    <MsalProvider instance={pca}>
      <AppContent />
    </MsalProvider>
  );
}

export default App;
