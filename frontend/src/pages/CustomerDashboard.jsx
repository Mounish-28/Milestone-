import { useState, useEffect, useMemo, useRef } from "react";
import {
  FiSearch,
  FiShoppingBag,
  FiShoppingCart,
  FiStar,
  FiCheckCircle,
  FiAward,
  FiTruck,
  FiGlobe,
  FiPlus,
  FiMinus,
  FiTrash2,
  FiArrowRight,
  FiX,
  FiMessageSquare,
  FiHeart,
  FiZap,
  FiClock,
  FiTag,
  FiShield,
  FiFilter,
  FiChevronRight,
  FiChevronLeft,
  FiDownload,
  FiCheck,
  FiPackage,
  FiDollarSign,
  FiLayers,
  FiGrid,
  FiMapPin,
  FiPercent,
  FiGift,
  FiRefreshCw,
  FiAlertCircle,
  FiCalendar,
  FiActivity,
  FiUser,
  FiFileText,
  FiTrendingUp,
  FiShare2,
  FiExternalLink
} from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getProducts,
  getTransactions,
  getCustomerTransactions,
  getCustomerSummary,
  createTransaction,
  cancelTransaction,
  getProductReviews,
  addProductReview
} from "../services/api";
import { getPaymentQR, getPaymentUPI, DEFAULT_PAYEE_NAME } from "../utils/paymentConfig";
import "./CustomerDashboard.css";

function CustomerDashboard() {
  // Navigation View: 'storefront' | 'orders' | 'history' | 'wishlist' | 'vip_rewards' | 'addresses' | 'news'
  const [activeTab, setActiveTab] = useState("storefront");

  // Products and Orders Data State
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customerSummary, setCustomerSummary] = useState({
    total_orders: 0,
    total_spent: 0,
    estimated_cashback_saved: 0,
    active_orders: 0
  });
  const [loading, setLoading] = useState(true);

  // Search, Category, and Sorting State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured"); // 'featured' | 'price-low' | 'price-high' | 'rating'
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [maxPrice, setMaxPrice] = useState(3000);

  // Shopping Cart & Saved Wishlist State
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([1, 4, 7, 12]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("UPI / GPay");

  // Hero Carousel State
  const [activeBanner, setActiveBanner] = useState(0);

  // Modals State
  const [videoModal, setVideoModal] = useState(null);
  const [reviewModalProduct, setReviewModalProduct] = useState(null);
  const [productReviewData, setProductReviewData] = useState(null);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState("");
  const [selectedNewsArticle, setSelectedNewsArticle] = useState(null);

  // Customer Profile Details from localStorage
  const userName = localStorage.getItem("userName") || "Aarav Sharma";
  const userEmail = localStorage.getItem("userEmail") || "aarav@gmail.com";
  const userPhone = localStorage.getItem("userPhone") || "+91 9876543210";
  const [userAddress, setUserAddress] = useState(
    localStorage.getItem("userAddress") || "Flat 402, Sunshine Heights, Bandra West, Mumbai - 400050, India"
  );
  const membershipTier = localStorage.getItem("membershipTier") || "Diamond";
  const membershipPrice = localStorage.getItem("membershipPrice") || "₹499";

  // Saved Delivery Addresses List
  const [savedAddresses, setSavedAddresses] = useState([
    {
      id: 1,
      type: "Home (Default)",
      address: "Flat 402, Sunshine Heights, Bandra West, Mumbai - 400050, India",
      isDefault: true
    },
    {
      id: 2,
      type: "Workplace / Office",
      address: "Unit 12B, Tech Innovation Park, Powai, Mumbai - 400076, India",
      isDefault: false
    }
  ]);

  // Flash Deals Countdown Timer (Ticking)
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 0, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Carousel Auto-Slide
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % 4);
    }, 6000);
    return () => clearInterval(slideTimer);
  }, []);

  // Fetch initial data from backend
  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      const [prodRes, orderRes, summaryRes] = await Promise.all([
        getProducts(),
        getTransactions(),
        getCustomerSummary(userName)
      ]);
      setProducts(prodRes || []);
      setOrders(orderRes || []);
      if (summaryRes) setCustomerSummary(summaryRes);
    } catch {
      console.error("Error fetching customer data from backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, []);

  // Real-World Tech & Market News Articles
  const techNewsArticles = [
    {
      id: 1,
      title: "Samsung Unveils Galaxy Z Fold6 & Z Flip6 with Multimodal Galaxy AI",
      category: "Mobile Tech",
      date: "August 2026",
      readTime: "4 min read",
      imageTag: "📱",
      summary:
        "Samsung has officially launched the Galaxy Z Fold6 with enhanced Armor Aluminum hinge, Snapdragon 8 Gen 3 for Galaxy, and full circle-to-search multimodal AI interpreter.",
      fullArticle: `Samsung Electronics today announced its next generation of foldable smartphones, the Galaxy Z Fold6 and Galaxy Z Flip6, designed with slimmer profiles, enhanced durability, and integrated Galaxy AI capabilities. Powered by the customized Snapdragon 8 Gen 3 for Galaxy processor, the Z Fold6 offers dual Dynamic AMOLED 2X 120Hz screens with up to 2,600 nits peak brightness. Real-time Live Translate, Note Assist with automated summarizing, and AI generative photo editing are built directly into One UI 6.1.1.`
    },
    {
      id: 2,
      title: "Apple Debuts iPhone 16 Pro Max with A18 Pro Chip & Camera Control",
      category: "Flagship Hardware",
      date: "August 2026",
      readTime: "5 min read",
      imageTag: "🍏",
      summary:
        "Featuring Grade 5 Titanium finishes, 48MP Fusion Camera, 4K120fps Dolby Vision video recording, and physical capacitive Camera Control button with Apple Intelligence.",
      fullArticle: `Apple introduced iPhone 16 Pro and iPhone 16 Pro Max, engineered with the groundbreaking 3-nanometer A18 Pro chip with 16-core Neural Engine. A new capacitive sapphire crystal Camera Control button provides haptic feedback to swipe between zoom, depth of field, and exposure. With thinner borders than ever before, the 6.9-inch Super Retina XDR display on iPhone 16 Pro Max sets a new standard for smartphone displays.`
    },
    {
      id: 3,
      title: "Sony Previews Next-Gen WH-1000XM6 Flagship Noise-Canceling Audio",
      category: "Audio & Wearables",
      date: "August 2026",
      readTime: "3 min read",
      imageTag: "🎧",
      summary:
        "Sony showcases dual HD Noise Canceling Processor QN2 architecture with 12 microphones, lossless LDAC wireless streaming, and 45-hour ultra-extended battery life.",
      fullArticle: `Sony has provided an exclusive preview of its upcoming audiophile wireless headphone architecture. Featuring a newly engineered carbon fiber composite driver and dynamic acoustic chambers, the next iteration achieves industry-first adaptive ambient wind reduction and intelligent head-tracking spatial 360 Reality Audio.`
    },
    {
      id: 4,
      title: "DJI Launches Mini 4 Pro Drone with Omnidirectional Active Sensing",
      category: "Drones & Robotics",
      date: "August 2026",
      readTime: "4 min read",
      imageTag: "🛸",
      summary:
        "Weighing under 249 grams, the DJI Mini 4 Pro introduces full 360-degree obstacle avoidance, 4K/60fps HDR True Vertical Shooting, and 20km FHD O4 video transmission.",
      fullArticle: `DJI Mini 4 Pro sets a new benchmark for ultra-lightweight consumer drones. Its 1/1.3-inch CMOS sensor with Dual Native ISO Fusion supports 48MP RAW photography and 4K/100fps slow motion. ActiveTrack 360 allows creators to execute professional cinematic tracking shots effortlessly.`
    },
    {
      id: 5,
      title: "Nike & Zara Announce Sustainable High-Performance Streetwear Drop",
      category: "Fashion & Apparel",
      date: "August 2026",
      readTime: "3 min read",
      imageTag: "👗",
      summary:
        "Combining Nike's Dri-FIT ADV recycled polymer technologies with Zara's European tailored silhouettes for an exclusive limited-edition autumn runway collection.",
      fullArticle: `Global sportswear giant Nike and fashion pioneer Zara have collaborated on a limited-edition capsule wardrobe. Incorporating breathable recycled mulberry silk blends, water-repellent urban trench coats, and reimagined Air Jordan retro sneakers, the drop bridges high fashion and active performance.`
    },
    {
      id: 6,
      title: "Herman Miller Integrates IoT Posture Sensors in Aeron Workstations",
      category: "Smart Furniture",
      date: "August 2026",
      readTime: "4 min read",
      imageTag: "🛋️",
      summary:
        "New smart lumbar modules embedded in Aeron mesh chairs pair with desktop apps to alert ergonomic fatigue and recommend standing desk interval transitions.",
      fullArticle: `Herman Miller has unveiled smart posture intelligence for modern home office setups. The discreet micro-sensor array integrated within the PostureFit SL lumbar mechanism tracks spinal alignment and pelvic tilt, delivering personalized ergonomic wellness nudges through an intuitive desktop widget.`
    }
  ];

  // Open Product Reviews & Sentiment Modal
  const handleOpenReviews = async (product) => {
    setReviewModalProduct(product);
    try {
      const data = await getProductReviews(product.id);
      setProductReviewData(data);
    } catch {
      setProductReviewData({
        sentiment_analysis: {
          overall_sentiment_label: "Highly Positive",
          avg_sentiment_score: 0.95,
          top_pros: ["Authentic brand quality", "Exceptional battery life & performance", "Fast express delivery"],
          top_cons: ["Premium packaging"]
        },
        reviews: [
          {
            id: 1,
            customer_name: "Aarav Sharma",
            rating: 5.0,
            review_text: "Top tier performance and verified fast delivery!",
            sentiment_label: "Positive"
          }
        ]
      });
    }
  };

  const handleAddReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewModalProduct || !newReviewText.trim()) return;

    try {
      await addProductReview({
        product_id: reviewModalProduct.id,
        customer_name: userName,
        rating: parseFloat(newReviewRating),
        review_text: newReviewText.trim()
      });
      toast.success("Review submitted & analyzed with AI sentiment! ⭐");
      setNewReviewText("");
      const updated = await getProductReviews(reviewModalProduct.id);
      setProductReviewData(updated);
    } catch {
      toast.success("Review saved!");
    }
  };

  // Add item to cart
  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    toast.success(`🛒 Added "${product.name}" to Cart!`);
  };

  // 1-Click Instant Buy Now
  const handleBuyNow = (product) => {
    handleAddToCart(product);
    setIsCartOpen(true);
  };

  // Toggle Wishlist
  const handleToggleWishlist = (productId) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        toast.info("Removed from your Wishlist");
        return prev.filter((id) => id !== productId);
      } else {
        toast.success("Saved to your Wishlist ❤️");
        return [...prev, productId];
      }
    });
  };

  // Adjust cart item quantity
  const handleQuantityChange = (productId, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  // Calculate cart totals & tiered membership cashback
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const getCashbackRate = () => {
    if (membershipTier.toLowerCase().includes("diamond")) return 0.15; // 15% for Diamond
    if (membershipTier.toLowerCase().includes("platinum")) return 0.10; // 10% for Platinum
    return 0.05; // 5% for Gold / Free
  };

  const cashbackRate = getCashbackRate();
  const cashbackDiscount = subtotal * cashbackRate;
  const grandTotal = Math.max(subtotal - cashbackDiscount, 0);

  // Complete checkout & create transaction in backend
  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      const firstItem = cart[0];
      await createTransaction({
        customer_name: userName,
        amount: grandTotal,
        payment_method: paymentMethod,
        status: "Completed",
        product_id: firstItem.id,
        quantity: cart.reduce((sum, i) => sum + i.quantity, 0)
      });

      toast.success("🎉 Order Placed Successfully! Instant confirmation generated.");
      setCart([]);
      setIsCartOpen(false);
      fetchCustomerData();
      setActiveTab("orders");
    } catch {
      toast.error("Checkout failed. Please check backend connection.");
    }
  };

  // Cancel order in backend
  const handleCancelOrder = async (txId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await cancelTransaction(txId);
      toast.success("Order cancelled and refund initiated!");
      fetchCustomerData();
    } catch {
      toast.error("Could not cancel order.");
    }
  };

  // Download Invoice HTML & Print
  const handleDownloadInvoice = (order) => {
    toast.info(`Generating official invoice for ${order.transaction_ref}...`);
    
    const invoiceContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Invoice ${order.transaction_ref}</title>
  <style>
    body { font-family: 'Inter', -apple-system, sans-serif; background: #f8fafc; padding: 40px; color: #0f172a; margin: 0; }
    .invoice-box { max-width: 800px; margin: auto; padding: 40px; border: 1px solid #cbd5e1; box-shadow: 0 10px 25px rgba(0,0,0,0.05); background: #ffffff; border-radius: 12px; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
    .logo { font-size: 32px; font-weight: 900; color: #2563eb; letter-spacing: -1px; }
    .logo span { color: #f59e0b; }
    .details { text-align: right; }
    .details h3 { margin: 0; color: #334155; font-size: 24px; font-weight: 800; letter-spacing: 2px; }
    .details p { margin: 5px 0 0; font-size: 14px; color: #64748b; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th, td { padding: 14px 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background: #f1f5f9; font-weight: 600; color: #334155; font-size: 14px; text-transform: uppercase; }
    td { font-size: 15px; }
    .total-row td { font-weight: 700; font-size: 16px; border-top: 2px solid #0f172a; }
    .total-amount { color: #2563eb; font-size: 24px !important; font-weight: 800 !important; }
    .footer { text-align: center; margin-top: 50px; color: #94a3b8; font-size: 13px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="invoice-box">
    <div class="header">
      <div class="logo">Shop<span>Sense</span></div>
      <div class="details">
        <h3>INVOICE</h3>
        <p><strong>Ref:</strong> ${order.transaction_ref}</p>
        <p><strong>Date:</strong> ${new Date(order.created_at || Date.now()).toLocaleDateString()}</p>
        <p><strong>Customer:</strong> ${userName}</p>
        <p><strong>Status:</strong> ${order.status || 'Completed'}</p>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Item Description</th>
          <th>Qty</th>
          <th>Price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${order.product_name || "General Marketplace Item"}</td>
          <td>${order.quantity || 1}</td>
          <td>₹${((order.amount || 0) / (order.quantity || 1)).toFixed(2)}</td>
          <td>₹${(order.amount || 0).toFixed(2)}</td>
        </tr>
        <tr class="total-row">
          <td colspan="3" style="text-align: right">Grand Total:</td>
          <td class="total-amount">₹${(order.amount || 0).toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
    <div class="footer">
      Thank you for shopping with ShopSense! This is an official digital tax invoice.<br/>
      For support, contact billing@shopsense.com
    </div>
  </div>
</body>
</html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(invoiceContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
      toast.success("Invoice generated successfully! You can now print or save it as PDF.");
    } else {
      // Fallback if popup blocked: download HTML directly
      const blob = new Blob([invoiceContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ShopSense_Invoice_${order.transaction_ref}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Invoice downloaded as HTML.");
    }
  };

  // Set default address
  const handleSetDefaultAddress = (addr) => {
    setUserAddress(addr.address);
    localStorage.setItem("userAddress", addr.address);
    setSavedAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === addr.id }))
    );
    toast.success(`Active delivery address updated to: ${addr.type}`);
  };

  // Add new address
  const handleAddNewAddress = (e) => {
    e.preventDefault();
    const form = e.target;
    const type = form.addrType.value;
    const details = form.addrDetails.value;
    const newAddr = {
      id: Date.now(),
      type,
      address: details,
      isDefault: false
    };
    setSavedAddresses((prev) => [...prev, newAddr]);
    form.reset();
    toast.success("New address saved to your profile!");
  };

  // Filter & Sort products for Storefront
  let filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchesStock = onlyInStock ? p.stock === "In Stock" : true;
    const matchesPrice = p.price <= maxPrice;

    return matchesSearch && matchesCategory && matchesStock && matchesPrice;
  });

  // Apply sorting
  if (sortBy === "price-low") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-high") {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === "rating") {
    filteredProducts.sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));
  }

  // Real-time Autocomplete Matching Search Results for Dropdown
  const searchAutocompleteResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 6);
  }, [products, searchQuery]);

  // Expanded Categories list
  const categoryList = [
    { name: "All", icon: "🛍️" },
    { name: "Mobiles", icon: "📱" },
    { name: "Electronics", icon: "💻" },
    { name: "Accessories", icon: "🎧" },
    { name: "Fashion", icon: "👗" },
    { name: "Men's Wear", icon: "👔" },
    { name: "Kids Wear", icon: "🧸" },
    { name: "Toys & Games", icon: "🚀" },
    { name: "Furniture", icon: "🛋️" },
    { name: "Beauty & Health", icon: "💄" }
  ];

  // Carousel banners with Real Brands and Product Launches
  const heroBanners = [
    {
      title: "SAMSUNG GALAXY Z FOLD6 & S24 ULTRA AI SERIES LAUNCHED ⚡",
      subtitle: "Experience Multimodal Galaxy AI, Snapdragon 8 Gen 3, Titanium Hinges & 200MP Quad OIS Cameras",
      highlight: `Extra ${(cashbackRate * 100).toFixed(0)}% Instant Cashback for ${membershipTier} Members`,
      cta: "Shop Samsung Galaxy Series",
      bgGradient: "linear-gradient(135deg, #0A192F 0%, #172A45 50%, #203A65 100%)",
      badge: "Official Global Flagship Launch",
      categoryTarget: "Mobiles"
    },
    {
      title: "APPLE IPHONE 16 PRO MAX & M3 MACBOOK PRO FEST 🍏",
      subtitle: "A18 Pro Silicon, Dedicated Physical Camera Control Button & 22-Hour M3 Max Battery Life",
      highlight: "Free 2-Hour VIP Express Delivery Included",
      cta: "Explore Apple Ecosystem",
      bgGradient: "linear-gradient(135deg, #18181B 0%, #27272A 50%, #3F3F46 100%)",
      badge: "Apple Titanium Drops",
      categoryTarget: "Electronics"
    },
    {
      title: "NIKE AIR JORDAN RETRO & ZARA MULBERRY SILK COLLECTION 👗",
      subtitle: "Chicago 1 High OGs, Handcrafted Silk Evening Gowns & Vintage Full-Grain Leather Biker Jackets",
      highlight: "Verified Video Unboxings & AI Sentiment Reviews Live",
      cta: "View Fashion Drops",
      bgGradient: "linear-gradient(135deg, #450A0A 0%, #7F1D1D 50%, #991B1B 100%)",
      badge: "Autumn Fashion Runway",
      categoryTarget: "Fashion"
    },
    {
      title: "DJI MINI 4 PRO & SONY PLAYSTATION 5 ROBOTICS CARNIVAL 🛸",
      subtitle: "Sub-249g 4K/60fps HDR Drones, DualSense Haptics, LEGO Technic & STEM Programmable Robots",
      highlight: "Best Price Guarantee with Instant Reward Coupons",
      cta: "Shop Toys & Gaming",
      bgGradient: "linear-gradient(135deg, #083344 0%, #0E7490 50%, #06B6D4 100%)",
      badge: "Robotics & Gaming Spotlight",
      categoryTarget: "Toys & Games"
    }
  ];

  return (
    <div className="marketplace-customer-page">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />

      {/* ========================================================================= */}
      {/* 1. TOP AMAZON / FLIPKART STYLE MARKETPLACE HEADER BAR                     */}
      {/* ========================================================================= */}
      <header className="marketplace-top-header">
        <div className="header-left">
          {/* Brand Logo with Dynamic Membership Badge: Free (Gold) / Plus (Platinum) / Prime (Diamond) */}
          <div
            className="marketplace-brand"
            onClick={() => setActiveTab("storefront")}
            style={{ cursor: "pointer" }}
          >
            <span className="brand-logo-text">ShopSense</span>
            {membershipTier.toLowerCase().includes("diamond") ? (
              <span className="brand-prime-tag tier-diamond">
                💎 Prime
              </span>
            ) : membershipTier.toLowerCase().includes("platinum") ? (
              <span className="brand-prime-tag tier-platinum">
                <FiZap /> Plus
              </span>
            ) : (
              <span className="brand-prime-tag tier-gold">
                Free
              </span>
            )}
          </div>

          <div
            className="delivery-location-pill"
            onClick={() => setActiveTab("addresses")}
            title="Click to view & manage delivery locations"
          >
            <FiTruck className="location-truck-icon" />
            <div className="location-texts">
              <span className="deliver-to-sub">Deliver to {userName.split(" ")[0]}</span>
              <span className="deliver-city-zip">{userAddress.split(",")[1] || "Mumbai 400050"}</span>
            </div>
          </div>
        </div>

        {/* Full-Width Search Bar with Instant Autocomplete Popup Dropdown */}
        <div className="marketplace-search-box-container">
          <div className="marketplace-search-box">
            <input
              type="text"
              placeholder="Search for Samsung S24 Ultra, iPhone 16, Nike Air Jordan, Sony WH-1000XM5, DJI Drones, Herman Miller..."
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab !== "storefront") setActiveTab("storefront");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setIsSearchFocused(false);
                  setActiveTab("storefront");
                }
              }}
            />

            {searchQuery && (
              <button
                className="search-clear-btn"
                onClick={() => setSearchQuery("")}
                title="Clear Search"
              >
                <FiX />
              </button>
            )}

            <button
              className="search-submit-btn"
              onClick={() => {
                setIsSearchFocused(false);
                setActiveTab("storefront");
              }}
            >
              <FiSearch />
            </button>
          </div>

          {/* Instant Autocomplete Suggestions Popup (Flipkart / Amazon Style) */}
          {isSearchFocused && searchQuery.trim().length > 0 && (
            <div className="search-autocomplete-dropdown">
              <div className="autocomplete-header">
                <span>Matching Products in Catalog ({searchAutocompleteResults.length}):</span>
                <span className="esc-hint">Press Enter to view all</span>
              </div>

              {searchAutocompleteResults.length === 0 ? (
                <div className="autocomplete-empty">
                  No matching products found for "{searchQuery}".
                </div>
              ) : (
                searchAutocompleteResults.map((item) => (
                  <div
                    key={item.id}
                    className="autocomplete-item"
                    onMouseDown={() => {
                      setSearchQuery(item.name);
                      setIsSearchFocused(false);
                      setActiveTab("storefront");
                    }}
                  >
                    <span className="item-cat-badge">{item.category}</span>
                    <span className="item-title">{item.name}</span>
                    <span className="item-price">₹{item.price.toFixed(2)}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Header Right Nav Actions */}
        <div className="header-right-actions">
          {/* Member Tier Badge */}
          <div
            className={`user-tier-pill tier-${membershipTier.toLowerCase()}`}
            onClick={() => setActiveTab("vip_rewards")}
            title="Click to open VIP Membership & Rewards Lounge"
          >
            <FiAward /> {membershipTier} VIP
          </div>

          {/* Orders Button */}
          <button
            className={`header-action-btn ${activeTab === "orders" ? "active-nav" : ""}`}
            onClick={() => setActiveTab("orders")}
            title="View My Orders & Package Tracking"
          >
            <FiPackage />
            <span>Orders ({orders.length})</span>
          </button>

          {/* Wishlist Button */}
          <button
            className={`header-action-btn ${activeTab === "wishlist" ? "active-nav" : ""}`}
            onClick={() => setActiveTab("wishlist")}
            title="View Saved Wishlist"
          >
            <FiHeart />
            <span className="action-counter-badge">{wishlist.length}</span>
          </button>

          {/* Cart Button */}
          <button
            className="header-cart-btn"
            onClick={() => setIsCartOpen(true)}
            title="Open Shopping Cart"
          >
            <FiShoppingCart />
            <div className="cart-btn-labels">
              <span className="cart-item-count">{cart.reduce((sum, i) => sum + i.quantity, 0)} Items</span>
              <span className="cart-price-tag">₹{grandTotal.toFixed(2)}</span>
            </div>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. CUSTOMER DASHBOARD TABS NAVIGATION                                      */}
      {/* ========================================================================= */}
      <div className="dashboard-subnav-strip">
        <div className="subnav-tabs-left">
          <button
            className={`subnav-tab ${activeTab === "storefront" ? "active" : ""}`}
            onClick={() => setActiveTab("storefront")}
          >
            <FiGrid /> Storefront & Deals ({products.length})
          </button>

          <button
            className={`subnav-tab ${activeTab === "news" ? "active" : ""}`}
            onClick={() => setActiveTab("news")}
          >
            <FiFileText /> 📰 Tech & Market News
          </button>

          <button
            className={`subnav-tab ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            <FiPackage /> My Orders ({orders.length})
          </button>

          <button
            className={`subnav-tab ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            <FiActivity /> Buying History & Ledger
          </button>

          <button
            className={`subnav-tab ${activeTab === "wishlist" ? "active" : ""}`}
            onClick={() => setActiveTab("wishlist")}
          >
            <FiHeart /> Wishlist ({wishlist.length})
          </button>

          <button
            className={`subnav-tab ${activeTab === "vip_rewards" ? "active" : ""}`}
            onClick={() => setActiveTab("vip_rewards")}
          >
            <FiGift /> VIP Rewards & Perks
          </button>

          <button
            className={`subnav-tab ${activeTab === "addresses" ? "active" : ""}`}
            onClick={() => setActiveTab("addresses")}
          >
            <FiMapPin /> Delivery Addresses
          </button>
        </div>

        <div className="subnav-quick-stats">
          <span className="stat-pill">
            <FiDollarSign /> Total Spent: <strong>₹{customerSummary.total_spent.toFixed(2)}</strong>
          </span>
          <span className="stat-pill cashback-pill">
            <FiPercent /> Cashback Saved: <strong>₹{customerSummary.estimated_cashback_saved.toFixed(2)}</strong>
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: STOREFRONT & DEALS HOME (Amazon / Flipkart Marketplace)             */}
      {/* ========================================================================= */}
      {activeTab === "storefront" && (
        <>
          {/* Category Icons Quick Bar (Flipkart Signature Strip) */}
          <nav className="category-quick-nav">
            {categoryList.map((cat) => (
              <button
                key={cat.name}
                className={`category-nav-item ${selectedCategory === cat.name ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat.name)}
              >
                <span className="cat-icon-symbol">{cat.icon}</span>
                <span className="cat-nav-name">{cat.name}</span>
              </button>
            ))}
          </nav>

          {/* Hero Promo Carousel & Flash Deals */}
          <section className="marketplace-hero-section">
            <div
              className="hero-carousel-slide"
              style={{ background: heroBanners[activeBanner].bgGradient }}
            >
              <div className="carousel-content">
                <span className="carousel-badge">{heroBanners[activeBanner].badge}</span>
                <h1>{heroBanners[activeBanner].title}</h1>
                <p className="carousel-desc">{heroBanners[activeBanner].subtitle}</p>
                <div className="carousel-cashback-tag">
                  <FiZap /> {heroBanners[activeBanner].highlight}
                </div>

                <div className="carousel-actions">
                  <button
                    className="carousel-primary-btn"
                    onClick={() => setSelectedCategory(heroBanners[activeBanner].categoryTarget)}
                  >
                    {heroBanners[activeBanner].cta} <FiArrowRight />
                  </button>
                </div>
              </div>

              {/* Carousel Indicators */}
              <div className="carousel-dots">
                {heroBanners.map((_, idx) => (
                  <span
                    key={idx}
                    className={`dot ${activeBanner === idx ? "active" : ""}`}
                    onClick={() => setActiveBanner(idx)}
                  />
                ))}
              </div>
            </div>

            {/* Lightning Deal Countdown Banner */}
            <div className="lightning-deal-sidebar">
              <div className="deal-header">
                <div className="deal-title">
                  <FiZap className="bolt-icon" />
                  <span>Deal of the Day</span>
                </div>
                <span className="deal-hurry-badge">Hurry!</span>
              </div>

              <div className="deal-timer-box">
                <span className="timer-unit">{String(timeLeft.hours).padStart(2, "0")}h</span>:
                <span className="timer-unit">{String(timeLeft.minutes).padStart(2, "0")}m</span>:
                <span className="timer-unit">{String(timeLeft.seconds).padStart(2, "0")}s</span>
              </div>

              <div className="deal-preview-card">
                <h4>Samsung Galaxy S24 Ultra 5G (512GB)</h4>
                <div className="deal-price-row">
                  <span className="deal-current-price">₹12,999</span>
                  <span className="deal-old-price">₹14,999</span>
                  <span className="deal-discount-tag">14% OFF</span>
                </div>
                <div className="deal-claim-progress">
                  <div className="progress-bar" style={{ width: "92%" }} />
                </div>
                <span className="claim-text">92% Claimed • Ends in {timeLeft.hours} hours</span>

                <button
                  className="deal-claim-btn"
                  onClick={() => {
                    const prod = products.find((p) => p.name.includes("S24 Ultra")) || products[0];
                    if (prod) handleAddToCart(prod);
                  }}
                >
                  <FiPlus /> Claim Deal to Cart
                </button>
              </div>
            </div>
          </section>

          {/* Filter & Sort Controls Bar */}
          <div className="storefront-controls-bar">
            <div className="controls-left">
              <div className="filter-chip">
                <FiFilter /> Filters:
              </div>

              <button
                className={`filter-toggle-pill ${onlyInStock ? "active" : ""}`}
                onClick={() => setOnlyInStock(!onlyInStock)}
              >
                <FiCheckCircle /> In-Stock Only
              </button>

              <div className="price-slider-group">
                <span>Max: ${maxPrice}</span>
                <input
                  type="range"
                  min="50"
                  max="3000"
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="controls-right">
              <span className="results-count-text">
                Showing <strong>{filteredProducts.length}</strong> items in <strong>{selectedCategory}</strong>
              </span>

              <div className="sort-wrapper">
                <span>Sort by:</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="featured">Featured & Recommended</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product Storefront Grid */}
          <main className="storefront-grid-section">
            {loading ? (
              <div className="loading-state">
                <FiRefreshCw className="loading-spin" />
                <p>Loading 100+ real-world products from database...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="no-products-state">
                <FiShoppingBag className="empty-catalog-icon" />
                <h3>No products found in "{selectedCategory}".</h3>
                <p>Try resetting your filters or search for another term.</p>
                <button
                  className="reset-filters-btn"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                    setOnlyInStock(false);
                    setMaxPrice(3000);
                  }}
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="marketplace-products-grid">
                {filteredProducts.map((p) => {
                  const isSaved = wishlist.includes(p.id);
                  const fakeOldPrice = (p.price * 1.25).toFixed(2);
                  const memberCashbackEarn = (p.price * cashbackRate).toFixed(2);

                  return (
                    <div key={p.id} className="amazon-product-card">
                      {/* Top Badges & Wishlist */}
                      <div className="card-top-row">
                        <span className="assured-badge">
                          <FiCheck /> Assured
                        </span>

                        <button
                          className={`wishlist-heart-btn ${isSaved ? "active" : ""}`}
                          onClick={() => handleToggleWishlist(p.id)}
                          title={isSaved ? "Remove from wishlist" : "Add to wishlist"}
                        >
                          <FiHeart />
                        </button>
                      </div>

                      {/* Visual Mockup Thumbnail Banner */}
                      <div className="product-thumb-box">
                        <div className="thumb-category-icon">
                          {p.category === "Electronics" && "💻"}
                          {p.category === "Mobiles" && "📱"}
                          {p.category === "Accessories" && "🎧"}
                          {p.category === "Furniture" && "🛋️"}
                          {p.category === "Fashion" && "👗"}
                          {p.category === "Men's Wear" && "👔"}
                          {p.category === "Kids Wear" && "🧸"}
                          {p.category === "Toys & Games" && "🚀"}
                          {p.category === "Beauty & Health" && "💄"}
                          {![
                            "Electronics",
                            "Mobiles",
                            "Accessories",
                            "Furniture",
                            "Fashion",
                            "Men's Wear",
                            "Kids Wear",
                            "Toys & Games",
                            "Beauty & Health"
                          ].includes(p.category) && "📦"}
                        </div>
                        <span className="stock-pill-badge">
                          {p.stock_quantity ? `${p.stock_quantity} in stock` : p.stock}
                        </span>
                      </div>

                      {/* Product Body */}
                      <div className="card-body">
                        <span className="card-category-label">{p.category || "General"}</span>
                        <h3 className="card-product-title" title={p.name}>
                          {p.name}
                        </h3>

                        {/* Star Rating */}
                        <div className="card-rating-row">
                          <span className="rating-pill">★ {p.rating || 4.8}</span>
                          <span className="rating-count-text">
                            ({Math.floor((p.id * 193 + 240) % 1800 + 350)} reviews)
                          </span>
                        </div>

                        {/* Price Container */}
                        <div className="price-container">
                          <div className="main-price-line">
                            <span className="deal-price">₹{p.price.toFixed(2)}</span>
                            <span className="mrp-slashed">₹{fakeOldPrice}</span>
                            <span className="discount-pct">20% OFF</span>
                          </div>
                          <div className="cashback-perk-line">
                            <FiZap /> Earn <strong>₹{memberCashbackEarn}</strong> with {membershipTier} VIP
                          </div>
                        </div>

                        {/* Delivery Promise */}
                        <div className="delivery-promise-line">
                          <FiTruck />
                          <span>
                            FREE Express Delivery by <strong>Tomorrow 8 PM</strong>
                          </span>
                        </div>

                        {/* Card Action Buttons */}
                        <div className="card-action-buttons">
                          <button
                            className="btn-add-cart"
                            onClick={() => handleAddToCart(p)}
                          >
                            <FiPlus /> Add to Cart
                          </button>

                          <button
                            className="btn-buy-now"
                            onClick={() => handleBuyNow(p)}
                          >
                            ⚡ Buy Now
                          </button>
                        </div>

                        <div className="card-sub-actions">
                          <button
                            className="sub-action-btn ai-reviews-btn"
                            onClick={() => handleOpenReviews(p)}
                          >
                            <FiMessageSquare /> AI Reviews
                          </button>

                          <button
                            className="sub-action-btn video-reviews-btn"
                            onClick={() => setVideoModal(p)}
                          >
                            <FiGlobe /> Video
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TECH & MARKET NEWS HUB                                             */}
      {/* ========================================================================= */}
      {activeTab === "news" && (
        <section className="dashboard-tab-section">
          <div className="tab-section-header">
            <h2>📰 Tech & Market News Hub</h2>
            <p>Stay informed with the latest flagship device launches, fashion drops, and market trends</p>
          </div>

          <div className="tech-news-grid">
            {techNewsArticles.map((article) => (
              <div key={article.id} className="news-article-card">
                <div className="news-card-thumb">
                  <span className="news-icon-tag">{article.imageTag}</span>
                  <span className="news-category-badge">{article.category}</span>
                </div>

                <div className="news-card-body">
                  <div className="news-meta-row">
                    <span><FiCalendar /> {article.date}</span>
                    <span><FiClock /> {article.readTime}</span>
                  </div>

                  <h3 className="news-title">{article.title}</h3>
                  <p className="news-snippet">{article.summary}</p>

                  <button
                    className="read-article-btn"
                    onClick={() => setSelectedNewsArticle(article)}
                  >
                    Read Full Story <FiArrowRight />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MY ORDERS & PACKAGE TRACKER DASHBOARD                              */}
      {/* ========================================================================= */}
      {activeTab === "orders" && (
        <section className="dashboard-tab-section">
          <div className="tab-section-header">
            <h2>📦 My Orders & Package Delivery Tracker</h2>
            <p>Track your active packages, download official invoices, and manage order cancellations</p>
          </div>

          <div className="orders-dashboard-grid">
            {orders.length === 0 ? (
              <div className="empty-tab-view">
                <FiPackage className="empty-tab-icon" />
                <h3>No orders placed yet</h3>
                <p>Explore our 100+ Real-World Catalog to discover deals and start shopping!</p>
                <button className="primary-action-btn" onClick={() => setActiveTab("storefront")}>
                  Start Shopping Now <FiArrowRight />
                </button>
              </div>
            ) : (
              orders.map((o) => {
                const isCancelled = o.status === "Cancelled";

                return (
                  <div key={o.id} className={`order-package-card ${isCancelled ? "cancelled" : ""}`}>
                    <div className="package-header-strip">
                      <div className="pkg-meta-item">
                        <span className="meta-label">ORDER DATE</span>
                        <span className="meta-val">{new Date(o.created_at || Date.now()).toLocaleDateString()}</span>
                      </div>
                      <div className="pkg-meta-item">
                        <span className="meta-label">TOTAL AMOUNT</span>
                        <span className="meta-val font-bold text-amber-400">₹{o.amount.toFixed(2)}</span>
                      </div>
                      <div className="pkg-meta-item">
                        <span className="meta-label">PAYMENT METHOD</span>
                        <span className="meta-val">{o.payment_method || "UPI / Card"}</span>
                      </div>
                      <div className="pkg-meta-item">
                        <span className="meta-label">ORDER ID</span>
                        <span className="meta-val text-indigo-400 font-mono">{o.transaction_ref}</span>
                      </div>
                    </div>

                    <div className="package-body-content">
                      <div className="package-product-info">
                        <div className="pkg-thumb">📦</div>
                        <div>
                          <h4>{o.product_name || "Marketplace Product Order"}</h4>
                          <span className="pkg-qty">Quantity: {o.quantity || 1} unit(s)</span>
                          <span className="pkg-customer">Shipped to: {o.customer_name}</span>
                        </div>
                      </div>

                      {/* Package Delivery Status Timeline */}
                      {!isCancelled ? (
                        <div className="delivery-tracking-stepper">
                          <div className="track-step completed">
                            <span className="track-dot"><FiCheck /></span>
                            <span className="track-label">Ordered & Paid</span>
                          </div>
                          <div className="track-line completed" />
                          <div className="track-step completed">
                            <span className="track-dot"><FiCheck /></span>
                            <span className="track-label">Shipped</span>
                          </div>
                          <div className="track-line completed" />
                          <div className="track-step active">
                            <span className="track-dot"><FiTruck /></span>
                            <span className="track-label">Out for Delivery</span>
                          </div>
                          <div className="track-line" />
                          <div className="track-step">
                            <span className="track-dot">●</span>
                            <span className="track-label">Delivered</span>
                          </div>
                        </div>
                      ) : (
                        <div className="cancelled-order-banner">
                          <FiAlertCircle /> Order Cancelled • Refund Processed Successfully
                        </div>
                      )}

                      <div className="package-action-buttons">
                        <button
                          className="reorder-pkg-btn"
                          onClick={() => {
                            toast.success(`Re-ordered ${o.transaction_ref}! Items added to cart.`);
                            setIsCartOpen(true);
                          }}
                        >
                          <FiZap /> Buy it Again
                        </button>

                        <button
                          className="invoice-pkg-btn"
                          onClick={() => handleDownloadInvoice(o)}
                        >
                          <FiDownload /> Download Invoice
                        </button>

                        {!isCancelled && (
                          <button
                            className="cancel-pkg-btn"
                            onClick={() => handleCancelOrder(o.id)}
                          >
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: BUYING HISTORY & TRANSACTION LEDGER                                */}
      {/* ========================================================================= */}
      {activeTab === "history" && (
        <section className="dashboard-tab-section">
          <div className="tab-section-header">
            <h2>📜 Buying History & Financial Ledger</h2>
            <p>Comprehensive transaction history, payment records, and tax invoice ledger</p>
          </div>

          <div className="history-ledger-container">
            <div className="ledger-summary-cards">
              <div className="ledger-stat-card">
                <span className="stat-title">Total Orders</span>
                <span className="stat-number">{customerSummary.total_orders}</span>
              </div>
              <div className="ledger-stat-card">
                <span className="stat-title">Lifetime Spent</span>
                <span className="stat-number text-amber-400">₹{customerSummary.total_spent.toFixed(2)}</span>
              </div>
              <div className="ledger-stat-card">
                <span className="stat-title">VIP Cashback Earned</span>
                <span className="stat-number text-emerald-400">₹{customerSummary.estimated_cashback_saved.toFixed(2)}</span>
              </div>
              <div className="ledger-stat-card">
                <span className="stat-title">Active Orders</span>
                <span className="stat-number text-cyan-400">{customerSummary.active_orders}</span>
              </div>
            </div>

            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Transaction Ref</th>
                  <th>Item Purchased</th>
                  <th>Date & Time</th>
                  <th>Payment Mode</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="font-mono text-indigo-400">{o.transaction_ref}</td>
                    <td>{o.product_name || "General Marketplace Item"}</td>
                    <td>{new Date(o.created_at || Date.now()).toLocaleString()}</td>
                    <td>{o.payment_method || "UPI"}</td>
                    <td className="font-bold text-amber-400">₹{o.amount.toFixed(2)}</td>
                    <td>
                      <span className={`status-tag ${o.status?.toLowerCase()}`}>
                        {o.status || "Completed"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="receipt-btn"
                        onClick={() => toast.info(`Exported receipt for ${o.transaction_ref}`)}
                      >
                        <FiDownload /> Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SAVED WISHLIST DASHBOARD                                           */}
      {/* ========================================================================= */}
      {activeTab === "wishlist" && (
        <section className="dashboard-tab-section">
          <div className="tab-section-header">
            <h2>❤️ Saved Wishlist & Price Drop Alerts ({wishlist.length})</h2>
            <p>Your curated favorite items with live price drop tracking and instant 1-click cart transfer</p>
          </div>

          <div className="wishlist-grid-view">
            {wishlist.length === 0 ? (
              <div className="empty-tab-view">
                <FiHeart className="empty-tab-icon" />
                <h3>Your Wishlist is Empty</h3>
                <p>Tap the heart icon on any product in our storefront to save it here.</p>
                <button className="primary-action-btn" onClick={() => setActiveTab("storefront")}>
                  Browse Storefront <FiArrowRight />
                </button>
              </div>
            ) : (
              products
                .filter((p) => wishlist.includes(p.id))
                .map((item) => (
                  <div key={item.id} className="wishlist-product-card">
                    <div className="wishlist-card-thumb">
                      <span>{item.category === "Electronics" ? "💻" : item.category === "Mobiles" ? "📱" : item.category === "Fashion" ? "👗" : "🛍️"}</span>
                      <span className="price-drop-badge">⚡ Price Drop Guarantee</span>
                    </div>

                    <div className="wishlist-card-details">
                      <span className="card-category-label">{item.category}</span>
                      <h4>{item.name}</h4>
                      <div className="price-row">
                        <span className="deal-price">₹{item.price.toFixed(2)}</span>
                        <span className="mrp-slashed">₹{(item.price * 1.25).toFixed(2)}</span>
                      </div>
                      <span className="stock-info">Status: <strong>{item.stock || "In Stock"}</strong></span>

                      <div className="wishlist-card-actions">
                        <button
                          className="btn-add-cart"
                          onClick={() => {
                            handleAddToCart(item);
                            handleToggleWishlist(item.id);
                          }}
                        >
                          <FiShoppingCart /> Move to Cart
                        </button>
                        <button
                          className="btn-remove-wish"
                          onClick={() => handleToggleWishlist(item.id)}
                          title="Remove from wishlist"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: VIP MEMBERSHIP & REWARDS LOUNGE                                    */}
      {/* ========================================================================= */}
      {activeTab === "vip_rewards" && (
        <section className="dashboard-tab-section">
          <div className="tab-section-header">
            <h2>💎 VIP Membership & Exclusive Rewards Lounge</h2>
            <p>Your active subscription tier, loyalty points, unlocked benefits, and personal AI agent</p>
          </div>

          <div className="vip-lounge-grid">
            {/* Active Tier Summary Card */}
            <div className={`vip-active-tier-card tier-${membershipTier.toLowerCase()}`}>
              <div className="tier-card-header">
                <FiAward className="tier-crown-icon" />
                <div>
                  <span className="tier-card-badge">ACTIVE SUBSCRIPTION</span>
                  <h3>{membershipTier} VIP Member</h3>
                  <span className="tier-price-period">{membershipPrice} Membership</span>
                </div>
              </div>

              <div className="tier-perks-list">
                <div className="perk-bullet">
                  <FiCheck className="perk-check" />
                  <span><strong>{(cashbackRate * 100).toFixed(0)}% Instant Cashback</strong> on all purchases</span>
                </div>
                <div className="perk-bullet">
                  <FiCheck className="perk-check" />
                  <span><strong>2-Hour VIP Express Delivery</strong> & Zero Delivery Fees Forever</span>
                </div>
                <div className="perk-bullet">
                  <FiCheck className="perk-check" />
                  <span><strong>Dedicated Autonomous AI Shopping Agent</strong> (with 1-click deals)</span>
                </div>
                <div className="perk-bullet">
                  <FiCheck className="perk-check" />
                  <span><strong>VIP Customer Concierge Hotline</strong> & Instant Hassle-Free Returns</span>
                </div>
              </div>
            </div>

            {/* Loyalty Points & Coupons Box */}
            <div className="vip-coupons-box">
              <h3>🎟️ Unlocked VIP Coupon Locker</h3>
              <div className="coupon-item">
                <div className="coupon-code">DIAMONDVIP15</div>
                <div className="coupon-desc">15% Instant Cashback applied automatically at checkout</div>
              </div>
              <div className="coupon-item">
                <div className="coupon-code">FREESHIP2HR</div>
                <div className="coupon-desc">Free 2-Hour Express Delivery on orders above ₹499</div>
              </div>
              <div className="coupon-item">
                <div className="coupon-code">AICHECKOUT</div>
                <div className="coupon-desc">Autonomous AI auto-purchase approval badge active</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: DELIVERY ADDRESSES & PROFILE                                       */}
      {/* ========================================================================= */}
      {activeTab === "addresses" && (
        <section className="dashboard-tab-section">
          <div className="tab-section-header">
            <h2>📍 Delivery Addresses & Customer Profile</h2>
            <p>Manage your saved delivery locations, contact details, and KYC status</p>
          </div>

          <div className="addresses-container-grid">
            <div className="saved-addresses-col">
              <h3>Saved Shipping Addresses</h3>

              {savedAddresses.map((addr) => (
                <div key={addr.id} className={`address-card ${addr.isDefault ? "default" : ""}`}>
                  <div className="address-type-row">
                    <span className="addr-type-title">{addr.type}</span>
                    {addr.isDefault && <span className="default-badge">Active Delivery</span>}
                  </div>
                  <p className="addr-text">{addr.address}</p>
                  <p className="addr-contact">Contact: {userName} • {userPhone}</p>

                  {!addr.isDefault && (
                    <button
                      className="set-default-btn"
                      onClick={() => handleSetDefaultAddress(addr)}
                    >
                      Set as Default Delivery Address
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add New Address Form */}
            <div className="add-address-form-card">
              <h3>➕ Add New Delivery Address</h3>
              <form onSubmit={handleAddNewAddress} className="new-address-form">
                <div className="input-group">
                  <label>Address Label / Type</label>
                  <input
                    type="text"
                    name="addrType"
                    required
                    placeholder="e.g. Vacation Home / Parents House"
                  />
                </div>

                <div className="input-group">
                  <label>Full Delivery Address</label>
                  <textarea
                    name="addrDetails"
                    required
                    rows={3}
                    placeholder="Flat / House No., Street, Area, City - Pincode"
                  />
                </div>

                <button type="submit" className="save-address-btn">
                  Save New Address
                </button>
              </form>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SHOPPING CART DRAWER (Amazon Style)                                       */}
      {/* ========================================================================= */}
      {isCartOpen && (
        <div className="cart-drawer-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <div className="cart-title">
                <FiShoppingBag /> Your Shopping Cart ({cart.reduce((sum, i) => sum + i.quantity, 0)})
              </div>
              <button className="cart-close-btn" onClick={() => setIsCartOpen(false)}>
                <FiX />
              </button>
            </div>

            {/* Free Delivery Meter */}
            <div className="free-delivery-bar">
              <div className="delivery-meter-text">
                <FiTruck />
                {grandTotal >= 50 ? (
                  <span>
                    🎉 <strong>You unlocked FREE 2-Hour Express Delivery!</strong>
                  </span>
                ) : (
                  <span>
                    Add <strong>₹{(500 - grandTotal > 0 ? (500 - grandTotal).toFixed(2) : 0)}</strong> more for FREE Express Delivery!
                  </span>
                )}
              </div>
              <div className="delivery-meter-fill">
                <div
                  className="fill-bar"
                  style={{ width: `${Math.min((grandTotal / 50) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="cart-items-body">
              {cart.length === 0 ? (
                <div className="empty-cart">
                  <FiShoppingCart style={{ fontSize: "3.5rem", color: "#64748B" }} />
                  <h4>Your Cart is Empty</h4>
                  <p>Explore 100+ real-world products and add items to your cart.</p>
                  <button
                    className="cart-shop-now-btn"
                    onClick={() => {
                      setIsCartOpen(false);
                      setActiveTab("storefront");
                    }}
                  >
                    Start Shopping Deals
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="cart-item-card">
                    <div className="cart-item-info">
                      <h4>{item.name}</h4>
                      <span className="cart-item-price">₹{item.price.toFixed(2)} each</span>
                      <span className="cart-item-subtotal">
                        Subtotal: <strong>₹{(item.price * item.quantity).toFixed(2)}</strong>
                      </span>
                    </div>

                    <div className="cart-item-controls">
                      <div className="qty-stepper">
                        <button onClick={() => handleQuantityChange(item.id, -1)}>
                          <FiMinus />
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => handleQuantityChange(item.id, 1)}>
                          <FiPlus />
                        </button>
                      </div>

                      <button
                        className="cart-remove-btn"
                        onClick={() => handleQuantityChange(item.id, -item.quantity)}
                        title="Remove item"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="bill-breakdown">
                  <div className="bill-row">
                    <span>Items Subtotal:</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>

                  <div className="bill-row cashback-discount-row">
                    <span>
                      <FiZap /> {membershipTier} Cashback Savings ({(cashbackRate * 100).toFixed(0)}%):
                    </span>
                    <span className="discount-value">-₹{cashbackDiscount.toFixed(2)}</span>
                  </div>

                  <div className="bill-row">
                    <span>Delivery Charges:</span>
                    <span className="text-green-400 font-bold">FREE (₹0.00)</span>
                  </div>

                  <div className="bill-divider" />

                  <div className="bill-row grand-total-row">
                    <span>Total Amount Payable:</span>
                    <span className="grand-total-val">₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="payment-method-box">
                  <label>Select Payment Mode:</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="pay-mode-select"
                  >
                    <option value="UPI / GPay">⚡ Instant UPI / Google Pay / PhonePe</option>
                    <option value="Credit / Debit Card">💳 Credit / Debit Card</option>
                    <option value="Net Banking">🏦 Net Banking</option>
                    <option value="Cash on Delivery">💵 Cash on Delivery (COD)</option>
                  </select>
                </div>

                {paymentMethod === "UPI / GPay" && (
                  <div style={{ textAlign: "center", margin: "14px 0", padding: "14px", background: "rgba(16, 185, 129, 0.08)", borderRadius: "10px", border: "1px dashed #10B981" }}>
                    <p style={{ fontSize: "0.82rem", color: "#10B981", fontWeight: 700, margin: "0 0 6px 0" }}>⚡ Scan & Pay to Merchant ({DEFAULT_PAYEE_NAME})</p>
                    <img src={getPaymentQR()} alt="UPI QR" style={{ width: "140px", height: "140px", objectFit: "contain", borderRadius: "8px", background: "#fff", padding: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }} />
                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: "6px 0 0 0" }}>UPI ID: <strong>{getPaymentUPI()}</strong></p>
                  </div>
                )}

                <button className="checkout-btn" onClick={handleCheckout}>
                  Proceed to Buy ({cart.reduce((sum, i) => sum + i.quantity, 0)} items) • ₹{grandTotal.toFixed(2)}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TECH NEWS FULL ARTICLE MODAL                                              */}
      {/* ========================================================================= */}
      {selectedNewsArticle && (
        <div className="modal-backdrop-overlay" onClick={() => setSelectedNewsArticle(null)}>
          <div className="review-modal-box news-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <h3>
                {selectedNewsArticle.imageTag} {selectedNewsArticle.title}
              </h3>
              <button className="close-modal-btn" onClick={() => setSelectedNewsArticle(null)}>
                <FiX />
              </button>
            </div>

            <div className="news-modal-content">
              <div className="news-modal-meta">
                <span className="news-category-pill">{selectedNewsArticle.category}</span>
                <span>📅 {selectedNewsArticle.date}</span>
                <span>⏱️ {selectedNewsArticle.readTime}</span>
              </div>

              <div className="news-modal-body-text">
                <p>{selectedNewsArticle.fullArticle}</p>
              </div>

              <div className="news-modal-footer">
                <button
                  className="shop-related-btn"
                  onClick={() => {
                    setSelectedNewsArticle(null);
                    setActiveTab("storefront");
                  }}
                >
                  <FiShoppingBag /> Explore Related Products in Storefront
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* AI PRODUCT REVIEWS & SENTIMENT MODAL                                      */}
      {/* ========================================================================= */}
      {reviewModalProduct && (
        <div className="modal-backdrop-overlay" onClick={() => setReviewModalProduct(null)}>
          <div className="review-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <h3>
                <FiMessageSquare /> AI Sentiment Analysis: {reviewModalProduct.name}
              </h3>
              <button className="close-modal-btn" onClick={() => setReviewModalProduct(null)}>
                <FiX />
              </button>
            </div>

            {productReviewData && (
              <div className="sentiment-summary-box">
                <div className="sentiment-score-badge">
                  <span>AI Sentiment Score:</span>
                  <strong>
                    {productReviewData.sentiment_analysis?.overall_sentiment_label || "Highly Positive"} (
                    {(
                      (productReviewData.sentiment_analysis?.avg_sentiment_score || 0.94) * 100
                    ).toFixed(0)}
                    %)
                  </strong>
                </div>

                <div className="pros-cons-grid">
                  <div className="pros-col">
                    <h4>👍 Key Strengths (Pros):</h4>
                    <ul>
                      {productReviewData.sentiment_analysis?.top_pros?.map((pro, i) => (
                        <li key={i}>✓ {pro}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="cons-col">
                    <h4>👎 Considerations (Cons):</h4>
                    <ul>
                      {productReviewData.sentiment_analysis?.top_cons?.map((con, i) => (
                        <li key={i}>• {con}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Submit New Review Form */}
            <form onSubmit={handleAddReviewSubmit} className="add-review-form">
              <h4>Write a Verified Customer Review</h4>
              <div className="star-select-row">
                <span>Your Rating:</span>
                <select
                  value={newReviewRating}
                  onChange={(e) => setNewReviewRating(Number(e.target.value))}
                >
                  <option value={5}>★★★★★ 5 Stars (Excellent)</option>
                  <option value={4}>★★★★☆ 4 Stars (Good)</option>
                  <option value={3}>★★★☆☆ 3 Stars (Average)</option>
                  <option value={2}>★★☆☆☆ 2 Stars (Poor)</option>
                  <option value={1}>★☆☆☆☆ 1 Star (Terrible)</option>
                </select>
              </div>

              <textarea
                placeholder="Write your genuine experience with this product..."
                rows={3}
                required
                value={newReviewText}
                onChange={(e) => setNewReviewText(e.target.value)}
              />

              <button type="submit" className="submit-review-btn">
                Submit Review for AI Analysis
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MULTILINGUAL VIDEO REVIEW MODAL                                           */}
      {/* ========================================================================= */}
      {videoModal && (
        <div className="modal-backdrop-overlay" onClick={() => setVideoModal(null)}>
          <div className="video-review-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <h3>
                <FiGlobe /> Multilingual Video Review: {videoModal.name}
              </h3>
              <button className="close-modal-btn" onClick={() => setVideoModal(null)}>
                <FiX />
              </button>
            </div>

            <div className="video-player-container">
              <div className="video-screen-mockup">
                <span className="play-symbol">▶</span>
                <p>Interactive Video Demo & Unboxing</p>
                <div className="video-badge-overlay">
                  ★ 4.9 Verified Creator Spotlight
                </div>
              </div>

              <div className="video-captions-box">
                <h4>🤖 AI Multi-Language Audio Transcripts</h4>
                <p>
                  "The build and responsiveness are remarkable. Battery easily lasted through intensive testing, and features perform seamlessly right out of the box."
                </p>
                <div className="language-pills-row">
                  <span className="lang-pill active">English</span>
                  <span className="lang-pill">Hindi (हिंदी)</span>
                  <span className="lang-pill">Spanish (Español)</span>
                  <span className="lang-pill">French (Français)</span>
                  <span className="lang-pill">German (Deutsch)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerDashboard;
