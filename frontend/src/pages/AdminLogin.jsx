import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiShield, FiMail, FiLock, FiKey, FiArrowRight, FiUsers } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@shopsense.com");
  const [password, setPassword] = useState("admin123");
  const [securityPin, setSecurityPin] = useState("9988");
  const [rememberMe, setRememberMe] = useState(true);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in email and password.");
      return;
    }
    
    // Set active user role session
    localStorage.setItem("userRole", "admin");
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userName", "System Administrator");

    toast.success("Authenticated as System Admin!");
    setTimeout(() => {
      navigate("/");
    }, 800);
  };

  const handleFillDemo = () => {
    setEmail("admin@shopsense.com");
    setPassword("admin123");
    setSecurityPin("9988");
    toast.info("Demo Admin credentials loaded!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%)",
        padding: "24px",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <ToastContainer position="top-right" autoClose={2000} theme="dark" />

      {/* Subtle background blur accents */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: "-10%",
          width: "400px",
          height: "400px",
          background: "rgba(37, 99, 235, 0.15)",
          filter: "blur(120px)",
          borderRadius: "50%",
          pointerEvents: "none"
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-10%",
          right: "-10%",
          width: "400px",
          height: "400px",
          background: "rgba(139, 92, 246, 0.15)",
          filter: "blur(120px)",
          borderRadius: "50%",
          pointerEvents: "none"
        }}
      />

      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "rgba(17, 24, 39, 0.85)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "16px",
          padding: "40px",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
          color: "#F9FAFB"
        }}
      >
        {/* Top Role Badge */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              borderRadius: "9999px",
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.5px",
              background: "rgba(37, 99, 235, 0.2)",
              color: "#60A5FA",
              border: "1px solid rgba(96, 165, 250, 0.3)",
              textTransform: "uppercase"
            }}
          >
            <FiShield style={{ fontSize: "0.9rem" }} /> System Admin Portal
          </span>
          <Link
            to="/login/vendor"
            style={{
              fontSize: "0.82rem",
              color: "#9CA3AF",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            <FiUsers /> Switch to Vendor Portal
          </Link>
        </div>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div
            style={{
              margin: "0 auto 16px auto",
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              fontSize: "1.8rem",
              boxShadow: "0 8px 20px rgba(37, 99, 235, 0.4)"
            }}
          >
            <FiShield />
          </div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.5px" }}>
            Admin Authentication
          </h2>
          <p style={{ fontSize: "0.88rem", color: "#9CA3AF", marginTop: "6px" }}>
            Access full executive controls, analytics, & multi-vendor management
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleAdminLogin} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.83rem", fontWeight: 600, color: "#D1D5DB", marginBottom: "6px" }}>
              Admin Email Address
            </label>
            <div style={{ position: "relative" }}>
              <FiMail style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#6B7280" }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@shopsense.com"
                style={{
                  width: "100%",
                  padding: "12px 14px 12px 42px",
                  borderRadius: "10px",
                  border: "1px solid #374151",
                  background: "#1F2937",
                  color: "#F9FAFB",
                  fontSize: "0.92rem",
                  outline: "none",
                  transition: "border-color 0.2s"
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.83rem", fontWeight: 600, color: "#D1D5DB", marginBottom: "6px" }}>
              Admin Password
            </label>
            <div style={{ position: "relative" }}>
              <FiLock style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#6B7280" }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "12px 14px 12px 42px",
                  borderRadius: "10px",
                  border: "1px solid #374151",
                  background: "#1F2937",
                  color: "#F9FAFB",
                  fontSize: "0.92rem",
                  outline: "none",
                  transition: "border-color 0.2s"
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.83rem", fontWeight: 600, color: "#D1D5DB", marginBottom: "6px" }}>
              Admin Security PIN (2FA)
            </label>
            <div style={{ position: "relative" }}>
              <FiKey style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#6B7280" }} />
              <input
                type="password"
                maxLength={6}
                value={securityPin}
                onChange={(e) => setSecurityPin(e.target.value)}
                placeholder="9988"
                style={{
                  width: "100%",
                  padding: "12px 14px 12px 42px",
                  borderRadius: "10px",
                  border: "1px solid #374151",
                  background: "#1F2937",
                  color: "#F9FAFB",
                  fontSize: "0.92rem",
                  outline: "none",
                  letterSpacing: "4px"
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", color: "#9CA3AF", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: "#2563EB", width: "16px", height: "16px" }}
              />
              Remember admin session
            </label>
            <button
              type="button"
              onClick={handleFillDemo}
              style={{
                background: "none",
                border: "none",
                color: "#60A5FA",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "0.82rem"
              }}
            >
              Fill Demo Admin
            </button>
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              marginTop: "8px",
              padding: "14px",
              borderRadius: "10px",
              border: "none",
              background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
              color: "#FFFFFF",
              fontSize: "0.95rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: "0 4px 15px rgba(37, 99, 235, 0.35)",
              transition: "transform 0.2s ease"
            }}
          >
            Authenticate Admin Console <FiArrowRight />
          </button>
        </form>

        {/* Footer Nav */}
        <div style={{ textAlign: "center", marginTop: "28px", borderTop: "1px solid #1F2937", paddingTop: "20px" }}>
          <p style={{ fontSize: "0.85rem", color: "#9CA3AF" }}>
            Are you a registered marketplace vendor?{" "}
            <Link to="/login/vendor" style={{ color: "#10B981", fontWeight: 700, textDecoration: "none" }}>
              Login to Vendor Portal
            </Link>
          </p>
          <div style={{ marginTop: "12px" }}>
            <Link to="/login" style={{ fontSize: "0.82rem", color: "#6B7280", textDecoration: "underline" }}>
              Return to Portal Gateway
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default AdminLogin;
