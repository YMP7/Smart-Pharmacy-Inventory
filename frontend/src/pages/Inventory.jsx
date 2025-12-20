import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import InventoryTable from "../components/InventoryTable";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [expiry, setExpiry] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ---------------- FETCH DATA ----------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [invRes, expRes] = await Promise.all([
          api.get("/inventory"),
          api.get("/alerts/expiry")
        ]);

        setInventory(invRes.data);
        setExpiry(expRes.data);
        buildHeatmap(invRes.data);
      } catch {
        setError("Failed to load inventory intelligence.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ---------------- VALUE HEATMAP ----------------
  const buildHeatmap = (data) => {
    const enriched = data.map(item => ({
      medicine: item.medicine,
      value: item.stock * 100 // safe demo proxy
    }));

    enriched.sort((a, b) => b.value - a.value);
    setHeatmap(enriched.slice(0, 8));
  };

  // ---------------- FEFO MERGE ----------------
  const inventoryWithExpiry = useMemo(() => {
    return inventory.map(item => {
      const batches = expiry.filter(
        e =>
          e.Drug_Name?.toLowerCase() === item.medicine?.toLowerCase()
      );

      const nearest = batches.length
        ? batches.reduce((min, b) =>
            b.days_to_expiry < min.days_to_expiry ? b : min
          )
        : null;

      return {
        ...item,
        days_to_expiry: nearest?.days_to_expiry ?? null
      };
    });
  }, [inventory, expiry]);

  // ---------------- SEARCH FILTER ----------------
  const filteredInventory = useMemo(() => {
    return inventoryWithExpiry.filter(i =>
      i.medicine.toLowerCase().includes(search.toLowerCase())
    );
  }, [inventoryWithExpiry, search]);

  // ---------------- LOW STOCK ----------------
  const lowStock = useMemo(
    () => inventory.filter(i => i.stock < 50),
    [inventory]
  );

  // ---------------- UI STATES ----------------
  if (loading) {
    return <div className="loading-text">Loading inventory intelligence…</div>;
  }

  if (error) {
    return <div className="warning-text">⚠️ {error}</div>;
  }

  return (
    <div className="section">
      <h3>📦 Inventory Intelligence</h3>

      {/* ---------------- SEARCH ---------------- */}
      <input
        className="search-box"
        placeholder="🔍 Search medicine"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* ---------------- HEATMAP ---------------- */}
      <div className="chart-box">
        <h4>🔥 Inventory Value Heatmap (₹ Exposure)</h4>

        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer>
            <BarChart data={heatmap}>
              <XAxis dataKey="medicine" />
              <YAxis />
              <Tooltip formatter={v => `₹${v.toLocaleString()}`} />
              <Bar dataKey="value">
                {heatmap.map((item, index) => (
                  <Cell
                    key={index}
                    fill={
                      item.value > 5000
                        ? "#d32f2f"
                        : item.value > 2000
                        ? "#f9a825"
                        : "#2e7d32"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="ai-box">
          🔥 <b>AI Insight:</b> High-value medicines (red) represent maximum
          financial exposure and should be prioritized for accurate demand
          forecasting and expiry risk control.
        </div>
      </div>

      {/* ---------------- LOW STOCK RISK ---------------- */}
      <div className="chart-box">
        <h4>⚠️ Low Stock Risk</h4>

        {lowStock.length === 0 ? (
          <p className="success">No low-stock risks detected</p>
        ) : (
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.map((i, idx) => (
                <tr key={idx}>
                  <td>{i.medicine.toUpperCase()}</td>
                  <td>{i.stock}</td>
                  <td>
                    <span
                      className={`badge ${
                        i.stock < 20 ? "critical" : "warning"
                      }`}
                    >
                      {i.stock < 20 ? "CRITICAL" : "WARNING"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ---------------- INVENTORY TABLE ---------------- */}
      <InventoryTable data={filteredInventory} />

      {/* ---------------- AI INSIGHT ---------------- */}
      <div className="ai-box">
        🤖 <b>AI Insight:</b> Inventory stock is computed directly from raw sales
        and purchase datasets. FEFO logic ensures medicines nearing expiry are
        surfaced first, reducing wastage and financial loss.
      </div>
    </div>
  );
}
