import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FiBox,
  FiShoppingBag,
  FiDollarSign,
  FiDownload,
  FiArrowRight,
  FiShield,
  FiBriefcase,
  FiCalendar,
  FiTrendingUp,
  FiTrendingDown
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "../components/Header";
import StatsCard from "../components/StatsCard";
import DashboardCharts from "../components/DashboardCharts";
import ChairmanDashboard, {
  initialChairmanTasks,
  CHAIRMAN_TASKS_KEY,
  initialChairmanInquiries,
  CHAIRMAN_INQUIRIES_KEY
} from "./ChairmanDashboard";
import { getVendors, getProducts, getCustomers, getVendorAnalytics, getVendorPipeline } from "../services/api";
import { exportCSV } from "../services/exportService";

const recentOrders = [
  { id: "ORD-9482", customer: "Mounish Sai", amount: "₹349.00", status: "Completed", date: "2026-08-01" },
  { id: "ORD-9481", customer: "Rahul Sharma", amount: "₹129.50", status: "Processing", date: "2026-08-01" },
  { id: "ORD-9480", customer: "Ravi Kumar", amount: "₹89.99", status: "Completed", date: "2026-07-31" },
  { id: "ORD-9479", customer: "Anjali Sharma", amount: "₹540.00", status: "Completed", date: "2026-07-31" },
  { id: "ORD-9478", customer: "Alice Smith", amount: "₹75.20", status: "Shipped", date: "2026-07-30" },
];

// Dedicated Operational Directives & Inquiries Widget for Standard Admins
function AdminChairmanDirectivesWidget({ adminType }) {
  const [tasks, setTasks] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [replyInputs, setReplyInputs] = useState({});

  const loadDirectives = () => {
    try {
      const savedTasks = localStorage.getItem(CHAIRMAN_TASKS_KEY);
      if (savedTasks) {
        const parsed = JSON.parse(savedTasks);
        if (Array.isArray(parsed) && parsed.length > 0) setTasks(parsed);
        else setTasks(initialChairmanTasks);
      } else {
        setTasks(initialChairmanTasks);
      }
    } catch {
      setTasks(initialChairmanTasks);
    }

    try {
      const savedInq = localStorage.getItem(CHAIRMAN_INQUIRIES_KEY);
      if (savedInq) {
        const parsed = JSON.parse(savedInq);
        if (Array.isArray(parsed) && parsed.length > 0) setInquiries(parsed);
        else setInquiries(initialChairmanInquiries);
      } else {
        setInquiries(initialChairmanInquiries);
      }
    } catch {
      setInquiries(initialChairmanInquiries);
    }
  };

  useEffect(() => {
    loadDirectives();
    window.addEventListener("storage", loadDirectives);
    return () => window.removeEventListener("storage", loadDirectives);
  }, [adminType]);

  const handleUpdateTaskStatus = (taskId, newStatus) => {
    const updated = tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
    setTasks(updated);
    localStorage.setItem(CHAIRMAN_TASKS_KEY, JSON.stringify(updated));
    toast.success(`Directive ${taskId} updated to: ${newStatus.replace('_', ' ')}`);
  };

  const handleSendReply = (inqId) => {
    const replyText = replyInputs[inqId];
    if (!replyText || !replyText.trim()) {
      toast.error("Please enter a response before submitting to Chairman Mounish.");
      return;
    }
    const updated = inquiries.map(inq => {
      if (inq.id === inqId) {
        return {
          ...inq,
          reply: replyText.trim(),
          status: "ANSWERED",
          replyTimestamp: new Date().toLocaleString()
        };
      }
      return inq;
    });
    setInquiries(updated);
    localStorage.setItem(CHAIRMAN_INQUIRIES_KEY, JSON.stringify(updated));
    setReplyInputs(prev => ({ ...prev, [inqId]: "" }));
    toast.success(`Response transmitted directly to Chairman Mounish!`);
  };

  const myTasks = tasks.filter(t => t.targetAdmin === adminType || t.targetAdmin === "all");
  const myInquiries = inquiries.filter(i => i.targetAdmin === adminType || i.targetAdmin === "all");

  return (
    <div style={{ marginTop: "28px", display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Assigned Tasks Section */}
      <div className="chart-card" style={{ padding: "22px", borderRadius: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h3 className="chart-title" style={{ fontSize: "1.1rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}>
              📋 Directives &amp; Tasks Assigned by Chairman Mounish
            </h3>
            <p className="chart-subtitle" style={{ fontSize: "0.8rem" }}>
              Operational directives and priority workflows dispatched from Chairman Mounish's desk
            </p>
          </div>
          <span style={{ fontSize: "0.78rem", background: "rgba(245, 158, 11, 0.15)", color: "#FBBF24", border: "1px solid rgba(245, 158, 11, 0.3)", padding: "4px 10px", borderRadius: "20px", fontWeight: 700 }}>
            {myTasks.filter(t => t.status !== "COMPLETED").length} Active Directives
          </span>
        </div>

        {myTasks.length === 0 ? (
          <div style={{ background: "#020617", border: "1px dashed #334155", borderRadius: "12px", padding: "20px", textAlign: "center", color: "#94A3B8", fontSize: "0.85rem" }}>
            No directives currently assigned by Chairman Mounish for this desk.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {myTasks.map(t => (
              <div
                key={t.id}
                style={{
                  background: "#020617",
                  border: t.priority === "URGENT" ? "1px solid rgba(239, 68, 68, 0.4)" : "1px solid #1E293B",
                  borderRadius: "12px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "0.72rem", background: "#1E293B", color: "#60A5FA", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
                      {t.id}
                    </span>
                    <strong style={{ color: "#F8FAFC", fontSize: "0.92rem" }}>{t.title}</strong>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 800,
                        padding: "2px 8px",
                        borderRadius: "4px",
                        background: t.priority === "URGENT" ? "rgba(239, 68, 68, 0.2)" : t.priority === "HIGH" ? "rgba(245, 158, 11, 0.2)" : "rgba(59, 130, 246, 0.2)",
                        color: t.priority === "URGENT" ? "#EF4444" : t.priority === "HIGH" ? "#F59E0B" : "#3B82F6"
                      }}
                    >
                      {t.priority} PRIORITY
                    </span>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: "4px",
                        background: t.status === "COMPLETED" ? "rgba(16, 185, 129, 0.2)" : t.status === "IN_PROGRESS" ? "rgba(245, 158, 11, 0.2)" : "rgba(148, 163, 184, 0.2)",
                        color: t.status === "COMPLETED" ? "#10B981" : t.status === "IN_PROGRESS" ? "#F59E0B" : "#94A3B8"
                      }}
                    >
                      {t.status.replace("_", " ")}
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: "0.82rem", color: "#CBD5E1", margin: "2px 0 6px 0", lineHeight: "1.4" }}>
                  {t.description}
                </p>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", borderTop: "1px solid #1E293B", paddingTop: "8px", fontSize: "0.75rem", color: "#94A3B8" }}>
                  <div>
                    📅 Due: <strong style={{ color: "#E2E8F0" }}>{t.dueDate}</strong> • Assigned: <span>{t.assignedDate}</span>
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {t.status === "PENDING" && (
                      <button
                        type="button"
                        onClick={() => handleUpdateTaskStatus(t.id, "IN_PROGRESS")}
                        style={{ padding: "4px 10px", borderRadius: "6px", border: "1px solid #F59E0B", background: "rgba(245, 158, 11, 0.15)", color: "#FBBF24", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}
                      >
                        ⚡ Mark In Progress
                      </button>
                    )}
                    {t.status === "IN_PROGRESS" && (
                      <button
                        type="button"
                        onClick={() => handleUpdateTaskStatus(t.id, "COMPLETED")}
                        style={{ padding: "4px 10px", borderRadius: "6px", border: "none", background: "linear-gradient(135deg, #10B981, #059669)", color: "#FFF", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}
                      >
                        ✅ Complete Directive
                      </button>
                    )}
                    {t.status === "COMPLETED" && (
                      <span style={{ color: "#10B981", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                        ✓ Completed &amp; Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inquiries & Direct Questions Section */}
      <div className="chart-card" style={{ padding: "22px", borderRadius: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h3 className="chart-title" style={{ fontSize: "1.1rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}>
              💬 Inquiries &amp; Questions from Chairman Mounish
            </h3>
            <p className="chart-subtitle" style={{ fontSize: "0.8rem" }}>
              Official inquiries sent directly by Supreme Chairman Mounish Sai to this desk
            </p>
          </div>
          <span style={{ fontSize: "0.78rem", background: "rgba(99, 102, 241, 0.15)", color: "#A5B4FC", border: "1px solid rgba(99, 102, 241, 0.3)", padding: "4px 10px", borderRadius: "20px", fontWeight: 700 }}>
            {myInquiries.length} Inquiries Logged
          </span>
        </div>

        {myInquiries.length === 0 ? (
          <div style={{ background: "#020617", border: "1px dashed #334155", borderRadius: "12px", padding: "20px", textAlign: "center", color: "#94A3B8", fontSize: "0.85rem" }}>
            No pending inquiries from Chairman Mounish for this desk.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {myInquiries.map(inq => (
              <div
                key={inq.id}
                style={{
                  background: "#020617",
                  border: inq.status === "PENDING_REPLY" ? "1px solid rgba(245, 158, 11, 0.4)" : "1px solid #1E293B",
                  borderRadius: "12px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "0.72rem", background: "#1E293B", color: "#A78BFA", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
                      {inq.id}
                    </span>
                    <strong style={{ color: "#F8FAFC", fontSize: "0.92rem" }}>{inq.subject}</strong>
                  </div>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "4px",
                      background: inq.status === "ANSWERED" ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 158, 11, 0.2)",
                      color: inq.status === "ANSWERED" ? "#10B981" : "#F59E0B"
                    }}
                  >
                    {inq.status === "ANSWERED" ? "✓ ANSWERED" : "⏳ RESPONSE REQUIRED"}
                  </span>
                </div>

                <div style={{ background: "rgba(245, 158, 11, 0.05)", borderLeft: "3px solid #F59E0B", padding: "10px 12px", borderRadius: "0 8px 8px 0" }}>
                  <div style={{ fontSize: "0.72rem", color: "#FBBF24", fontWeight: 700, marginBottom: "4px" }}>
                    👑 Chairman Mounish Inquired ({inq.timestamp}):
                  </div>
                  <p style={{ fontSize: "0.82rem", color: "#F1F5F9", margin: 0, lineHeight: "1.4" }}>
                    "{inq.question}"
                  </p>
                </div>

                {inq.status === "ANSWERED" ? (
                  <div style={{ background: "rgba(16, 185, 129, 0.05)", borderLeft: "3px solid #10B981", padding: "10px 12px", borderRadius: "0 8px 8px 0" }}>
                    <div style={{ fontSize: "0.72rem", color: "#34D399", fontWeight: 700, marginBottom: "4px" }}>
                      ✓ Your Official Response ({inq.replyTimestamp}):
                    </div>
                    <p style={{ fontSize: "0.82rem", color: "#E2E8F0", margin: 0, lineHeight: "1.4" }}>
                      "{inq.reply}"
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
                    <textarea
                      rows={2}
                      placeholder="Type your official administrative response to Chairman Mounish..."
                      value={replyInputs[inq.id] || ""}
                      onChange={(e) => setReplyInputs({ ...replyInputs, [inq.id]: e.target.value })}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #334155", background: "#1E293B", color: "#F8FAFC", fontSize: "0.82rem", outline: "none", resize: "none" }}
                    />
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        onClick={() => handleSendReply(inq.id)}
                        style={{ padding: "6px 14px", borderRadius: "6px", border: "none", background: "linear-gradient(135deg, #6366F1, #4F46E5)", color: "#FFF", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}
                      >
                        📨 Submit Formal Response to Chairman Mounish
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Dashboard() {
  const [role, setRole] = useState(localStorage.getItem("userRole") || "admin");
  const [adminType, setAdminType] = useState(localStorage.getItem("adminType") || "executor");
  const [stats, setStats] = useState({
    vendors: 12,
    products: 48,
    customers: 154,
    revenue: "₹1,28,450"
  });

  const [vendorAnalytics, setVendorAnalytics] = useState({
    total_monthly_income: 106920.0,
    total_yearly_income: 1283040.0,
    highest_performing_vendor: { name: "Tech Supplies Inc", monthly_income: 48250.0, yearly_income: 579000.0, orders_count: 142 },
    lowest_performing_vendor: { name: "Nova Gadgets Co", monthly_income: 4120.0, yearly_income: 49440.0, orders_count: 12 }
  });

  useEffect(() => {
    const handleRoleChange = () => {
      setRole(localStorage.getItem("userRole") || "admin");
      setAdminType(localStorage.getItem("adminType") || "executor");
    };
    window.addEventListener("roleChanged", handleRoleChange);
    window.addEventListener("storage", handleRoleChange);

    async function loadData() {
      try {
        const [vList, pList, cList, vAnalytics] = await Promise.allSettled([
          getVendors(),
          getProducts(),
          getCustomers(),
          getVendorAnalytics()
        ]);

        setStats(prev => ({
          ...prev,
          vendors: vList.status === "fulfilled" && Array.isArray(vList.value) ? vList.value.length : 12,
          products: pList.status === "fulfilled" && Array.isArray(pList.value) ? pList.value.length : 48,
          customers: cList.status === "fulfilled" && Array.isArray(cList.value) ? cList.value.length : 154,
        }));

        if (vAnalytics.status === "fulfilled" && vAnalytics.value) {
          setVendorAnalytics(vAnalytics.value);
        }
      } catch {
        // Fallback
      }
    }
    loadData();

    return () => {
      window.removeEventListener("roleChanged", handleRoleChange);
      window.removeEventListener("storage", handleRoleChange);
    };
  }, []);

  // Pipeline applications from localStorage and API for quick Executor view
  const [pipelineApps, setPipelineApps] = useState([]);

  const loadPipelineApplications = async () => {
    let localList = [];
    const saved =
      localStorage.getItem("vendorRegistrationPipeline_v7") ||
      localStorage.getItem("vendorRegistrationPipeline_v6") ||
      localStorage.getItem("vendorRegistrationPipeline_v5") ||
      localStorage.getItem("vendorRegistrationPipeline_v4");

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          localList = parsed;
        }
      } catch {}
    }

    try {
      const data = await getVendorPipeline();
      if (Array.isArray(data) && data.length > 0) {
        const normalizedBackend = data.map((app) => ({
          ...app,
          id: app.id || app.app_ref,
          app_ref: app.app_ref || app.id,
          storeName: app.storeName || app.store_name,
          ownerName: app.ownerName || app.owner_name,
          overallStatus: app.overallStatus || app.overall_status || "STAGE_1_EXECUTOR",
          stage1_executor: app.stage1_executor || {
            status: app.stage1_status || "PENDING",
            by: app.stage1_by,
            timestamp: app.stage1_timestamp,
            notes: app.stage1_notes
          },
          stage2_verifier: app.stage2_verifier || {
            status: app.stage2_status || "LOCKED",
            by: app.stage2_by,
            timestamp: app.stage2_timestamp,
            notes: app.stage2_notes
          },
          stage3_approver: app.stage3_approver || {
            status: app.stage3_status || "LOCKED",
            by: app.stage3_by,
            timestamp: app.stage3_timestamp,
            notes: app.stage3_notes
          }
        }));

        const merged = [...normalizedBackend];
        const seenNames = new Set(normalizedBackend.map((a) => (a.storeName || "").toLowerCase().trim()));
        for (const item of localList) {
          const nameKey = (item.storeName || item.store_name || "").toLowerCase().trim();
          if (!seenNames.has(nameKey)) {
            merged.push(item);
            seenNames.add(nameKey);
          }
        }
        setPipelineApps(merged);
        return;
      }
    } catch (e) {
      console.warn("Could not fetch pipeline in Dashboard", e);
    }

    if (localList.length > 0) {
      setPipelineApps(localList);
    }
  };

  useEffect(() => {
    loadPipelineApplications();

    const handleUpdate = () => {
      loadPipelineApplications();
    };

    window.addEventListener("storage", handleUpdate);
    window.addEventListener("roleChanged", handleUpdate);
    window.addEventListener("vendorPipelineUpdated", handleUpdate);

    let channel = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        channel = new BroadcastChannel("shopsense_live_pipeline");
        channel.onmessage = () => {
          loadPipelineApplications();
        };
      } catch {}
    }

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("roleChanged", handleUpdate);
      window.removeEventListener("vendorPipelineUpdated", handleUpdate);
      if (channel) channel.close();
    };
  }, []);

  const isChairman = role === "chairman" || adminType === "chairman";
  if (isChairman) {
    return <ChairmanDashboard />;
  }

  const isAdmin = role === "admin";
  const isExecutor = isAdmin && adminType === "executor";
  const isVerifier = isAdmin && adminType === "verifier";
  const isApprover = isAdmin && adminType === "approver";

  const adminRoleTitle =
    adminType === "approver"
      ? "Logged in as Admin Type 3: Cross-Check & Vendor Approver Authority (Rajesh Menon)"
      : adminType === "verifier"
      ? "Logged in as Admin Type 2: Compliance & KYC Verifier Admin (Ananya Rao)"
      : "Logged in as Admin Type 1: System Operations Executor Admin (Mounish Sai)";

  const adminRoleDesc =
    adminType === "approver"
      ? "You have full cross-check authorization authority to evaluate verified KYC audits, review 5.0% Gross selling percentage bonds, and grant final live store approvals."
      : adminType === "verifier"
      ? "You are responsible for auditing new vendor Aadhaar KYC documents, inspecting multi-warehouse logistics fulfillment facilities, and checking GSTIN tax records."
      : "You are exclusively responsible for new vendor applications intake: scanning legal complaints registries on vendors & warehouses, validating trustability scores, verifying past partnerships, and reviewing company market reputations.";

  const adminRoleBadgeColor =
    adminType === "approver" ? "#10B981" : adminType === "verifier" ? "#8B5CF6" : "#2563EB";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="page-container"
    >
      <Header
        title={
          isExecutor
            ? "⚡ System Operations Executor Dashboard"
            : isVerifier
            ? "🔍 Compliance & KYC Verifier Dashboard"
            : isApprover
            ? "⚖️ Vendor Cross-Check & Approval Dashboard"
            : isAdmin
            ? "System Executive Dashboard"
            : "Vendor Storefront Dashboard"
        }
        subtitle={
          isExecutor
            ? "New Vendor Applications Intake, Complaints Registry, Trust Scoring & Partnership Due-Diligence"
            : isVerifier
            ? "Aadhaar KYC Verification & Multi-Warehouse Fulfillment Hub Inspections"
            : isApprover
            ? "Cross-Check Verification, 5.0% Gross Bond Review & Final Merchant Certification"
            : isAdmin
            ? "Platform-wide analytics, vendor revenue rankings, and marketplace stats"
            : "Manage your store inventory, customer sales, & earnings performance"
        }
      />

      {/* Role Banner Notification */}
      <div
        style={{
          background: isAdmin ? `${adminRoleBadgeColor}15` : "rgba(16, 185, 129, 0.08)",
          border: `1px solid ${isAdmin ? `${adminRoleBadgeColor}40` : "rgba(16, 185, 129, 0.25)"}`,
          borderRadius: "14px",
          padding: "16px 20px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "14px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              padding: "10px",
              borderRadius: "10px",
              background: isAdmin ? adminRoleBadgeColor : "#10B981",
              color: "#FFF",
              fontSize: "1.3rem"
            }}
          >
            {isAdmin ? <FiShield /> : <FiBriefcase />}
          </div>
          <div>
            <strong style={{ fontSize: "0.95rem", color: "var(--text-main)", display: "block" }}>
              {isAdmin ? adminRoleTitle : "Logged in as Marketplace Partner Vendor"}
            </strong>
            <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", marginTop: "2px", maxWidth: "800px" }}>
              {isAdmin ? adminRoleDesc : "You are viewing your dedicated store metrics, product management, & sales analytics."}
            </p>
          </div>
        </div>

        {isAdmin && (
          <Link
            to="/vendors"
            style={{
              background: adminRoleBadgeColor,
              color: "#FFFFFF",
              padding: "8px 16px",
              borderRadius: "10px",
              fontWeight: 800,
              fontSize: "0.82rem",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <FiShield /> {isExecutor ? "Open Due-Diligence Desk" : isVerifier ? "Open KYC Audits" : "Open Vendor Approvals"}
          </Link>
        )}
      </div>

      {/* ========================================================================= */}
      {/* EXECUTOR ADMIN SPECIFIC DASHBOARD: NO UNWANTED FINANCIAL OR ORDER CHARTS   */}
      {/* ========================================================================= */}
      {isExecutor ? (
        <div>
          {/* Executor Specific Due-Diligence Stats */}
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '24px' }}>
            <StatsCard
              title="Stage 1: Pending Executor Intake"
              value={`${pipelineApps.filter(a => a.stage1_executor?.status === "PENDING").length} Stores`}
              icon={<FiBox />}
              color="#2563EB"
              change="Executor Intake Queue"
            />
            <StatsCard
              title="Complaints & Cases Registry"
              value="0 Disputes"
              icon={<FiShield />}
              color="#10B981"
              change="100% Clean Records"
            />
            <StatsCard
              title="Average Vendor Trust Score"
              value="96.2 / 100"
              icon={<FiTrendingUp />}
              color="#38BDF8"
              change="Tier-A+ Reliability"
            />
            <StatsCard
              title="Forwarded to Verifier"
              value={`${pipelineApps.filter(a => a.stage1_executor?.status === "COMPLETED").length} Approved`}
              icon={<FiShoppingBag />}
              color="#F59E0B"
              change="Sent to Stage 2"
            />
          </div>

          {/* Executor Dedicated Applications Due-Diligence Quick Board */}
          <div className="chart-card" style={{ padding: "22px", borderRadius: "16px", marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <h3 className="chart-title" style={{ fontSize: "1.15rem", fontWeight: 800 }}>
                  ⚡ Stage 1: New Vendor Applications Intake & Investigation Desk
                </h3>
                <p className="chart-subtitle" style={{ fontSize: "0.82rem" }}>
                  Approve Stage 1 due-diligence to unlock and forward applications to the Verifier Admin
                </p>
              </div>
              <Link to="/vendors" className="btn btn-primary" style={{ padding: "8px 16px", fontSize: "0.82rem", fontWeight: 700 }}>
                Open Full Investigation Portal <FiArrowRight />
              </Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {(() => {
                const executorPendingApps = pipelineApps.filter((a) => a.stage1_executor?.status === "PENDING");
                if (executorPendingApps.length === 0) {
                  return (
                    <div style={{ background: "#020617", border: "1px dashed #334155", borderRadius: "12px", padding: "30px 20px", textAlign: "center", color: "#94A3B8" }}>
                      <div style={{ fontSize: "2rem", marginBottom: "6px" }}>✓</div>
                      <h4 style={{ color: "#FFFFFF", margin: "0 0 4px 0" }}>All Stage 1 intake applications cleared!</h4>
                      <p style={{ fontSize: "0.82rem", margin: 0 }}>
                        All applications have been approved and forwarded to the Verifier Admin.
                      </p>
                    </div>
                  );
                }
                return executorPendingApps.slice(0, 4).map((app) => (
                  <div
                    key={app.id}
                    style={{
                      background: "#020617",
                      border: "1px solid #1E293B",
                      borderRadius: "12px",
                      padding: "14px 16px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "12px"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <strong style={{ color: "#FFFFFF", fontSize: "0.95rem" }}>{app.storeName}</strong>
                        <span style={{ fontSize: "0.72rem", color: "#60A5FA", background: "rgba(37, 99, 235, 0.15)", padding: "2px 6px", borderRadius: "4px" }}>{app.id}</span>
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#94A3B8", marginTop: "2px" }}>
                        Proprietor: <span style={{ color: "#E2E8F0" }}>{app.ownerName}</span> • Category: <span style={{ color: "#FCD34D" }}>{app.category}</span> • Warehouses: <span style={{ color: "#38BDF8" }}>{app.warehouses?.length || 2} Hubs</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ textAlign: "right", fontSize: "0.76rem" }}>
                        <div style={{ color: "#FBBF24", fontWeight: 700 }}>
                          ⏳ Pending Executor Review
                        </div>
                        <div style={{ color: "#38BDF8", fontWeight: 700 }}>
                          Trust: {app.dueDiligence?.trustability?.trustScore || 98}/100
                        </div>
                      </div>

                      <Link
                        to="/vendors"
                        style={{
                          background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
                          color: "#FFFFFF",
                          padding: "6px 14px",
                          borderRadius: "8px",
                          fontSize: "0.76rem",
                          fontWeight: 700,
                          textDecoration: "none",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px"
                        }}
                      >
                        ⚡ Inspect
                      </Link>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Directives & Inquiries Widget from Chairman Mounish */}
          <AdminChairmanDirectivesWidget adminType="executor" />
        </div>
      ) : isVerifier ? (
        /* ========================================================================= */
        /* VERIFIER ADMIN SPECIFIC DASHBOARD: ONLY APPS APPROVED BY EXECUTOR ADMIN   */
        /* ========================================================================= */
        <div>
          {/* Verifier Specific Metrics */}
          {(() => {
            const verifierPendingApps = pipelineApps.filter(
              (app) => app.stage1_executor?.status === "COMPLETED" && app.stage2_verifier?.status === "PENDING"
            );
            const totalReceivedFromExecutor = pipelineApps.filter(app => app.stage1_executor?.status === "COMPLETED").length;
            const totalForwardedToApprover = pipelineApps.filter(app => app.stage2_verifier?.status === "COMPLETED").length;

            return (
              <>
                <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '24px' }}>
                  <StatsCard
                    title="Received from Executor"
                    value={`${totalReceivedFromExecutor} Applications`}
                    icon={<FiBox />}
                    color="#8B5CF6"
                    change="Cleared Stage 1"
                  />
                  <StatsCard
                    title="Pending Verifier Audit"
                    value={`${verifierPendingApps.length} Stores`}
                    icon={<FiShield />}
                    color="#10B981"
                    change="Ready for Inspection"
                  />
                  <StatsCard
                    title="Real Physical Geolocation"
                    value="100% Real Hubs"
                    icon={<FiTrendingUp />}
                    color="#38BDF8"
                    change="0 Fake Addresses"
                  />
                  <StatsCard
                    title="Forwarded to Approver"
                    value={`${totalForwardedToApprover} Cleared`}
                    icon={<FiShoppingBag />}
                    color="#F59E0B"
                    change="Sent to Stage 3"
                  />
                </div>

                {/* Verifier Dedicated Compliance & Geolocation Queue */}
                <div className="chart-card" style={{ padding: "22px", borderRadius: "16px", marginBottom: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                    <div>
                      <h3 className="chart-title" style={{ fontSize: "1.15rem", fontWeight: 800 }}>
                        🔍 Stage 2: Verifier Compliance, Geolocation & Quality Audit Desk
                      </h3>
                      <p className="chart-subtitle" style={{ fontSize: "0.82rem" }}>
                        Showing ONLY active applications pending Verifier audit (disappears once approved)
                      </p>
                    </div>
                    <Link to="/vendors" className="btn btn-primary" style={{ background: "linear-gradient(135deg, #8B5CF6, #6D28D9)", padding: "8px 16px", fontSize: "0.82rem", fontWeight: 700 }}>
                      Open Verifier Portal <FiArrowRight />
                    </Link>
                  </div>

                  {verifierPendingApps.length === 0 ? (
                    <div style={{ background: "#020617", border: "1px dashed #334155", borderRadius: "12px", padding: "40px 20px", textAlign: "center", color: "#94A3B8" }}>
                      <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>
                        {totalReceivedFromExecutor === 0 ? "🔒" : "✓"}
                      </div>
                      <h4 style={{ color: "#FFFFFF", margin: "0 0 4px 0" }}>
                        {totalReceivedFromExecutor === 0
                          ? "No applications forwarded from Executor Admin yet."
                          : "All received applications have been audited & forwarded to Approver!"}
                      </h4>
                      <p style={{ fontSize: "0.82rem", margin: 0 }}>
                        {totalReceivedFromExecutor === 0
                          ? "Under sequential governance, the Executor Admin must approve Stage 1 first before applications arrive at the Verifier desk."
                          : "New applications will appear here automatically when the Executor Admin approves them."}
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {verifierPendingApps.slice(0, 4).map((app) => (
                        <div
                          key={app.id}
                          style={{
                            background: "#020617",
                            border: "1px solid rgba(139, 92, 246, 0.3)",
                            borderRadius: "12px",
                            padding: "14px 16px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "12px"
                          }}
                        >
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <strong style={{ color: "#FFFFFF", fontSize: "0.95rem" }}>{app.storeName}</strong>
                              <span style={{ fontSize: "0.72rem", color: "#A78BFA", background: "rgba(139, 92, 246, 0.15)", padding: "2px 6px", borderRadius: "4px" }}>{app.id}</span>
                              <span style={{ fontSize: "0.7rem", color: "#34D399", background: "rgba(16, 185, 129, 0.15)", padding: "2px 6px", borderRadius: "4px" }}>✓ Executor Cleared</span>
                            </div>
                            <div style={{ fontSize: "0.78rem", color: "#94A3B8", marginTop: "2px" }}>
                              📍 <strong>{app.warehouses?.length || 2} Declared Hubs:</strong> {app.warehouses?.map(w => w.city).join(", ") || "Mumbai, Pune"} • <span style={{ color: "#34D399" }}>100% Real Geotagged</span>
                            </div>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ textAlign: "right", fontSize: "0.76rem" }}>
                              <div style={{ color: "#FBBF24", fontWeight: 700 }}>
                                ⏳ Ready for Verifier Audit
                              </div>
                            </div>

                            <Link
                              to="/vendors"
                              style={{
                                background: "linear-gradient(135deg, #8B5CF6, #6D28D9)",
                                color: "#FFFFFF",
                                padding: "6px 14px",
                                borderRadius: "8px",
                                fontSize: "0.76rem",
                                fontWeight: 700,
                                textDecoration: "none",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                            >
                              🔍 Audit
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Directives & Inquiries Widget from Chairman Mounish */}
                <AdminChairmanDirectivesWidget adminType="verifier" />
              </>
            );
          })()}
        </div>
      ) : isApprover ? (
        /* ========================================================================= */
        /* APPROVER ADMIN SPECIFIC DASHBOARD: DEDICATED STAGE 3 VENDOR SEAL DESK    */
        /* (NO UNWANTED SALES CHARTS, ORDER TABLES, OR TOP/LOW SELLER BANNERS)       */
        /* ========================================================================= */
        <div>
          {(() => {
            const approverPendingApps = pipelineApps.filter(
              (app) =>
                app.stage1_executor?.status === "COMPLETED" &&
                app.stage2_verifier?.status === "COMPLETED" &&
                app.stage3_approver?.status !== "APPROVED"
            );
            const totalClearedStage1and2 = pipelineApps.filter(
              (app) => app.stage1_executor?.status === "COMPLETED" && app.stage2_verifier?.status === "COMPLETED"
            ).length;
            const totalApprovedVendors = pipelineApps.filter(
              (app) => app.stage3_approver?.status === "APPROVED"
            ).length;

            return (
              <>
                {/* Approver Specific Metrics */}
                <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '24px' }}>
                  <StatsCard
                    title="Stage 3: Pending Cross-Check & Seal"
                    value={`${approverPendingApps.length} Stores`}
                    icon={<FiBox />}
                    color="#10B981"
                    change="Approver Final Queue"
                  />
                  <StatsCard
                    title="Commercial Performance Bond"
                    value="5.0% Gross Standard"
                    icon={<FiShield />}
                    color="#F59E0B"
                    change="100% Policy Compliant"
                  />
                  <StatsCard
                    title="Stage 1 & 2 Cleared Intake"
                    value={`${totalClearedStage1and2} Applications`}
                    icon={<FiTrendingUp />}
                    color="#38BDF8"
                    change="KYC & Geolocation Cleared"
                  />
                  <StatsCard
                    title="Active Certified Storefronts"
                    value={`${totalApprovedVendors} Live Vendors`}
                    icon={<FiShoppingBag />}
                    color="#10B981"
                    change="Merchant Seals Issued"
                  />
                </div>

                {/* Approver Dedicated Cross-Check & Merchant Seal Desk */}
                <div className="chart-card" style={{ padding: "22px", borderRadius: "16px", marginBottom: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                    <div>
                      <h3 className="chart-title" style={{ fontSize: "1.15rem", fontWeight: 800 }}>
                        ⚖️ Stage 3: Vendor Cross-Check, Performance Bond &amp; Merchant Seal Authority Desk
                      </h3>
                      <p className="chart-subtitle" style={{ fontSize: "0.82rem" }}>
                        Showing ONLY verified applications cleared by BOTH Executor and Verifier, ready for final 5.0% bond execution and merchant induction
                      </p>
                    </div>
                    <Link to="/vendors" className="btn btn-primary" style={{ background: "linear-gradient(135deg, #10B981, #059669)", padding: "8px 16px", fontSize: "0.82rem", fontWeight: 700 }}>
                      Open Approvals Portal <FiArrowRight />
                    </Link>
                  </div>

                  {approverPendingApps.length === 0 ? (
                    <div style={{ background: "#020617", border: "1px dashed #334155", borderRadius: "12px", padding: "40px 20px", textAlign: "center", color: "#94A3B8" }}>
                      <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>
                        {totalClearedStage1and2 === 0 ? "🔒" : "✓"}
                      </div>
                      <h4 style={{ color: "#FFFFFF", margin: "0 0 4px 0" }}>
                        {totalClearedStage1and2 === 0
                          ? "No applications ready for final seal yet."
                          : "All verified applications have been approved & inducted into ShopSense!"}
                      </h4>
                      <p style={{ fontSize: "0.82rem", margin: 0 }}>
                        {totalClearedStage1and2 === 0
                          ? "Under sequential governance, applications arrive at the Approver desk ONLY after the Executor has cleared Stage 1 and the Verifier has audited Stage 2."
                          : "New applications will appear here automatically when the Verifier Admin clears Stage 2."}
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {approverPendingApps.slice(0, 4).map((app) => (
                        <div
                          key={app.id}
                          style={{
                            background: "#020617",
                            border: "1px solid rgba(16, 185, 129, 0.3)",
                            borderRadius: "12px",
                            padding: "14px 16px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "12px"
                          }}
                        >
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <strong style={{ color: "#FFFFFF", fontSize: "0.95rem" }}>{app.storeName}</strong>
                              <span style={{ fontSize: "0.72rem", color: "#34D399", background: "rgba(16, 185, 129, 0.15)", padding: "2px 6px", borderRadius: "4px" }}>{app.id}</span>
                              <span style={{ fontSize: "0.7rem", color: "#60A5FA", background: "rgba(37, 99, 235, 0.15)", padding: "2px 6px", borderRadius: "4px" }}>✓ Executor Cleared</span>
                              <span style={{ fontSize: "0.7rem", color: "#A78BFA", background: "rgba(139, 92, 246, 0.15)", padding: "2px 6px", borderRadius: "4px" }}>✓ Verifier Cleared</span>
                            </div>
                            <div style={{ fontSize: "0.78rem", color: "#94A3B8", marginTop: "2px" }}>
                              Proprietor: <span style={{ color: "#E2E8F0" }}>{app.ownerName}</span> • Category: <span style={{ color: "#FCD34D" }}>{app.category}</span> • Bond: <span style={{ color: "#34D399" }}>{app.bond?.sellingPercentage || "5.0% Gross"}</span>
                            </div>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ textAlign: "right", fontSize: "0.76rem" }}>
                              <div style={{ color: "#34D399", fontWeight: 700 }}>
                                ⏳ Ready for Final Cross-Check &amp; Seal
                              </div>
                            </div>

                            <Link
                              to="/vendors"
                              style={{
                                background: "linear-gradient(135deg, #10B981, #059669)",
                                color: "#FFFFFF",
                                padding: "6px 14px",
                                borderRadius: "8px",
                                fontSize: "0.76rem",
                                fontWeight: 700,
                                textDecoration: "none",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)"
                              }}
                            >
                              ⚖️ Cross-Check &amp; Seal
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Directives & Inquiries Widget from Chairman Mounish */}
                <AdminChairmanDirectivesWidget adminType="approver" />
              </>
            );
          })()}
        </div>
      ) : (
        /* ========================================================================= */
        /* STANDARD VENDOR STOREFRONT DASHBOARDS                                     */
        /* ========================================================================= */
        <div>
          {/* Vendor Specific Stats Cards */}
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '24px' }}>
            <StatsCard title="My Store Monthly Earnings" value="₹34,820" icon={<FiDollarSign />} color="#10B981" change="+24.8%" />
            <StatsCard title="My Store Yearly Projections" value="₹4,17,840" icon={<FiCalendar />} color="#2563EB" change="Annual Earnings" />
            <StatsCard title="Listed Products" value="18" icon={<FiBox />} color="#3B82F6" change="+4.2%" />
            <StatsCard title="Completed Orders" value="142" icon={<FiShoppingBag />} color="#8B5CF6" change="+15.6%" />
          </div>

          {/* Charts Section */}
          <DashboardCharts />

          {/* Recent Activity Table Card */}
          <div className="chart-card" style={{ marginTop: '24px' }}>
            <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 className="chart-title">Recent Store Orders</h3>
                <p className="chart-subtitle">Orders placed for your store products</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.825rem' }} onClick={() => exportCSV(recentOrders)}>
                  <FiDownload /> Export CSV
                </button>
                <Link to="/transactions" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.825rem' }}>
                  View All <FiArrowRight />
                </Link>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 600 }}>{order.id}</td>
                      <td>{order.customer}</td>
                      <td style={{ fontWeight: 700, color: '#10B981' }}>{order.amount}</td>
                      <td>
                        <span className={`badge ${order.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default Dashboard;