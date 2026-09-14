import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiChevronLeft, FiTrash2, FiPlus, FiMinus, FiShield, FiCheckCircle } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CustomerHeader from "../components/CustomerHeader";
import { createTransaction } from "../services/api";
import { getPaymentQR, getPaymentUPI, DEFAULT_PAYEE_NAME } from "../utils/paymentConfig";
import "./CartCheckout.css";

function CartCheckout() {
  const navigate = useNavigate();

  // Load cart and wishlist from localStorage
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("customerCart")) || [];
    } catch {
      return [];
    }
  });

  const [wishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("customerWishlist")) || [];
    } catch {
      return [];
    }
  });

  const [userAddress, setUserAddress] = useState(
    localStorage.getItem("userAddress") || "Flat 402, Sunshine Heights, Bandra West, Mumbai - 400050, India"
  );
  
  const userName = localStorage.getItem("userName") || "Customer";
  const membershipTier = localStorage.getItem("membershipTier") || "Gold";

  // Auto-sync cart with local storage
  useEffect(() => {
    localStorage.setItem("customerCart", JSON.stringify(cart));
  }, [cart]);

  // Handle quantity changes
  const handleQuantityChange = (productId, delta) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean)
    );
  };

  const handleRemoveItem = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    toast.info("Item removed from cart");
  };

  // Pricing calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const getCashbackRate = () => {
    if (membershipTier.toLowerCase().includes("diamond")) return 0.15;
    if (membershipTier.toLowerCase().includes("platinum")) return 0.10;
    return 0.05;
  };

  const cashbackRate = getCashbackRate();
  const cashbackDiscount = subtotal * cashbackRate;
  const grandTotal = Math.max(subtotal - cashbackDiscount, 0);

  // Vendor QR / UPI Integration with uploaded merchant QR
  const paymentQRUrl = getPaymentQR();
  const paymentUPI = getPaymentUPI();

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      const firstItem = cart[0];
      const txRes = await createTransaction({
        customer_name: userName,
        amount: grandTotal,
        payment_method: "QR Scanner",
        status: "Out for Delivery",
        product_id: firstItem.id,
        quantity: cart.reduce((sum, i) => sum + i.quantity, 0)
      });

      const orderRef = txRes?.transaction_ref || `TXN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      toast.success("🎉 Payment verified! Order Placed. Connecting to Live Delivery Radar...");
      setCart([]); // Clear cart
      setTimeout(() => {
        navigate(`/track/${orderRef}`);
      }, 1000);
    } catch {
      toast.error("Checkout failed. Please check backend connection.");
    }
  };

  return (
    <div className="cart-checkout-page">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      <CustomerHeader
        cartCount={cart.reduce((acc, curr) => acc + (curr.quantity || 1), 0)}
        wishlistCount={wishlist.length}
      />

      <div className="checkout-container">
        <div className="checkout-header">
          <button className="btn-back" onClick={() => navigate(-1)}>
            <FiChevronLeft /> Back to Shopping
          </button>
          <h1>Secure Checkout</h1>
        </div>

        <div className="checkout-content">
          {/* Left Column: Cart Items & Shipping */}
          <div className="checkout-main-col">
            <div className="checkout-section-card">
              <h2>1. Delivery Address</h2>
              <div className="address-display">
                <p><strong>{userName}</strong></p>
                <p>{userAddress}</p>
                <button className="btn-text-edit">Change Address</button>
              </div>
            </div>

            <div className="checkout-section-card">
              <h2>2. Review Your Cart</h2>
              {cart.length === 0 ? (
                <div className="empty-cart-message">
                  <p>Your cart is currently empty.</p>
                  <Link to="/" className="btn-shop-now">Start Shopping</Link>
                </div>
              ) : (
                <div className="cart-items-list">
                  {cart.map((item) => (
                    <div key={item.id} className="cart-item-row">
                      <div className="item-image-col">
                        <img 
                          src={item.image_url || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"} 
                          alt={item.name} 
                        />
                      </div>
                      <div className="item-details-col">
                        <h3>{item.name}</h3>
                        <p className="item-seller">Seller: {item.vendor?.name || "ShopSense Verified"}</p>
                        <div className="item-price-row">
                          <span className="price">₹{item.price.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="item-actions-col">
                        <div className="qty-controls">
                          <button onClick={() => handleQuantityChange(item.id, -1)}><FiMinus /></button>
                          <span>{item.quantity}</span>
                          <button onClick={() => handleQuantityChange(item.id, 1)}><FiPlus /></button>
                        </div>
                        <button className="btn-remove" onClick={() => handleRemoveItem(item.id)}>
                          <FiTrash2 /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Payment & Order Summary */}
          <div className="checkout-sidebar">
            <div className="order-summary-card">
              <h2>Order Summary</h2>
              
              <div className="summary-row">
                <span>Items ({cart.reduce((s, i) => s + i.quantity, 0)}):</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              
              <div className="summary-row discount">
                <span>VIP Cashback ({membershipTier}):</span>
                <span>- ₹{cashbackDiscount.toFixed(2)}</span>
              </div>
              
              <div className="summary-row">
                <span>Delivery:</span>
                <span className="free">FREE</span>
              </div>
              
              <div className="summary-divider"></div>
              
              <div className="summary-row total">
                <span>Order Total:</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>

              {cart.length > 0 && (
                <div className="payment-qr-section">
                  <div className="qr-header">
                    <FiShield className="shield-icon" />
                    <span>Scan & Pay Securely</span>
                  </div>
                  
                  <div className="qr-code-display">
                    <img src={paymentQRUrl} alt="Scan to Pay QR" className="qr-image" />
                  </div>
                  <p className="upi-id-text">UPI ID: <strong>{paymentUPI}</strong> ({DEFAULT_PAYEE_NAME})</p>
                  
                  <div className="payment-instructions">
                    <p><FiCheckCircle /> Open your payment app</p>
                    <p><FiCheckCircle /> Scan the QR code above</p>
                    <p><FiCheckCircle /> Complete the payment of <strong>₹{grandTotal.toFixed(2)}</strong></p>
                  </div>

                  <button className="btn-confirm-order" onClick={handleCheckout}>
                    I Have Made The Payment
                  </button>
                </div>
              )}
            </div>

            <div className="secure-checkout-badges">
              <span>🔒 SSL Encrypted</span>
              <span>🛡️ Buyer Protection</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartCheckout;
