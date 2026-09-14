import { useState, useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Sidebar from "./components/Sidebar";
import AIAssistantWidget from "./components/AIAssistantWidget";

import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Analytics from "./pages/Analytics";
import Products from "./pages/Products";
import Vendors from "./pages/Vendors";
import Customers from "./pages/Customers";
import Transactions from "./pages/Transactions";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import CustomerLogin from "./pages/CustomerLogin";
import VendorLogin from "./pages/VendorLogin";
import CustomerDashboard from "./pages/CustomerDashboard";
import Signup from "./pages/Signup";

import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  const location = useLocation();
  const isCustomerPort = typeof window !== "undefined" && window.location.port === "5174";

  const [authSession, setAuthSession] = useState(() => {
    const active = localStorage.getItem("authSessionActive") === "true" || localStorage.getItem("isLoggedIn") === "true";
    const role = localStorage.getItem("userRole");
    return Boolean(active && role);
  });

  const [userRole, setUserRole] = useState(() => {
    return isCustomerPort ? "customer" : (localStorage.getItem("userRole") || "");
  });

  useEffect(() => {
    const handleAuthChange = () => {
      const active = localStorage.getItem("authSessionActive") === "true" || localStorage.getItem("isLoggedIn") === "true";
      const role = localStorage.getItem("userRole");
      setAuthSession(Boolean(active && role));
      setUserRole(isCustomerPort ? "customer" : (role || ""));
    };

    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("roleChanged", handleAuthChange);
    window.addEventListener("authChanged", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("roleChanged", handleAuthChange);
      window.removeEventListener("authChanged", handleAuthChange);
    };
  }, [isCustomerPort]);

  const isAuthPage =
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/admin/login") ||
    location.pathname.startsWith("/vendor/login") ||
    location.pathname.startsWith("/customer/login") ||
    location.pathname.startsWith("/login/customer") ||
    location.pathname.startsWith("/login/vendor") ||
    location.pathname.startsWith("/vendor/register") ||
    location.pathname === "/signup";

  const showSidebar = authSession && !isAuthPage && !isCustomerPort && userRole !== "customer";

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "var(--bg-primary)",
        backgroundImage: "var(--bg-ambient-gradient)",
        backgroundAttachment: "fixed",
        backgroundSize: "cover"
      }}
    >
      {/* Show admin/vendor sidebar only when logged in and not on auth pages */}
      {showSidebar && <Sidebar />}

      <main
        style={{
          flex: 1,
          marginLeft: showSidebar ? "260px" : 0,
          padding: isAuthPage || !authSession ? 0 : isCustomerPort || userRole === "customer" ? "16px 20px" : "28px",
          width: showSidebar ? "calc(100% - 260px)" : "100%",
          minHeight: "100vh",
          transition: "margin-left 0.3s ease, width 0.3s ease"
        }}
      >
        <ErrorBoundary>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              {/* Public Authentication Pages - Always Accessible */}
              <Route path="/login" element={authSession ? <Navigate to="/" replace /> : (isCustomerPort ? <CustomerLogin /> : <Login />)} />
              <Route path="/login/customer" element={authSession ? <Navigate to="/" replace /> : <CustomerLogin />} />
              <Route path="/customer/login" element={authSession ? <Navigate to="/" replace /> : <CustomerLogin />} />
              <Route path="/login/vendor" element={authSession ? <Navigate to="/" replace /> : <VendorLogin />} />
              <Route path="/vendor/login" element={authSession ? <Navigate to="/" replace /> : <VendorLogin />} />
              <Route path="/vendor/register" element={<VendorLogin />} />
              <Route path="/login/admin" element={authSession ? <Navigate to="/" replace /> : <Login />} />
              <Route path="/admin/login" element={authSession ? <Navigate to="/" replace /> : <Login />} />
              <Route path="/signup" element={authSession ? <Navigate to="/" replace /> : <Signup />} />

              {/* Protected Routes: Require Login, Otherwise Redirect to /login */}
              <Route
                path="/"
                element={
                  authSession ? (
                    isCustomerPort || userRole === "customer" ? <CustomerDashboard /> : <Dashboard />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/customer/dashboard"
                element={authSession ? <CustomerDashboard /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/inventory"
                element={authSession ? <Inventory /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/analytics"
                element={authSession ? <Analytics /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/products"
                element={authSession ? <Products /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/vendors"
                element={authSession ? <Vendors /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/customers"
                element={authSession ? <Customers /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/transactions"
                element={authSession ? <Transactions /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/reports"
                element={authSession ? <Reports /> : <Navigate to="/login" replace />}
              />
              <Route
                path="/settings"
                element={authSession ? <Settings /> : <Navigate to="/login" replace />}
              />

              {/* Catch-all Wildcard Route */}
              <Route path="*" element={<Navigate to={authSession ? "/" : "/login"} replace />} />
            </Routes>
          </AnimatePresence>
        </ErrorBoundary>
      </main>

      {/* Page-Aware AI Assistant & Autonomous Shopping Agent Widget (Only when authenticated) */}
      {authSession && !isAuthPage && <AIAssistantWidget />}
    </div>
  );
}

export default App;