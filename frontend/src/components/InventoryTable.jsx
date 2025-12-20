import { useState } from "react";
import api from "../api/api";

export default function InventoryTable({ data }) {
  const [altData, setAltData] = useState(null);
  const [showAlt, setShowAlt] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);
  const [error, setError] = useState(null);

  if (!data || data.length === 0) {
    return <p className="muted">No inventory data available.</p>;
  }

  // ---------------- STATUS HELPERS ----------------
  const getStatus = (stock) => {
    if (stock < 20) return "Critical";
    if (stock < 50) return "Low";
    return "Healthy";
  };

  const getStatusClass = (status) => {
    if (status === "Critical") return "status critical";
    if (status === "Low") return "status warning";
    return "status healthy";
  };

  // ---------------- REORDER ----------------
  const handleReorder = async (medicine) => {
    try {
      setLoadingAction(medicine);
      setError(null);

      const res = await api.post("/chatbot", {
        query: `reorder ${medicine.toLowerCase()}`
      });

      alert(res.data.response); // can be modal later
    } catch {
      setError("Failed to submit reorder request.");
    } finally {
      setLoadingAction(null);
    }
  };

  // ---------------- ALTERNATIVES ----------------
  const handleAlternatives = async (medicine) => {
    try {
      setLoadingAction(medicine);
      setError(null);

      const res = await api.post("/chatbot", {
        query: `alternative for ${medicine.toLowerCase()}`
      });

      setAltData(res.data.response);
      setShowAlt(true);
    } catch {
      setError("Unable to fetch alternative medicines.");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="table-box">
      <h4>📋 Inventory Details</h4>

      {error && <p className="warning-text">⚠️ {error}</p>}

      <table className="inventory-table">
        <thead>
          <tr>
            <th>Medicine</th>
            <th>Stock</th>
            <th>Status</th>
            <th style={{ width: 180 }}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row, idx) => {
            const status = getStatus(row.stock);
            const isLoading = loadingAction === row.medicine;

            return (
              <tr key={idx}>
                <td>{row.medicine.toUpperCase()}</td>
                <td>{row.stock}</td>
                <td>
                  <span className={getStatusClass(status)}>
                    {status}
                  </span>
                </td>
                <td>
                  <button
                    className="reorder-btn"
                    disabled={isLoading}
                    onClick={() => handleReorder(row.medicine)}
                  >
                    {isLoading ? "..." : "Reorder"}
                  </button>

                  <button
                    className="alt-btn"
                    disabled={isLoading}
                    onClick={() => handleAlternatives(row.medicine)}
                  >
                    Alternatives
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ---------------- ALTERNATIVE MODAL ---------------- */}
      {showAlt && (
        <div className="popup-overlay">
          <div className="popup-card">
            <h3>🔄 Alternative Medicines</h3>

            <div className="alternative-box">
              <pre style={{ whiteSpace: "pre-wrap" }}>
                {altData}
              </pre>
              <p className="warning-text">
                Pharmacist approval required before substitution.
              </p>
            </div>

            <button
              className="report-btn"
              onClick={() => setShowAlt(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
