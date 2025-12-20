import { useEffect, useRef, useState } from "react";
import api from "../api/api";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 Hi! I’m your AI Pharmacy Assistant. Ask me about stock, expiry, wastage, or reorders.",
      time: new Date().toLocaleTimeString()
    }
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const query = text.trim();
    if (!query || loading) return;

    const now = new Date().toLocaleTimeString();

    setMessages(prev => [
      ...prev,
      { sender: "user", text: query, time: now }
    ]);

    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/chatbot", { query });

      setMessages(prev => [
        ...prev,
        {
          sender: "bot",
          text: res.data.response,
          alternatives: res.data.alternatives || [],
          time: new Date().toLocaleTimeString()
        }
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          sender: "bot",
          text: "⚠️ AI service temporarily unavailable.",
          time: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section chatbot-container">
      <h3>🤖 AI Pharmacy Assistant</h3>

      <div className="chat-window">
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.sender}`}>
            <div>{m.text}</div>

            {/* 🔁 ALTERNATIVE DRUG SUGGESTIONS */}
            {m.alternatives?.length > 0 && (
              <div className="alternative-box">
                <b>🔁 Alternative Medicines Available</b>
                <ul>
                  {m.alternatives.map((a, idx) => (
                    <li key={idx}>
                      💊 {a.medicine} — <b>{a.stock}</b> units
                    </li>
                  ))}
                </ul>
                <small className="warning-text">
                  ⚠️ Substitution must be confirmed by pharmacist
                </small>
              </div>
            )}

            <span className="chat-time">
              {m.sender === "bot" ? "AI Verified · " : ""}
              {m.time}
            </span>
          </div>
        ))}

        {loading && (
          <div className="chat-bubble bot">🤖 Thinking...</div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* QUICK ACTIONS */}
      <div className="quick-actions">
        <button onClick={() => sendMessage("Check stock of dolo 650")}>📦 Stock</button>
        <button onClick={() => sendMessage("Which medicines expire soon?")}>⏰ Expiry</button>
        <button onClick={() => sendMessage("Show wastage summary")}>💰 Wastage</button>
        <button onClick={() => sendMessage("Generate reorder report")}>🔁 Reorder</button>
      </div>

      {/* INPUT */}
      <div className="chat-input">
        <input
          placeholder="Ask a pharmacy question..."
          value={input}
          disabled={loading}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage(input)}
        />
        <button disabled={loading} onClick={() => sendMessage(input)}>
          Send
        </button>
      </div>
    </div>
  );
}
