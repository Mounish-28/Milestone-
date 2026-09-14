import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { FiTrendingUp, FiUsers, FiShoppingBag, FiDollarSign, FiFilter } from "react-icons/fi";
import Header from "../components/Header";
import StatsCard from "../components/StatsCard";
import { useTheme } from "../context/ThemeContext";

const vendorPerformanceData = [
  { vendor: "Tech Supplies Inc", sales: 48500, orders: 320 },
  { vendor: "Aura Apparel", sales: 32100, orders: 240 },
  { vendor: "Nova Gadgets", sales: 29400, orders: 195 },
  { vendor: "Green Life Studio", sales: 18900, orders: 150 },
  { vendor: "Apex Gear Co", sales: 14200, orders: 98 }
];

const conversionFunnel = [
  { stage: "Store Visits", count: 45000, rate: "100%" },
  { stage: "Product Views", count: 28400, rate: "63.1%" },
  { stage: "Added to Cart", count: 8900, rate: "19.7%" },
  { stage: "Checkout Started", count: 5200, rate: "11.5%" },
  { stage: "Orders Placed", count: 3950, rate: "8.7%" }
];

function Analytics() {
  const { theme } = useTheme();
  const [timeframe, setTimeframe] = useState("30d");
  const isDark = theme === "dark";

  const strokeColor = isDark ? "#374151" : "#E2E8F0";
  const textColor = isDark ? "#9CA3AF" : "#64748B";
  const tooltipBg = isDark ? "#1F2937" : "#FFFFFF";
  const tooltipText = isDark ? "#F9FAFB" : "#0F172A";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="page-container"
    >
      <Header title="Advanced Business Analytics" subtitle="Comprehensive vendor performance, conversion rates, and sales metrics" />

      {/* Timeframe Filter Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Performance Intelligence</h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'var(--bg-surface)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <FiFilter style={{ marginLeft: '8px', color: 'var(--text-muted)' }} />
          {["7d", "30d", "90d", "1y"].map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`btn ${timeframe === tf ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '6px' }}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '24px' }}>
        <StatsCard title="Conversion Rate" value="3.84%" icon={<FiTrendingUp />} color="#10B981" change="+0.4%" />
        <StatsCard title="Avg. Order Value" value="₹845.00" icon={<FiDollarSign />} color="#2563EB" change="+₹42.00" />
        <StatsCard title="Repeat Customers" value="42.8%" icon={<FiUsers />} color="#8B5CF6" change="+3.1%" />
        <StatsCard title="Return Rate" value="1.2%" icon={<FiShoppingBag />} color="#F59E0B" change="-0.3%" isPositive={true} />
      </div>

      {/* Charts Grid */}
      <div className="chart-grid">
        {/* Vendor Sales Comparison Bar Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Top Vendors by Gross Revenue</h3>
              <p className="chart-subtitle">Revenue breakdown by marketplace partner</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={vendorPerformanceData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={strokeColor} vertical={false} />
              <XAxis dataKey="vendor" tick={{ fill: textColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: textColor, fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={val => `$${val / 1000}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  color: tooltipText,
                  borderRadius: "8px",
                  border: `1px solid ${strokeColor}`
                }}
                formatter={val => [`$${val.toLocaleString()}`, "Sales"]}
              />
              <Bar dataKey="sales" fill="#2563EB" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Conversion Funnel Table */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Conversion Funnel</h3>
              <p className="chart-subtitle">Customer journey progression</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {conversionFunnel.map((item, idx) => (
              <div key={idx} style={{ padding: '10px 14px', background: 'var(--bg-surface-hover)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 600 }}>{item.stage}</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary-blue)' }}>{item.count.toLocaleString()} ({item.rate})</span>
                </div>
                <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: item.rate, height: '100%', background: 'linear-gradient(90deg, var(--primary-blue), var(--accent-emerald))', borderRadius: '3px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Analytics;