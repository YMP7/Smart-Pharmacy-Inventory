import { useEffect, useState } from "react";
import api from "../api/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

export default function Forecast() {
  const [drug, setDrug] = useState("dolo 650");
  const [forecast, setForecast] = useState([]);
  const [expiryAlerts, setExpiryAlerts] = useState([]);
  const [showExpiryPopup, setShowExpiryPopup] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔔 FETCH EXPIRY ALERTS ON TAB LOAD
  useEffect(() => {
    api.get("/alerts/expiry")
      .then(res => {
        if (res.data && res.data.length > 0) {
          setExpiryAlerts(res.data);
          setShowExpiryPopup(true); // 🚨 POPUP TRIGGER
        }
      })
      .catch(() => {});
  }, []);

  // 📈 LOAD FORECAST
  useEffect(() => {
    setLoading(true);
    api.get(`/forecast/${drug}`)
      .then(res => setForecast(res.data))
      .finally(() => setLoading(false));
  }, [drug]);

  const insight = forecast[forecast.length - 1];

  return (
    <div className="section">
      <h3>📈 AI Demand Forecasting</h3>

      {/* ================= EXPIRY POPUP ================= */}
      {showExpiryPopup && (
        <div className="popup-overlay">
          <div className="popup-card">
            <h3>⏰ Expiry Alert (FEFO Priority)</h3>

            {expiryAlerts.slice(0, 5).map((e, i) => (
              <p key={i}>
                ⚠️ <b>{e.Drug_Name}</b> (Batch {e.batch}) expires in{" "}
                <b>{e.days_to_expiry} days</b>
              </p>
            ))}

            <p className="warning-text">
              FEFO enforced — use earliest expiry batches first.
            </p>

            <button
              className="report-btn"
              onClick={() => setShowExpiryPopup(false)}
            >
              Acknowledge & Continue
            </button>
          </div>
        </div>
      )}

      {/* MEDICINE SELECT */}
      <select
        className="select-box"
        value={drug}
        onChange={e => setDrug(e.target.value)}
      >
        <option value="dolo 650">Dolo 650</option>
        <option value="azithral 500">Azithral 500</option>
        <option value="pan 40">Pan 40</option>
        <option value="telma 40">Telma 40</option>
      </select>

      {/* FORECAST CHART */}
      <div className="chart-box">
        {loading ? (
          <p className="loading-text">🔄 Generating forecast…</p>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={forecast}>
              <XAxis dataKey="ds" hide />
              <YAxis />
              <Tooltip />
              <Legend />

              <Line dataKey="actual" stroke="#1976d2" name="Actual Sales" />
              <Line dataKey="yhat" stroke="#2e7d32" name="AI Forecast" />
              <Line dataKey="moving_avg" stroke="#f9a825" name="Moving Avg" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* AI INSIGHTS */}
      {insight && (
        <>
          <div className="ai-box">
            🤖 <b>AI Insight:</b> Expected daily demand for <b>{drug}</b> is{" "}
            <b>{Math.round(insight.yhat)}</b> units. Reorder{" "}
            <b>{insight.reorder_qty}</b> units by{" "}
            <b>{insight.reorder_date}</b>.
          </div>

          <div className="accuracy-box">
            📊 Forecast Accuracy (MAPE):{" "}
            {insight.mape ? `${insight.mape}%` : "N/A"}
          </div>
        </>
      )}
    </div>
  );
}
