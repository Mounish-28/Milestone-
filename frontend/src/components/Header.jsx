import { useEffect, useState } from 'react';
import { FiSun, FiMoon, FiBell, FiCheckCircle, FiAlertCircle, FiShield, FiBriefcase, FiUser, FiPlay } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import { checkHealth } from '../services/api';
import DemoShowcaseModal from './DemoShowcaseModal';

function Header({ title, subtitle }) {
  const { theme, toggleTheme } = useTheme();
  const [isBackendOnline, setIsBackendOnline] = useState(true);
  const [role, setRole] = useState(localStorage.getItem("userRole") || "admin");
  const [showDemoModal, setShowDemoModal] = useState(false);
  
  // User profile state
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "John Doe");
  const [gender, setGender] = useState(localStorage.getItem("userGender") || "Male");

  useEffect(() => {
    let isMounted = true;
    const verifyBackend = async () => {
      const status = await checkHealth();
      if (isMounted) setIsBackendOnline(status);
    };
    verifyBackend();
    const interval = setInterval(verifyBackend, 15000);

    const handleRoleChanged = () => {
      setRole(localStorage.getItem("userRole") || "admin");
      setUserName(
        localStorage.getItem("displayName") ||
        localStorage.getItem("userName") ||
        (localStorage.getItem("userRole") === "vendor" ? "Rahul Sharma" : "Mounish Sai")
      );
      setGender(localStorage.getItem("userGender") || "Male");
    };

    window.addEventListener("roleChanged", handleRoleChanged);
    window.addEventListener("storage", handleRoleChanged);
    window.addEventListener("profileUpdated", handleRoleChanged);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener("roleChanged", handleRoleChanged);
      window.removeEventListener("storage", handleRoleChanged);
      window.removeEventListener("profileUpdated", handleRoleChanged);
    };
  }, []);

  const adminType = localStorage.getItem("adminType") || "executor";
  const isChairman = role === "chairman" || adminType === "chairman";
  const isAdmin = role === "admin" || isChairman;
  const salutation = gender === "Female" ? "Mrs." : gender === "Male" ? "Mr." : "";
  const welcomeText = `Welcome ${salutation} ${userName}`.trim();

  // Dynamic Admin Badge Definition
  const adminBadgeConfig = {
    chairman: {
      label: "👑 SUPREME CHAIRMAN & MANAGING DIRECTOR",
      bg: "rgba(245, 158, 11, 0.15)",
      color: "#FBBF24",
      border: "1px solid rgba(245, 158, 11, 0.35)",
      title: "Supreme Executive Authority & Board Chairman"
    },
    approver: {
      label: "⚖️ APPROVER ADMIN (VENDOR APPROVAL AUTHORITY)",
      bg: "rgba(16, 185, 129, 0.15)",
      color: "#34D399",
      border: "1px solid rgba(16, 185, 129, 0.35)",
      title: "Cross-Check & Vendor Approval Authority"
    },
    verifier: {
      label: "🔍 VERIFIER ADMIN (KYC & HUBS AUDIT)",
      bg: "rgba(139, 92, 246, 0.15)",
      color: "#A78BFA",
      border: "1px solid rgba(139, 92, 246, 0.35)",
      title: "Compliance & Security Verifier"
    },
    executor: {
      label: "⚡ EXECUTOR ADMIN (OPERATIONS & INTAKE)",
      bg: "rgba(37, 99, 235, 0.15)",
      color: "#60A5FA",
      border: "1px solid rgba(37, 99, 235, 0.35)",
      title: "System Operations Executor"
    }
  };

  const activeAdminBadge = adminBadgeConfig[adminType] || adminBadgeConfig.executor;

  const displayTitle = title || (isAdmin ? "Executive Admin Dashboard" : "Vendor Store Dashboard");
  const displaySubtitle = subtitle || `Greeting, ${welcomeText}`;

  return (
    <header className="top-header">
      <div>
        <div style={{ fontSize: "0.82rem", fontWeight: 700, color: isAdmin ? activeAdminBadge.color : "#10B981", marginBottom: "2px", display: "flex", alignItems: "center", gap: "6px" }}>
          <FiUser /> {welcomeText}
        </div>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.75rem', margin: 0 }}>
          {displayTitle}
          <span
            className="badge"
            style={{
              fontSize: '0.7rem',
              padding: '4px 10px',
              background: isAdmin ? activeAdminBadge.bg : 'rgba(16, 185, 129, 0.15)',
              color: isAdmin ? activeAdminBadge.color : '#10B981',
              border: isAdmin ? activeAdminBadge.border : '1px solid rgba(16, 185, 129, 0.3)'
            }}
          >
            {isAdmin ? <FiShield /> : <FiBriefcase />}
            {isAdmin ? activeAdminBadge.label : 'VENDOR PORTAL'}
          </span>
        </h1>
        <p style={{ marginTop: '2px' }}>{displaySubtitle}</p>
      </div>

      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Backend Status Indicator */}
        <div 
          className={`badge ${isBackendOnline ? 'badge-success' : 'badge-warning'}`}
          title={isBackendOnline ? "FastAPI Backend is Online" : "Using Offline Fallback Mode"}
          style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          {isBackendOnline ? <FiCheckCircle /> : <FiAlertCircle />}
          <span>{isBackendOnline ? "API Online" : "Offline Mode"}</span>
        </div>

        {/* Live Presentation Demo Showcase Button */}
        <button
          onClick={() => setShowDemoModal(true)}
          className="btn btn-primary"
          style={{
            background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "50px",
            padding: "8px 16px",
            fontSize: "0.85rem",
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 4px 15px rgba(99, 102, 241, 0.4)"
          }}
          title="Open Real-World Live Presentation Scenarios & Script"
        >
          <span>🎬</span>
          <span>Live Demo Guide</span>
        </button>

        {/* Dark / Light Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="btn btn-secondary"
          style={{ padding: '8px 14px', borderRadius: '50px' }}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? (
            <>
              <FiMoon style={{ color: '#F59E0B' }} />
              <span style={{ fontSize: '0.85rem' }}>Dark</span>
            </>
          ) : (
            <>
              <FiSun style={{ color: '#F59E0B' }} />
              <span style={{ fontSize: '0.85rem' }}>Light</span>
            </>
          )}
        </button>

        {/* Notifications Icon */}
        <button className="btn btn-secondary" style={{ padding: '10px', borderRadius: '50%' }} title="Notifications">
          <FiBell />
        </button>

        {/* Profile Info */}
        <div className="admin-profile" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div>
            <strong style={{ display: 'block', fontSize: '0.9rem' }}>{salutation} {userName}</strong>
            <small style={{ color: isAdmin ? activeAdminBadge.color : '#10B981', fontWeight: 600, display: 'block' }}>
              {isAdmin ? activeAdminBadge.title : "Marketplace Seller"}
            </small>
          </div>
        </div>
      </div>

      {/* Demo Showcase Modal */}
      <DemoShowcaseModal isOpen={showDemoModal} onClose={() => setShowDemoModal(false)} />
    </header>
  );
}

export default Header;