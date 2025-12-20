export default function Navbar({ active, setActive, toggleDark }) {
  const tabs = ["Dashboard", "Inventory", "Forecast", "Alerts", "Chatbot"];

  return (
    <div className="navbar">
      <h2>💊 NexPharm</h2>

      <div className="nav-tabs">
        {tabs.map(tab => (
          <button
            key={tab}
            className={active === tab ? "tab active" : "tab"}
            onClick={() => setActive(tab)}
          >
            {tab}
          </button>
        ))}

        <button className="dark-btn" onClick={toggleDark}>
          🌙
        </button>
      </div>
    </div>
  );
}
