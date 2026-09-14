import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiUsers,
  FiBox,
  FiUserCheck,
  FiDollarSign,
  FiTrendingUp,
  FiFileText,
  FiSettings,
  FiLogOut,
  FiShoppingBag,
  FiShield,
  FiAlertTriangle
} from "react-icons/fi";
import "./Sidebar.css";

function Sidebar() {
  const navigate = useNavigate();
  const [role, setRole] = useState(localStorage.getItem("userRole") || "admin");
  const [adminType, setAdminType] = useState(localStorage.getItem("adminType") || "executor");

  useEffect(() => {
    const handleStorage = () => {
      setRole(localStorage.getItem("userRole") || "admin");
      setAdminType(localStorage.getItem("adminType") || "executor");
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("roleChanged", handleStorage);
    window.addEventListener("authChanged", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("roleChanged", handleStorage);
      window.removeEventListener("authChanged", handleStorage);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authSessionActive");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("adminType");
    localStorage.removeItem("adminTypeTitle");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("displayName");
    localStorage.removeItem("aadhaarVerified");
    localStorage.removeItem("customerToken");
    window.dispatchEvent(new Event("authChanged"));
    window.dispatchEvent(new Event("roleChanged"));
    window.dispatchEvent(new Event("storage"));
    navigate("/login");
  };

  const isChairman = role === "chairman" || adminType === "chairman";
  const isAdmin = role === "admin" || isChairman;
  const isCustomer = role === "customer";

  const adminRoleTitle = isChairman
    ? "Supreme Chairman & Managing Director"
    : adminType === "approver"
    ? "Cross-Check & Seal Authority"
    : adminType === "verifier"
    ? "Compliance & KYC Verifier"
    : "System Operations Executor";

  const adminScopeBadge = isChairman
    ? "Board Chairman & 3-Admin Oversight"
    : adminType === "approver"
    ? "Cross-Check & Live Induction"
    : adminType === "verifier"
    ? "KYC & Warehouse Hub Audits"
    : "Vendor Intake & Due-Diligence";

  const adminSubRoleLabel = isChairman
    ? "CHAIRMAN PORTAL"
    : adminType === "approver"
    ? "APPROVER PORTAL"
    : adminType === "verifier"
    ? "VERIFIER PORTAL"
    : "EXECUTOR PORTAL";

  const vendorMenuName =
    adminType === "approver"
      ? "Vendor Cross-Check & Approvals"
      : adminType === "verifier"
      ? "KYC & Warehouse Hub Audits"
      : "Vendor Intake & Due-Diligence";

  let adminMenuItems = [];

  if (isChairman) {
    adminMenuItems = [
      { name: "Chairman Command Center", path: "/", icon: <FiGrid /> },
      { name: "New Admin Onboarding", path: "/", icon: <FiUserCheck /> },
      { name: "3-Admin Work Oversight", path: "/", icon: <FiShield /> },
      { name: "Vendor Network Governance", path: "/vendors", icon: <FiUsers /> },
      { name: "Platform Analytics", path: "/analytics", icon: <FiTrendingUp /> },
      { name: "Executive Settings", path: "/settings", icon: <FiSettings /> },
    ];
  } else if (adminType === "executor") {
    adminMenuItems = [
      { name: "Executor Intake Desk", path: "/", icon: <FiGrid /> },
      { name: "Due-Diligence & Intake", path: "/vendors", icon: <FiUsers /> },
      { name: "Cancelled & Discrepancies", path: "/vendors", icon: <FiAlertTriangle /> },
      { name: "Admin Settings", path: "/settings", icon: <FiSettings /> },
    ];
  } else if (adminType === "verifier") {
    adminMenuItems = [
      { name: "Verifier Audit Dashboard", path: "/", icon: <FiGrid /> },
      { name: "KYC & Warehouse Audits", path: "/vendors", icon: <FiUsers /> },
      { name: "Cancelled & Returned Desk", path: "/vendors", icon: <FiAlertTriangle /> },
      { name: "Admin Settings", path: "/settings", icon: <FiSettings /> },
    ];
  } else if (adminType === "approver") {
    adminMenuItems = [
      { name: "Approver Seal Authority", path: "/", icon: <FiGrid /> },
      { name: "Vendor Cross-Check & Seals", path: "/vendors", icon: <FiUsers /> },
      { name: "Cancelled & Rejected Archive", path: "/vendors", icon: <FiAlertTriangle /> },
      { name: "Admin Settings", path: "/settings", icon: <FiSettings /> },
    ];
  } else {
    adminMenuItems = [
      { name: "Executive Dashboard", path: "/", icon: <FiGrid /> },
      { name: "Vendor Management", path: "/vendors", icon: <FiUsers /> },
      { name: "Platform Analytics", path: "/analytics", icon: <FiTrendingUp /> },
      { name: "Admin Settings", path: "/settings", icon: <FiSettings /> },
    ];
  }

  const vendorMenuItems = [
    { name: "Store Dashboard", path: "/", icon: <FiGrid /> },
    { name: "Inventory Tracking", path: "/inventory", icon: <FiBox /> },
    { name: "My Products Catalog", path: "/products", icon: <FiBox /> },
    { name: "Sales & Earnings", path: "/transactions", icon: <FiDollarSign /> },
    { name: "Store Reports", path: "/reports", icon: <FiFileText /> },
    { name: "Store Settings", path: "/settings", icon: <FiSettings /> },
  ];

  const customerMenuItems = [
    { name: "Storefront Home", path: "/", icon: <FiGrid /> },
    { name: "My Order Ledger", path: "/transactions", icon: <FiDollarSign /> },
    { name: "Account Settings", path: "/settings", icon: <FiSettings /> },
  ];

  const currentMenuItems = isCustomer ? customerMenuItems : (isAdmin ? adminMenuItems : vendorMenuItems);

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="logo-section">
        <div
          className="logo-icon"
          style={{
            background: isChairman
              ? "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)"
              : isAdmin
              ? adminType === "approver"
                ? "linear-gradient(135deg, #10B981 0%, #059669 100%)"
                : adminType === "verifier"
                ? "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)"
                : "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)"
              : isCustomer
              ? "linear-gradient(135deg, #818CF8 0%, #4F46E5 100%)"
              : "linear-gradient(135deg, #10B981 0%, #059669 100%)"
          }}
        >
          {isChairman ? "👑" : isAdmin ? <FiShield /> : <FiShoppingBag />}
        </div>
        <div>
          <h2>ShopSense</h2>
          <p
            style={{
              color: isChairman
                ? "#FBBF24"
                : isAdmin
                ? adminType === "approver"
                  ? "#34D399"
                  : adminType === "verifier"
                  ? "#A78BFA"
                  : "#60A5FA"
                : isCustomer
                ? "#A5B4FC"
                : "#34D399",
              fontWeight: 800,
              fontSize: "0.74rem",
              letterSpacing: "0.5px"
            }}
          >
            {isAdmin ? adminSubRoleLabel : isCustomer ? "CUSTOMER PORTAL" : "VENDOR PORTAL"}
          </p>
        </div>
      </div>

      {/* Navigation Group */}
      <div className="menu-group" style={{ marginTop: "16px" }}>
        <span className="menu-label">
          {isChairman ? "EXECUTIVE GOVERNANCE" : isAdmin ? "ADMINISTRATION" : isCustomer ? "CUSTOMER DASHBOARD" : "STOREFRONT MANAGEMENT"}
        </span>
        <nav className="nav-list">
          {currentMenuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
              style={({ isActive }) => ({
                background: isActive
                  ? isAdmin
                    ? "#2563EB"
                    : "#10B981"
                  : undefined
              })}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-name">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Logout Footer */}
      <div className="sidebar-footer">
        <button className="logout-button" onClick={handleLogout}>
          <FiLogOut />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;