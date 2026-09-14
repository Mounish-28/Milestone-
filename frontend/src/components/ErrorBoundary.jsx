import React from "react";
import { FiAlertTriangle, FiRefreshCw, FiHome } from "react-icons/fi";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "70vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            color: "#FFFFFF"
          }}
        >
          <div
            style={{
              background: "#0F172A",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              borderRadius: "20px",
              padding: "40px",
              maxWidth: "600px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)"
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "rgba(239, 68, 68, 0.15)",
                color: "#EF4444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2rem",
                margin: "0 auto 20px auto"
              }}
            >
              <FiAlertTriangle />
            </div>

            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "8px" }}>
              Something Went Wrong
            </h2>

            <p style={{ color: "#94A3B8", fontSize: "0.9rem", lineHeight: "1.6", marginBottom: "24px" }}>
              An unexpected render issue occurred while loading this view. The rest of the platform remains safe and functional.
            </p>

            {this.state.error && (
              <div
                style={{
                  background: "#020617",
                  border: "1px solid #334155",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  fontSize: "0.78rem",
                  color: "#F87171",
                  textAlign: "left",
                  marginBottom: "24px",
                  fontFamily: "monospace",
                  overflowX: "auto"
                }}
              >
                {this.state.error.toString()}
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                onClick={this.handleReload}
                style={{
                  background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "10px",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <FiRefreshCw /> Reload Page
              </button>

              <button
                onClick={this.handleGoHome}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  color: "#E2E8F0",
                  border: "1px solid #334155",
                  padding: "10px 20px",
                  borderRadius: "10px",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <FiHome /> Return to Command Center
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
