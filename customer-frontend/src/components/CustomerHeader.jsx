import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FiSearch,
  FiShoppingCart,
  FiHeart,
  FiUser,
  FiMapPin,
  FiChevronDown,
  FiShoppingBag,
  FiPackage,
  FiLogOut,
  FiTag,
  FiZap,
  FiShield,
  FiCheck,
  FiCompass,
  FiSettings,
  FiTruck
} from "react-icons/fi";
import ThemeToggle from "./ThemeToggle";
import { logoutCustomer, isCustomerAuthenticated } from "../utils/auth";
import "./CustomerHeader.css";

function CustomerHeader({ cartCount = 0, wishlistCount = 0, onCartClick }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  // User state from localStorage & auth helper
  const [user, setUser] = useState({
    name: localStorage.getItem("userName") || "",
    email: localStorage.getItem("userEmail") || "",
    phone: localStorage.getItem("userPhone") || "",
    address: localStorage.getItem("userAddress") || "Flat 402, Sunshine Heights, Mumbai - 400050"
  });

  const [isLoggedIn, setIsLoggedIn] = useState(isCustomerAuthenticated());

  // Listen to authChanged to sync header status immediately
  useEffect(() => {
    const handleAuthSync = () => {
      setUser({
        name: localStorage.getItem("userName") || "",
        email: localStorage.getItem("userEmail") || "",
        phone: localStorage.getItem("userPhone") || "",
        address: localStorage.getItem("userAddress") || "Flat 402, Sunshine Heights, Mumbai - 400050"
      });
      setIsLoggedIn(isCustomerAuthenticated());
    };
    window.addEventListener("authChanged", handleAuthSync);
    window.addEventListener("storage", handleAuthSync);
    return () => {
      window.removeEventListener("authChanged", handleAuthSync);
      window.removeEventListener("storage", handleAuthSync);
    };
  }, []);

  // Sync search input if query param changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q") || "";
    if (location.pathname === "/search") {
      setSearchTerm(q);
    }
  }, [location.search, location.pathname]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) return;
    setIsSearchOpen(false);
    navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}${selectedCategory !== "All Categories" ? `&category=${encodeURIComponent(selectedCategory)}` : ""}`);
  };

  const handleQuickSearch = (keyword) => {
    setSearchTerm(keyword);
    setIsSearchOpen(false);
    navigate(`/search?q=${encodeURIComponent(keyword)}`);
  };

  const handleLogout = () => {
    logoutCustomer();
    setUser({ name: "", email: "", phone: "", address: "" });
    setIsLoggedIn(false);
    setUserDropdownOpen(false);
    navigate("/login");
  };

  const popularSearches = [
    "iPhone 16 Pro",
    "Sony WH-1000XM6",
    "MacBook Pro M3",
    "Samsung Galaxy Fold",
    "Smart Watch",
    "Noise Canceling Earbuds",
    "Running Shoes",
    "Gaming Laptop"
  ];

  const categories = [
    { name: "Top Deals", icon: <FiZap />, path: "/deals" },
    { name: "Mobiles", icon: "📱", path: "/search?category=Electronics" },
    { name: "Electronics", icon: "💻", path: "/search?category=Electronics" },
    { name: "Fashion", icon: "👗", path: "/search?category=Fashion" },
    { name: "Audio & Sound", icon: "🎧", path: "/search?category=Audio" },
    { name: "Smart Home", icon: "🏠", path: "/search?category=Home" },
    { name: "Wearables", icon: "⌚", path: "/search?category=Wearables" },
    { name: "All Products", icon: <FiCompass />, path: "/search" }
  ];

  return (
    <header className="customer-header-wrapper">
      {/* Top Banner Notice */}
      <div className="customer-top-strip">
        <div className="top-strip-container">
          <div className="top-strip-left">
            <span>⚡ Big Freedom Fest: Instant 10% Extra Cashback with ShopSense Prime</span>
          </div>
          <div className="top-strip-right">
            <span className="strip-item"><FiShield /> 100% Genuine Guaranteed</span>
            <span className="strip-item"><FiTag /> 7 Days Free Replacement</span>
            <span className="strip-item"><FiCheck /> Verified Seller Hub</span>
          </div>
        </div>
      </div>

      {/* Main Flipkart / Amazon Style Navbar */}
      <div className="customer-main-nav">
        <div className="main-nav-container">
          {/* Logo & Plus Badge */}
          <Link to="/" className="brand-logo-link">
            <div className="brand-logo-box">
              <div className="logo-icon-wrap">
                <FiShoppingBag />
              </div>
              <div className="brand-text-stack">
                <span className="brand-title">ShopSense</span>
                <span className="brand-subtitle">
                  Explore <span className="plus-tag">Plus ✦</span>
                </span>
              </div>
            </div>
          </Link>

          {/* Delivery Pincode / Address Selector */}
          <div className="delivery-location-btn" title={user.address}>
            <div className="pin-icon-wrap">
              <FiMapPin />
            </div>
            <div className="pin-text-col">
              <span className="pin-label">Deliver to {user.name ? user.name.split(" ")[0] : "Guest"}</span>
              <span className="pin-city">
                {user.address ? user.address.split(",")[0] : "Select Location"}
              </span>
            </div>
          </div>

          {/* Flipkart/Amazon Global Search Bar */}
          <div className="global-search-container" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="search-form-bar">
              <select
                className="search-category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="All Categories">All</option>
                <option value="Electronics">Electronics</option>
                <option value="Fashion">Fashion</option>
                <option value="Home & Living">Home</option>
                <option value="Audio">Audio</option>
                <option value="Wearables">Wearables</option>
              </select>

              <input
                type="text"
                placeholder="Search for Products, Brands, Electronics, Fashion and more..."
                className="search-main-input"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
              />

              <button type="submit" className="search-submit-btn" aria-label="Search">
                <FiSearch />
              </button>
            </form>

            {/* Auto-suggest dropdown */}
            {isSearchOpen && (
              <div className="search-suggest-dropdown">
                <div className="suggest-header">
                  <span>Popular Searches & Recommendations</span>
                </div>
                <div className="suggest-tags">
                  {popularSearches.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="suggest-chip"
                      onClick={() => handleQuickSearch(item)}
                    >
                      <FiSearch className="chip-icon" /> {item}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Action Icons & User Account */}
          <div className="nav-actions-group">
            {/* Dark / Light Mode Theme Toggle */}
            <ThemeToggle className="header-theme-toggle" showLabel={true} />

            {/* Account / Login */}
            {isLoggedIn ? (
              <div className="account-dropdown-wrapper" ref={dropdownRef}>
                <button
                  type="button"
                  className="account-btn logged-in"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                >
                  <div className="user-avatar-badge">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="user-name-col">
                    <span className="user-greeting">Hello, {user.name ? user.name.split(" ")[0] : "Customer"}</span>
                    <span className="user-sub">Account & Lists <FiChevronDown /></span>
                  </div>
                </button>

                {userDropdownOpen && (
                  <div className="account-menu-flyout">
                    <div className="flyout-user-header">
                      <strong>{user.name || "Customer"}</strong>
                      <span className="user-email-text">{user.email || user.phone}</span>
                    </div>
                    <div className="flyout-divider" />
                    <Link to="/track" className="flyout-link" style={{ color: "#10B981", fontWeight: "700" }} onClick={() => setUserDropdownOpen(false)}>
                      <FiTruck /> Live Order Tracking
                    </Link>
                    <Link to="/orders" className="flyout-link" onClick={() => setUserDropdownOpen(false)}>
                      <FiPackage /> My Orders
                    </Link>
                    <Link to="/wishlist" className="flyout-link" onClick={() => setUserDropdownOpen(false)}>
                      <FiHeart /> My Wishlist ({wishlistCount})
                    </Link>
                    <Link to="/deals" className="flyout-link" onClick={() => setUserDropdownOpen(false)}>
                      <FiZap /> Flash Deals & VIP
                    </Link>
                    <div className="flyout-divider" />
                    <Link to="/settings" className="flyout-link" onClick={() => setUserDropdownOpen(false)}>
                      <FiUser /> Settings & Preferences
                    </Link>
                    <button type="button" className="flyout-link logout-link" onClick={handleLogout}>
                      <FiLogOut /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="account-login-btn">
                <FiUser /> Sign In
              </Link>
            )}

            {/* Direct Logout Button */}
            {isLoggedIn && (
              <button
                type="button"
                className="header-direct-logout-btn"
                onClick={handleLogout}
                title="Log Out of Customer Platform"
              >
                <FiLogOut />
                <span>Logout</span>
              </button>
            )}

            {/* Live Order Tracking Button */}
            <Link to="/track" className="nav-icon-btn" title="Live Order Tracking" style={{ position: "relative" }}>
              <div className="icon-with-badge" style={{ color: "#10B981" }}>
                <FiTruck />
                <span 
                  style={{
                    position: "absolute",
                    top: "-2px",
                    right: "-2px",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#10B981",
                    boxShadow: "0 0 8px #10B981"
                  }} 
                />
              </div>
              <span className="nav-icon-label" style={{ color: "#10B981", fontWeight: "700" }}>Live Track</span>
            </Link>

            {/* Settings Link */}
            <Link to="/settings" className="nav-icon-btn" title="Settings">
              <div className="icon-with-badge">
                <FiSettings />
              </div>
              <span className="nav-icon-label">Settings</span>
            </Link>

            {/* Wishlist Link */}
            <Link to="/wishlist" className="nav-icon-btn" title="Wishlist">
              <div className="icon-with-badge">
                <FiHeart />
                {wishlistCount > 0 && <span className="nav-badge">{wishlistCount}</span>}
              </div>
              <span className="nav-icon-label">Wishlist</span>
            </Link>

            <button
              type="button"
              className="nav-cart-btn"
              onClick={() => navigate("/cart")}
            >
              <div className="icon-with-badge">
                <FiShoppingCart />
                {cartCount > 0 && <span className="nav-badge cart-badge">{cartCount}</span>}
              </div>
              <span className="cart-text-label">Cart</span>
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Categories Strip (Amazon/Flipkart Style) */}
      <nav className="customer-categories-strip">
        <div className="categories-strip-container">
          {categories.map((cat, idx) => (
            <Link key={idx} to={cat.path} className="category-strip-item">
              <span className="cat-icon">{cat.icon}</span>
              <span className="cat-title">{cat.name}</span>
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}

export default CustomerHeader;
