import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiSearch,
  FiFilter,
  FiStar,
  FiHeart,
  FiShoppingCart,
  FiCheckCircle,
  FiGrid,
  FiList,
  FiChevronRight,
  FiTruck,
  FiTag,
  FiShield,
  FiArrowLeft,
  FiSliders,
  FiX
} from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CustomerHeader from "../components/CustomerHeader";
import { getProducts } from "../services/api";
import { getProductImage, getProductSource } from "../utils/productImages";
import "./SearchResults.css";

function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();

  // Parse search query and category from URL
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const searchQuery = queryParams.get("q") || "";
  const initialCategory = queryParams.get("category") || "All";

  // Data states
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Sort states
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [minRating, setMinRating] = useState(0); // 0, 3, 4
  const [priceRange, setPriceRange] = useState(2500); // max price slider
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [minDiscount, setMinDiscount] = useState(0); // 0, 10, 25, 50
  const [sortBy, setSortBy] = useState("relevance"); // 'relevance' | 'price-low' | 'price-high' | 'rating' | 'popular'
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Cart & Wishlist state
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

  // Update filter when query param changes
  useEffect(() => {
    const cat = queryParams.get("category") || "All";
    setSelectedCategory(cat);
  }, [queryParams]);

  // Save cart & wishlist to localStorage
  useEffect(() => {
    localStorage.setItem("customerCart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("customerWishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Fetch all products with live background sync
  useEffect(() => {
    const fetchCatalog = async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const data = await getProducts();
        if (Array.isArray(data)) {
          setProducts((prev) => {
            if (data.length !== prev.length || data.some((p) => !prev.some((x) => x.id === p.id))) {
              return data;
            }
            return prev;
          });
        }
      } catch (err) {
        console.error("Failed to load catalog:", err);
      } finally {
        if (!silent) setLoading(false);
      }
    };

    fetchCatalog();

    // Cross-tab BroadcastChannel listener
    let syncChannel;
    try {
      syncChannel = new BroadcastChannel("shopsense_live_sync");
      syncChannel.onmessage = () => {
        fetchCatalog(true);
      };
    } catch {}

    const handleStorage = (e) => {
      if (!e || e.key === "shopsense_last_product_update" || !e.key) {
        fetchCatalog(true);
      }
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("productUpdated", () => fetchCatalog(true));
    const pollInterval = setInterval(() => fetchCatalog(true), 4000);

    return () => {
      if (syncChannel) syncChannel.close();
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("productUpdated", () => fetchCatalog(true));
      clearInterval(pollInterval);
    };
  }, []);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Keyword Search match
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchName = (p.name || "").toLowerCase().includes(q);
          const matchDesc = (p.description || "").toLowerCase().includes(q);
          const matchCat = (p.category || "").toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchCat) return false;
        }

        // Category Filter
        if (selectedCategory && selectedCategory !== "All" && selectedCategory !== "All Categories") {
          if ((p.category || "").toLowerCase() !== selectedCategory.toLowerCase()) {
            return false;
          }
        }

        // Price Filter
        if (p.price > priceRange) return false;

        // Rating Filter
        if (minRating > 0 && (p.rating || 0) < minRating) return false;

        // Stock Filter
        if (onlyInStock && p.stock === "No Stock") return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
        if (sortBy === "popular") return (b.units_sold || 0) - (a.units_sold || 0);
        return 0; // relevance
      });
  }, [products, searchQuery, selectedCategory, priceRange, minRating, onlyInStock, sortBy]);

  // Available categories list
  const categoriesList = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [products]);

  // Cart operations
  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast.success(`🛒 Added ${product.name} to Cart!`);
  };

  const handleToggleWishlist = (e, productId) => {
    e.stopPropagation();
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        toast.info("Removed from Wishlist");
        return prev.filter((id) => id !== productId);
      } else {
        toast.success("❤️ Added to Wishlist!");
        return [...prev, productId];
      }
    });
  };

  const calculateMrp = (price) => {
    return Math.round(price * 1.25);
  };

  return (
    <div className="search-results-page">
      <ToastContainer position="top-right" autoClose={2000} theme="colored" />
      
      {/* Global Header */}
      <CustomerHeader
        cartCount={cart.reduce((acc, curr) => acc + (curr.quantity || 1), 0)}
        wishlistCount={wishlist.length}
      />

      <div className="search-page-body">
        {/* Breadcrumb Navigation */}
        <div className="search-breadcrumbs">
          <Link to="/">Home</Link>
          <FiChevronRight className="crumb-sep" />
          <span>Search Results</span>
          {searchQuery && (
            <>
              <FiChevronRight className="crumb-sep" />
              <span className="crumb-active">"{searchQuery}"</span>
            </>
          )}
        </div>

        {/* Main Content Layout */}
        <div className="search-layout-grid">
          {/* Left Filter Sidebar */}
          <aside className={`search-filter-sidebar ${mobileFilterOpen ? "mobile-open" : ""}`}>
            <div className="filter-sidebar-header">
              <div className="filter-title-wrap">
                <FiSliders />
                <h3>Filters</h3>
              </div>
              <button
                type="button"
                className="clear-all-btn"
                onClick={() => {
                  setSelectedCategory("All");
                  setMinRating(0);
                  setPriceRange(2500);
                  setOnlyInStock(false);
                  setMinDiscount(0);
                }}
              >
                Clear All
              </button>
              {mobileFilterOpen && (
                <button
                  type="button"
                  className="mobile-close-filter"
                  onClick={() => setMobileFilterOpen(false)}
                >
                  <FiX />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="filter-section">
              <h4 className="filter-sec-title">Category</h4>
              <div className="filter-options-list">
                {categoriesList.map((cat, idx) => (
                  <label key={idx} className="filter-checkbox-row">
                    <input
                      type="radio"
                      name="category_filter"
                      checked={selectedCategory === cat}
                      onChange={() => setSelectedCategory(cat)}
                    />
                    <span className="checkbox-custom" />
                    <span className="option-label">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Slider */}
            <div className="filter-section">
              <div className="filter-sec-header-row">
                <h4 className="filter-sec-title">Max Price</h4>
                <span className="filter-price-val">₹{priceRange}</span>
              </div>
              <input
                type="range"
                min="50"
                max="2500"
                step="50"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="price-slider-input"
              />
              <div className="price-slider-ticks">
                <span>₹50</span>
                <span>₹1250</span>
                <span>₹2500</span>
              </div>

              {/* Quick Price Buttons */}
              <div className="quick-price-chips">
                <button
                  type="button"
                  className={`price-chip ${priceRange === 200 ? "active" : ""}`}
                  onClick={() => setPriceRange(200)}
                >
                  Under ₹200
                </button>
                <button
                  type="button"
                  className={`price-chip ${priceRange === 500 ? "active" : ""}`}
                  onClick={() => setPriceRange(500)}
                >
                  Under ₹500
                </button>
                <button
                  type="button"
                  className={`price-chip ${priceRange === 1000 ? "active" : ""}`}
                  onClick={() => setPriceRange(1000)}
                >
                  Under ₹1000
                </button>
              </div>
            </div>

            {/* Customer Ratings Filter */}
            <div className="filter-section">
              <h4 className="filter-sec-title">Customer Ratings</h4>
              <div className="filter-options-list">
                {[
                  { stars: 4, label: "4★ & above" },
                  { stars: 3, label: "3★ & above" },
                  { stars: 0, label: "All Ratings" }
                ].map((item, idx) => (
                  <label key={idx} className="filter-checkbox-row">
                    <input
                      type="radio"
                      name="rating_filter"
                      checked={minRating === item.stars}
                      onChange={() => setMinRating(item.stars)}
                    />
                    <span className="checkbox-custom" />
                    <span className="rating-pill-opt">
                      {item.stars > 0 && <FiStar className="star-icon-fill" />} {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Availability Filter */}
            <div className="filter-section">
              <h4 className="filter-sec-title">Availability</h4>
              <label className="filter-checkbox-row">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                />
                <span className="checkbox-custom" />
                <span className="option-label">Exclude Out of Stock</span>
              </label>
            </div>

            {/* Assured Badge Guarantee */}
            <div className="filter-assurance-card">
              <div className="assure-icon">
                <FiShield />
              </div>
              <div className="assure-text">
                <strong>ShopSense Assured</strong>
                <p>100% genuine products with 7-day hassle-free replacement.</p>
              </div>
            </div>
          </aside>

          {/* Right Product Grid Column */}
          <main className="search-results-main">
            {/* Top Toolbar */}
            <div className="results-toolbar-bar">
              <div className="results-count-col">
                <h2>
                  {searchQuery ? (
                    <>
                      Results for <span className="highlight-q">"{searchQuery}"</span>
                    </>
                  ) : (
                    "All Products Catalog"
                  )}
                </h2>
                <span className="items-count-text">
                  Showing {filteredProducts.length} {filteredProducts.length === 1 ? "item" : "items"}
                </span>
              </div>

              <div className="toolbar-controls">
                {/* Mobile Filter Toggle */}
                <button
                  type="button"
                  className="mobile-filter-btn"
                  onClick={() => setMobileFilterOpen(true)}
                >
                  <FiFilter /> Filters
                </button>

                {/* Sort By Selector */}
                <div className="sort-by-wrapper">
                  <span className="sort-label">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="sort-select-input"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="popular">Popularity / Units Sold</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Customer Rating</option>
                  </select>
                </div>

                {/* Grid / List View Toggle */}
                <div className="view-mode-toggle">
                  <button
                    type="button"
                    className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                    onClick={() => setViewMode("grid")}
                    title="Grid View"
                  >
                    <FiGrid />
                  </button>
                  <button
                    type="button"
                    className={`view-btn ${viewMode === "list" ? "active" : ""}`}
                    onClick={() => setViewMode("list")}
                    title="List View"
                  >
                    <FiList />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filter Chips */}
            {(selectedCategory !== "All" || minRating > 0 || onlyInStock || priceRange < 2500) && (
              <div className="active-filter-chips">
                <span className="chips-label">Active Filters:</span>
                {selectedCategory !== "All" && (
                  <span className="filter-badge-chip">
                    Category: {selectedCategory}{" "}
                    <FiX onClick={() => setSelectedCategory("All")} />
                  </span>
                )}
                {minRating > 0 && (
                  <span className="filter-badge-chip">
                    Rating: {minRating}★ & above{" "}
                    <FiX onClick={() => setMinRating(0)} />
                  </span>
                )}
                {onlyInStock && (
                  <span className="filter-badge-chip">
                    In Stock Only{" "}
                    <FiX onClick={() => setOnlyInStock(false)} />
                  </span>
                )}
                {priceRange < 2500 && (
                  <span className="filter-badge-chip">
                    Max ₹{priceRange}{" "}
                    <FiX onClick={() => setPriceRange(2500)} />
                  </span>
                )}
              </div>
            )}

            {/* Products Grid / List */}
            {loading ? (
              <div className="search-loading-state">
                <div className="search-spinner" />
                <p>Loading matching products from verified vendors...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="no-results-state">
                <div className="no-res-icon">
                  <FiSearch />
                </div>
                <h3>No products found for "{searchQuery}"</h3>
                <p>Try searching with broader terms or clear applied filters.</p>
                <button
                  type="button"
                  className="browse-all-btn"
                  onClick={() => {
                    setSelectedCategory("All");
                    setMinRating(0);
                    setPriceRange(2500);
                    setOnlyInStock(false);
                    navigate("/search");
                  }}
                >
                  Browse All Products
                </button>
              </div>
            ) : (
              <div className={`products-container ${viewMode === "list" ? "list-view" : "grid-view"}`}>
                {filteredProducts.map((product) => {
                  const mrp = calculateMrp(product.price);
                  const discountPercent = Math.round(((mrp - product.price) / mrp) * 100);
                  const isWishlisted = wishlist.includes(product.id);

                  return (
                    <motion.div
                      key={product.id}
                      className="product-card-flipkart"
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      {/* Product Image Container */}
                      <div className="product-image-frame">
                        <img
                          src={getProductImage(product)}
                          alt={product.name}
                          className="product-main-img"
                          loading="lazy"
                        />
                        
                        {/* Source Platform Badge */}
                        {(() => {
                          const srcBadge = getProductSource(product);
                          return (
                            <div 
                              className="assured-badge"
                              style={{ 
                                background: srcBadge.bg, 
                                color: srcBadge.color,
                                border: `1px solid ${srcBadge.color}40`,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                            >
                              <span>{srcBadge.icon}</span> {srcBadge.label}
                            </div>
                          );
                        })()}

                        {/* Wishlist Button */}
                        <button
                          type="button"
                          className={`wishlist-heart-btn ${isWishlisted ? "active" : ""}`}
                          onClick={(e) => handleToggleWishlist(e, product.id)}
                          title="Add to Wishlist"
                        >
                          <FiHeart />
                        </button>
                      </div>

                      {/* Product Details Section */}
                      <div className="product-info-frame">
                        <div className="product-cat-tag">{product.category || "General"}</div>
                        <h3 className="product-name-title" title={product.name}>
                          {product.name}
                        </h3>

                        {/* Ratings and Reviews */}
                        <div className="product-rating-row">
                          <span className="rating-badge-green">
                            {product.rating || 4.7} <FiStar className="star-mini" />
                          </span>
                          <span className="reviews-count-text">
                            ({Math.floor((product.units_sold || 25) * 4.2)} Ratings)
                          </span>
                        </div>

                        {/* Price Block */}
                        <div className="product-price-row">
                          <span className="selling-price">₹{product.price}</span>
                          <span className="mrp-strikethrough">₹{mrp}</span>
                          <span className="discount-tag">{discountPercent}% off</span>
                        </div>

                        {/* Delivery & Warranty info */}
                        <div className="product-perks-row">
                          <span className="perk-item"><FiTruck /> Free Delivery</span>
                          <span className="perk-item"><FiTag /> Top Deal</span>
                        </div>

                        {/* Stock & Add to Cart button */}
                        <div className="card-bottom-actions">
                          <span className={`stock-status-pill ${product.stock === 'No Stock' ? 'out-of-stock' : 'in-stock'}`}>
                            {product.stock || "In Stock"}
                          </span>

                          <button
                            type="button"
                            className="add-to-cart-btn-flipkart"
                            onClick={(e) => handleAddToCart(e, product)}
                          >
                            <FiShoppingCart /> Add to Cart
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default SearchResults;
