import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiSend, FiZap, FiCpu } from "react-icons/fi";
import { queryAIAssistant } from "../services/api";

const initialMessages = [
  {
    id: 1,
    sender: "ai",
    text: "Hello! I am Ai Assistant. How can I help you today?",
    timestamp: "Just now"
  }
];

function GeminiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [inputMessage, setInputMessage] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputMessage;
    if (!query.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage("");
    setIsThinking(true);

    try {
      const pageContext = localStorage.getItem("userRole") || "admin";
      const data = await queryAIAssistant({
        query: query,
        page_context: pageContext,
        target_language: null,
        user_country: "India"
      });

      const aiMsg = {
        id: Date.now() + 1,
        sender: "ai",
        text: data.response || "No response received.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg = {
        id: Date.now() + 1,
        sender: "ai",
        text: "Error connecting to AI Assistant backend.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 999 }}>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          style={{
            padding: "12px 20px",
            borderRadius: "50px",
            background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
            color: "#FFFFFF",
            border: "none",
            boxShadow: "0 10px 25px rgba(37, 99, 235, 0.4)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontWeight: 700,
            fontSize: "0.9rem"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255, 255, 255, 0.2)", borderRadius: "50%", width: "28px", height: "28px" }}>
            <FiZap style={{ fontSize: "1rem", color: "#FDE047" }} />
          </div>
          <span>Gemini 3.6 Flash AI</span>
        </motion.button>
      )}

      {/* Chat Box Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            style={{
              width: "380px",
              height: "520px",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-color)",
              borderRadius: "18px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden"
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "16px 20px",
                background: "linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: "linear-gradient(135deg, #2563EB 0%, #8B5CF6 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FiCpu style={{ fontSize: "1.2rem", color: "#FFFFFF" }} />
                </div>
                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 800, margin: 0 }}>Gemini 3.6 Flash</h4>
                  <small style={{ color: "#A7F3D0", fontSize: "0.72rem", fontWeight: 700 }}>High Precision AI Mode</small>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", fontSize: "1.2rem" }}
              >
                <FiX />
              </button>
            </div>

            {/* Messages Body */}
            <div style={{ flex: 1, padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                    maxWidth: "85%",
                    background: msg.sender === "user" ? "var(--primary-blue)" : "var(--bg-surface-hover)",
                    color: msg.sender === "user" ? "#FFFFFF" : "var(--text-main)",
                    padding: "10px 14px",
                    borderRadius: msg.sender === "user" ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                    fontSize: "0.86rem",
                    lineHeight: "1.4",
                    boxShadow: "var(--shadow-sm)"
                  }}
                >
                  <p style={{ margin: 0 }}>{msg.text}</p>
                  <small style={{ display: "block", fontSize: "0.68rem", opacity: 0.7, marginTop: "4px", textAlign: "right" }}>
                    {msg.timestamp}
                  </small>
                </div>
              ))}

              {isThinking && (
                <div style={{ alignSelf: "flex-start", background: "var(--bg-surface-hover)", padding: "10px 14px", borderRadius: "14px", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  ⚡ Gemini 3.6 Flash is analyzing data...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Chips */}
            <div style={{ padding: "0 12px 8px 12px", display: "flex", gap: "6px", overflowX: "auto" }}>
              <button
                type="button"
                onClick={() => handleSendMessage("Analyze sales trends")}
                style={{ whiteSpace: "nowrap", padding: "4px 10px", fontSize: "0.72rem", borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-main)", cursor: "pointer" }}
              >
                📊 Sales Trends
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage("Check low stock items")}
                style={{ whiteSpace: "nowrap", padding: "4px 10px", fontSize: "0.72rem", borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-main)", cursor: "pointer" }}
              >
                📦 Stock Alerts
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage("Suggest pricing strategy")}
                style={{ whiteSpace: "nowrap", padding: "4px 10px", fontSize: "0.72rem", borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-main)", cursor: "pointer" }}
              >
                🏷️ Pricing
              </button>
            </div>

            {/* Footer Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              style={{ padding: "12px", borderTop: "1px solid var(--border-color)", display: "flex", gap: "8px" }}
            >
              <input
                type="text"
                placeholder="Ask Gemini 3.6 Flash AI..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: "20px",
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-primary)",
                  color: "var(--text-main)",
                  fontSize: "0.85rem",
                  outline: "none"
                }}
              />
              <button
                type="submit"
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  border: "none",
                  background: "var(--primary-blue)",
                  color: "#FFFFFF",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <FiSend />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default GeminiAssistant;
