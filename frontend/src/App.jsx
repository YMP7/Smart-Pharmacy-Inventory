import { useState } from "react";
import Navbar from "./components/Navbar";

import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Forecast from "./pages/Forecast";
import Alerts from "./pages/Alerts";
import Chatbot from "./pages/Chatbot";

export default function App() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={darkMode ? "dark app-wrapper" : "app-wrapper"}>
      <Navbar
        active={activeTab}
        setActive={setActiveTab}
        toggleDark={() => setDarkMode(!darkMode)}
      />

      <main className="content">
        {activeTab === "Dashboard" && <Dashboard />}
        {activeTab === "Inventory" && <Inventory />}
        {activeTab === "Forecast" && <Forecast />}
        {activeTab === "Alerts" && <Alerts />}
        {activeTab === "Chatbot" && <Chatbot />}
      </main>

      {/* ✅ FOOTER */}
      <footer className="app-footer">
        © 2025 NexPharm | Smart Pharmacy Inventory System | AI-Driven HealthTech Solution
      </footer>
    </div>
  );
}
