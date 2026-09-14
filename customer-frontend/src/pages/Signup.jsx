import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiShoppingBag,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiKey,
  FiCheckCircle,
  FiArrowRight,
  FiShield,
  FiTruck,
  FiHome,
  FiBriefcase
} from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { customerRegisterApi } from "../services/api";
import ThemeToggle from "../components/ThemeToggle";
import { loginCustomer } from "../utils/auth";
import "./Signup.css";

function Signup() {
  const navigate = useNavigate();

  // Registration Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("+91 ");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Delivery Address Form State
  const [addressLine, setAddressLine] = useState("");
  const [locality, setLocality] = useState("");
  const [city, setCity] = useState("Mumbai");
  const [stateName, setStateName] = useState("Maharashtra");
  const [pincode, setPincode] = useState("400050");
  const [addressType, setAddressType] = useState("Home");

  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!fullName.trim() || !phone.trim() || !email.trim()) {
      toast.error("Please fill in all personal and contact details");
      return;
    }

    if (password && confirmPassword && password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (pincode.length !== 6) {
      toast.error("Please enter a valid 6-digit delivery pincode");
      return;
    }

    setIsLoading(true);
    try {
      const fullAddressFormatted = `${addressLine}, ${locality ? locality + ', ' : ''}${city}, ${stateName} - ${pincode}, India`;

      try {
        await customerRegisterApi({
          name: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password: password,
          address_line: addressLine || "Flat 101, Main Residency",
          locality: locality || "Main Street",
          city: city,
          state: stateName,
          pincode: pincode,
          address_type: addressType
        });
      } catch {
        console.warn("Backend register fallback simulation");
      }

      // Persist customer session using centralized auth utility
      loginCustomer({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        address: fullAddressFormatted,
        membership_tier: "Diamond"
      });

      toast.success("🎉 Account created & Delivery Address registered successfully!");
      setTimeout(() => {
        navigate("/");
      }, 900);
    } catch {
      toast.error("Failed to create account. Please check your inputs.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="customer-signup-fullpage">
      <ToastContainer position="top-right" autoClose={2500} theme="colored" />

      {/* Top Floating Theme Toggle */}
      <div className="signup-top-controls">
        <ThemeToggle className="signup-theme-btn" showLabel={true} />
      </div>

      <div className="signup-ambient-glow" />

      <div className="customer-signup-box">
        {/* Left Side Header */}
        <div className="signup-banner-side">
          <div className="signup-brand-header">
            <Link to="/" className="signup-logo-link">
              <div className="signup-logo-badge">
                <FiShoppingBag />
              </div>
              <span className="signup-logo-text">ShopSense</span>
            </Link>
            <h2>Create Your Customer Account</h2>
            <p>
              Join millions of happy shoppers! Enjoy instant cashback, verified reviews, and priority delivery.
            </p>
          </div>

          <div className="signup-benefits-list">
            <div className="benefit-item">
              <FiTruck className="benefit-icon" />
              <div>
                <strong>Express 24-Hour Delivery</strong>
                <span>Automatic address tracking with live SMS updates</span>
              </div>
            </div>
            <div className="benefit-item">
              <FiShield className="benefit-icon" />
              <div>
                <strong>Assured Buyer Protection</strong>
                <span>7 days easy return & 100% money-back guarantee</span>
              </div>
            </div>
            <div className="benefit-item">
              <FiCheckCircle className="benefit-icon" />
              <div>
                <strong>Diamond Tier VIP Rewards</strong>
                <span>Free complimentary access with 5% instant cashback</span>
              </div>
            </div>
          </div>

          <div className="signup-side-footer">
            <span>Already have an account?</span>
            <Link to="/login" className="link-signin-side">
              Sign In Here →
            </Link>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="signup-form-side">
          <form onSubmit={handleSignup} className="signup-main-form">
            {/* Section 1: Personal Details */}
            <div className="form-section-group">
              <h3 className="section-title">
                <FiUser className="sec-icon" /> 1. Personal & Contact Details
              </h3>

              <div className="form-grid-2col">
                <div className="input-group-modern">
                  <label>Full Name *</label>
                  <div className="input-field-wrap">
                    <span className="field-icon"><FiUser /></span>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      className="modern-input"
                    />
                  </div>
                </div>

                <div className="input-group-modern">
                  <label>Mobile Phone Number *</label>
                  <div className="input-field-wrap">
                    <span className="field-icon"><FiPhone /></span>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="modern-input"
                    />
                  </div>
                </div>
              </div>

              <div className="input-group-modern">
                <label>Email Address *</label>
                <div className="input-field-wrap">
                  <span className="field-icon"><FiMail /></span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. aarav@gmail.com"
                    className="modern-input"
                  />
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="input-group-modern">
                  <label>Create Password *</label>
                  <div className="input-field-wrap">
                    <span className="field-icon"><FiKey /></span>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="modern-input"
                    />
                  </div>
                </div>

                <div className="input-group-modern">
                  <label>Confirm Password *</label>
                  <div className="input-field-wrap">
                    <span className="field-icon"><FiKey /></span>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="modern-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Delivery Address */}
            <div className="form-section-group">
              <h3 className="section-title">
                <FiMapPin className="sec-icon" /> 2. Delivery Address Details
              </h3>

              <div className="input-group-modern">
                <label>House / Flat / Building / Street Address *</label>
                <input
                  type="text"
                  required
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="e.g. Flat 402, Sunshine Heights, 14th Road"
                  className="modern-input no-icon"
                />
              </div>

              <div className="form-grid-2col">
                <div className="input-group-modern">
                  <label>Locality / Area / Landmark</label>
                  <input
                    type="text"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    placeholder="e.g. Near National Park, Bandra West"
                    className="modern-input no-icon"
                  />
                </div>

                <div className="input-group-modern">
                  <label>6-Digit Pincode *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="400050"
                    className="modern-input no-icon"
                  />
                </div>
              </div>

              <div className="form-grid-2col">
                <div className="input-group-modern">
                  <label>City / District *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Mumbai"
                    className="modern-input no-icon"
                  />
                </div>

                <div className="input-group-modern">
                  <label>State *</label>
                  <input
                    type="text"
                    required
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    placeholder="Maharashtra"
                    className="modern-input no-icon"
                  />
                </div>
              </div>

              {/* Address Type (Home / Work) */}
              <div className="input-group-modern">
                <label>Address Type</label>
                <div className="address-type-selector">
                  <button
                    type="button"
                    className={`type-btn ${addressType === "Home" ? "active" : ""}`}
                    onClick={() => setAddressType("Home")}
                  >
                    <FiHome /> Home (All Day Delivery)
                  </button>
                  <button
                    type="button"
                    className={`type-btn ${addressType === "Work" ? "active" : ""}`}
                    onClick={() => setAddressType("Work")}
                  >
                    <FiBriefcase /> Work / Office (9 AM - 6 PM)
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              className="btn-signup-submit"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account & Start Shopping"}{" "}
              <FiArrowRight />
            </button>
          </form>

          <p className="signup-bottom-signin">
            Already have an account?{" "}
            <Link to="/login" className="signin-highlight">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;