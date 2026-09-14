import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiShoppingBag,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiShield,
  FiCheckCircle,
  FiAward,
  FiArrowRight,
  FiArrowLeft,
  FiSend,
  FiKey,
  FiCheck,
  FiStar,
  FiZap,
  FiTruck,
  FiCreditCard,
  FiRefreshCw,
  FiBriefcase
} from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./CustomerLogin.css";

function CustomerLogin() {
  const navigate = useNavigate();

  // Current Step in 4-page onboarding: 1 | 2 | 3 | 4
  const [step, setStep] = useState(1);

  // -------------------------------------------------------------
  // Page 1: Personal & Contact Information State
  // -------------------------------------------------------------
  const [customerName, setCustomerName] = useState("Aarav Sharma");
  const [contactInput, setContactInput] = useState("+91 9876543210"); // Single unified input for Mobile or Email

  // Detect whether contactInput is email or mobile number
  const isEmailInput = contactInput.includes("@");

  // -------------------------------------------------------------
  // Page 2: OTP Verification State
  // -------------------------------------------------------------
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // -------------------------------------------------------------
  // Page 3: Address Details State
  // -------------------------------------------------------------
  const [streetAddress, setStreetAddress] = useState("Flat 402, Sunshine Heights, Bandra West");
  const [city, setCity] = useState("Mumbai");
  const [stateName, setStateName] = useState("Maharashtra");
  const [pincode, setPincode] = useState("400050");
  const [country, setCountry] = useState("India");

  // -------------------------------------------------------------
  // Page 4: Membership Tier Selection State (Gold / Platinum / Diamond)
  // -------------------------------------------------------------
  const [membershipTier, setMembershipTier] = useState("Diamond"); // 'Gold' | 'Platinum' | 'Diamond'

  // Membership Definitions
  const membershipPlans = [
    {
      id: "Gold",
      name: "Gold Membership",
      price: "₹0",
      priceNum: 0,
      period: "Free Membership",
      badge: "Free Starter Tier",
      badgeColor: "#F59E0B",
      cashback: "5% Cashback",
      delivery: "Standard Free Delivery (1-2 Days)",
      benefits: [
        "5% Instant Cashback on all orders",
        "Free standard delivery across regions",
        "ShopSense AI Assistant basic access",
        "Verified customer reviews & ratings",
        "Standard customer support"
      ]
    },
    {
      id: "Platinum",
      name: "Platinum Membership",
      price: "₹299",
      priceNum: 299,
      period: "299 Rupees",
      badge: "Popular Value",
      badgeColor: "#818CF8",
      cashback: "10% Cashback",
      delivery: "Priority 4-Hour Express Delivery",
      benefits: [
        "10% Instant Cashback on all orders",
        "Priority 4-hour ultra-fast express delivery",
        "Price Drop Guarantee & Auto-refund difference",
        "Unlimited multilingual video reviews & summaries",
        "Early restock alerts & personalized deals",
        "Priority 24/7 customer chat support"
      ]
    },
    {
      id: "Diamond",
      name: "Diamond Membership",
      price: "₹699",
      priceNum: 699,
      period: "699 Rupees",
      badge: "Full Benefits - Ultimate VIP",
      badgeColor: "#06B6D4",
      cashback: "15% Maximum Cashback",
      delivery: "2-Hour VIP Instant Concierge Delivery",
      benefits: [
        "Full Benefits & VIP privileges included",
        "15% Maximum Instant Cashback on all purchases",
        "2-Hour VIP Instant Concierge Delivery",
        "Zero delivery & convenience fees on all orders",
        "Dedicated 24/7 Autonomous AI Shopping Agent",
        "Exclusive early access to flash sales & launches",
        "1-Click instant returns & dedicated VIP hotline"
      ]
    }
  ];

  // -------------------------------------------------------------
  // Step Handlers & Validations
  // -------------------------------------------------------------

  // Step 1: Validate Basic Info
  const handleProceedToOtp = (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      toast.error("Please enter your Full Name.");
      return;
    }
    if (!contactInput.trim()) {
      toast.error("Please enter your mobile number or email address.");
      return;
    }
    if (isEmailInput) {
      if (!contactInput.includes(".") || contactInput.length < 5) {
        toast.error("Please enter a valid email address.");
        return;
      }
    } else {
      const digits = contactInput.replace(/\D/g, "");
      if (digits.length < 7) {
        toast.error("Please enter a valid mobile number.");
        return;
      }
    }

    setStep(2);
    // Auto-trigger OTP send for smooth onboarding
    if (!otpSent) {
      triggerOtpSend();
    }
  };

  // Trigger OTP Send
  const triggerOtpSend = () => {
    setIsSendingOtp(true);
    setTimeout(() => {
      setIsSendingOtp(false);
      setOtpSent(true);
      setOtpCode("582910"); // Demo OTP
      setCountdown(30);
      toast.info(`Verification code sent to ${contactInput}: 582910`);
    }, 800);
  };

  // Step 2: Validate OTP
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (!otpSent) {
      toast.warning("Please request an OTP first.");
      return;
    }
    if (otpCode !== "582910") {
      toast.error("Invalid OTP code. Please enter 582910 for demo verification.");
      return;
    }

    setIsOtpVerified(true);
    toast.success("Security OTP Verified Successfully! 🎉");
    setTimeout(() => {
      setStep(3);
    }, 400);
  };

  // Step 3: Validate Address
  const handleProceedToMembership = (e) => {
    e.preventDefault();
    if (!streetAddress.trim()) {
      toast.error("Please enter your street / delivery address.");
      return;
    }
    if (!city.trim()) {
      toast.error("Please enter your city.");
      return;
    }
    if (!pincode.trim()) {
      toast.error("Please enter your pincode/zip code.");
      return;
    }

    setStep(4);
  };

  // Step 4: Finalize Registration / Login
  const handleCompleteRegistration = () => {
    const selectedPlan = membershipPlans.find((p) => p.id === membershipTier) || membershipPlans[0];
    const fullAddress = `${streetAddress}, ${city}, ${stateName} - ${pincode}, ${country}`;

    const resolvedEmail = isEmailInput ? contactInput : "aarav@gmail.com";
    const resolvedPhone = !isEmailInput ? contactInput : "+91 9876543210";

    // Save Customer Session to localStorage
    localStorage.setItem("userRole", "customer");
    localStorage.setItem("userName", customerName);
    localStorage.setItem("userEmail", resolvedEmail);
    localStorage.setItem("userPhone", resolvedPhone);
    localStorage.setItem("userContact", contactInput);
    localStorage.setItem("userAddress", fullAddress);
    localStorage.setItem("membershipTier", selectedPlan.id);
    localStorage.setItem("membershipName", selectedPlan.name);
    localStorage.setItem("membershipPrice", selectedPlan.price);
    localStorage.setItem("authSessionActive", "true");
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("customerToken", "token_" + Date.now());

    // Notify application state
    window.dispatchEvent(new Event("roleChanged"));
    window.dispatchEvent(new Event("authChanged"));
    window.dispatchEvent(new Event("storage"));

    toast.success(`Welcome, ${customerName}! Enrolled in ${selectedPlan.name} (${selectedPlan.price}).`);
    setTimeout(() => {
      navigate("/customer/dashboard");
    }, 600);
  };

  return (
    <div className="customer-login-page">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />

      {/* Decorative Animated Glow Elements */}
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />
      <div className="bg-glow bg-glow-3" />

      <div className="customer-onboarding-wrapper">
        {/* Main Brand Header */}
        <header className="onboarding-brand-header">
          <div className="brand-badge">
            <FiShoppingBag /> ShopSense Customer Portal
          </div>
          <h1>Customer Onboarding & Login</h1>
          <p>Complete your 4-step registration to start shopping with AI perks & exclusive rewards</p>
        </header>

        {/* Step Progress Navigation Bar */}
        <div className="stepper-container">
          <div className="stepper-track">
            <div
              className="stepper-progress-fill"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />
          </div>

          <div className="stepper-nodes">
            {[
              { num: 1, label: "Sign In", icon: <FiUser /> },
              { num: 2, label: "OTP Verification", icon: <FiKey /> },
              { num: 3, label: "Address Details", icon: <FiMapPin /> },
              { num: 4, label: "Membership Tier", icon: <FiAward /> }
            ].map((s) => {
              const isCompleted = step > s.num;
              const isActive = step === s.num;

              return (
                <div
                  key={s.num}
                  className={`step-node ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
                  onClick={() => {
                    // Allow navigating back to completed steps
                    if (isCompleted) setStep(s.num);
                  }}
                >
                  <div className="step-icon-circle">
                    {isCompleted ? <FiCheck /> : s.num}
                  </div>
                  <span className="step-title">
                    <span className="step-badge-text">Page {s.num}</span>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card Container for Multi-Step Screens */}
        <div className="onboarding-card">
          <AnimatePresence mode="wait">
            {/* ========================================================= */}
            {/* PAGE 1: SIGN IN OR CREATE ACCOUNT (Name + Mobile or Email) */}
            {/* ========================================================= */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="step-content"
              >
                <div className="step-header">
                  <div className="step-pill">Page 1 of 4</div>
                  <h2>Sign in or create account</h2>
                  <p>Enter your full name and mobile number or email address to continue</p>
                </div>

                <form onSubmit={handleProceedToOtp} className="customer-form">
                  {/* Full Name */}
                  <div className="input-group">
                    <label>
                      <FiUser /> Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aarav Sharma"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>

                  {/* Enter mobile number or email */}
                  <div className="input-group">
                    <label className="primary-contact-label">
                      {isEmailInput ? <FiMail /> : <FiPhone />} Enter mobile number or email *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter mobile number or email"
                      className="contact-unified-input"
                      value={contactInput}
                      onChange={(e) => setContactInput(e.target.value)}
                    />
                    <span className="input-hint-sub">
                      {isEmailInput ? "✓ Email address detected" : "✓ Mobile number detected"}
                    </span>
                  </div>

                  <div className="form-actions-row">
                    <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                      <Link to="/login" className="back-login-link">
                        <FiArrowLeft /> Main Login
                      </Link>
                      <Link to="/vendor/login" className="back-login-link" style={{ color: "#34D399" }}>
                        <FiBriefcase /> I am a Vendor
                      </Link>
                    </div>
                    <button type="submit" className="primary-action-btn">
                      Continue to OTP Verification <FiArrowRight />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ========================================================= */}
            {/* PAGE 2: OTP VERIFICATION                                  */}
            {/* ========================================================= */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="step-content"
              >
                <div className="step-header">
                  <div className="step-pill">Page 2 of 4</div>
                  <h2>🔐 Security OTP Verification</h2>
                  <p>
                    We’ve dispatched a 6-digit verification code to{" "}
                    <strong>{contactInput}</strong>
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="customer-form">
                  <div className="otp-dispatch-card">
                    <div className="otp-dispatch-header">
                      <div className="otp-dest-info">
                        <span className="dest-channel-badge">
                          {isEmailInput ? <FiMail /> : <FiPhone />}{" "}
                          {isEmailInput ? "EMAIL OTP" : "MOBILE OTP"}
                        </span>
                        <span className="dest-value">{contactInput}</span>
                      </div>

                      <button
                        type="button"
                        className="resend-otp-btn"
                        onClick={triggerOtpSend}
                        disabled={isSendingOtp}
                      >
                        <FiRefreshCw className={isSendingOtp ? "spin" : ""} />{" "}
                        {isSendingOtp ? "Sending..." : "Resend OTP"}
                      </button>
                    </div>

                    <div className="otp-input-wrapper">
                      <label>
                        <FiKey /> Enter 6-Digit Verification Code *
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        placeholder="5 8 2 9 1 0"
                        className="otp-code-input"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                      />
                    </div>

                    <div className="demo-otp-helper">
                      <span className="demo-tag">DEMO OTP</span>
                      <span>Default test code is <strong>582910</strong></span>
                      <button
                        type="button"
                        className="autofill-btn"
                        onClick={() => {
                          setOtpSent(true);
                          setOtpCode("582910");
                          toast.info("Auto-filled demo OTP: 582910");
                        }}
                      >
                        Auto-Fill OTP
                      </button>
                    </div>
                  </div>

                  <div className="form-actions-row">
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => setStep(1)}
                    >
                      <FiArrowLeft /> Edit Mobile / Email
                    </button>
                    <button type="submit" className="primary-action-btn">
                      Verify & Continue to Address <FiArrowRight />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ========================================================= */}
            {/* PAGE 3: ADDRESS DETAILS                                   */}
            {/* ========================================================= */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="step-content"
              >
                <div className="step-header">
                  <div className="step-pill">Page 3 of 4</div>
                  <h2>📍 Shipping & Delivery Address</h2>
                  <p>Provide your delivery location for automatic order fulfillment and accurate delivery estimates</p>
                </div>

                <form onSubmit={handleProceedToMembership} className="customer-form">
                  {/* Street Address */}
                  <div className="input-group">
                    <label>
                      <FiMapPin /> Street Address / Flat / Building *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Flat 402, Sunshine Heights, Bandra West"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                    />
                  </div>

                  {/* City & State */}
                  <div className="input-row">
                    <div className="input-group">
                      <label>City *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Mumbai"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                    <div className="input-group">
                      <label>State / Province *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Maharashtra"
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Pincode & Country */}
                  <div className="input-row">
                    <div className="input-group">
                      <label>Pincode / Postal Code *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 400050"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                      />
                    </div>
                    <div className="input-group">
                      <label>Country *</label>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="custom-select-input"
                      >
                        <option value="India">India</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                        <option value="Singapore">Singapore</option>
                        <option value="UAE">UAE</option>
                        <option value="Germany">Germany</option>
                      </select>
                    </div>
                  </div>

                  {/* Address Preview Summary */}
                  <div className="address-preview-box">
                    <FiTruck className="preview-truck-icon" />
                    <div>
                      <strong>Delivering to:</strong>
                      <p>{streetAddress}, {city}, {stateName} - {pincode}, {country}</p>
                    </div>
                  </div>

                  <div className="form-actions-row">
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => setStep(2)}
                    >
                      <FiArrowLeft /> Back to OTP
                    </button>
                    <button type="submit" className="primary-action-btn">
                      Continue to Membership Tier <FiArrowRight />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ========================================================= */}
            {/* PAGE 4: MEMBERSHIP SELECTION (Gold, Platinum, Diamond)     */}
            {/* ========================================================= */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="step-content membership-step"
              >
                <div className="step-header">
                  <div className="step-pill">Page 4 of 4 (Final Step)</div>
                  <h2>💎 Select Your Customer Membership Tier</h2>
                  <p>Choose between our 3 curated plans to activate your perks, cashback rate, and AI shopping agent privileges</p>
                </div>

                {/* Membership Pricing Cards Grid */}
                <div className="membership-cards-grid">
                  {membershipPlans.map((plan) => {
                    const isSelected = membershipTier === plan.id;

                    return (
                      <div
                        key={plan.id}
                        className={`membership-card tier-${plan.id.toLowerCase()} ${isSelected ? "selected" : ""}`}
                        onClick={() => setMembershipTier(plan.id)}
                      >
                        {/* Selected Indicator Ribbon */}
                        {isSelected && (
                          <div className="selected-ribbon">
                            <FiCheckCircle /> Selected Plan
                          </div>
                        )}

                        <div className="plan-header">
                          <span
                            className="plan-badge"
                            style={{
                              backgroundColor: `${plan.badgeColor}22`,
                              color: plan.badgeColor,
                              borderColor: `${plan.badgeColor}55`
                            }}
                          >
                            {plan.badge}
                          </span>

                          <h3 className="plan-title">{plan.name}</h3>

                          <div className="plan-pricing">
                            <span className="price-val">{plan.price}</span>
                            <span className="price-period">{plan.period}</span>
                          </div>
                        </div>

                        <div className="plan-perks-summary">
                          <div className="perk-highlight">
                            <FiZap className="perk-icon" />
                            <span><strong>{plan.cashback}</strong> on all items</span>
                          </div>
                          <div className="perk-highlight">
                            <FiTruck className="perk-icon" />
                            <span>{plan.delivery}</span>
                          </div>
                        </div>

                        <div className="plan-benefits-divider" />

                        <ul className="plan-benefits-list">
                          {plan.benefits.map((b, idx) => (
                            <li key={idx}>
                              <FiCheck className="benefit-check" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>

                        <button
                          type="button"
                          className={`plan-select-btn ${isSelected ? "active" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setMembershipTier(plan.id);
                          }}
                        >
                          {isSelected ? (
                            <>
                              <FiCheckCircle /> Enrolled in {plan.id}
                            </>
                          ) : (
                            `Choose ${plan.name} (${plan.price})`
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Active Membership Summary Banner */}
                <div className="membership-confirmation-bar">
                  <div className="confirmation-left">
                    <FiAward className="confirmation-icon" />
                    <div>
                      <div className="conf-title">
                        Enrolling in: <strong>{membershipPlans.find((p) => p.id === membershipTier)?.name}</strong>
                      </div>
                      <div className="conf-sub">
                        Price: <strong>{membershipPlans.find((p) => p.id === membershipTier)?.price}</strong> ({membershipPlans.find((p) => p.id === membershipTier)?.period}) • Contact: {contactInput}
                      </div>
                    </div>
                  </div>

                  <div className="confirmation-actions">
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => setStep(3)}
                    >
                      <FiArrowLeft /> Back to Address
                    </button>
                    <button
                      type="button"
                      className="finish-onboarding-btn"
                      onClick={handleCompleteRegistration}
                    >
                      Complete Onboarding & Access Dashboard <FiArrowRight />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default CustomerLogin;
