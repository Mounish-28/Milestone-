import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  FiMessageSquare,
  FiX,
  FiSend,
  FiGlobe,
  FiZap
} from "react-icons/fi";
import { queryAIAssistant } from "../services/api";
import "./AIAssistantWidget.css";

function AIAssistantWidget() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  // Page context auto-detection
  const getPageContext = () => {
    const role = localStorage.getItem("userRole") || "vendor";
    const path = location.pathname;

    if (path.includes("vendors") || path.includes("analytics") || path.includes("reports") || path.includes("chairman")) {
      return "admin";
    }
    if (path.includes("products") || path.includes("inventory")) {
      return role === "admin" ? "admin" : "vendor";
    }
    return role;
  };

  const pageContext = getPageContext();
  const isAdmin = pageContext === "admin";

  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: `Hello! I am your ShopSense AI Assistant powered by Gemini Flash 3.6. I am ready to help you with ${
        isAdmin
          ? "platform revenue metrics, vendor compliance, and executive operations."
          : "catalog inventory, low-stock warnings, and customer review sentiment."
      }`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMsg = inputText.trim();
    setInputText("");

    const newMsgs = [
      ...messages,
      {
        sender: "user",
        text: userMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    setMessages(newMsgs);
    setLoading(true);

    try {
      const data = await queryAIAssistant({
        query: userMsg,
        page_context: pageContext,
        target_language: null,
        user_country: "India"
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: data.response,
          video_url: data.video_url,
          suggested_languages: data.suggested_languages,
          refusal: data.refusal,
          model: data.model || "gemini-flash-3.6",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Connection error. Please ensure the backend server is running on port 8000.",
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

      setMessages((prev) => [
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

  return (
    <div className="ai-widget-container">
      {/* Floating Button */}
      {!isOpen && (
        <button className="ai-fab-button" onClick={() => setIsOpen(true)}>
          <FiMessageSquare className="fab-icon" />
          <span className="fab-badge">
            <FiZap style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            GEMINI FLASH 3.6
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
                <FiZap />
              </div>
              <div>
                <h4>ShopSense AI Assistant</h4>
                <span className="context-pill">
                  <span className="gemini-badge">⚡ Gemini Flash 3.6</span>
                  <span className="context-tag">({pageContext.toUpperCase()})</span>
                </span>
              </div>
            </div>
            <button className="ai-close-btn" onClick={() => setIsOpen(false)} title="Close Assistant">
              <FiX />
            </button>
          </div>

          {/* Message List */}
          <div className="ai-messages-body">
            {messages.map((m, idx) => (
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

                  <span className="bubble-time">{m.timestamp}</span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-bubble-wrapper ai">
                <div className="chat-bubble ai loading">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span>Gemini Flash 3.6 is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form className="ai-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask Gemini Flash AI Assistant..."
              disabled={loading}
            />
            <button type="submit" disabled={loading || !inputText.trim()} title="Send Message">
              <FiSend />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default AIAssistantWidget;
