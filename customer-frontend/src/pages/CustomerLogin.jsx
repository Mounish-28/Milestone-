import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiShoppingBag,
  FiMail,
  FiPhone,
  FiShield,
  FiCheckCircle,
  FiArrowRight,
  FiArrowLeft,
  FiKey,
  FiStar,
  FiZap,
  FiTruck,
  FiRefreshCw,
  FiUserPlus,
  FiUser
} from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { customerSendOtpApi, customerVerifyOtpApi } from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import ThemeToggle from "../components/ThemeToggle";
import { loginCustomer } from "../utils/auth";
import "./CustomerLogin.css";

const LANGUAGES = [
  "English", "Hindi (हिंदी)", "Telugu (తెలుగు)", "Tamil (தமிழ்)", 
  "Malayalam (മലയാളം)", "Kannada (ಕನ್ನಡ)", "Marathi (मराठी)", 
  "Bengali (বাংলা)", "Gujarati (ગુજરાતી)"
];

function CustomerLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage } = useLanguage();

  // Login Mode: 'otp' | 'password'
  const [loginMode, setLoginMode] = useState("otp");

  // Step 1: Enter Phone / Email | Step 2: Enter OTP
  const [loginStep, setLoginStep] = useState(1);

  // Form Fields
  const [contactInput, setContactInput] = useState("+91 9876543210");
  const [userNameInput, setUserNameInput] = useState("Aarav Sharma");
  const [passwordInput, setPasswordInput] = useState("");
  const [otpCode, setOtpCode] = useState("");

  // UI & Timer States
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [demoOtp, setDemoOtp] = useState("582910");

  const isEmail = contactInput.includes("@");

  // Countdown timer for OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // Request OTP
  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    if (!contactInput.trim()) {
      toast.error("Please enter a valid Mobile Number or Email Address");
      return;
    }

    setIsLoading(true);
    try {
      const res = await customerSendOtpApi({
        contact: contactInput.trim(),
        channel: isEmail ? "email" : "phone"
      });
      const generatedOtp = res.otp || "582910";
      setDemoOtp(generatedOtp);
      setLoginStep(2);
      setCountdown(60);
      toast.success(`📲 6-digit OTP dispatched to ${contactInput}`);
    } catch {
      // Offline / fallback demo simulation
      setDemoOtp("582910");
      setLoginStep(2);
      setCountdown(60);
      toast.info(`Demo Mode: OTP is 582910`);
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP & Sign In
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    if (!otpCode || otpCode.length < 4) {
      toast.error("Please enter the complete 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      let customerData = null;
      try {
        const res = await customerVerifyOtpApi({
          contact: contactInput.trim(),
          otp_code: otpCode.trim(),
          name: userNameInput
        });
        customerData = res.customer;
      } catch {
        // Fallback demo user
        customerData = {
          name: userNameInput || (isEmail ? contactInput.split("@")[0].title() : "Aarav Sharma"),
          email: isEmail ? contactInput : "aarav@gmail.com",
          phone: !isEmail ? contactInput : "+91 9876543210",
          city: "Mumbai",
          country: "India",
          membership_tier: "Diamond"
        };
      }

      // Persist customer session using centralized auth utility
      loginCustomer(customerData);

      toast.success(`🎉 Welcome back, ${customerData.name}!`);
      setTimeout(() => {
        const destination = location.state?.from || "/";
        navigate(destination);
      }, 700);
    } catch {
      toast.error("Invalid verification code. Please check again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fill demo OTP for convenience
  const handleAutoFillOtp = () => {
    setOtpCode(demoOtp);
    toast.info(`Auto-filled OTP: ${demoOtp}`);
  };

  // 1-Click Instant Demo Login
  const handleDemoLogin = () => {
    loginCustomer({
      id: 1,
      name: "Aarav Sharma",
      email: "aarav@gmail.com",
      phone: "+91 9876543210",
      address: "Flat 402, Sunshine Heights, Mumbai - 400050",
      membership_tier: "Diamond"
    });
    toast.success("🎉 Logged in as Demo Customer (Aarav Sharma)!");
    setTimeout(() => {
      const destination = location.state?.from || "/";
      navigate(destination);
    }, 500);
  };

  // Password Login Fallback
  const handlePasswordLogin = (e) => {
    e.preventDefault();
    if (!contactInput.trim() || !passwordInput.trim()) {
      toast.error("Please enter both contact and password");
      return;
    }

    const name = userNameInput || (isEmail ? contactInput.split("@")[0].title() : "Aarav Sharma");
    loginCustomer({
      id: 1,
      name: name,
      email: isEmail ? contactInput : "aarav@gmail.com",
      phone: !isEmail ? contactInput : "+91 9876543210",
      membership_tier: "Diamond"
    });

    toast.success(`🎉 Welcome back, ${name}!`);
    setTimeout(() => {
      navigate("/");
    }, 700);
  };

  return (
    <div className="customer-login-fullpage">
      <ToastContainer position="top-right" autoClose={2500} theme="colored" />

      {/* Background ambient lighting */}
      <div className="login-ambient-glow" />

      {/* Floating Theme Toggle & Language Selector */}
      <div className="login-top-controls">
        <ThemeToggle className="login-theme-btn" showLabel={true} />
        <div className="login-language-selector">
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="language-dropdown"
          >
            {LANGUAGES.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="customer-login-box">
        {/* Left Brand Panel (Flipkart / Amazon style) */}
        <div className="login-banner-side">
          <div className="banner-top">
            <Link to="/" className="login-logo-link">
              <div className="logo-badge">
                <FiShoppingBag />
              </div>
              <span className="logo-text">ShopSense</span>
            </Link>
            <h2>Customer Login</h2>
            <p>Get access to your Orders, Wishlist, Personalized AI Recommendations & VIP Deals.</p>
          </div>

          <div className="banner-perks-list">
            <div className="banner-perk">
              <FiTruck className="perk-icon" />
              <div>
                <strong>Express Free Delivery</strong>
                <span>Instant dispatch across 25,000+ pincodes</span>
              </div>
            </div>
            <div className="banner-perk">
              <FiZap className="perk-icon gold" />
              <div>
                <strong>AI Autonomous Shopping</strong>
                <span>Voice search, comparison & sentiment analysis</span>
              </div>
            </div>
            <div className="banner-perk">
              <FiShield className="perk-icon green" />
              <div>
                <strong>100% Secure Checkout</strong>
                <span>UPI, Cards, NetBanking & Cash on Delivery</span>
              </div>
            </div>
          </div>

          <div className="banner-bottom-note">
            <span>By continuing, you agree to ShopSense Terms & Privacy Policy</span>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="login-form-side">
          {/* Step 1: Contact Identifier */}
          {loginStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="login-step-card"
            >
              <div className="form-header">
                <h3>Sign in to your account</h3>
                <p>Enter your Mobile Phone number or Email ID to receive an OTP</p>
              </div>

              {/* Login Method Toggle */}
              <div className="login-method-toggle">
                <button
                  type="button"
                  className={`method-btn ${loginMode === "otp" ? "active" : ""}`}
                  onClick={() => setLoginMode("otp")}
                >
                  <FiPhone /> Login with OTP
                </button>
                <button
                  type="button"
                  className={`method-btn ${loginMode === "password" ? "active" : ""}`}
                  onClick={() => setLoginMode("password")}
                >
                  <FiKey /> Password / PIN
                </button>
              </div>

              {loginMode === "otp" ? (
                <form onSubmit={handleRequestOtp} className="login-actual-form">
                  <div className="input-group-modern">
                    <label>Mobile Number or Email ID</label>
                    <div className="input-field-wrap">
                      <span className="field-icon">
                        {isEmail ? <FiMail /> : <FiPhone />}
                      </span>
                      <input
                        type="text"
                        required
                        value={contactInput}
                        onChange={(e) => setContactInput(e.target.value)}
                        placeholder="e.g. +91 9876543210 or user@example.com"
                        className="modern-input"
                        autoFocus
                      />
                    </div>
                    <span className="input-hint">
                      We'll send a 6-digit OTP code to verify your account
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="btn-continue-submit"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending OTP..." : "Request OTP"}{" "}
                    <FiArrowRight />
                  </button>
                </form>
              ) : (
                <form onSubmit={handlePasswordLogin} className="login-actual-form">
                  <div className="input-group-modern">
                    <label>Mobile Number or Email ID</label>
                    <div className="input-field-wrap">
                      <span className="field-icon"><FiMail /></span>
                      <input
                        type="text"
                        required
                        value={contactInput}
                        onChange={(e) => setContactInput(e.target.value)}
                        placeholder="e.g. +91 9876543210 or user@gmail.com"
                        className="modern-input"
                      />
                    </div>
                  </div>

                  <div className="input-group-modern">
                    <label>Password or Security PIN</label>
                    <div className="input-field-wrap">
                      <span className="field-icon"><FiKey /></span>
                      <input
                        type="password"
                        required
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="••••••••"
                        className="modern-input"
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-continue-submit">
                    Sign In <FiArrowRight />
                  </button>
                </form>
              )}

              {/* 1-Click Instant Demo Login */}
              <div className="demo-login-box">
                <div className="demo-login-divider">
                  <span>Fast Testing</span>
                </div>
                <button
                  type="button"
                  className="btn-quick-demo-login"
                  onClick={handleDemoLogin}
                >
                  <FiZap className="demo-zap-icon" /> Instant Demo Sign In (Aarav Sharma)
                </button>
              </div>

              {/* Prominent Option: I DON'T HAVE AN ACCOUNT */}
              <div className="no-account-card">
                <div className="no-account-divider">
                  <span>New to ShopSense?</span>
                </div>
                <Link to="/signup" className="btn-create-new-account">
                  <FiUserPlus className="create-icon" /> I don't have an account — Sign Up
                </Link>
              </div>
            </motion.div>
          )}

          {/* Step 2: OTP Verification */}
          {loginStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="login-step-card"
            >
              <button
                type="button"
                className="btn-back-step"
                onClick={() => setLoginStep(1)}
              >
                <FiArrowLeft /> Change Phone / Email
              </button>

              <div className="form-header">
                <h3>Verify OTP Code</h3>
                <p>
                  Enter the 6-digit code dispatched to <strong>{contactInput}</strong>
                </p>
              </div>

              {/* Demo Helper Banner with 1-Click Auto Fill */}
              <div className="demo-otp-banner">
                <div className="demo-otp-text">
                  <FiShield className="shield-icon" />
                  <span>
                    Verification Code: <strong className="otp-highlight">{demoOtp}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  className="btn-autofill-otp"
                  onClick={handleAutoFillOtp}
                >
                  Auto-fill OTP
                </button>
              </div>

              <form onSubmit={handleVerifyOtp} className="login-actual-form">
                <div className="input-group-modern">
                  <label>Enter 6-Digit Verification Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="582910"
                    className="modern-otp-input"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  className="btn-continue-submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Verifying..." : "Verify & Sign In"}{" "}
                  <FiCheckCircle />
                </button>

                {/* Resend OTP */}
                <div className="resend-otp-row">
                  {countdown > 0 ? (
                    <span className="timer-text">
                      Resend OTP in <strong>{countdown}s</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="btn-resend-link"
                      onClick={handleRequestOtp}
                    >
                      <FiRefreshCw /> Resend OTP
                    </button>
                  )}
                </div>
              </form>

              {/* Prominent Option: I DON'T HAVE AN ACCOUNT */}
              <div className="no-account-card">
                <div className="no-account-divider">
                  <span>New Customer?</span>
                </div>
                <Link to="/signup" className="btn-create-new-account">
                  <FiUserPlus /> I don't have an account
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomerLogin;
