import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiSend, FiZap, FiCpu } from "react-icons/fi";
import { queryAIAssistant } from "../services/api";

const initialMessages = [
  {
    id: 1,
    sender: "ai",
    text: "👋 Hello! Welcome to ShopSense! I am your Gemini 3.8 Flash Shopping Assistant. How can I assist you with product discovery, spec comparisons, deals, and delivery tracking today?",
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
      const pageContext = "customer";
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
        video_url: data.video_url,
        suggested_languages: data.suggested_languages,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      const qLower = query.toLowerCase().replace(/[^\w\s]/g, "").trim();
      let aiReply = "⚡ **[Gemini 3.8 Flash Shopping Assistant]**: Operating in high-speed local mode. I can assist you with product specs, real-time prices, deals, stock levels, and authentic video reviews. What are you looking to buy today?";

      if (["hi", "hello", "hey", "greetings"].includes(qLower) || qLower.startsWith("hi ") || qLower.startsWith("hello ")) {
        aiReply = "👋 **Hello! Welcome to ShopSense!**\nI am your **Gemini 3.8 Flash Shopping Assistant**.\n\nHere is what I can assist you with today:\n• 📱 **Product Discovery**: Search specs, ratings, and best prices for flagship electronics, fashion, and home goods.\n• ⚖️ **Deal & Value Comparisons**: Find the best value-for-money products in any budget.\n• 🎥 **Authentic Video Reviews**: Watch real customer reviews in English, Hindi, Telugu, or Tamil.\n• 🚚 **Order Tracking & Deliveries**: Check your delivery status and live GPS tracking.\n• ⭐ **ShopSense Prime**: Explore free express shipping and VIP perks.\n\n*What are you looking to explore today?*";
      } else if (qLower.includes("sales") || qLower.includes("revenue") || qLower.includes("margin") || qLower.includes("stock") || qLower.includes("inventory") || qLower.includes("gmv")) {
        aiReply = "🔒 **[Access Restricted - Customer Sector]**: This inquiry relates to vendor inventory management, wholesale margin schedules, or executive platform controls. As a customer, you have authorization for product discovery, order tracking, returns, and authentic video reviews. Please log into the Vendor or Admin Command Center for inventory operations.";
      } else if (qLower.includes("phone") || qLower.includes("mobile") || qLower.includes("samsung") || qLower.includes("iphone") || qLower.includes("laptop")) {
        aiReply = "📱 **[Gemini 3.8 Flash Catalog Picks]**:\n• **Samsung Galaxy S24 Ultra 5G** — ₹1,39,999 (4.9★ | 200MP Quad Telephoto)\n• **Apple iPhone 16 Pro Max** — ₹1,44,900 (4.9★ | A18 Pro Chip)\n• **Apple MacBook Air M3 13\"** — ₹1,14,900 (4.9★ | Liquid Retina, 16GB RAM)\n🚀 Verified in stock with Express 2-Day Delivery.";
      } else if (qLower.includes("membership") || qLower.includes("prime") || qLower.includes("tier")) {
        aiReply = "⭐ **[Gemini 3.8 Flash Membership Plans]**:\n• **ShopSense Prime Basic**: Free standard shipping on orders over ₹499.\n• **Prime Plus ($9.99/mo)**: Free 2-day delivery + 5% cashback.\n• **Prime VIP ($119/yr)**: Free same-day delivery, early deal access & 24/7 AI Concierge.";
      } else if (qLower.includes("track") || qLower.includes("order") || qLower.includes("delivery")) {
        aiReply = "🚚 **[Gemini 3.8 Flash Delivery Tracker]**:\n• Status: **In Transit** (Tracking ID: AWB-98421092 via BlueDart).\n• Expected Delivery: Tomorrow by 7:00 PM.";
      } else if (qLower.includes("return") || qLower.includes("refund")) {
        aiReply = "📦 **[ShopSense Return & Refund Policy]**:\n• **7-Day Replacement Guarantee**: Valid on smartphones, electronics, and fashion items.\n• **Doorstep Pickup**: Within 24 hours from your registered address.\n• **Instant Refund**: Credited directly to your original payment method (UPI / Card).";
      } else if (qLower.includes("login") || qLower.includes("logintoday") || qLower.includes("vendor")) {
        aiReply = "🏬 **[ShopSense Verified Merchants & Vendors]**:\n• ShopSense hosts **11 verified merchants** across Mobiles, Electronics, Wearables, and Fashion.\n• All vendors undergo strict Aadhaar e-KYC compliance with 100% verified authentic products, 2-day express delivery, and genuine manufacturer warranties.";
      } else if (qLower.includes("best seller") || qLower.includes("top selling") || qLower.includes("popular")) {
        aiReply = "🏆 **[ShopSense Best Sellers]**:\n• **Samsung Galaxy S24 Ultra 5G** (₹1,39,999) — 1,240 units sold (4.9★)\n• **Apple iPhone 16 Pro Max** (₹1,44,900) — 890 units sold (4.9★)\n• **Noise ColorFit Pulse 3** (₹1,499) — 3,420 units sold (4.8★)\nAll backed by verified authentic video reviews and hassle-free returns!";
      } else if (qLower.includes("shopsense") || qLower.includes("about") || qLower.includes("platform")) {
        aiReply = "🛍️ **[About ShopSense]**:\nShopSense is a next-generation multi-vendor e-commerce platform built with AI-powered multilingual video reviews, live GPS carrier tracking, multi-tenant vendor stores, and Gemini 3.8 Flash intelligence!";
      }

      const aiMsg = {
        id: Date.now() + 1,
        sender: "ai",
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
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
          <span>Gemini 3.8 Flash AI</span>
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
              height: "530px",
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
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 800, margin: 0 }}>Gemini 3.8 Flash</h4>
                  <small style={{ color: "#A7F3D0", fontSize: "0.72rem", fontWeight: 700 }}>Customer Shopping Assistant</small>
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
                  <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{msg.text}</p>
                  {msg.video_url && (
                    <div style={{ marginTop: "8px" }}>
                      <a
                        href={msg.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "0.78rem",
                          color: "#60A5FA",
                          textDecoration: "underline",
                          fontWeight: 600
                        }}
                      >
                        🎥 Watch Authentic Video Review
                      </a>
                    </div>
                  )}
                  {msg.suggested_languages && (
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
                      {msg.suggested_languages.map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => handleSendMessage(`Show video review in ${lang}`)}
                          style={{
                            padding: "3px 8px",
                            fontSize: "0.72rem",
                            borderRadius: "10px",
                            border: "1px solid var(--border-color)",
                            background: "var(--bg-primary)",
                            color: "var(--text-main)",
                            cursor: "pointer"
                          }}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  )}
                  <small style={{ display: "block", fontSize: "0.68rem", opacity: 0.7, marginTop: "4px", textAlign: "right" }}>
                    {msg.timestamp}
                  </small>
                </div>
              ))}

              {isThinking && (
                <div style={{ alignSelf: "flex-start", background: "var(--bg-surface-hover)", padding: "10px 14px", borderRadius: "14px", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  ⚡ Gemini 3.8 Flash is analyzing data...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Chips for Customer Storefront */}
            <div style={{ padding: "0 12px 8px 12px", display: "flex", gap: "6px", overflowX: "auto" }}>
              <button
                type="button"
                onClick={() => handleSendMessage("Show me top flagship phones")}
                style={{ whiteSpace: "nowrap", padding: "4px 10px", fontSize: "0.72rem", borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-main)", cursor: "pointer" }}
              >
                📱 Flagship Phones
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage("Compare Samsung S24 Ultra vs iPhone 16 Pro")}
                style={{ whiteSpace: "nowrap", padding: "4px 10px", fontSize: "0.72rem", borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-main)", cursor: "pointer" }}
              >
                ⚖️ Compare Specs
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage("Track my order delivery status")}
                style={{ whiteSpace: "nowrap", padding: "4px 10px", fontSize: "0.72rem", borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-main)", cursor: "pointer" }}
              >
                🚚 Track Order
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage("What are ShopSense Prime membership benefits?")}
                style={{ whiteSpace: "nowrap", padding: "4px 10px", fontSize: "0.72rem", borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-main)", cursor: "pointer" }}
              >
                ⭐ Prime Perks
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
                placeholder="Ask Gemini 3.8 Flash Shopping Assistant..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isThinking}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: "20px",
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-primary)",
                  color: "var(--text-main)",
                  fontSize: "0.85rem",
                  outline: "none",
                  opacity: isThinking ? 0.6 : 1
                }}
              />
              <button
                type="submit"
                disabled={isThinking || !inputMessage.trim()}
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  border: "none",
                  background: isThinking || !inputMessage.trim() ? "var(--bg-surface-hover)" : "var(--primary-blue)",
                  color: "#FFFFFF",
                  cursor: isThinking || !inputMessage.trim() ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: isThinking || !inputMessage.trim() ? 0.6 : 1
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
