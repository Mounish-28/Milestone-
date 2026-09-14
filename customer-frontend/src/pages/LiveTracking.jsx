import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiTruck,
  FiMapPin,
  FiCheckCircle,
  FiClock,
  FiPackage,
  FiPhone,
  FiPhoneCall,
  FiX,
  FiShare2,
  FiNavigation,
  FiRefreshCw,
  FiShield,
  FiChevronLeft,
  FiSearch,
  FiCopy,
  FiCheck,
  FiActivity,
  FiPlay,
  FiPause,
  FiAlertCircle,
  FiArrowRight
} from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CustomerHeader from "../components/CustomerHeader";
import { getOrderTracking, advanceOrderTracking, getTransactions } from "../services/api";
import { getProductImage, getProductSource } from "../utils/productImages";
import "./LiveTracking.css";

function LiveTracking() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Target Order Reference
  const activeOrderRef = orderId || searchParams.get("ref") || "TXN-DEMO88";

  // Data states
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStage, setCurrentStage] = useState(4); // Default to live Out for Delivery
  const [isSimulating, setIsSimulating] = useState(true); // Auto-simulate live courier movement
  const [courierProgress, setCourierProgress] = useState(0.68); // 0.0 to 1.0 along route
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedOtp, setCopiedOtp] = useState(false);

  // Phone Call Modal state
  const [isCallingCourier, setIsCallingCourier] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Live ETA countdown state (seconds remaining)
  const [secondsRemaining, setSecondsRemaining] = useState(870); // ~14m 30s

  // Fetch Tracking Data
  const loadTracking = async (ref) => {
    setLoading(true);
    try {
      const data = await getOrderTracking(ref);
      if (data) {
        setTrackingData(data);
        setCurrentStage(data.current_stage || 4);
        if (data.current_stage === 5) {
          setCourierProgress(1.0);
          setSecondsRemaining(0);
        } else if (data.current_stage === 4) {
          setCourierProgress(0.68);
          setSecondsRemaining(870);
        } else if (data.current_stage === 3) {
          setCourierProgress(0.25);
          setSecondsRemaining(1800);
        } else {
          setCourierProgress(0.05);
          setSecondsRemaining(2700);
        }
      }
    } catch (err) {
      console.warn("Using offline demo fallback for live tracking", err);
      // Construct rich fallback tracking
      setTrackingData(getFallbackTracking(ref));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTracking(activeOrderRef);
  }, [activeOrderRef]);

  // Live countdown timer
  useEffect(() => {
    if (currentStage === 5) return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [currentStage]);

  // Auto-simulation timer: smoothly moves courier and triggers events
  useEffect(() => {
    if (!isSimulating || currentStage === 5) return;

    const simInterval = setInterval(() => {
      setCourierProgress((prev) => {
        if (prev >= 0.98) {
          // Reached destination! Transition to Delivered
          setCurrentStage(5);
          toast.success("🎉 Courier has arrived at your doorstep! Ready for OTP handover.");
          return 1.0;
        }
        return Math.min(1.0, prev + 0.015);
      });
    }, 2000);

    return () => clearInterval(simInterval);
  }, [isSimulating, currentStage]);

  // Call duration timer
  useEffect(() => {
    let callTimer;
    if (isCallingCourier) {
      callTimer = setInterval(() => setCallDuration((d) => d + 1), 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(callTimer);
  }, [isCallingCourier]);

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s < 10 ? "0" : ""}${s}s`;
  };

  // Handle stage change manually
  const handleStageSelect = async (stageNum) => {
    setCurrentStage(stageNum);
    if (stageNum === 1) {
      setCourierProgress(0.02);
      setSecondsRemaining(2700);
    } else if (stageNum === 2) {
      setCourierProgress(0.12);
      setSecondsRemaining(2200);
    } else if (stageNum === 3) {
      setCourierProgress(0.35);
      setSecondsRemaining(1500);
    } else if (stageNum === 4) {
      setCourierProgress(0.68);
      setSecondsRemaining(870);
    } else if (stageNum === 5) {
      setCourierProgress(1.0);
      setSecondsRemaining(0);
      toast.success("Order marked as Delivered & Verified with OTP!");
    }

    try {
      await advanceOrderTracking(activeOrderRef, stageNum);
    } catch {
      // Offline fallback
    }
  };

  const handleCopyOtp = () => {
    const otpCode = trackingData?.otp || "7492";
    navigator.clipboard.writeText(otpCode);
    setCopiedOtp(true);
    toast.info("Secure Delivery OTP copied to clipboard");
    setTimeout(() => setCopiedOtp(false), 2500);
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Live tracking link copied to clipboard!");
  };

  const handleTrackOther = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/track/${searchQuery.trim().toUpperCase()}`);
  };

  // S-Curve waypoint interpolation for smooth animated courier coordinate on SVG Map
  // Path points: BKC Hub (80, 280) -> Kalanagar (180, 240) -> Highway (310, 220) -> Bandra Station (430, 160) -> Hill Rd (550, 120) -> Destination (680, 110)
  const mapPathCoords = useMemo(() => {
    return [
      { x: 80, y: 280, label: "BKC Hub" },
      { x: 180, y: 230, label: "Kalanagar Junction" },
      { x: 300, y: 220, label: "Western Express Hwy" },
      { x: 420, y: 160, label: "Bandra Station Flyover" },
      { x: 540, y: 130, label: "Hill Road Junction" },
      { x: 680, y: 110, label: "Customer Delivery Address" }
    ];
  }, []);

  // Compute exact animated (x, y) coordinates of courier vehicle along mapPathCoords
  const courierCurrentPos = useMemo(() => {
    const totalSegments = mapPathCoords.length - 1;
    const scaledProgress = courierProgress * totalSegments;
    const segIndex = Math.min(Math.floor(scaledProgress), totalSegments - 1);
    const segT = scaledProgress - segIndex;

    const p0 = mapPathCoords[segIndex];
    const p1 = mapPathCoords[segIndex + 1];

    const currentX = p0.x + (p1.x - p0.x) * segT;
    const currentY = p0.y + (p1.y - p0.y) * segT;

    return { x: currentX, y: currentY };
  }, [courierProgress, mapPathCoords]);

  const product = trackingData ? {
    id: 1,
    name: trackingData.product_name,
    image_url: trackingData.product_image,
    price: trackingData.amount
  } : null;

  const sourceBadge = product ? getProductSource(product) : { label: "Amazon Verified", icon: "📦", color: "#FF9900", bg: "rgba(255, 153, 0, 0.12)" };

  return (
    <div className="live-tracking-page">
      <ToastContainer position="top-right" autoClose={2500} theme="colored" />
      <CustomerHeader />

      <div className="tracking-container">
        {/* Top Breadcrumb & Navigation Bar */}
        <div className="tracking-top-bar">
          <div className="top-bar-left">
            <Link to="/settings?tab=orders" className="back-to-orders-btn">
              <FiChevronLeft /> Back to My Orders
            </Link>
            <div className="tracking-order-id-badge">
              <span className="live-pulse-dot" />
              <span>LIVE TRACKING • {activeOrderRef}</span>
            </div>
          </div>

          {/* Quick Search other Order */}
          <form className="quick-track-form" onSubmit={handleTrackOther}>
            <FiSearch className="track-search-icon" />
            <input
              type="text"
              placeholder="Track another Order ID (e.g. TXN-1234)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit">Track</button>
          </form>
        </div>

        {/* Live Simulation Controls Bar */}
        <div className="simulation-control-bar">
          <div className="sim-status-col">
            <span className="sim-badge">
              <FiActivity className="sim-icon animate-pulse" /> LIVE TELEMETRY SIMULATOR
            </span>
            <span className="sim-desc">
              Courier GPS is broadcasting real-time location. Test stages or toggle auto-simulation below:
            </span>
          </div>

          <div className="sim-actions-col">
            <button
              className={`sim-toggle-btn ${isSimulating ? "active" : ""}`}
              onClick={() => setIsSimulating(!isSimulating)}
              title={isSimulating ? "Pause live simulation" : "Start live simulation"}
            >
              {isSimulating ? <><FiPause /> Pause Auto-Drive</> : <><FiPlay /> Auto-Drive Vehicle</>}
            </button>

            <div className="stage-quick-jumper">
              <span className="jumper-label">Jump Stage:</span>
              {[1, 2, 3, 4, 5].map((st) => (
                <button
                  key={st}
                  type="button"
                  className={`jump-btn ${currentStage === st ? "selected" : ""}`}
                  onClick={() => handleStageSelect(st)}
                >
                  {st === 1 ? "1. Placed" : st === 2 ? "2. Packed" : st === 3 ? "3. Dispatched" : st === 4 ? "4. Out" : "5. Done"}
                </button>
              ))}
            </div>

            <button className="share-btn-secondary" onClick={handleShareLink} title="Share Live Tracking">
              <FiShare2 /> Share
            </button>
          </div>
        </div>

        {/* Main 2-Column Live Tracking Layout */}
        <div className="tracking-grid-layout">
          {/* ============================================================ */}
          {/* LEFT COLUMN: INTERACTIVE LIVE RADAR GPS MAP & SPEEDOMETER     */}
          {/* ============================================================ */}
          <div className="tracking-map-column">
            <div className="map-card-container">
              {/* Map Header Overlay */}
              <div className="map-telemetry-header">
                <div className="telemetry-live-badge">
                  <span className="radar-blip" />
                  <div>
                    <strong>REAL-TIME GPS ROUTE</strong>
                    <span>En Route to Bandra West</span>
                  </div>
                </div>

                <div className="telemetry-stats-row">
                  <div className="telemetry-stat">
                    <span className="stat-label">Estimated Arrival</span>
                    <strong className="stat-value highlight-cyan">
                      {currentStage === 5 ? "Delivered" : formatTime(secondsRemaining)}
                    </strong>
                  </div>
                  <div className="telemetry-stat">
                    <span className="stat-label">Remaining Distance</span>
                    <strong className="stat-value">
                      {currentStage === 5 ? "0.0 km" : `${(1.8 * (1 - courierProgress * 0.5)).toFixed(1)} km`}
                    </strong>
                  </div>
                  <div className="telemetry-stat">
                    <span className="stat-label">Vehicle Speed</span>
                    <strong className="stat-value">
                      {currentStage === 5 ? "0 km/h" : isSimulating ? "28 km/h" : "0 km/h (Stopped)"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Vector Simulated Radar Map (SVG) */}
              <div className="interactive-svg-map-wrapper">
                <svg
                  viewBox="0 0 760 380"
                  className="live-gps-svg"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <defs>
                    {/* Grid Background Pattern */}
                    <pattern id="radarGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(56, 189, 248, 0.07)" strokeWidth="1" />
                    </pattern>

                    {/* Glowing Route Gradient */}
                    <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#2563EB" />
                      <stop offset="50%" stopColor="#06B6D4" />
                      <stop offset="100%" stopColor="#10B981" />
                    </linearGradient>

                    {/* Filter for Glowing Line */}
                    <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Grid Plane */}
                  <rect width="760" height="380" fill="url(#radarGrid)" />

                  {/* Simulated City Terrain Roads */}
                  <path
                    d="M 20 180 Q 200 210 400 130 T 740 100"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="14"
                    fill="none"
                  />
                  <path
                    d="M 120 360 Q 250 200 350 180 T 600 40"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="12"
                    fill="none"
                  />
                  <path
                    d="M 50 80 Q 300 90 500 260 T 720 320"
                    stroke="rgba(255,255,255,0.04)"
                    strokeWidth="8"
                    fill="none"
                  />

                  {/* Delivery Route Baseline Shadow */}
                  <path
                    d="M 80 280 C 180 230, 300 220, 420 160 S 540 130, 680 110"
                    stroke="rgba(37, 99, 235, 0.25)"
                    strokeWidth="10"
                    fill="none"
                    strokeLinecap="round"
                  />

                  {/* Active Neon Delivery Route Path */}
                  <path
                    id="deliveryRoutePath"
                    d="M 80 280 C 180 230, 300 220, 420 160 S 540 130, 680 110"
                    stroke="url(#routeGradient)"
                    strokeWidth="5"
                    fill="none"
                    strokeLinecap="round"
                    filter="url(#glowEffect)"
                  />

                  {/* Dashed Animated Pulse Line */}
                  <path
                    d="M 80 280 C 180 230, 300 220, 420 160 S 540 130, 680 110"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    strokeDasharray="8 8"
                    className="animated-dash-flow"
                    fill="none"
                  />

                  {/* Waypoint Pins along the road */}
                  {mapPathCoords.map((pt, i) => (
                    <g key={i}>
                      <circle cx={pt.x} cy={pt.y} r="5" fill="rgba(6, 182, 212, 0.4)" />
                      <circle cx={pt.x} cy={pt.y} r="2.5" fill="#38BDF8" />
                    </g>
                  ))}

                  {/* Point 1: Fulfillment Hub Marker */}
                  <g transform="translate(80, 280)">
                    <circle r="18" fill="rgba(37, 99, 235, 0.2)" className="pulse-circle" />
                    <circle r="10" fill="#2563EB" />
                    <circle r="4" fill="#FFFFFF" />
                    <rect x="-45" y="-36" width="90" height="20" rx="4" fill="rgba(15, 23, 42, 0.85)" stroke="#38BDF8" strokeWidth="1" />
                    <text x="0" y="-22" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700">
                      BKC Hub
                    </text>
                  </g>

                  {/* Point 2: Destination Marker (Customer Home) */}
                  <g transform="translate(680, 110)">
                    <circle r="20" fill="rgba(16, 185, 129, 0.25)" className="pulse-circle" />
                    <circle r="12" fill="#10B981" />
                    <circle r="5" fill="#FFFFFF" />
                    <rect x="-60" y="-38" width="120" height="22" rx="4" fill="rgba(15, 23, 42, 0.9)" stroke="#10B981" strokeWidth="1" />
                    <text x="0" y="-23" textAnchor="middle" fill="#10B981" fontSize="10" fontWeight="700">
                      Your Delivery Address
                    </text>
                  </g>

                  {/* ======================================================= */}
                  {/* MOVING COURIER ELECTRIC SCOOTER / VAN ICON             */}
                  {/* ======================================================= */}
                  <g transform={`translate(${courierCurrentPos.x}, ${courierCurrentPos.y})`}>
                    {/* Pulsing Radar Beacon Waves */}
                    <circle r="26" fill="rgba(6, 182, 212, 0.18)" className="radar-wave-1" />
                    <circle r="18" fill="rgba(6, 182, 212, 0.35)" className="radar-wave-2" />
                    <circle r="12" fill="#06B6D4" stroke="#FFFFFF" strokeWidth="2" />

                    {/* Vehicle Icon Badge */}
                    <g transform="translate(-14, -14)">
                      <rect width="28" height="28" rx="14" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
                      <text x="14" y="19" textAnchor="middle" fontSize="14">
                        🛵
                      </text>
                    </g>

                    {/* Moving Courier Info Tooltip */}
                    <g transform="translate(0, -32)">
                      <rect x="-55" y="-18" width="110" height="22" rx="5" fill="rgba(15, 23, 42, 0.95)" stroke="#06B6D4" strokeWidth="1.5" />
                      <text x="0" y="-4" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="800">
                        Vikram • En Route
                      </text>
                    </g>
                  </g>
                </svg>

                {/* Corner Road Name Indicators */}
                <div className="map-road-overlay top-left">
                  <span>📍 Western Express Corridor (Bandra BKC Link)</span>
                </div>
                <div className="map-road-overlay bottom-right">
                  <span>Live Speed: 28 km/h • GPS Ping: Active</span>
                </div>
              </div>

              {/* Delivery Partner Profile Card */}
              <div className="courier-profile-card">
                <div className="courier-photo-wrap">
                  <img
                    src={trackingData?.courier?.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"}
                    alt="Courier Partner"
                    className="courier-avatar-img"
                  />
                  <span className="courier-online-dot" />
                </div>

                <div className="courier-info-col">
                  <div className="courier-name-row">
                    <h4>{trackingData?.courier?.name || "Vikram Rathore"}</h4>
                    <span className="verified-badge">
                      <FiShield /> {trackingData?.courier?.badge || "Elite Partner"}
                    </span>
                  </div>
                  <p className="courier-vehicle-text">
                    {trackingData?.courier?.vehicle_model || "Hero Electric Nyx"} • <strong>{trackingData?.courier?.vehicle_number || "MH-02-EE-8821"}</strong>
                  </p>
                  <p className="courier-meta-text">
                    ⭐ <strong>{trackingData?.courier?.rating || 4.9}</strong> (1,420+ 5-star deliveries) • COVID Vaccinated
                  </p>
                </div>

                <div className="courier-actions-col">
                  <button className="call-courier-btn" onClick={() => setIsCallingCourier(true)}>
                    <FiPhoneCall /> Call Partner
                  </button>
                </div>
              </div>
            </div>

            {/* Live Telemetry Activity Logs Feed */}
            <div className="telemetry-feed-card">
              <div className="feed-header">
                <h3>
                  <FiActivity /> Live Activity Telemetry Feed
                </h3>
                <span className="feed-auto-badge">Auto-Updating</span>
              </div>

              <div className="feed-timeline-list">
                {(trackingData?.telemetry_logs || []).map((log, idx) => (
                  <div key={idx} className="feed-item">
                    <div className="feed-bullet">
                      <span className="feed-inner-dot" />
                    </div>
                    <div className="feed-content">
                      <span className="feed-time">{log.time}</span>
                      <p className="feed-event">{log.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* RIGHT COLUMN: STEP TIMELINE, OTP BOX & ORDER SUMMARY         */}
          {/* ============================================================ */}
          <div className="tracking-summary-column">
            {/* Secure Delivery OTP Card */}
            <div className="otp-security-card">
              <div className="otp-card-header">
                <div className="otp-icon-wrap">
                  <FiShield />
                </div>
                <div>
                  <h4>Secure Delivery OTP</h4>
                  <p>Share this 4-digit verification code with the driver upon delivery</p>
                </div>
              </div>

              <div className="otp-display-box" onClick={handleCopyOtp}>
                <div className="otp-digits-row">
                  {(trackingData?.otp || "7492").split("").map((digit, i) => (
                    <span key={i} className="otp-digit">
                      {digit}
                    </span>
                  ))}
                </div>
                <button type="button" className="copy-otp-btn">
                  {copiedOtp ? <FiCheck className="text-emerald" /> : <FiCopy />}
                  <span>{copiedOtp ? "Copied" : "Copy Code"}</span>
                </button>
              </div>
            </div>

            {/* 5-Step Order Progress Timeline */}
            <div className="progress-timeline-card">
              <div className="timeline-card-header">
                <h3>Order Fulfillment Progress</h3>
                <span className={`status-pill ${currentStage === 5 ? "completed" : "in-progress"}`}>
                  {currentStage === 5 ? "Delivered" : "In Transit"}
                </span>
              </div>

              <div className="steps-container">
                {(trackingData?.stages || []).map((st) => {
                  const isDone = currentStage >= st.stage;
                  const isCurrent = currentStage === st.stage;

                  return (
                    <div key={st.stage} className={`step-row ${isDone ? "done" : ""} ${isCurrent ? "current" : ""}`}>
                      <div className="step-indicator-col">
                        <div className="step-circle">
                          {isDone ? <FiCheck /> : <span>{st.stage}</span>}
                        </div>
                        {st.stage < 5 && <div className={`step-line ${currentStage > st.stage ? "done" : ""}`} />}
                      </div>

                      <div className="step-details-col">
                        <div className="step-title-row">
                          <h5>{st.title}</h5>
                          <span className="step-time">{st.time}</span>
                        </div>
                        <p className="step-desc">{st.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Product & Package Overview Card */}
            <div className="order-overview-card">
              <div className="overview-header">
                <h3>Package Details</h3>
                <span
                  className="source-platform-pill"
                  style={{
                    background: sourceBadge.bg,
                    color: sourceBadge.color,
                    border: `1px solid ${sourceBadge.color}35`,
                    borderRadius: "6px",
                    padding: "3px 8px",
                    fontSize: "0.72rem",
                    fontWeight: "700",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  <span>{sourceBadge.icon}</span> {sourceBadge.label}
                </span>
              </div>

              <div className="overview-product-row">
                <img
                  src={product ? getProductImage(product) : "https://m.media-amazon.com/images/I/81vxWpPpgNL.jpg"}
                  alt={trackingData?.product_name}
                  className="overview-prod-img"
                />
                <div className="overview-prod-info">
                  <h4>{trackingData?.product_name || "Samsung Galaxy S24 Ultra 5G"}</h4>
                  <p>Qty: {trackingData?.quantity || 1} • Payment: {trackingData?.payment_method || "UPI / GPay"}</p>
                  <strong className="overview-amount">
                    ₹{parseFloat(trackingData?.amount || 139999).toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>

              <div className="overview-divider" />

              {/* Delivery Address & Hub details */}
              <div className="address-section">
                <div className="addr-row">
                  <FiMapPin className="addr-icon text-emerald" />
                  <div>
                    <span className="addr-type">Delivery Destination:</span>
                    <p className="addr-text">
                      {trackingData?.delivery_address?.name || "Customer"}<br />
                      {trackingData?.delivery_address?.address || "Flat 402, Sunshine Heights, Hill Road, Bandra West, Mumbai - 400050"}
                    </p>
                  </div>
                </div>

                <div className="addr-row">
                  <FiPackage className="addr-icon text-blue" />
                  <div>
                    <span className="addr-type">Dispatched From:</span>
                    <p className="addr-text">
                      {trackingData?.hub?.name || "ShopSense BKC Central Fulfillment Hub"}<br />
                      {trackingData?.hub?.address || "Unit 4B, G-Block, Bandra Kurla Complex, Mumbai"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SIMULATED PHONE CALL TO COURIER MODAL                        */}
      {/* ============================================================ */}
      <AnimatePresence>
        {isCallingCourier && (
          <div className="call-modal-backdrop" onClick={() => setIsCallingCourier(false)}>
            <motion.div
              className="call-modal-card"
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="call-modal-avatar-pulse">
                <img
                  src={trackingData?.courier?.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"}
                  alt="Courier"
                />
                <span className="call-soundwave-ring" />
              </div>

              <h3>{trackingData?.courier?.name || "Vikram Rathore"}</h3>
              <p className="call-partner-tag">ShopSense Express Courier Partner</p>
              <p className="call-status-text">
                {callDuration === 0 ? "Connecting via Encrypted Proxy..." : `Call In Progress (${formatTime(callDuration)})`}
              </p>

              <div className="call-dialog-snippet">
                <p>
                  &quot;Hello! I am just 2 minutes away from Sunshine Heights at Bandra West. Please have your 4-digit OTP ready!&quot;
                </p>
              </div>

              <div className="call-actions-row">
                <button className="hangup-call-btn" onClick={() => setIsCallingCourier(false)}>
                  <FiPhone /> End Call
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Fallback generator for rich demo tracking
function getFallbackTracking(ref) {
  return {
    transaction_ref: ref,
    customer_name: "Aarav Sharma",
    product_name: "Samsung Galaxy S24 Ultra 5G (Titanium Gray, 512GB)",
    product_image: "https://m.media-amazon.com/images/I/81vxWpPpgNL.jpg",
    amount: 139999.0,
    quantity: 1,
    payment_method: "UPI / GPay",
    status: "Out for Delivery",
    current_stage: 4,
    otp: "7492",
    courier: {
      name: "Vikram Rathore",
      phone: "+91 98201 44829",
      rating: 4.9,
      badge: "Elite Verified Partner",
      vehicle_model: "Hero Electric Nyx",
      vehicle_number: "MH-02-EE-8821",
      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
    },
    hub: {
      name: "ShopSense BKC Central Fulfillment Hub",
      address: "Unit 4B, G-Block, Bandra Kurla Complex, Mumbai - 400051"
    },
    delivery_address: {
      name: "Aarav Sharma",
      address: "Flat 402, Sunshine Heights, Hill Road, Bandra West, Mumbai - 400050"
    },
    stages: [
      { stage: 1, title: "Order Placed & Payment Verified", desc: "Payment confirmed via Instant UPI. Sent to merchant.", time: "8:30 PM", completed: true },
      { stage: 2, title: "Inspected & Packed at Hub", desc: "Quality certified at ShopSense BKC Central Hub with tamper seal.", time: "8:45 PM", completed: true },
      { stage: 3, title: "Dispatched via Express Courier", desc: "Handed to courier partner. Vehicle departed BKC hub.", time: "9:00 PM", completed: true },
      { stage: 4, title: "Out for Delivery (Live GPS Active)", desc: "Courier is 1.8 km away heading towards your address.", time: "9:15 PM", completed: true },
      { stage: 5, title: "Delivered & Verified", desc: "Package safely handed over with 4-digit OTP verification.", time: "Est. 9:45 PM", completed: false }
    ],
    telemetry_logs: [
      { time: "9:18:45 PM", event: "Courier reached Bandra West Hill Road junction." },
      { time: "9:14:10 PM", event: "Departed Western Express Highway flyover, speed 32 km/h." },
      { time: "9:05:22 PM", event: "Passed Mahim Causeway transit security gate." },
      { time: "9:00:05 PM", event: "Package loaded onto Hero Electric Nyx delivery vehicle." },
      { time: "8:45:00 PM", event: "Security barcode scan SS-BKC-9921 cleared." }
    ]
  };
}

export default LiveTracking;
