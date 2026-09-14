import { useState } from "react";
import { motion } from "framer-motion";
import { FiSun, FiMoon, FiUser, FiSave } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../components/Header";
import { useTheme } from "../context/ThemeContext";
import { getPaymentQR, getPaymentUPI, DEFAULT_PAYEE_NAME } from "../utils/paymentConfig";

function Settings() {
  const { theme, toggleTheme } = useTheme();

  const [profile, setProfile] = useState({
    displayName: localStorage.getItem("displayName") || "Mounish Sai",
    userName: localStorage.getItem("userName") || "mounish_admin",
    gender: localStorage.getItem("userGender") || "Male",
    email: localStorage.getItem("userEmail") || "admin@shopsense.com"
  });

  const handleSaveProfile = (e) => {
    e.preventDefault();
    localStorage.setItem("displayName", profile.displayName);
    localStorage.setItem("userName", profile.userName);
    localStorage.setItem("userGender", profile.gender);
    localStorage.setItem("userEmail", profile.email);

    window.dispatchEvent(new Event("profileUpdated"));
    toast.success("Profile preferences updated!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="page-container"
    >
      <ToastContainer position="top-right" autoClose={2500} theme="colored" />
      <Header title="Account Settings" subtitle="Manage your profile preferences, display name, and interface theme" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        
        {/* Profile Details Card */}
        <div className="chart-card">
          <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <FiUser style={{ color: 'var(--primary-blue)' }} /> User Profile & Account Info
          </h3>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Display Name</label>
              <input
                type="text"
                value={profile.displayName}
                onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Username</label>
              <input
                type="text"
                value={profile.userName}
                onChange={(e) => setProfile({ ...profile, userName: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Gender (Welcome Prefix)</label>
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)' }}
                >
                  <option value="Male">Male (Mr.)</option>
                  <option value="Female">Female (Mrs.)</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)' }}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '6px' }}>
              <FiSave /> Save Profile Settings
            </button>
          </form>
        </div>

        {/* Interface Theme Preferences Card */}
        <div className="chart-card">
          <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            {theme === 'light' ? <FiSun style={{ color: '#F59E0B' }} /> : <FiMoon style={{ color: '#F59E0B' }} />} Interface Theme Preference
          </h3>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Customize your visual workspace interface theme (Light Mode / Dark Mode).
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Active Mode: {theme.toUpperCase()}</span>
            <button className="btn btn-secondary" onClick={toggleTheme} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              {theme === 'light' ? <FiMoon /> : <FiSun />} Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
            </button>
          </div>
        </div>

        {/* Payment Gateway Configuration Card */}
        <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
          <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <span style={{ color: '#10B981' }}>🛡️</span> Payment Gateway Configuration (QR Scanner)
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Set up the QR code image and UPI ID that customers will see during checkout to make payments directly to you.
          </p>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Payment Gateway Settings Saved Successfully!");
            }} 
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>UPI ID / Merchant ID ({DEFAULT_PAYEE_NAME})</label>
                <input
                  type="text"
                  defaultValue={getPaymentUPI()}
                  onChange={(e) => localStorage.setItem("platformUPIId", e.target.value)}
                  placeholder="e.g. yourname@bank"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Upload Custom QR Code</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        localStorage.setItem("platformQRUrl", reader.result);
                        toast.success("QR Code updated! It will now appear on checkout.");
                        // Force a re-render to show the new preview
                        setProfile(prev => ({...prev}));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '6px' }}>
                <FiSave /> Update Payment Settings
              </button>
            </div>

            {/* QR Code Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '15px', color: 'var(--text-muted)' }}>Current QR Code Preview</span>
              <img 
                src={getPaymentQR()} 
                alt="QR Preview" 
                style={{ width: '180px', height: '180px', objectFit: 'contain', borderRadius: '8px', background: '#fff', padding: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }} 
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>Merchant: <strong>{DEFAULT_PAYEE_NAME}</strong></span>
            </div>
          </form>
        </div>

      </div>
    </motion.div>
  );
}

export default Settings;