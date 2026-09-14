import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiDollarSign,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiDownload,
  FiTruck,
  FiMapPin,
  FiActivity,
  FiX,
  FiExternalLink,
  FiRefreshCw,
  FiShield
} from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../components/Header";
import StatsCard from "../components/StatsCard";
import { exportExcel, exportCSV, exportPDF } from "../services/exportService";
import { getTransactions, advanceOrderTracking, getOrderTracking } from "../services/api";

const INITIAL_TRANSACTIONS = [
  { id: 101, transaction_ref: "TXN-S24U01", customer_name: "Rahul Sharma", product_name: "Samsung Galaxy S24 Ultra 5G (Titanium Gray)", amount: 139999.00, created_at: "2026-09-03T18:30:00Z", status: "Out for Delivery", payment_method: "UPI / GPay", quantity: 1 },
  { id: 102, transaction_ref: "TXN-IP16P2", customer_name: "Pooja Mehta", product_name: "Apple iPhone 16 Pro Max (Desert Titanium)", amount: 144900.00, created_at: "2026-09-03T17:15:00Z", status: "In Transit", payment_method: "Credit Card", quantity: 1 },
  { id: 103, transaction_ref: "TXN-WH503", customer_name: "Aarav Gupta", product_name: "Sony WH-1000XM5 Wireless Headphones", amount: 29990.00, created_at: "2026-09-03T16:00:00Z", status: "Completed", payment_method: "UPI / PhonePe", quantity: 1 },
  { id: 104, transaction_ref: "TXN-MBP04", customer_name: "Neha Verma", product_name: "Apple MacBook Pro M3 Max 16-inch", amount: 319900.00, created_at: "2026-09-03T15:20:00Z", status: "Packed", payment_method: "Net Banking", quantity: 1 },
  { id: 105, transaction_ref: "TXN-PS505", customer_name: "Vikram Malhotra", product_name: "Sony PlayStation 5 Slim Disc Edition (1TB)", amount: 54990.00, created_at: "2026-09-03T14:10:00Z", status: "Out for Delivery", payment_method: "Debit Card", quantity: 1 },
  { id: 106, transaction_ref: "TXN-AJ106", customer_name: "Karan Johar", product_name: "Nike Air Jordan 1 Retro High OG 'Chicago'", amount: 18995.00, created_at: "2026-09-03T13:45:00Z", status: "Completed", payment_method: "UPI / GPay", quantity: 1 }
];

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("ledger"); // 'ledger' | 'dispatches'

  // Live Tracking Modal State for Admin/Vendor
  const [activeTrackingOrder, setActiveTrackingOrder] = useState(null);
  const [trackingModalData, setTrackingModalData] = useState(null);
  const [loadingTrackingModal, setLoadingTrackingModal] = useState(false);

  const fetchTransactionsList = async () => {
    setLoading(true);
    try {
      const data = await getTransactions();
      if (data && data.length > 0) {
        setTransactions(data);
      } else {
        setTransactions(INITIAL_TRANSACTIONS);
      }
    } catch {
      setTransactions(INITIAL_TRANSACTIONS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactionsList();
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const cust = (t.customer_name || t.customer || "").toLowerCase();
      const prod = (t.product_name || t.product || "").toLowerCase();
      const ref = (t.transaction_ref || t.id.toString()).toLowerCase();
      const q = search.toLowerCase();

      const matchesSearch = cust.includes(q) || prod.includes(q) || ref.includes(q);
      const matchesStatus = statusFilter === "All" || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [transactions, search, statusFilter]);

  // Open Live Tracking Radar Modal
  const handleOpenTrackingModal = async (tx) => {
    setActiveTrackingOrder(tx);
    setLoadingTrackingModal(true);
    try {
      const data = await getOrderTracking(tx.transaction_ref || tx.id);
      setTrackingModalData(data);
    } catch {
      toast.error("Could not fetch live telemetry");
    } finally {
      setLoadingTrackingModal(false);
    }
  };

  // Vendor / Admin updates dispatch stage
  const handleUpdateDispatchStatus = async (tx, newStatus) => {
    try {
      await advanceOrderTracking(tx.transaction_ref || tx.id, null, newStatus);
      toast.success(`Order ${tx.transaction_ref} status updated to: ${newStatus}`);
      // Update local state
      setTransactions((prev) =>
        prev.map((item) => (item.id === tx.id ? { ...item, status: newStatus } : item))
      );
      if (activeTrackingOrder && activeTrackingOrder.id === tx.id) {
        setActiveTrackingOrder({ ...activeTrackingOrder, status: newStatus });
      }
    } catch {
      toast.error("Failed to update status on server");
    }
  };

  const totalVolume = useMemo(() => {
    return transactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  }, [transactions]);

  const completedCount = useMemo(() => {
    return transactions.filter((t) => t.status === "Completed").length;
  }, [transactions]);

  const activeInTransitCount = useMemo(() => {
    return transactions.filter((t) => ["In Transit", "Out for Delivery", "Processing", "Packed"].includes(t.status)).length;
  }, [transactions]);

  const handleExportPDF = () => {
    exportPDF(filteredTransactions.map((t) => ({ id: t.id, name: t.customer_name, email: `${t.product_name} (₹${t.amount})` })));
    toast.success("Downloaded PDF Report!");
  };

  const handleExportExcel = () => {
    exportExcel(filteredTransactions);
    toast.success("Downloaded Excel Report!");
  };

  const handleExportCSV = () => {
    exportCSV(filteredTransactions);
    toast.success("Downloaded CSV Report!");
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
      <Header
        title="Transaction & Dispatch Ledger"
        subtitle="Real-time multi-vendor orders, financial auditing, and live courier tracking"
      />

      {/* KPI Cards */}
      <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "18px", marginBottom: "24px" }}>
        <StatsCard
          title="Total Gross Volume"
          value={`₹${totalVolume.toLocaleString("en-IN")}`}
          icon={<FiDollarSign />}
          color="#2563EB"
          change={`${transactions.length} total orders`}
        />
        <StatsCard
          title="Completed Deliveries"
          value={completedCount}
          icon={<FiCheckCircle />}
          color="#10B981"
          change={`${Math.round((completedCount / (transactions.length || 1)) * 100)}% completion rate`}
        />
        <StatsCard
          title="Live Dispatches In-Transit"
          value={activeInTransitCount}
          icon={<FiTruck />}
          color="#06B6D4"
          change="GPS live tracking active"
        />
      </div>

      {/* View Switcher Tabs */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        <button
          className={`btn ${activeTab === "ledger" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("ledger")}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <FiFileText /> Financial Ledger Table
        </button>
        <button
          className={`btn ${activeTab === "dispatches" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("dispatches")}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <FiActivity /> Live Dispatches Radar ({activeInTransitCount})
        </button>
      </div>

      {/* Search & Export Toolbar */}
      <div className="chart-card" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: "12px", flex: 1, minWidth: "280px" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <FiSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="text"
                placeholder="Search orders by customer, product, or Order ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 38px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-surface)",
                  color: "var(--text-main)",
                  outline: "none"
                }}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                background: "var(--bg-surface)",
                color: "var(--text-main)",
                outline: "none"
              }}
            >
              <option value="All">All Statuses</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="In Transit">In Transit</option>
              <option value="Packed">Packed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn btn-secondary" onClick={handleExportCSV}>
              <FiDownload /> CSV
            </button>
            <button className="btn btn-secondary" onClick={handleExportExcel}>
              <FiDownload /> Excel
            </button>
            <button className="btn btn-primary" onClick={handleExportPDF}>
              <FiFileText /> PDF Report
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Financial Ledger Table */}
      {activeTab === "ledger" && (
        <div className="chart-card">
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order Reference</th>
                  <th>Customer Name</th>
                  <th>Purchased Product</th>
                  <th>Total Amount</th>
                  <th>Payment Method</th>
                  <th>Order Date</th>
                  <th>Status</th>
                  <th>Live Tracking</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 800, color: "var(--primary-blue)" }}>
                      {t.transaction_ref || `#ORD-${t.id}`}
                    </td>
                    <td style={{ fontWeight: 700 }}>{t.customer_name || t.customer}</td>
                    <td style={{ maxWidth: "260px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {t.product_name || t.product || "Real-World Package"}
                    </td>
                    <td style={{ fontWeight: 800, color: "var(--text-main)" }}>
                      ₹{parseFloat(t.amount || 0).toLocaleString("en-IN")}
                    </td>
                    <td style={{ color: "var(--text-muted)" }}>{t.payment_method || t.payment || "UPI"}</td>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                      {new Date(t.created_at || Date.now()).toLocaleDateString()}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          t.status === "Completed"
                            ? "badge-success"
                            : t.status === "Out for Delivery"
                            ? "badge-info"
                            : t.status === "In Transit"
                            ? "badge-warning"
                            : "badge-danger"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "0.78rem",
                          padding: "5px 10px",
                          background: "rgba(16, 185, 129, 0.12)",
                          color: "#10B981",
                          border: "1px solid rgba(16, 185, 129, 0.35)",
                          cursor: "pointer"
                        }}
                        onClick={() => handleOpenTrackingModal(t)}
                      >
                        <FiTruck /> Track Live
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Live Dispatches & Radar View */}
      {activeTab === "dispatches" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
          {filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className="chart-card"
              style={{
                borderRadius: "16px",
                border: "1.5px solid var(--border-color)",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "14px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 700 }}>ORDER REF</span>
                  <h4 style={{ margin: "2px 0 0 0", fontSize: "1.05rem", fontWeight: 800, color: "var(--primary-blue)" }}>
                    {tx.transaction_ref || `#ORD-${tx.id}`}
                  </h4>
                </div>
                <span
                  style={{
                    background: tx.status === "Completed" ? "rgba(16, 185, 129, 0.15)" : "rgba(6, 182, 212, 0.15)",
                    color: tx.status === "Completed" ? "#10B981" : "#06B6D4",
                    border: `1px solid ${tx.status === "Completed" ? "rgba(16, 185, 129, 0.35)" : "rgba(6, 182, 212, 0.35)"}`,
                    padding: "4px 10px",
                    borderRadius: "20px",
                    fontSize: "0.72rem",
                    fontWeight: 800
                  }}
                >
                  {tx.status}
                </span>
              </div>

              <div>
                <strong style={{ fontSize: "0.92rem", display: "block", color: "var(--text-main)" }}>
                  {tx.product_name || "Flagship Item"}
                </strong>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Customer: <strong>{tx.customer_name || tx.customer}</strong>
                </span>
              </div>

              <div style={{ background: "var(--bg-primary)", padding: "10px 14px", borderRadius: "10px", fontSize: "0.82rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ color: "var(--text-muted)" }}>Courier Partner:</span>
                  <strong style={{ color: "var(--text-main)" }}>Vikram Rathore</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ color: "var(--text-muted)" }}>Vehicle:</span>
                  <span>Hero Electric (MH-02-EE-8821)</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Amount:</span>
                  <strong style={{ color: "var(--primary-blue)" }}>₹{parseFloat(tx.amount || 0).toLocaleString("en-IN")}</strong>
                </div>
              </div>

              {/* Status Update Quick Select */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, fontSize: "0.76rem" }}
                  onClick={() => handleUpdateDispatchStatus(tx, "Packed")}
                >
                  Mark Packed
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, fontSize: "0.76rem" }}
                  onClick={() => handleUpdateDispatchStatus(tx, "Out for Delivery")}
                >
                  Out for Delivery
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, fontSize: "0.76rem", background: "rgba(16, 185, 129, 0.1)", color: "#10B981" }}
                  onClick={() => handleUpdateDispatchStatus(tx, "Completed")}
                >
                  Delivered
                </button>
              </div>

              <button
                className="btn btn-primary btn-sm"
                style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: "6px" }}
                onClick={() => handleOpenTrackingModal(tx)}
              >
                <FiTruck /> View Live GPS Radar
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ======================================================= */}
      {/* ADMIN LIVE TRACKING MODAL POPUP                         */}
      {/* ======================================================= */}
      <AnimatePresence>
        {activeTrackingOrder && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(10, 15, 29, 0.8)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "20px"
            }}
            onClick={() => setActiveTrackingOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              style={{
                background: "var(--bg-surface)",
                border: "1.5px solid var(--border-color)",
                borderRadius: "20px",
                maxWidth: "700px",
                width: "100%",
                padding: "26px",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
                color: "var(--text-main)"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <h3 style={{ margin: "0 0 4px 0", fontSize: "1.15rem", fontWeight: 800 }}>
                    Live Delivery Tracking • {activeTrackingOrder.transaction_ref}
                  </h3>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    Recipient: {activeTrackingOrder.customer_name || activeTrackingOrder.customer} • Destination: Bandra West, Mumbai
                  </p>
                </div>
                <button
                  style={{ background: "transparent", border: "none", fontSize: "1.3rem", color: "var(--text-muted)", cursor: "pointer" }}
                  onClick={() => setActiveTrackingOrder(null)}
                >
                  <FiX />
                </button>
              </div>

              {loadingTrackingModal ? (
                <p>Loading telemetry...</p>
              ) : (
                <>
                  {/* Status Banner */}
                  <div
                    style={{
                      background: "rgba(6, 182, 212, 0.12)",
                      border: "1px solid rgba(6, 182, 212, 0.3)",
                      borderRadius: "12px",
                      padding: "14px 18px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "16px"
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "0.72rem", color: "#06B6D4", fontWeight: 800, textTransform: "uppercase" }}>CURRENT STATUS</span>
                      <h4 style={{ margin: "2px 0 0 0", color: "var(--text-main)" }}>{activeTrackingOrder.status}</h4>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 700 }}>DELIVERY OTP</span>
                      <h3 style={{ margin: "2px 0 0 0", letterSpacing: "2px", color: "var(--primary-blue)" }}>
                        {trackingModalData?.otp || "7492"}
                      </h3>
                    </div>
                  </div>

                  {/* Courier Card */}
                  <div
                    style={{
                      background: "var(--bg-primary)",
                      borderRadius: "12px",
                      padding: "14px 18px",
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      marginBottom: "18px"
                    }}
                  >
                    <img
                      src={trackingModalData?.courier?.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"}
                      alt="Courier"
                      style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover", border: "2px solid #06B6D4" }}
                    />
                    <div style={{ flex: 1 }}>
                      <strong style={{ display: "block", fontSize: "0.95rem" }}>
                        {trackingModalData?.courier?.name || "Vikram Rathore"} (Rating: 4.9★)
                      </strong>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                        Vehicle: {trackingModalData?.courier?.vehicle_model || "Hero Electric Nyx"} • {trackingModalData?.courier?.vehicle_number || "MH-02-EE-8821"}
                      </span>
                    </div>
                    <span style={{ fontSize: "0.8rem", color: "#10B981", fontWeight: 700 }}>
                      📞 {trackingModalData?.courier?.phone || "+91 98201 44829"}
                    </span>
                  </div>

                  {/* Telemetry Logs */}
                  <div style={{ marginBottom: "20px" }}>
                    <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                      Live Telemetry Logs
                    </span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px", maxHeight: "150px", overflowY: "auto" }}>
                      {(trackingModalData?.telemetry_logs || []).map((log, i) => (
                        <div key={i} style={{ display: "flex", gap: "10px", fontSize: "0.8rem" }}>
                          <span style={{ color: "#06B6D4", fontWeight: 700, minWidth: "85px" }}>{log.time}</span>
                          <span style={{ color: "var(--text-main)" }}>{log.event}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <a
                      href={`http://localhost:5174/track/${activeTrackingOrder.transaction_ref || activeTrackingOrder.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                      style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                    >
                      <FiExternalLink /> Open Customer Live Map View
                    </a>
                    <button className="btn btn-primary" onClick={() => setActiveTrackingOrder(null)}>
                      Close
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default Transactions;