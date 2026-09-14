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
        text: "Hello! I am Ai Assistant. How can I help you today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ],
    autonomous_agent: [
      {
        sender: "ai",
        text: "Hello! I am your Shopping Agent. How can I help you today?",
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
      updateActiveMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Connection error. Please check backend server.",
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
