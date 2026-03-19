import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import OTPVerify from "./components/OTPVerify";
import Dashboard from "./pages/Dashboard";
import "./App.css";

function App() {
  const [step, setStep] = useState("login");
  const [authenticated, setAuthenticated] = useState(false);

  // Check if user is already authenticated on app load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    setAuthenticated(false);
    setStep("login");
  };

  if (!authenticated) {
    if (step === "login") return <Login setStep={setStep} />;
    if (step === "otp") return <OTPVerify setAuthenticated={setAuthenticated} setStep={setStep} />;
  }

  return <Dashboard onLogout={handleLogout} />;
}

export default App;
