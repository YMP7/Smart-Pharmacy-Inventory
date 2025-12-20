import { useEffect, useState } from "react";
import api from "../api/api";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export default function Alerts() {
  const [lowStock, setLowStock] = useState([]);
  const [expiry, setExpiry] = useState([]);
  const [lossChart, setLossChart] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    api.get("/alerts/low-stock").then(res => setLowStock(res.data));
    api.get("/alerts/expiry").then(res => setExpiry(res.data));
    api.get("/expiry-loss-recovery").then(res => {
      setLossChart(res.data.chart);
      setSummary(res.data.summary);
    });
  }, []);

  const COLORS = ["#2e7d32", "#d32f2f"];

  return (
    <div className="section">
      <h3>🚨 Alerts & Risk Intelligence</h3>

      {/* ---------------- LOW STOCK ---------------- */}
      <div className="alert-box">
        <h4>📦 Low Stock Alerts</h4>
        {lowStock.length === 0 ? (
          <p className="success">All stock levels are healthy</p>
        ) : (
          lowStock.map((i, idx) => (
            <p key={idx}>
              🔴 {i.medicine} — {i.stock} units ({i.severity})
            </p>
          ))
        )}
      </div>

      {/* ---------------- EXPIRY ALERTS ---------------- */}
      <div className="alert-box">
        <h4>⏰ Upcoming Expiries (FEFO)</h4>
        {expiry.length === 0 ? (
          <p className="success">No medicines nearing expiry</p>
        ) : (
          expiry.slice(0, 5).map((e, idx) => (
            <p key={idx}>
              ⚠️ {e.Drug_Name} — Batch {e.batch} — {e.days_to_expiry} days
            </p>
          ))
        )}
      </div>

      {/* ---------------- EXPIRY LOSS vs RECOVERY ---------------- */}
      <div className="chart-box">
        <h4>💰 Expiry Loss vs Recovery (AI Impact)</h4>

        {!lossChart.length ? (
          <p className="success">No expiry-related loss detected 🎉</p>
        ) : (
          <>
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={lossChart}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                    label
                  >
                    {lossChart.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* SUMMARY */}
            {summary && (
              <div className="ai-box">
                <p>
                  <b>Total Expiring Stock Value:</b> ₹{summary.total_value}
                </p>
                <p>
                  <b>Recoverable via AI Strategy:</b> ₹{summary.recoverable_value}
                </p>
                <p className="warning-text">
                  <b>Potential Loss Prevented:</b> ₹{summary.potential_loss}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
