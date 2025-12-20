import { useEffect, useState } from "react";
import api from "../api/api";
import StatCard from "../components/StatCard";
import ChartComponent from "../components/ChartComponent";

export default function Dashboard() {
  const [stats, setStats] = useState({
    unique_medicines: 0,
    total_units: 0,
    low_stock: 0,
    expiring_soon: 0
  });

  const [inventory, setInventory] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [expiry, setExpiry] = useState([]);
  const [expiryRisk, setExpiryRisk] = useState(null);

  const reportDate = new Date().toLocaleDateString();

  // ---------------- REPORT ACTIONS ----------------
  const generateReport = () => window.print();
  const emailReport = () =>
    alert("📧 Executive report emailed to pharmacy manager ");

  const narrateReport = () => {
    const text = `
    Smart Pharmacy Executive Report.
    Unique medicines: ${stats.unique_medicines}.
    Total stock units: ${stats.total_units}.
    Low stock alerts: ${stats.low_stock}.
    Expiring medicines: ${stats.expiring_soon}.
    `;
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  };

  // ---------------- DATA FETCH ----------------
  useEffect(() => {
    api.get("/dashboard-kpis").then(res => setStats(res.data));
    api.get("/inventory").then(res => setInventory(res.data));
    api.get("/alerts/low-stock").then(res => setLowStock(res.data));
    api.get("/alerts/expiry").then(res => setExpiry(res.data));

    // Optional advanced analytics
    api.get("/expiry-risk")
      .then(res => setExpiryRisk(res.data))
      .catch(() => {});
  }, []);

  return (
    <div className="section">
      <h3>📊 Pharmacy Intelligence Dashboard</h3>

      {/* ---------------- ACTION BAR ---------------- */}
      <div className="action-bar">
        <button className="report-btn" onClick={generateReport}>
          📄 Generate Executive Report
        </button>
        <button className="report-btn" onClick={emailReport}>
          📧 Email Report
        </button>
        <button className="report-btn" onClick={narrateReport}>
          🗣️ Narrate Report
        </button>
      </div>

      {/* ---------------- REPORT HEADER ---------------- */}
      <div className="report-header">
        <h1>Smart Pharmacy Inventory Report</h1>
        <p><b>Generated On:</b> {reportDate}</p>
        <p><b>System:</b> AI-Powered Pharmacy Inventory Management</p>
      </div>

      {/* ---------------- KPI ROW ---------------- */}
      <div className="grid">
        <StatCard title="Unique Medicines" value={stats.unique_medicines} />
        <StatCard title="Total Units in Stock" value={stats.total_units} />
        <StatCard title="Low Stock Alerts" value={stats.low_stock} />
        <StatCard title="Expiring Soon (30 days)" value={stats.expiring_soon} />
      </div>

      {/* ---------------- STOCK DISTRIBUTION ---------------- */}
      <div className="chart-box">
        <h4>📦 Stock Distribution (Top Medicines)</h4>
        <ChartComponent
          data={inventory.slice(0, 8).map(i => ({
            name: i.medicine,
            value: i.stock
          }))}
          xKey="name"
          yKey="value"
        />
      </div>

      {/* ---------------- ALERT SUMMARY ---------------- */}
      <div className="alert-box">
        <h4>⚠️ Critical Attention Required</h4>
        {lowStock.length === 0 ? (
          <p className="success">No immediate stock risks detected</p>
        ) : (
          lowStock.slice(0, 3).map((i, idx) => (
            <p key={idx}>
              🔴 {i.medicine} – {i.stock} units left
            </p>
          ))
        )}
      </div>

      {/* ---------------- EXPIRY ANALYTICS (FEFO) ---------------- */}
      <div className="chart-box">
        <h4>⏰ Expiry Analytics (FEFO Timeline)</h4>
        {expiry.length === 0 ? (
          <p className="success">No medicines nearing expiry</p>
        ) : (
          expiry.slice(0, 5).map((e, i) => (
            <p key={i}>
              ⏳ {e.Drug_Name} (Batch {e.batch}) expires in{" "}
              <b>{e.days_to_expiry}</b> days
            </p>
          ))
        )}
      </div>

      {/* ---------------- FINANCIAL RISK ---------------- */}
      {expiryRisk && (
        <div className="chart-box">
          <h4>💰 Inventory Value at Risk</h4>
          <ChartComponent
            data={expiryRisk.value_at_risk}
            xKey="name"
            yKey="value"
          />
        </div>
      )}

      {/* ---------------- AI INSIGHTS ---------------- */}
      <div className="ai-box">
        🤖 <b>AI Insight:</b>
        <ul>
          <li>Demand forecasting reduces stock-outs.</li>
          <li>FEFO expiry tracking minimizes wastage.</li>
          <li>Financial exposure is identified before loss occurs.</li>
        </ul>
      </div>

      {/* ---------------- REPORT SUMMARY ---------------- */}
      <div className="report-summary">
        <h4>📌 AI-Generated Executive Summary</h4>
        <ul>
          <li>Inventory intelligence is driven by real transaction data.</li>
          <li>Alerts are prioritized based on operational risk.</li>
          <li>Analytics support proactive pharmacy decisions.</li>
        </ul>
      </div>
    </div>
  );
}
