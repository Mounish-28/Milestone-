import { motion } from "framer-motion";
import { FiFileText, FiDownload, FiCheckCircle, FiClock } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../components/Header";
import StatsCard from "../components/StatsCard";
import { exportExcel, exportCSV, exportPDF } from "../services/exportService";
import { getTransactions, getVendors, getCustomers, getProducts } from "../services/api";

const reportTypes = [
  { id: "R1", title: "Executive Sales Report", description: "Comprehensive breakdown of gross revenue, average order values, and order trends.", type: "Monthly PDF/Excel", value: "$128,450", fetcher: getTransactions },
  { id: "R2", title: "Vendor Commission & Performance", description: "Audit vendor sales volumes, platform commission fees, and active product listings.", type: "Weekly Audit", value: "12 Partners", fetcher: getVendors },
  { id: "R3", title: "Customer Behavior Analysis", description: "Demographic insights, repeat purchase frequencies, and geographic breakdown.", type: "Demographics", value: "154 Profiles", fetcher: getCustomers },
  { id: "R4", title: "Inventory & Stock Audit", description: "Low stock alerts, product SKU distribution, and warehouse velocity metrics.", type: "Inventory", value: "48 Products", fetcher: getProducts },
];

function Reports() {
  const handleDownloadReport = async (rep, format) => {
    try {
      const data = await rep.fetcher();
      const exportList = Array.isArray(data) && data.length > 0 ? data : [
        { id: 1, name: `${rep.title} Sample 1`, status: "Active" },
        { id: 2, name: `${rep.title} Sample 2`, status: "Active" }
      ];

      if (format === 'PDF') {
        exportPDF(exportList.map(item => ({
          id: item.id || item.transaction_ref || 1,
          name: item.name || item.customer_name || "Item",
          email: item.email || item.category || `$${item.amount || item.price || 0}`
        })));
      } else if (format === 'Excel') {
        exportExcel(exportList);
      } else {
        exportCSV(exportList);
      }
      toast.success(`Generated live ${rep.title} in ${format} format!`);
    } catch {
      toast.error(`Failed to export ${rep.title}`);
    }
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
      <Header title="Reports & Business Intelligence" subtitle="Generate, preview, and download custom marketplace reports" />

      {/* KPI Cards */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '24px' }}>
        <StatsCard title="Available Templates" value="8 Types" icon={<FiFileText />} color="#2563EB" change="Ready to export" />
        <StatsCard title="Reports Generated" value="142 Total" icon={<FiCheckCircle />} color="#10B981" change="+14 today" />
        <StatsCard title="Last Run Time" value="Today, 23:30" icon={<FiClock />} color="#F59E0B" change="System automated" />
      </div>

      {/* Report Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {reportTypes.map((rep) => (
          <div className="chart-card" key={rep.id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <h3 className="chart-title">{rep.title}</h3>
                <span className="badge badge-info">{rep.type}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
                {rep.description}
              </p>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-blue)', marginBottom: '20px' }}>
                {rep.value}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-secondary" style={{ flex: 1, fontSize: '0.8rem' }} onClick={() => handleDownloadReport(rep, 'CSV')}>
                <FiDownload /> CSV
              </button>
              <button className="btn btn-secondary" style={{ flex: 1, fontSize: '0.8rem' }} onClick={() => handleDownloadReport(rep, 'Excel')}>
                <FiDownload /> Excel
              </button>
              <button className="btn btn-primary" style={{ flex: 1, fontSize: '0.8rem' }} onClick={() => handleDownloadReport(rep, 'PDF')}>
                <FiFileText /> PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default Reports;