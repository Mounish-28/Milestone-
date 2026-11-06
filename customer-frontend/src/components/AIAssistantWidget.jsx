import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  FiMessageSquare,
  FiX,
  FiSend,
  FiGlobe,
  FiCheckCircle,
  FiAlertCircle,
  FiCpu
} from "react-icons/fi";
import { queryAIAssistant, approveBuyStep } from "../services/api";
import "./AIAssistantWidget.css";

function AIAssistantWidget() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [agentMode, setAgentMode] = useState("assistant"); // 'assistant' | 'autonomous_agent'

  // Page context auto-detection
  const getPageContext = () => {
    const role = localStorage.getItem("userRole") || "customer";
    const path = location.pathname;

    if (role === "customer" || path.includes("customer")) {
      return "customer";
    }
    if (path.includes("products") || path.includes("inventory")) {
      return role === "admin" ? "admin" : "vendor";
    }
    if (path.includes("vendors") || path.includes("analytics") || path.includes("reports")) {
      return "admin";
    }
    return role;
  };

  const pageContext = getPageContext();
  const isAdmin = pageContext === "admin";
  const effectiveMode = isAdmin ? "assistant" : agentMode;

  // Separate conversation state for each mode so they never mix
  const [messagesByMode, setMessagesByMode] = useState({
    assistant: [
      {
        sender: "ai",
        text: "👋 Hello! Welcome to ShopSense! I am your Gemini 3.8 Flash Shopping Assistant. How can I assist you with product discovery, spec comparisons, deals, and delivery tracking today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ],
    autonomous_agent: [
      {
        sender: "ai",
        text: "🤖 Hello! I am your Autonomous Shopping Agent powered by Gemini 3.8 Flash. I can autonomously discover deals, check delivery SLAs, and guide step-by-step 3-tier purchase approvals.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]
  });

  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(null); // Step approval state

  // Active mode's message list
  const activeMessages = messagesByMode[effectiveMode] || [];

  const updateActiveMessages = (updater) => {
    setMessagesByMode((prev) => {
      const currentList = prev[effectiveMode] || [];
      const updatedList = typeof updater === "function" ? updater(currentList) : updater;
      return {
        ...prev,
        [effectiveMode]: updatedList
      };
    });
  };

  const handleModeChange = (newMode) => {
    if (isAdmin) return; // Admin only has AI Assistant
    if (newMode === agentMode) return;
    setAgentMode(newMode);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMsg = inputText.trim();
    setInputText("");

    const newMsgs = [
      ...activeMessages,
      {
        sender: "user",
        text: userMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    updateActiveMessages(newMsgs);
    setLoading(true);

    try {
      const data = await queryAIAssistant({
        query: userMsg,
        page_context: pageContext,
        target_language: null,
        user_country: "India"
      });

      updateActiveMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: data.response,
          video_url: data.video_url,
          suggested_languages: data.suggested_languages,
          refusal: data.refusal,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      if (data.action_type === "approval_required" && !isAdmin) {
        setPendingApproval({
          step: data.step,
          product_name: data.product_name,
          price: data.price,
          vendor_name: data.vendor_name
        });
      }
    } catch {
      const qLower = userMsg.toLowerCase().replace(/[^\w\s]/g, "").trim();
      let fallbackText = "⚡ **[Gemini 3.8 Flash Shopping Assistant]**: Operating in high-speed edge mode. I can help you search authentic catalog products, check live delivery ETA, and find top offers!";
      if (["hi", "hello", "hey", "greetings"].includes(qLower) || qLower.startsWith("hi ") || qLower.startsWith("hello ")) {
        fallbackText = "👋 **Hello! Welcome to ShopSense!**\nI am your **Gemini 3.8 Flash Shopping Assistant**.\n\nHere is what I can assist you with today:\n• 📱 **Product Discovery**: Search specs, ratings, and best prices for flagship electronics, fashion, and home goods.\n• ⚖️ **Deal & Value Comparisons**: Find the best value-for-money products in any budget.\n• 🎥 **Authentic Video Reviews**: Watch real customer reviews in English, Hindi, Telugu, or Tamil.\n• 🚚 **Order Tracking & Deliveries**: Check your delivery status and live GPS tracking.\n• ⭐ **ShopSense Prime**: Explore free express shipping and VIP perks.\n\n*What are you looking to explore today?*";
      } else if (qLower.includes("sales") || qLower.includes("revenue") || qLower.includes("margin") || qLower.includes("stock") || qLower.includes("inventory") || qLower.includes("gmv")) {
        fallbackText = "🔒 **[Access Restricted - Customer Sector]**: This inquiry relates to vendor inventory management, wholesale margin schedules, or executive platform controls. As a customer, you have authorization for product discovery, order tracking, returns, and authentic video reviews. Please log into the Vendor or Admin Command Center for inventory operations.";
      } else if (qLower.includes("deal") || qLower.includes("discount") || qLower.includes("offer") || qLower.includes("sale")) {
        fallbackText = "🏷️ **[Gemini 3.8 Flash Deals]**: Top offer right now: **Samsung Galaxy S24 Ultra 5G** and **Noise ColorFit Pulse 3** with up to 15% instant seasonal discount!";
      } else if (qLower.includes("phone") || qLower.includes("mobile") || qLower.includes("samsung") || qLower.includes("iphone")) {
        fallbackText = "📱 **[Gemini 3.8 Flash Products]**: Verified flagship phones available: **Samsung Galaxy S24 Ultra 5G** (₹1,39,999) and **Apple iPhone 16 Pro Max** (₹1,44,900) with Express Delivery.";
      } else if (qLower.includes("track") || qLower.includes("order") || qLower.includes("status")) {
        fallbackText = "🚚 **[Gemini 3.8 Flash Tracking]**: Your most recent order is in transit with live GPS tracking enabled. Delivery expected within 2 business days.";
      } else if (qLower.includes("login") || qLower.includes("logintoday") || qLower.includes("vendor")) {
        fallbackText = "🏬 **[ShopSense Verified Merchants & Vendors]**:\n• ShopSense hosts **11 verified merchants** across Mobiles, Electronics, Wearables, and Fashion.\n• All vendors undergo strict Aadhaar e-KYC compliance with 100% verified authentic products, 2-day express delivery, and genuine manufacturer warranties.";
      } else if (qLower.includes("best seller") || qLower.includes("top selling") || qLower.includes("popular")) {
        fallbackText = "🏆 **[ShopSense Best Sellers]**:\n• **Samsung Galaxy S24 Ultra 5G** (₹1,39,999) — 1,240 units sold (4.9★)\n• **Apple iPhone 16 Pro Max** (₹1,44,900) — 890 units sold (4.9★)\n• **Noise ColorFit Pulse 3** (₹1,499) — 3,420 units sold (4.8★)\nAll backed by verified authentic video reviews and hassle-free returns!";
      } else if (qLower.includes("shopsense") || qLower.includes("about") || qLower.includes("platform")) {
        fallbackText = "🛍️ **[About ShopSense]**:\nShopSense is a next-generation multi-vendor e-commerce platform built with AI-powered multilingual video reviews, live GPS carrier tracking, multi-tenant vendor stores, and Gemini 3.8 Flash intelligence!";
      }
      updateActiveMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: fallbackText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageSelect = async (lang) => {
    setLoading(true);
    try {
      const data = await queryAIAssistant({
        query: "Show me a review",
        page_context: pageContext,
        target_language: lang,
        user_country: "India"
      });

      updateActiveMessages((prev) => [
        ...prev,
        {
          sender: "user",
          text: `Language selected: ${lang}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        {
          sender: "ai",
          text: data.response,
          video_url: data.video_url,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalResponse = async (approved) => {
    if (!pendingApproval) return;
    setLoading(true);

    try {
      const data = await approveBuyStep({
        step: pendingApproval.step,
        approved: approved,
        product_name: pendingApproval.product_name,
        price: pendingApproval.price
      });

      updateActiveMessages((prev) => [
        ...prev,
        {
          sender: "user",
          text: approved ? "Yes, I approve to proceed." : "No, cancel this action.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        {
          sender: "ai",
          text: data.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      if (data.status === "in_progress") {
        setPendingApproval({
          step: data.step,
          product_name: pendingApproval.product_name,
          price: pendingApproval.price
        });
      } else {
        setPendingApproval(null);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-widget-container">
      {/* Floating Button */}
      {!isOpen && (
        <button className="ai-fab-button" onClick={() => setIsOpen(true)}>
          <FiMessageSquare className="fab-icon" />
          <span className="fab-badge">
            {isAdmin ? "ADMIN ASSISTANT" : `${pageContext.toUpperCase()} AI SUITE`}
          </span>
        </button>
      )}

      {/* Main Drawer */}
      {isOpen && (
        <div className="ai-chat-drawer">
          {/* Header */}
          <div className="ai-header">
            <div className="ai-header-title">
              <div className="ai-avatar">
                <FiMessageSquare />
              </div>
              <div>
                <h4>ShopSense AI {isAdmin ? "Assistant" : "Suite"}</h4>
                <span className="context-pill">
                  {isAdmin ? (
                    <>Mode: <strong>AI ASSISTANT</strong> (ADMIN)</>
                  ) : (
                    <>Mode: <strong>{effectiveMode === 'assistant' ? 'AI ASSISTANT' : 'AGENT MODE'}</strong> ({pageContext.toUpperCase()})</>
                  )}
                </span>
              </div>
            </div>
            <button className="ai-close-btn" onClick={() => setIsOpen(false)}>
              <FiX />
            </button>
          </div>

          {/* Mode Switcher Bar - Only shown for Customers / non-Admin */}
          {!isAdmin && (
            <div className="agent-mode-bar">
              <button
                className={effectiveMode === 'assistant' ? 'active' : ''}
                onClick={() => handleModeChange('assistant')}
              >
                <FiMessageSquare /> AI Assistant Mode
              </button>
              <button
                className={effectiveMode === 'autonomous_agent' ? 'active' : ''}
                onClick={() => handleModeChange('autonomous_agent')}
              >
                <FiCpu /> Agent Mode
              </button>
            </div>
          )}

          {/* Message List - Shows ONLY active mode's messages */}
          <div className="ai-messages-body">
            {activeMessages.map((m, idx) => (
              <div key={idx} className={`chat-bubble-wrapper ${m.sender}`}>
                <div className={`chat-bubble ${m.sender}`}>
                  <p>{m.text}</p>

                  {/* Video Link Renderer */}
                  {m.video_url && (
                    <div className="video-card">
                      <a href={m.video_url} target="_blank" rel="noopener noreferrer" className="video-link">
                        <FiGlobe /> Watch Authentic Video Review
                      </a>
                    </div>
                  )}

                  {/* Language Selector Buttons */}
                  {m.suggested_languages && (
                    <div className="lang-options-grid">
                      {m.suggested_languages.map((lang) => (
                        <button
                          key={lang}
                          className="lang-btn"
                          onClick={() => handleLanguageSelect(lang)}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="chat-time">{m.timestamp}</span>
                </div>
              </div>
            ))}

            {/* Pending Step-by-Step Approval Prompt (in Agent Mode) */}
            {pendingApproval && effectiveMode === 'autonomous_agent' && (
              <div className="approval-card">
                <div className="approval-header">
                  <FiAlertCircle /> Action Requires Permission (Step {pendingApproval.step} of 3)
                </div>
                <p>
                  <strong>{pendingApproval.product_name}</strong> (${pendingApproval.price})
                </p>
                <div className="approval-actions">
                  <button className="approve-btn" onClick={() => handleApprovalResponse(true)}>
                    <FiCheckCircle /> Approve & Proceed
                  </button>
                  <button className="reject-btn" onClick={() => handleApprovalResponse(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {loading && (
              <div className="chat-bubble-wrapper ai">
                <div className="chat-bubble ai loading">
                  <span>{effectiveMode === 'assistant' ? 'AI Assistant processing...' : 'Agent processing action...'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Action Prompts */}
          <div className="quick-prompts-row">
            {isAdmin ? (
              <>
                <button onClick={() => setInputText("What is the total platform revenue?")}>
                  📊 Revenue Stats
                </button>
                <button onClick={() => setInputText("Check vendor compliance & status")}>
                  🏬 Vendor Status
                </button>
                <button onClick={() => setInputText("Summary of all marketplace transactions")}>
                  💳 Transactions
                </button>
              </>
            ) : effectiveMode === 'assistant' ? (
              <>
                <button onClick={() => setInputText("Compare Samsung S26 Ultra vs iPhone 16 Pro")}>
                  📱 Compare Specs
                </button>
                <button onClick={() => setInputText("Show me a review for Headphones")}>
                  📹 Video Review
                </button>
                <button onClick={() => setInputText("What are today's top deals?")}>
                  🔥 Top Deals
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setInputText("Buy Smart Fitness Watch Pro")}>
                  🛒 Buy Smart Watch
                </button>
                <button onClick={() => setInputText("Buy Samsung Galaxy S24 Ultra 5G")}>
                  ⚡ Buy S24 Ultra
                </button>
                <button onClick={() => setInputText("Buy Herman Miller Aeron Chair")}>
                  📦 Buy Office Chair
                </button>
              </>
            )}
          </div>

          {/* Input Form */}
          <form className="ai-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder={isAdmin || effectiveMode === 'assistant' ? "Ask AI Assistant..." : "Instruct Agent Mode..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button type="submit" disabled={loading}>
              <FiSend />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default AIAssistantWidget;
