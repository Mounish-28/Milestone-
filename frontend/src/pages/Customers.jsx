import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiSearch, FiUsers, FiMapPin, FiX, FiAward, FiEye, FiTrendingUp } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../components/Header";
import StatsCard from "../components/StatsCard";
import { getCustomers, createCustomer, getCustomerSegmentation, getCustomerInsights } from "../services/api";

const initialCustomers = [
  { id: 1, name: "Aarav Sharma", email: "aarav@gmail.com", phone: "+91 98765 43210", city: "Mumbai", orders: 18, status: "Active", total_spent: 548.98, tier: "VIP / High Value" },
  { id: 2, name: "Priya Patel", email: "priya@gmail.com", phone: "+91 98123 45678", city: "Bangalore", orders: 12, status: "Active", total_spent: 199.50, tier: "Moderate Spender" },
  { id: 3, name: "Vikram Singh", email: "vikram@gmail.com", phone: "+91 99887 76655", city: "Delhi", orders: 6, status: "Active", total_spent: 89.00, tier: "Low Spender / New" },
  { id: 4, name: "Ananya Roy", email: "ananya@gmail.com", phone: "+91 97766 55443", city: "Kolkata", orders: 4, status: "Active", total_spent: 45.00, tier: "Low Spender / New" },
];

function Customers() {
  const [customers, setCustomers] = useState(initialCustomers);
  const [segmentation, setSegmentation] = useState(null);
  const [insightsModal, setInsightsModal] = useState(null);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("All");
  const [tierFilter, setTierFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: "", email: "", phone: "", city: "" });

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [custList, segData] = await Promise.allSettled([
          getCustomers(),
          getCustomerSegmentation()
        ]);

        if (!active) return;

        if (segData.status === "fulfilled" && segData.value) {
          setSegmentation(segData.value);
        }

        if (custList.status === "fulfilled" && Array.isArray(custList.value) && custList.value.length > 0) {
          const segMap = {};
          if (segData.status === "fulfilled" && segData.value?.segments) {
            segData.value.segments.forEach(seg => {
              seg.customers?.forEach(sc => {
                segMap[sc.name.trim().toLowerCase()] = {
                  tier: sc.tier,
                  total_spent: sc.total_spent,
                  orders: sc.orders
                };
              });
            });
          }

          setCustomers(custList.value.map(c => {
            const segInfo = segMap[c.name.trim().toLowerCase()];
            return {
              ...c,
              phone: c.phone || "+91 98000 12345",
              orders: segInfo ? segInfo.orders : 1,
              total_spent: segInfo ? segInfo.total_spent : 0,
              tier: segInfo ? segInfo.tier : "Low Spender / New",
              status: "Active"
            };
          }));
        }
      } catch {
        // Fallback
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const cities = useMemo(() => {
    const list = Array.from(new Set(customers.map(c => c.city).filter(Boolean)));
    return ["All", ...list];
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                            c.email.toLowerCase().includes(search.toLowerCase()) ||
                            c.city.toLowerCase().includes(search.toLowerCase());
      const matchesCity = cityFilter === "All" || c.city === cityFilter;
      const matchesTier = tierFilter === "All" || c.tier === tierFilter;
      return matchesSearch && matchesCity && matchesTier;
    });
  }, [customers, search, cityFilter, tierFilter]);

  const handleOpenInsights = async (customerId) => {
    try {
      const data = await getCustomerInsights(customerId);
      setInsightsModal(data);
    } catch {
      const found = customers.find(c => c.id === customerId);
      setInsightsModal({
        name: found?.name || "Customer",
        email: found?.email || "",
        city: found?.city || "",
        country: "India",
        segment_tier: found?.tier || "Standard",
        metrics: {
          total_spent: found?.total_spent || 120.0,
          order_count: found?.orders || 1,
          avg_order_value: found?.total_spent ? (found.total_spent / Math.max(found.orders, 1)).toFixed(2) : 120.0
        },
        recent_transactions: []
      });
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    if (!newCustomer.name || !newCustomer.email || !newCustomer.city) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      const created = await createCustomer({
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone || "+91 98765 00000",
        city: newCustomer.city
      });
      setCustomers(prev => [{ ...created, orders: 1, total_spent: 0, tier: "Low Spender / New", status: "Active" }, ...prev]);
      toast.success("Customer added successfully!");
    } catch {
      const mockCreated = {
        id: Date.now(),
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone || "+91 98765 00000",
        city: newCustomer.city,
        orders: 1,
        total_spent: 0,
        tier: "Low Spender / New",
        status: "Active"
      };
      setCustomers(prev => [mockCreated, ...prev]);
      toast.success("Customer added locally!");
    }
    setShowModal(false);
    setNewCustomer({ name: "", email: "", phone: "", city: "" });
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
      <Header title="Customer Intelligence & Segmentation" subtitle="SQL-based customer value grouping (VIP, Moderate, Low), demographics, and insights" />

      {/* KPI Cards */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '24px' }}>
        <StatsCard title="Total Customers" value={customers.length} icon={<FiUsers />} color="#2563EB" change="+14.2% growth" />
        <StatsCard title="VIP Customers (>= ₹5,000)" value={segmentation?.summary?.vip_count ?? customers.filter(c => c.tier?.includes("VIP")).length} icon={<FiAward />} color="#10B981" change="High Value Spenders" />
        <StatsCard title="Moderate Spenders" value={segmentation?.summary?.moderate_count ?? customers.filter(c => c.tier?.includes("Moderate")).length} icon={<FiTrendingUp />} color="#F59E0B" change="₹1,000 - ₹5,000 Spenders" />
        <StatsCard title="Cities Covered" value={Math.max(cities.length - 1, 4)} icon={<FiMapPin />} color="#8B5CF6" change="Across India" />
      </div>

      {/* Search & Filter Bar */}
      <div className="chart-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '280px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search customers by name, email, or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-main)',
                  outline: 'none'
                }}
              />
            </div>

            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-surface)',
                color: 'var(--text-main)',
                outline: 'none'
              }}
            >
              <option value="All">All Tiers</option>
              <option value="VIP / High Value">VIP / High Value</option>
              <option value="Moderate Spender">Moderate Spender</option>
              <option value="Low Spender / New">Low Spender / New</option>
            </select>

            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-surface)',
                color: 'var(--text-main)',
                outline: 'none'
              }}
            >
              {cities.map(c => (
                <option key={c} value={c}>{c === 'All' ? 'All Cities' : c}</option>
              ))}
            </select>
          </div>

          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <FiPlus /> Add Customer
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="chart-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Phone</th>
                <th>City</th>
                <th>Total Spent</th>
                <th>Segment Tier</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td style={{ fontWeight: 600 }}>#{customer.id}</td>
                  <td style={{ fontWeight: 700 }}>{customer.name}</td>
                  <td style={{ color: 'var(--primary-blue)' }}>{customer.email}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{customer.phone}</td>
                  <td>
                    <span className="badge badge-info">{customer.city}</span>
                  </td>
                  <td style={{ fontWeight: 800, color: customer.tier?.includes("VIP") ? "#10B981" : "var(--primary-blue)" }}>
                    ${parseFloat(customer.total_spent || 0).toFixed(2)}
                  </td>
                  <td>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "8px",
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        background: customer.tier?.includes("VIP") ? "rgba(16, 185, 129, 0.15)" : customer.tier?.includes("Moderate") ? "rgba(245, 158, 11, 0.15)" : "rgba(100, 116, 139, 0.15)",
                        color: customer.tier?.includes("VIP") ? "#10B981" : customer.tier?.includes("Moderate") ? "#F59E0B" : "#94A3B8",
                        border: `1px solid ${customer.tier?.includes("VIP") ? "rgba(16, 185, 129, 0.3)" : customer.tier?.includes("Moderate") ? "rgba(245, 158, 11, 0.3)" : "rgba(100, 116, 139, 0.3)"}`
                      }}
                    >
                      {customer.tier}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: "6px 12px", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: "4px" }}
                      onClick={() => handleOpenInsights(customer.id)}
                    >
                      <FiEye /> Insights
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Insights Modal */}
      <AnimatePresence>
        {insightsModal && (
          <div className="modal-overlay">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="modal-card"
              style={{ maxWidth: "550px" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 800 }}>👤 Customer Insights</h3>
                  <span style={{ fontSize: "0.85rem", color: "var(--primary-blue)", fontWeight: 700 }}>
                    {insightsModal.name} ({insightsModal.segment_tier})
                  </span>
                </div>
                <button
                  onClick={() => setInsightsModal(null)}
                  style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "1.3rem", cursor: "pointer" }}
                >
                  <FiX />
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                <div style={{ background: "var(--bg-surface-hover)", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Total Spent</span>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#10B981", margin: "4px 0 0 0" }}>
                    ${parseFloat(insightsModal.metrics?.total_spent || 0).toFixed(2)}
                  </h4>
                </div>

                <div style={{ background: "var(--bg-surface-hover)", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Orders Count</span>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#60A5FA", margin: "4px 0 0 0" }}>
                    {insightsModal.metrics?.order_count || 0}
                  </h4>
                </div>

                <div style={{ background: "var(--bg-surface-hover)", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Avg Order Value</span>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#F59E0B", margin: "4px 0 0 0" }}>
                    ${parseFloat(insightsModal.metrics?.avg_order_value || 0).toFixed(2)}
                  </h4>
                </div>
              </div>

              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "16px" }}>
                <p>📍 Location: <strong>{insightsModal.city}, {insightsModal.country || "India"}</strong></p>
                <p style={{ marginTop: "4px" }}>📧 Email: <strong>{insightsModal.email}</strong></p>
              </div>

              {insightsModal.recent_transactions?.length > 0 && (
                <div>
                  <h4 style={{ fontSize: "0.9rem", marginBottom: "8px" }}>Recent Purchase History</h4>
                  <div style={{ maxHeight: "150px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
                    {insightsModal.recent_transactions.map((tx, idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "var(--bg-surface-hover)", borderRadius: "6px", fontSize: "0.8rem" }}>
                        <span>{tx.transaction_ref}</span>
                        <strong style={{ color: "#10B981" }}>₹{parseFloat(tx.amount).toFixed(2)}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                className="btn btn-secondary"
                style={{ width: "100%", marginTop: "16px" }}
                onClick={() => setInsightsModal(null)}
              >
                Close Insights
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Customer Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="modal-card"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Add New Customer</h3>
                <button
                  onClick={() => setShowModal(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
                >
                  <FiX />
                </button>
              </div>

              <form onSubmit={handleAddCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jane Doe"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="jane@example.com"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Phone</label>
                    <input
                      type="text"
                      placeholder="+91 98765 43210"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>City</label>
                    <input
                      type="text"
                      required
                      placeholder="Hyderabad"
                      value={newCustomer.city}
                      onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Profile
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default Customers;