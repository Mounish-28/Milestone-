import { useState, useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import AIAssistantWidget from "./components/AIAssistantWidget";
import CustomerDashboard from "./pages/CustomerDashboard";
import CustomerLogin from "./pages/CustomerLogin";
import Signup from "./pages/Signup";
import SearchResults from "./pages/SearchResults";
import ProductDetail from "./pages/ProductDetail";
import Settings from "./pages/Settings";
import CartCheckout from "./pages/CartCheckout";
import LiveTracking from "./pages/LiveTracking";

import { isCustomerAuthenticated } from "./utils/auth";

function App() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(() => isCustomerAuthenticated());

  useEffect(() => {
    const handleAuth = () => {
      setIsAuthenticated(isCustomerAuthenticated());
    };
    window.addEventListener("storage", handleAuth);
    window.addEventListener("authChanged", handleAuth);
    return () => {
      window.removeEventListener("storage", handleAuth);
      window.removeEventListener("authChanged", handleAuth);
    };
  }, []);

  const isAuthPage = location.pathname.startsWith("/login") || location.pathname.startsWith("/signup");
  const isFullBleedPage = isAuthPage || location.pathname.startsWith("/search") || location.pathname.startsWith("/product") || location.pathname.startsWith("/track");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "var(--bg-primary)",
        backgroundImage: "var(--bg-ambient-gradient)",
        backgroundAttachment: "fixed",
        backgroundSize: "cover"
      }}
    >
      <main
        style={{
          flex: 1,
          padding: isFullBleedPage ? 0 : "16px 20px",
          width: "100%",
          minHeight: "100vh"
        }}
      >
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Public Authentication Routes */}
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <CustomerLogin />} />
            <Route path="/customer/login" element={isAuthenticated ? <Navigate to="/" replace /> : <CustomerLogin />} />
            <Route path="/signup" element={isAuthenticated ? <Navigate to="/" replace /> : <Signup />} />
            <Route path="/customer/signup" element={isAuthenticated ? <Navigate to="/" replace /> : <Signup />} />

            {/* Protected Customer Storefront & Marketplace Routes - Require Login */}
            <Route path="/" element={isAuthenticated ? <CustomerDashboard /> : <Navigate to="/login" replace />} />
            <Route path="/marketplace" element={isAuthenticated ? <CustomerDashboard /> : <Navigate to="/login" replace />} />
            <Route path="/cart" element={isAuthenticated ? <CartCheckout /> : <Navigate to="/login" replace />} />
            <Route path="/orders" element={isAuthenticated ? <Navigate to="/settings?tab=orders" replace /> : <Navigate to="/login" replace />} />
            <Route path="/wishlist" element={isAuthenticated ? <CustomerDashboard /> : <Navigate to="/login" replace />} />
            <Route path="/deals" element={isAuthenticated ? <CustomerDashboard /> : <Navigate to="/login" replace />} />
            <Route path="/settings" element={isAuthenticated ? <Settings /> : <Navigate to="/login" replace />} />

            {/* Protected Live Tracking */}
            <Route path="/track" element={isAuthenticated ? <LiveTracking /> : <Navigate to="/login" replace />} />
            <Route path="/track/:orderId" element={isAuthenticated ? <LiveTracking /> : <Navigate to="/login" replace />} />
            <Route path="/tracking" element={isAuthenticated ? <LiveTracking /> : <Navigate to="/login" replace />} />
            <Route path="/tracking/:orderId" element={isAuthenticated ? <LiveTracking /> : <Navigate to="/login" replace />} />

            {/* Protected Search & Product Details Pages */}
            <Route path="/search" element={isAuthenticated ? <SearchResults /> : <Navigate to="/login" replace />} />
            <Route path="/product/:id" element={isAuthenticated ? <ProductDetail /> : <Navigate to="/login" replace />} />

            {/* Fallback Catch-All */}
            <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
          </Routes>
        </AnimatePresence>
      </main>

      {/* Shopping & Product Recommendation AI Assistant */}
      {isAuthenticated && !isAuthPage && <AIAssistantWidget />}
    </div>
  );
}

export default App;

