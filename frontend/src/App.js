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
  const [userAccount, setUserAccount] = useState(null);

  // Check authentication status on mount and when account changes
  useEffect(() => {
    console.log("📋 Checking authentication status...");
    checkAuth();
  }, [account, instance]);

  // Listen for localStorage changes (e.g., from LoginPage)
  useEffect(() => {
    const handleStorageChange = () => {
      console.log("🔔 LocalStorage changed, rechecking auth...");
      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);
    
    // Also check immediately in case token was just set
    const checkInterval = setInterval(() => {
      const storedToken = localStorage.getItem("accessToken");
      if (storedToken && !tokenAcquired) {
        console.log("🔔 Token detected in localStorage, updating state...");
        checkAuth();
      }
    }, 500); // Check every 500ms for first 5 seconds

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(checkInterval);
    };
  }, [tokenAcquired]);

  const checkAuth = () => {
    // First check MSAL account context
    if (account) {
      console.log("✅ Account detected from MSAL:", account.username);
      setUserAccount(account);
      setAuthenticated(true);
      return;
    }

    // Fallback: Check if token exists in localStorage (set by LoginPage)
    const storedToken = localStorage.getItem("accessToken");
    const storedEmail = localStorage.getItem("userEmail");
    
    if (storedToken && storedEmail) {
      console.log("✅ Token found in localStorage from LoginPage:", storedEmail);
      setAuthenticated(true);
      setTokenAcquired(true);
      // Get all accounts from MSAL
      const accounts = instance.getAllAccounts();
      if (accounts.length > 0) {
        console.log("✅ Found MSAL account:", accounts[0].username);
        setUserAccount(accounts[0]);
      }
      return;
    }

    // No authentication found
    console.log("❌ No authentication found");
    setAuthenticated(false);
    setTokenAcquired(false);
    setUserAccount(null);
  };

  const acquireToken = async () => {
    try {
      console.log("🔄 Attempting silent token acquisition...");
      const response = await instance.acquireTokenSilent({
        scopes: ["openid", "profile", "email"],
        account: userAccount,
      });
      console.log("✅ Silent token acquired");
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("userEmail", userAccount.username);
      setTokenAcquired(true);
    } catch (error) {
      console.warn("⚠️ Silent token failed:", error.errorCode);
      // LoginPage already acquired the token, so we should be good
      const storedToken = localStorage.getItem("accessToken");
      if (storedToken) {
        console.log("✅ Token already in localStorage");
        setTokenAcquired(true);
      }
    }
  };

  const handleLogout = async () => {
    console.log("🚪 Logging out...");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    setAuthenticated(false);
    setTokenAcquired(false);
    setUserAccount(null);
    
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

  console.log("🔍 Status - authenticated:", authenticated, "tokenAcquired:", tokenAcquired, "account:", userAccount?.username);

  return authenticated && tokenAcquired ? (
    <Dashboard onLogout={handleLogout} account={userAccount} />
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
