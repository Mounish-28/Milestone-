import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiStar,
  FiShoppingCart,
  FiZap,
  FiHeart,
  FiShare2,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiTag,
  FiCheckCircle,
  FiMapPin,
  FiChevronRight,
  FiChevronLeft,
  FiThumbsUp,
  FiMessageSquare,
  FiInfo,
  FiCheck,
  FiX,
  FiAward,
  FiCpu,
  FiLayers,
  FiMaximize2
} from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CustomerHeader from "../components/CustomerHeader";
import {
  getProduct,
  getProducts,
  getProductReviews,
  addProductReview,
  getRelatedRecommendations
} from "../services/api";
import { getProductGallery, getProductImage, getProductSource } from "../utils/productImages";
import "./ProductDetail.css";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  // Reviews and Sentiment data
  const [reviewData, setReviewData] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeSpecTab, setActiveSpecTab] = useState("all");

  // Variant selections
  const [selectedColor, setSelectedColor] = useState("Space Black");
  const [selectedStorage, setSelectedStorage] = useState("256 GB");

  // Delivery Pincode checker
  const [pincode, setPincode] = useState("400050");
  const [isPincodeChecked, setIsPincodeChecked] = useState(true);

  // Write Review Modal
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewerName, setNewReviewerName] = useState(
    localStorage.getItem("userName") || "Aarav Sharma"
  );
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Cart & Wishlist state from localStorage
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("customerCart")) || [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("customerWishlist")) || [1, 4, 7];
    } catch {
      return [1, 4, 7];
    }
  });

  useEffect(() => {
    localStorage.setItem("customerCart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("customerWishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Load product data, reviews, and related recommendations
  useEffect(() => {
    const fetchFullProduct = async () => {
      setLoading(true);
      try {
        const prodId = parseInt(id, 10);
        let prod = null;

        try {
          prod = await getProduct(prodId);
        } catch {
          // Fallback fetch all
          const all = await getProducts();
          prod = (all || []).find((p) => p.id === prodId);
        }

        if (prod) {
          setProduct(prod);
        }

        // Fetch reviews
        try {
          const revs = await getProductReviews(prodId);
          setReviewData(revs);
        } catch {
          setReviewData(null);
        }

        // Fetch related products
        try {
          const rel = await getRelatedRecommendations(prodId);
          setRelatedProducts(rel?.related_products || []);
        } catch {
          setRelatedProducts([]);
        }
      } catch (err) {
        console.error("Error fetching product detail:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFullProduct();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  // Product gallery images generator (Authentic Multi-Angle Photography)
  const galleryImages = useMemo(() => {
    return getProductGallery(product);
  }, [product]);

  // Dynamic MRP & Discounts
  const mrp = product ? Math.round(product.price * 1.25) : 0;
  const discountAmount = product ? mrp - product.price : 0;
  const discountPercent = product ? Math.round((discountAmount / mrp) * 100) : 0;
  const isWishlisted = product ? wishlist.includes(product.id) : false;

  // Cart operations
  const handleAddToCart = () => {
    if (!product) return;
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      let newCart;
      if (exists) {
        newCart = prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        newCart = [...prev, { ...product, quantity: 1 }];
      }
      localStorage.setItem("customerCart", JSON.stringify(newCart));
      return newCart;
    });
    toast.success(`🛒 Added ${product.name} to Cart!`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/cart");
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    setWishlist((prev) => {
      if (prev.includes(product.id)) {
        toast.info("Removed from Wishlist");
        return prev.filter((id) => id !== product.id);
      } else {
        toast.success("❤️ Added to Wishlist!");
        return [...prev, product.id];
      }
    });
  };

  // Image zoom tracking
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  // Submit new review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReviewText.trim()) {
      toast.error("Please enter your review text");
      return;
    }
    setIsSubmittingReview(true);
    try {
      await addProductReview({
        product_id: product.id,
        customer_name: newReviewerName,
        rating: newRating,
        review_text: newReviewText.trim()
      });
      toast.success("⭐ Review submitted successfully!");
      setIsReviewModalOpen(false);
      setNewReviewText("");

      // Refresh reviews
      const updated = await getProductReviews(product.id);
      setReviewData(updated);
    } catch {
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Specifications Matrix (Flipkart / Amazon Style)
  const specifications = [
    {
      category: "General",
      specs: [
        { key: "In The Box", value: "Handset, USB-C to USB-C Braided Cable, SIM Tray Ejector Pin, Quick Start Manual" },
        { key: "Model Number", value: `SS-${product?.id || 101}-PRO` },
        { key: "Model Name", value: product?.name || "Flagship Edition" },
        { key: "Color", value: selectedColor },
        { key: "Browse Type", value: "Smartphones / Flagship" },
        { key: "SIM Type", value: "Dual SIM (Nano + eSIM)" },
        { key: "Hybrid Sim Slot", value: "No" },
        { key: "Touchscreen", value: "Yes (Capacitive Multitouch, 120Hz ProMotion)" },
        { key: "OTG Compatible", value: "Yes" },
        { key: "Quick Charging", value: "Yes (Up to 45W Turbo Charge + 25W Qi2 Wireless)" }
      ]
    },
    {
      category: "Display Features",
      specs: [
        { key: "Display Size", value: "6.7 inch (17.02 cm)" },
        { key: "Resolution", value: "2796 x 1290 Pixels" },
        { key: "Resolution Type", value: "Super Retina XDR OLED" },
        { key: "GPU", value: "6-Core High Performance Neural Graphic Engine" },
        { key: "Display Type", value: "Dynamic AMOLED 2X HDR10+ Always-On" },
        { key: "Other Display Features", value: "Ceramic Shield Glass Front, 2,000 nits Peak Outdoor Brightness, True Tone" }
      ]
    },
    {
      category: "Os & Processor Features",
      specs: [
        { key: "Operating System", value: "Latest OS 18 with AI Intelligence Engine" },
        { key: "Processor Brand", value: "Next-Gen 3nm Architecture" },
        { key: "Processor Type", value: "Hexa Core Neural Processing Unit" },
        { key: "Processor Core", value: "Octa-Core (2 Prime + 6 Efficiency Cores)" },
        { key: "Primary Clock Speed", value: "3.78 GHz" }
      ]
    },
    {
      category: "Memory & Storage Features",
      specs: [
        { key: "Internal Storage", value: selectedStorage },
        { key: "RAM", value: "12 GB LPDDR5X Ultra Fast" },
        { key: "Expandable Storage", value: "Cloud Backup Integrated" },
        { key: "Memory Card Slot Type", value: "Dedicated Cloud Sync" }
      ]
    },
    {
      category: "Camera Features",
      specs: [
        { key: "Primary Camera", value: "50MP + 48MP + 12MP Triple Studio Setup" },
        { key: "Primary Camera Features", value: "Sensor-shift OIS, 5x Optical Zoom, 4K120fps Dolby Vision, Night Mode Portrait" },
        { key: "Secondary Camera", value: "12MP TrueDepth Front Camera with Autofocus" },
        { key: "Flash", value: "Adaptive True Tone Quad-LED Flash" },
        { key: "Video Recording", value: "Yes, 4K at 24/25/30/60/120 fps, 1080p Slo-mo up to 240 fps" }
      ]
    },
    {
      category: "Connectivity & Battery Features",
      specs: [
        { key: "Network Type", value: "5G, 4G LTE, 3G, 2G" },
        { key: "Supported Networks", value: "5G SA/NSA, VoLTE, Wi-Fi 7 (802.11be), Bluetooth 5.4, Ultra Wideband (UWB)" },
        { key: "Battery Capacity", value: "4850 mAh" },
        { key: "Battery Life", value: "Up to 33 hours video playback, all-day intensive endurance" }
      ]
    },
    {
      category: "Warranty",
      specs: [
        { key: "Warranty Summary", value: "1 Year Manufacturer Comprehensive Warranty for Device and 6 Months for In-Box Accessories" },
        { key: "Covered in Warranty", value: "Manufacturing defects, Hardware malfunctions, and Motherboard failures" },
        { key: "Not Covered in Warranty", value: "Physical damage, Water submersion exceeding IP68, Unauthorized software tampering" },
        { key: "Domestic Warranty", value: "1 Year Across All Authorized Service Hubs" }
      ]
    }
  ];

  if (loading) {
    return (
      <div className="product-detail-page">
        <CustomerHeader
          cartCount={cart.reduce((acc, curr) => acc + (curr.quantity || 1), 0)}
          wishlistCount={wishlist.length}
        />
        <div className="detail-loading-wrap">
          <div className="detail-spinner" />
          <p>Loading complete product specifications and verified reviews...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-page">
        <CustomerHeader
          cartCount={cart.reduce((acc, curr) => acc + (curr.quantity || 1), 0)}
          wishlistCount={wishlist.length}
        />
        <div className="detail-not-found">
          <h2>Product Not Found</h2>
          <p>The product you are looking for is unavailable or has been removed.</p>
          <Link to="/search" className="btn-back-catalog">
            <FiChevronLeft /> Back to Product Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <ToastContainer position="top-right" autoClose={2000} theme="colored" />

      {/* Shared Flipkart/Amazon Header */}
      <CustomerHeader
        cartCount={cart.reduce((acc, curr) => acc + (curr.quantity || 1), 0)}
        wishlistCount={wishlist.length}
      />

      <div className="detail-page-container">
        {/* Breadcrumbs */}
        <div className="detail-breadcrumbs">
          <Link to="/">Home</Link>
          <FiChevronRight className="crumb-sep" />
          <Link to={`/search?category=${encodeURIComponent(product.category || "All")}`}>
            {product.category || "Catalog"}
          </Link>
          <FiChevronRight className="crumb-sep" />
          <span className="crumb-active">{product.name}</span>
        </div>

        {/* 2-Column Product Hero (Flipkart / Amazon Style) */}
        <div className="product-hero-layout">
          {/* Left Column: Image Gallery & Buy Actions */}
          <div className="product-gallery-column">
            <div className="gallery-sticky-wrap">
              {/* Thumbnail Strip + Main Image */}
              <div className="gallery-main-flex">
                {/* Thumbnails */}
                <div className="thumbnails-strip">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`thumbnail-btn ${activeImageIndex === idx ? "active" : ""}`}
                      onMouseEnter={() => setActiveImageIndex(idx)}
                      onClick={() => setActiveImageIndex(idx)}
                    >
                      <img src={img} alt={`Thumb ${idx + 1}`} />
                    </button>
                  ))}
                </div>

                {/* Main Active Image with Zoom Lens */}
                <div
                  className="main-image-display"
                  onMouseEnter={() => setIsZoomed(true)}
                  onMouseLeave={() => setIsZoomed(false)}
                  onMouseMove={handleMouseMove}
                >
                  <img
                    src={galleryImages[activeImageIndex]}
                    alt={product.name}
                    className="active-display-img"
                  />

                  {/* Wishlist Button */}
                  <button
                    type="button"
                    className={`gallery-wishlist-btn ${isWishlisted ? "active" : ""}`}
                    onClick={handleToggleWishlist}
                    title="Add to Wishlist"
                  >
                    <FiHeart />
                  </button>

                  {/* Assured Badge */}
                  <div className="gallery-assured-badge">
                    <FiCheckCircle /> ShopSense Assured
                  </div>

                  {/* Zoom Overlay (Hover lens) */}
                  {isZoomed && (
                    <div
                      className="zoom-lens-preview"
                      style={{
                        backgroundImage: `url(${galleryImages[activeImageIndex]})`,
                        backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Action Buttons (Flipkart Yellow + Orange style) */}
              <div className="gallery-action-buttons">
                <button
                  type="button"
                  className="btn-add-to-cart-gold"
                  onClick={handleAddToCart}
                >
                  <FiShoppingCart /> ADD TO CART
                </button>
                <button
                  type="button"
                  className="btn-buy-now-orange"
                  onClick={handleBuyNow}
                >
                  <FiZap /> BUY NOW
                </button>
              </div>

              {/* Safe & Secure Guarantee strip */}
              <div className="gallery-trust-strip">
                <div className="trust-item">
                  <FiShield className="trust-icon" />
                  <span>100% Authentic</span>
                </div>
                <div className="trust-item">
                  <FiRefreshCw className="trust-icon" />
                  <span>7 Days Return</span>
                </div>
                <div className="trust-item">
                  <FiTruck className="trust-icon" />
                  <span>Express Delivery</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Product Info, Offers, Delivery & Specs */}
          <div className="product-info-column">
            {/* Category & Brand Header */}
            <div className="info-brand-row">
              <span className="brand-badge-link">
                Brand: <strong>{product.category || "ShopSense Partner"}</strong>
              </span>
              {(() => {
                const srcBadge = getProductSource(product);
                return (
                  <span 
                    style={{ 
                      background: srcBadge.bg, 
                      color: srcBadge.color,
                      border: `1px solid ${srcBadge.color}40`,
                      borderRadius: "6px",
                      padding: "4px 10px",
                      fontSize: "0.78rem",
                      fontWeight: "700",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px"
                    }}
                  >
                    <span>{srcBadge.icon}</span> {srcBadge.label}
                  </span>
                );
              })()}
              <span className="stock-availability-badge in-stock">
                <FiCheck /> {product.stock || "In Stock (Ready to Dispatch)"}
              </span>
            </div>

            {/* Product Title */}
            <h1 className="detail-product-title">{product.name}</h1>

            {/* Ratings & Reviews Count */}
            <div className="detail-ratings-summary-row">
              <div className="rating-pill-green">
                <span>{product.rating || 4.8}</span>
                <FiStar className="star-fill" />
              </div>
              <span className="rating-text-divider">•</span>
              <span className="total-ratings-count">
                {Math.floor((product.units_sold || 35) * 6.5)} Ratings &{" "}
                {reviewData?.total_reviews || 18} Reviews
              </span>
              <span className="assured-inline-tag">
                <FiAward /> Top Selling in {product.category || "Marketplace"}
              </span>
            </div>

            {/* Price & Discount Section */}
            <div className="detail-price-box">
              <div className="price-primary-row">
                <span className="price-current">₹{product.price}</span>
                <span className="price-mrp-strike">₹{mrp}</span>
                <span className="price-discount-percent">{discountPercent}% off</span>
              </div>
              <div className="price-savings-note">
                You save: <strong>₹{discountAmount}</strong> • Inclusive of all GST and Import taxes
              </div>
            </div>

            {/* Available Bank Offers & Coupons (Flipkart/Amazon Style) */}
            <div className="detail-offers-card">
              <div className="offers-header">
                <FiTag className="tag-icon" />
                <strong>Available Offers & Instant Discounts</strong>
              </div>
              <ul className="offers-list">
                <li>
                  <span className="offer-type">Bank Offer:</span> 5% Unlimited Cashback on ShopSense Axis Bank Credit Card.
                </li>
                <li>
                  <span className="offer-type">Special Price:</span> Get extra ₹250 off (price inclusive of cashback/coupon).
                </li>
                <li>
                  <span className="offer-type">Partner Offer:</span> Sign up for ShopSense Prime & get ₹500 Welcome Voucher.
                </li>
                <li>
                  <span className="offer-type">No Cost EMI:</span> Avail No Cost EMI on select cards starting from ₹450/month.
                </li>
              </ul>
            </div>

            {/* Delivery & Pincode Checker */}
            <div className="detail-delivery-checker-box">
              <div className="checker-header-row">
                <span className="checker-title">
                  <FiMapPin /> Delivery Options & Pincode Check
                </span>
              </div>
              <div className="pincode-input-row">
                <input
                  type="text"
                  placeholder="Enter 6-digit Pincode"
                  value={pincode}
                  onChange={(e) => {
                    setPincode(e.target.value);
                    setIsPincodeChecked(false);
                  }}
                  maxLength={6}
                  className="pincode-input"
                />
                <button
                  type="button"
                  className="btn-check-pincode"
                  onClick={() => {
                    if (pincode.length === 6) {
                      setIsPincodeChecked(true);
                      toast.success(`Delivery available to pincode ${pincode}!`);
                    } else {
                      toast.warning("Please enter a valid 6-digit pincode");
                    }
                  }}
                >
                  Check
                </button>
              </div>

              {isPincodeChecked && (
                <div className="delivery-estimates-list">
                  <div className="estimate-row highlight">
                    <FiTruck className="est-icon green" />
                    <span>
                      Delivery by <strong>Tomorrow, 5:00 PM</strong> | <span className="free-tag">FREE</span> (Standard Express)
                    </span>
                  </div>
                  <div className="estimate-row">
                    <FiCheckCircle className="est-icon" />
                    <span>Cash on Delivery Available</span>
                  </div>
                  <div className="estimate-row">
                    <FiRefreshCw className="est-icon" />
                    <span>7 Days Replacement Policy & Verified Transit Warranty</span>
                  </div>
                </div>
              )}
            </div>

            {/* Color Variants Selector */}
            <div className="variant-selection-group">
              <span className="variant-label">
                Color: <strong>{selectedColor}</strong>
              </span>
              <div className="variant-options-row">
                {["Space Black", "Titanium Natural", "Deep Blue", "Silver Frost"].map((col, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`variant-chip ${selectedColor === col ? "active" : ""}`}
                    onClick={() => setSelectedColor(col)}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>

            {/* Storage Variants Selector */}
            <div className="variant-selection-group">
              <span className="variant-label">
                Storage: <strong>{selectedStorage}</strong>
              </span>
              <div className="variant-options-row">
                {["128 GB", "256 GB", "512 GB", "1 TB"].map((stor, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`variant-chip ${selectedStorage === stor ? "active" : ""}`}
                    onClick={() => setSelectedStorage(stor)}
                  >
                    {stor}
                  </button>
                ))}
              </div>
            </div>

            {/* Highlights & Key Features */}
            <div className="product-highlights-card">
              <h3 className="highlights-title">Highlights & Key Features</h3>
              <ul className="highlights-list">
                <li>12 GB RAM | {selectedStorage} ROM | Expandable Cloud Ecosystem</li>
                <li>6.7 inch Super Retina XDR Dynamic 120Hz ProMotion AMOLED Display</li>
                <li>50MP + 48MP + 12MP Triple Studio AI Camera | 12MP Front Camera</li>
                <li>4850 mAh High-Density Lithium-Polymer Battery with 45W Fast Charging</li>
                <li>Next-Gen 3nm Hexa Core Neural Processing Unit for Ultra Performance</li>
                <li>Titanium Grade 5 Frame with IP68 Water & Dust Resistance</li>
              </ul>
            </div>

            {/* Seller Information */}
            <div className="seller-info-card">
              <div className="seller-header">
                <span className="seller-label">Seller:</span>
                <span className="seller-name">{product.vendor?.name || "ShopSense Official Retail Hub"}</span>
                <span className="seller-rating">4.9 ★</span>
              </div>
              <div className="seller-perks">
                <span>• 7 Days Replacement</span>
                <span>• GST Invoice Available</span>
                <span>• 100% Original Brand Warranty</span>
              </div>
            </div>
          </div>
        </div>

        {/* Full Specifications Section (Flipkart / Amazon Table Style) */}
        <section className="product-specifications-section">
          <div className="spec-section-header">
            <h2>Product Specifications</h2>
            <p>Comprehensive technical and general details verified by authorized manufacturer.</p>
          </div>

          <div className="spec-tables-wrapper">
            {specifications.map((sec, idx) => (
              <div key={idx} className="spec-category-block">
                <h3 className="spec-category-title">{sec.category}</h3>
                <div className="spec-table-grid">
                  {sec.specs.map((item, sIdx) => (
                    <div key={sIdx} className="spec-table-row">
                      <div className="spec-key-col">{item.key}</div>
                      <div className="spec-val-col">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Ratings & Customer Reviews Section with LLM Sentiment */}
        <section className="product-reviews-section">
          <div className="reviews-section-header">
            <div>
              <h2>Ratings & Customer Reviews</h2>
              <p>Verified purchaser reviews analyzed with ShopSense AI sentiment scoring.</p>
            </div>
            <button
              type="button"
              className="btn-rate-product"
              onClick={() => setIsReviewModalOpen(true)}
            >
              <FiStar /> Rate & Review Product
            </button>
          </div>

          {/* Rating Summary Breakdown Cards */}
          <div className="rating-breakdown-grid">
            {/* Left Score Box */}
            <div className="overall-score-card">
              <div className="big-rating-number">
                {product.rating || 4.8} <FiStar className="big-star" />
              </div>
              <span className="score-summary-text">
                {Math.floor((product.units_sold || 35) * 6.5)} Ratings & {reviewData?.total_reviews || 18} Reviews
              </span>
              <div className="verified-badge-row">
                <FiCheckCircle className="green-check" /> 100% Verified Buyers
              </div>
            </div>

            {/* Star Distribution Progress Bars */}
            <div className="star-bars-card">
              {[
                { stars: 5, pct: 76, color: "#16a34a" },
                { stars: 4, pct: 16, color: "#22c55e" },
                { stars: 3, pct: 5, color: "#f59e0b" },
                { stars: 2, pct: 2, color: "#ea580c" },
                { stars: 1, pct: 1, color: "#ef4444" }
              ].map((bar, bIdx) => (
                <div key={bIdx} className="star-bar-row">
                  <span className="star-label">{bar.stars} ★</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ width: `${bar.pct}%`, backgroundColor: bar.color }}
                    />
                  </div>
                  <span className="star-pct">{bar.pct}%</span>
                </div>
              ))}
            </div>

            {/* AI Sentiment Analysis Card */}
            <div className="ai-sentiment-summary-card">
              <div className="ai-sentiment-header">
                <FiZap className="zap-icon" />
                <strong>AI Customer Sentiment Summary</strong>
              </div>
              <div className="sentiment-verdict-row">
                <span className="sentiment-score-badge">
                  {reviewData?.sentiment_analysis?.avg_sentiment_score
                    ? `${Math.round(reviewData.sentiment_analysis.avg_sentiment_score * 100)}% Positive`
                    : "96% Highly Positive"}
                </span>
                <span className="sentiment-sub">Based on verified reviews</span>
              </div>

              {/* Pros & Cons */}
              <div className="sentiment-bullets">
                <div className="pro-chip">
                  <strong>👍 Top Pros:</strong> Fast processing, vivid display, exceptional battery life, ultra premium build.
                </div>
                <div className="con-chip">
                  <strong>⚠️ Areas of Note:</strong> Charger sold separately in select regions, slightly heavy packaging.
                </div>
              </div>
            </div>
          </div>

          {/* Customer Reviews List */}
          <div className="customer-reviews-list">
            {(reviewData?.reviews && reviewData.reviews.length > 0) ? (
              reviewData.reviews.map((rev) => (
                <div key={rev.id} className="review-card-item">
                  <div className="review-top-row">
                    <div className="review-rating-pill">
                      {rev.rating} <FiStar className="star-xs" />
                    </div>
                    <strong className="review-title">
                      {rev.rating >= 4 ? "Outstanding Quality & Value" : "Decent Product Experience"}
                    </strong>
                  </div>

                  <p className="review-body-text">{rev.review_text}</p>

                  <div className="review-footer-row">
                    <div className="reviewer-info">
                      <span className="reviewer-name">{rev.customer_name}</span>
                      <span className="verified-purchaser-pill">
                        <FiCheckCircle /> Certified Buyer
                      </span>
                      <span className="review-date">
                        {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : "Recent"}
                      </span>
                    </div>

                    <div className="review-helpful-action">
                      <button type="button" className="btn-helpful">
                        <FiThumbsUp /> Helpful (14)
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Default rich mock reviews
              [
                {
                  id: 1,
                  name: "Pooja Hegde",
                  rating: 5,
                  title: "Mindblowing Flagship Experience!",
                  text: "Simply the best device I have purchased this year! The display smoothness and camera sharpness are second to none. Delivered within 24 hours in pristine packaging.",
                  date: "2 days ago",
                  helpful: 38
                },
                {
                  id: 2,
                  name: "Vikram Malhotra",
                  rating: 5,
                  title: "Worth every single penny",
                  text: "Battery easily lasts for 1.5 days with intensive multi-tasking. AI features make voice queries and photo editing effortless. Highly recommended!",
                  date: "1 week ago",
                  helpful: 24
                },
                {
                  id: 3,
                  name: "Sneha Roy",
                  rating: 4,
                  title: "Great performance, sleek design",
                  text: "Build quality is top notch. The display is ultra bright outdoors. Minor issue is that it gets slightly warm during continuous 4K video recording, otherwise 10/10.",
                  date: "2 weeks ago",
                  helpful: 19
                }
              ].map((rev) => (
                <div key={rev.id} className="review-card-item">
                  <div className="review-top-row">
                    <div className="review-rating-pill">
                      {rev.rating} <FiStar className="star-xs" />
                    </div>
                    <strong className="review-title">{rev.title}</strong>
                  </div>

                  <p className="review-body-text">{rev.text}</p>

                  <div className="review-footer-row">
                    <div className="reviewer-info">
                      <span className="reviewer-name">{rev.name}</span>
                      <span className="verified-purchaser-pill">
                        <FiCheckCircle /> Certified Buyer
                      </span>
                      <span className="review-date">{rev.date}</span>
                    </div>

                    <div className="review-helpful-action">
                      <button type="button" className="btn-helpful">
                        <FiThumbsUp /> Helpful ({rev.helpful})
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Similar & Recommended Products Carousel */}
        {relatedProducts.length > 0 && (
          <section className="similar-products-section">
            <div className="similar-sec-header">
              <h2>Similar Products You Might Like</h2>
              <Link to={`/search?category=${encodeURIComponent(product.category || "All")}`} className="view-all-similar">
                View All <FiChevronRight />
              </Link>
            </div>

            <div className="similar-products-grid">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  className="similar-card"
                  onClick={() => navigate(`/product/${rel.id}`)}
                >
                  <div className="similar-img-box">
                    <img
                      src={getProductImage(rel)}
                      alt={rel.name}
                      loading="lazy"
                    />
                    <span className="similar-rating-badge">
                      {rel.rating || 4.7} <FiStar className="star-xs" />
                    </span>
                  </div>
                  <div className="similar-info-box">
                    <h4 title={rel.name}>{rel.name}</h4>
                    <div className="similar-price-row">
                      <span className="similar-price">₹{rel.price}</span>
                      <span className="similar-mrp">₹{Math.round(rel.price * 1.25)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Write Review Modal */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <motion.div
            className="modal-backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="write-review-modal-card"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="modal-header-row">
                <div className="modal-title-wrap">
                  <FiStar className="star-gold" />
                  <h3>Rate & Review Product</h3>
                </div>
                <button
                  type="button"
                  className="btn-modal-close"
                  onClick={() => setIsReviewModalOpen(false)}
                >
                  <FiX />
                </button>
              </div>

              <form onSubmit={handleReviewSubmit} className="review-modal-form">
                <div className="modal-product-summary">
                  <img
                    src={galleryImages[0]}
                    alt={product.name}
                    className="modal-prod-thumb"
                  />
                  <div>
                    <h4>{product.name}</h4>
                    <span className="modal-cat">{product.category || "General"}</span>
                  </div>
                </div>

                {/* Star Rating Picker */}
                <div className="form-group-rating">
                  <label>Overall Rating</label>
                  <div className="stars-picker-row">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`star-pick-btn ${newRating >= star ? "active" : ""}`}
                        onClick={() => setNewRating(star)}
                      >
                        <FiStar />
                      </button>
                    ))}
                    <span className="rating-desc-text">
                      {newRating === 5
                        ? "5 Stars - Excellent"
                        : newRating === 4
                        ? "4 Stars - Very Good"
                        : newRating === 3
                        ? "3 Stars - Average"
                        : newRating === 2
                        ? "2 Stars - Below Average"
                        : "1 Star - Poor"}
                    </span>
                  </div>
                </div>

                {/* Reviewer Name */}
                <div className="form-field-group">
                  <label>Your Name / Display Name</label>
                  <input
                    type="text"
                    required
                    value={newReviewerName}
                    onChange={(e) => setNewReviewerName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="review-input-text"
                  />
                </div>

                {/* Review Description */}
                <div className="form-field-group">
                  <label>Detailed Feedback & Experience</label>
                  <textarea
                    required
                    rows={4}
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    placeholder="What did you like or dislike? How was the build quality, display, and performance?"
                    className="review-textarea"
                  />
                </div>

                {/* Submit Action */}
                <div className="modal-actions-row">
                  <button
                    type="button"
                    className="btn-cancel-review"
                    onClick={() => setIsReviewModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-submit-review"
                    disabled={isSubmittingReview}
                  >
                    {isSubmittingReview ? "Analyzing Sentiment..." : "Submit Review"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ProductDetail;
