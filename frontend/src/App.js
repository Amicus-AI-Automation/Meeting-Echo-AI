import React, { useState, useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import "./App.css";

function AppContent() {
  const { instance } = useMsal();
  const [authenticated, setAuthenticated] = useState(
    () => !!localStorage.getItem("idToken")
  );

  // Keep auth state in sync if another tab logs out
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "idToken") {
        setAuthenticated(!!e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleLoginSuccess = () => {
    setAuthenticated(true);
  };

  const handleLogout = async () => {
    localStorage.removeItem("idToken");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    setAuthenticated(false);
    // Sign out from Microsoft silently (clears MSAL cache)
    const accounts = instance.getAllAccounts();
    if (accounts.length > 0) {
      await instance.logoutPopup({ account: accounts[0] }).catch(() => {});
    }
  };

  if (!authenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return <Dashboard onLogout={handleLogout} />;
}

function App() {
  return <AppContent />;
}

export default App;
