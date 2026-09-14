import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  FiMapPin, 
  FiPackage, 
  FiSettings, 
  FiLogOut,
  FiMoon,
  FiSun,
  FiPlus,
  FiSearch,
  FiTrash2
} from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { 
  getCustomerAddressesApi, 
  addCustomerAddressApi, 
  deleteCustomerAddressApi,
  getCustomerTransactions 
} from "../services/api";
import { logoutCustomer } from "../utils/auth";
import "./Settings.css";

const LANGUAGES = [
  "English", "Hindi (हिंदी)", "Telugu (తెలుగు)", "Tamil (தமிழ்)", 
  "Malayalam (മലയാളം)", "Kannada (ಕನ್ನಡ)", "Marathi (मराठी)", 
  "Bengali (বাংলা)", "Gujarati (ગુજરાતી)"
];

const Settings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  
  // Parse query params to set active tab
  const params = new URLSearchParams(location.search);
  const tabFromUrl = params.get("tab") || "account";
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  const customerId = localStorage.getItem("customerId") || 1;
  const userName = localStorage.getItem("userName") || "";

  // Keep state in sync with URL
  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  const setTab = (tabId) => {
    navigate(`/settings?tab=${tabId}`);
  };

  // Orders State
  const [orders, setOrders] = useState([]);
  const [trackId, setTrackId] = useState("");
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Addresses State
  const [addresses, setAddresses] = useState([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [newAddress, setNewAddress] = useState({ 
    address_type: "Home", 
    name: userName, 
    address_line: "", 
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "",
    phone: localStorage.getItem("userPhone") || "" 
  });

  // Fetch Data on Component Mount based on active tab
  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    } else if (activeTab === "addresses") {
      fetchAddresses();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    if (!userName) return;
    setLoadingOrders(true);
    try {
      const data = await getCustomerTransactions(userName);
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const data = await getCustomerAddressesApi(customerId);
      setAddresses(data);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleLogout = () => {
    logoutCustomer();
    toast.success("👋 Signed out successfully. See you soon!");
    setTimeout(() => {
      navigate("/login");
    }, 400);
  };

  const handleTrackOrder = () => {
    if(!trackId.trim()) return;
    navigate(`/track/${trackId.trim()}`);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if(newAddress.name && newAddress.address_line && newAddress.pincode) {
      try {
        const savedAddr = await addCustomerAddressApi(customerId, newAddress);
        setAddresses([...addresses, savedAddr]);
        setIsAddingAddress(false);
        setNewAddress({ 
          address_type: "Home", 
          name: userName, 
          address_line: "", 
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "",
          phone: localStorage.getItem("userPhone") || "" 
        });
        toast.success("Address added successfully!");
      } catch (error) {
        toast.error("Failed to add address.");
        console.error(error);
      }
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await deleteCustomerAddressApi(customerId, addressId);
      setAddresses(addresses.filter(a => a.id !== addressId));
      toast.success("Address deleted.");
    } catch (error) {
      toast.error("Failed to delete address.");
      console.error(error);
    }
  };

  return (
    <div className="settings-layout">
      <ToastContainer position="top-right" autoClose={2500} theme="colored" />
      {/* Sidebar Navigation */}
      <aside className="settings-sidebar">
        <div className="sidebar-header">
          <h2>Your Account</h2>
          <p>Manage your preferences</p>
        </div>
        <ul className="sidebar-menu">
          <li>
            <button 
              className={`sidebar-menu-btn ${activeTab === "account" ? "active" : ""}`} 
              onClick={() => setTab("account")}
            >
              <FiSettings /> Account & Preferences
            </button>
          </li>
          <li>
            <button 
              className={`sidebar-menu-btn ${activeTab === "orders" ? "active" : ""}`} 
              onClick={() => setTab("orders")}
            >
              <FiPackage /> My Orders & Tracking
            </button>
          </li>
          <li>
            <button 
              className={`sidebar-menu-btn ${activeTab === "addresses" ? "active" : ""}`} 
              onClick={() => setTab("addresses")}
            >
              <FiMapPin /> Addresses
            </button>
          </li>
        </ul>
      </aside>

      {/* Main Content Area */}
      <main className="settings-content">
        
        {/* Tab 1: Account & Preferences */}
        {activeTab === "account" && (
          <div className="tab-pane">
            <div className="tab-header">
              <h1>Account Preferences</h1>
              <p>Customize your shopping experience.</p>
            </div>

            <div className="preference-card">
              <div className="pref-info">
                <div className="pref-icon-wrapper">
                  {theme === "light" ? <FiSun /> : <FiMoon />}
                </div>
                <div className="pref-text">
                  <h3>App Appearance</h3>
                  <p>{theme === "light" ? "Light Mode is currently active." : "Dark Mode is currently active."}</p>
                </div>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={theme === "dark"} 
                  onChange={toggleTheme} 
                />
                <span className="slider round"></span>
              </label>
            </div>

            <div className="preference-card">
              <div className="pref-info">
                <div className="pref-icon-wrapper" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                  Aअ
                </div>
                <div className="pref-text">
                  <h3>Language Preference</h3>
                  <p>Select your preferred shopping language.</p>
                </div>
              </div>
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className="settings-language-dropdown"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            <div className="logout-container">
              <button onClick={handleLogout} className="btn-logout-lg">
                <FiLogOut />
                Sign Out of ShopSense
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Orders & Tracking */}
        {activeTab === "orders" && (
          <div className="tab-pane">
            <div className="tab-header">
              <h1>My Orders & Tracking</h1>
              <p>Track your recent purchases and view order history.</p>
            </div>

            <div className="tracking-input-wrapper">
              <input 
                type="text" 
                placeholder="Enter Order ID (e.g. TXN-A1B2C3D4) to track package..." 
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
              />
              <button className="btn btn-primary" onClick={handleTrackOrder}>
                <FiSearch /> Track
              </button>
            </div>

            <h3 style={{ marginBottom: '16px', color: 'var(--text-main)' }}>Recent Orders</h3>
            {loadingOrders ? (
              <p style={{ color: 'var(--text-muted)' }}>Loading your orders...</p>
            ) : orders.length > 0 ? (
              <div className="orders-list">
                {orders.map(order => (
                  <div key={order.id} className="order-card">
                    <div className="order-card-left">
                      <h4>{order.product_name || "Multiple Items"}</h4>
                      <p>Order ID: {order.transaction_ref} • Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                      <p style={{ marginTop: '8px', fontWeight: '600' }}>Total: ₹{order.amount.toFixed(2)}</p>
                    </div>
                    <div className="order-card-right" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                      <span className={`order-status ${order.status === 'Completed' ? 'delivered' : 'transit'}`}>
                        {order.status}
                      </span>
                      <button
                        className="btn-sm"
                        style={{
                          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                        }}
                        onClick={() => navigate(`/track/${order.transaction_ref}`)}
                      >
                        ⚡ Track Live
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>You haven't placed any orders yet.</p>
            )}
          </div>
        )}

        {/* Tab 3: Address Management */}
        {activeTab === "addresses" && (
          <div className="tab-pane">
            <div className="tab-header">
              <h1>Saved Addresses</h1>
              <p>Manage your delivery locations for faster checkout.</p>
            </div>

            {!isAddingAddress ? (
              <>
                {loadingAddresses ? (
                  <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Loading addresses...</p>
                ) : (
                  <div className="address-grid">
                    {addresses.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No saved addresses found.</p>}
                    {addresses.map(addr => (
                      <div key={addr.id} className="address-card">
                        <h4>{addr.address_type} - {addr.name}</h4>
                        <p>{addr.address_line}, {addr.locality ? addr.locality + ', ' : ''}{addr.city}, {addr.state} {addr.pincode}</p>
                        <p style={{ marginTop: '8px' }}>Phone: {addr.phone}</p>
                        <div className="address-actions">
                          <button className="btn-sm-outline" style={{ color: 'var(--accent-rose)', borderColor: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => handleDeleteAddress(addr.id)}>
                            <FiTrash2 /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button className="btn btn-primary" onClick={() => setIsAddingAddress(true)}>
                  <FiPlus /> Add New Address
                </button>
              </>
            ) : (
              <form className="add-address-form" onSubmit={handleSaveAddress}>
                <h3>Add a New Delivery Address</h3>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" required value={newAddress.name} onChange={(e) => setNewAddress({...newAddress, name: e.target.value})} placeholder="e.g. Rahul Sharma" />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="text" required value={newAddress.phone} onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})} placeholder="e.g. +91 9876543210" />
                </div>
                <div className="form-group">
                  <label>Address Type</label>
                  <select className="settings-language-dropdown" style={{ width: '100%', marginTop: '4px' }} value={newAddress.address_type} onChange={(e) => setNewAddress({...newAddress, address_type: e.target.value})}>
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>House No., Building, Street</label>
                  <input type="text" required value={newAddress.address_line} onChange={(e) => setNewAddress({...newAddress, address_line: e.target.value})} placeholder="e.g. Flat 402, Sunshine Heights" />
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>City</label>
                    <input type="text" required value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} placeholder="e.g. Mumbai" />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>State</label>
                    <input type="text" required value={newAddress.state} onChange={(e) => setNewAddress({...newAddress, state: e.target.value})} placeholder="e.g. Maharashtra" />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Pincode</label>
                    <input type="text" required value={newAddress.pincode} onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})} placeholder="e.g. 400053" />
                  </div>
                </div>
                
                <div className="form-actions">
                  <button type="button" className="btn-sm-outline" onClick={() => setIsAddingAddress(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Address</button>
                </div>
              </form>
            )}
          </div>
        )}

      </main>
    </div>
  );
};

export default Settings;
