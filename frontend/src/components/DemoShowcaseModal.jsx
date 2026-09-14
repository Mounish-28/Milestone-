import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlay,
  FiX,
  FiBox,
  FiTruck,
  FiCpu,
  FiShield,
  FiShoppingBag,
  FiZap,
  FiCheckCircle,
  FiAlertTriangle,
  FiExternalLink,
  FiCopy,
  FiActivity,
  FiLayers
} from "react-icons/fi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { simulateInventoryAction, getInventoryForecast } from "../services/api";

const DEMO_SCENARIOS = [
  {
    id: "vendor_catalog",
    title: "1. Enterprise Multi-Vendor Catalog Segregation",
    tag: "Catalog Architecture",
    badgeColor: "#3B82F6",
    icon: <FiBox />,
    summary: "Demonstrates 4 specialized vendor domains (TechWorld Electronics, StyleHub Fashion, ModernHome Furniture, GadgetCentral Robotics) with isolated inventories and domain tagging.",
    talkingPoints: [
      "Each vendor operates within an isolated verified domain (e.g. Consumer Electronics vs. Luxury Apparel vs. Smart Furniture).",
      "130+ authentic branded items (Samsung S24 Ultra, iPhone 16 Pro Max, Levi's 501, Herman Miller Aeron, DJI Mini 4 Pro).",
      "Instant filtering by vendor with live catalog metrics and QR scanner presets."
    ],
    actionLabel: "Open Products Catalog",
    route: "/products"
  },
  {
    id: "air_cargo",
    title: "2. Inbound Air Freight & DHL Waybill Manifest",
    tag: "Logistics & Provenance",
    badgeColor: "#10B981",
    icon: <FiTruck />,
    summary: "Simulates an international air cargo restock container arrival via DHL Express with automated Air Waybill (AWB) generation, SKU serial tracking, and thermal validation.",
    talkingPoints: [
      "Generates real-world Air Waybills (e.g. AWB-DHL-994821) arriving on Flight DXB-502.",
      "Records storage climate conditions (21.0°C | 42% Humidity) in Zone A Electronics Bay.",
      "Auditable barcode manifests with ISO-9001 Quality Assurance Lead stamp."
    ],
    actionLabel: "Simulate DHL Air Cargo (+100 Units)",
    simAction: "log_inbound_shipment",
    route: "/inventory"
  },
  {
    id: "ml_forecasting",
    title: "3. Real-Time ML Demand Forecasting",
    tag: "Machine Learning (ML)",
    badgeColor: "#8B5CF6",
    icon: <FiCpu />,
    summary: "Runs time-series forecasting algorithms over historical sales velocity to predict stockout risk across 7-day, 14-day, and 30-day horizon windows.",
    talkingPoints: [
      "Calculates dynamic daily sales velocity rates and days-until-depletion.",
      "Auto-generates recommended purchase order replenishment quantities.",
      "Replaces static thresholds with predictive machine learning intelligence."
    ],
    actionLabel: "View Live Inventory Forecasts",
    route: "/inventory"
  },
  {
    id: "low_stock_spike",
    title: "4. Rapid Depletion & Low-Stock Warning Trigger",
    tag: "Real-Time Telemetry",
    badgeColor: "#F59E0B",
    icon: <FiAlertTriangle />,
    summary: "Simulates a sudden sales surge depleting flagship products below safety thresholds to demonstrate real-time alert dispatching and restocking workflows.",
    talkingPoints: [
      "Demonstrates high-severity visual amber/red warning banners on executive dashboard.",
      "Interactive 1-click restock modal with instant database synchronization.",
      "Restores optimal inventory baseline in a single click."
    ],
    actionLabel: "Trigger Low-Stock Surge Simulation",
    simAction: "simulate_low_stock",
    route: "/inventory"
  },
  {
    id: "governance_pipeline",
    title: "5. 3-Stage Sequential Governance Clearance",
    tag: "Security & Governance",
    badgeColor: "#EC4899",
    icon: <FiShield />,
    summary: "Showcases strict separation of administrative duties across 3 tiers (Executor Intake ➔ Verifier KYC/Audit ➔ Approver Bond Authority) with Chairman oversight.",
    talkingPoints: [
      "Eliminates single points of compromise with mandatory multi-admin consensus.",
      "Full audit trail tracking timestamps, IP addresses, and inspector credentials.",
      "Chairman emergency kill-switch and supreme policy enforcement."
    ],
    actionLabel: "Open 3-Admin Approval Desk",
    route: "/approval-desk"
  },
  {
    id: "customer_storefront",
    title: "6. Customer Marketplace & AI Assistant (Port 5174)",
    tag: "Customer Platform",
    badgeColor: "#06B6D4",
    icon: <FiShoppingBag />,
    summary: "Walks through the standalone customer shopping storefront on port 5174 with real-time cart checkout, customer segmentation tiers, and AI search.",
    talkingPoints: [
      "Completely separated frontend running on http://localhost:5174.",
      "Real-time customer segmentation (VIP, Regular, New) with dynamic discount banners.",
      "Integrated AI Shopping Assistant for natural language product recommendations."
    ],
    actionLabel: "Launch Customer Marketplace (Port 5174)",
    externalUrl: "http://localhost:5174",
    route: null
  }
];

function DemoShowcaseModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [selectedScenario, setSelectedScenario] = useState(DEMO_SCENARIOS[0]);
  const [isExecuting, setIsExecuting] = useState(false);

  if (!isOpen) return null;

  const handleExecuteScenario = async (scenario) => {
    setIsExecuting(true);
    try {
      if (scenario.simAction) {
        const res = await simulateInventoryAction(scenario.simAction);
        toast.success(res.message || "Simulation action executed!");
      }

      if (scenario.externalUrl) {
        window.open(scenario.externalUrl, "_blank");
        toast.info("Opened Customer Marketplace on http://localhost:5174!");
      } else if (scenario.route) {
        navigate(scenario.route);
        onClose();
      }
    } catch {
      toast.error("Failed to execute demo action");
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        className="modal-card"
        style={{
          maxWidth: "880px",
          width: "95%",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "26px",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-color)",
          borderRadius: "20px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "14px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "1.5rem" }}>🎬</span>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800, margin: 0, color: "var(--text-main)" }}>
                Real-World Presentation Demo Guide & Scenarios
              </h2>
            </div>
            <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
              Curated interactive presentation scenarios and talking points for project evaluation & live demonstrations
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "1.4rem", cursor: "pointer" }}
          >
            <FiX />
          </button>
        </div>

        {/* 2-Column Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "20px" }}>
          {/* Scenario List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Select Demo Scenario:
            </span>

            {DEMO_SCENARIOS.map((s) => {
              const isSelected = selectedScenario.id === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedScenario(s)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 14px",
                    borderRadius: "12px",
                    border: isSelected ? `2px solid ${s.badgeColor}` : "1px solid var(--border-color)",
                    background: isSelected ? `${s.badgeColor}18` : "var(--bg-primary)",
                    color: isSelected ? "var(--text-main)" : "var(--text-muted)",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      background: `${s.badgeColor}22`,
                      color: s.badgeColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.1rem",
                      flexShrink: 0
                    }}
                  >
                    {s.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong style={{ display: "block", fontSize: "0.84rem", color: "var(--text-main)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {s.title}
                    </strong>
                    <span style={{ fontSize: "0.72rem", color: s.badgeColor, fontWeight: 700 }}>
                      {s.tag}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Scenario Details & Execution Panel */}
          <div
            style={{
              background: "var(--bg-primary)",
              border: "1px solid var(--border-color)",
              borderRadius: "14px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "0.74rem",
                    fontWeight: 800,
                    background: `${selectedScenario.badgeColor}22`,
                    color: selectedScenario.badgeColor
                  }}
                >
                  {selectedScenario.tag}
                </span>
              </div>

              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-main)", margin: "0 0 8px 0" }}>
                {selectedScenario.title}
              </h3>

              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.5", margin: "0 0 16px 0" }}>
                {selectedScenario.summary}
              </p>

              {/* Talking Points */}
              <div style={{ background: "var(--bg-surface)", padding: "14px", borderRadius: "10px", border: "1px solid var(--border-color)", marginBottom: "18px" }}>
                <strong style={{ display: "block", fontSize: "0.8rem", color: "var(--primary-blue)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  💡 Evaluator Presentation Talking Points:
                </strong>
                <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "0.82rem", color: "var(--text-main)", display: "flex", flexDirection: "column", gap: "6px" }}>
                  {selectedScenario.talkingPoints.map((tp, idx) => (
                    <li key={idx}>{tp}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Execution Footer */}
            <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
                Click below to launch this live real-world demonstration
              </span>

              <button
                className="btn btn-primary"
                onClick={() => handleExecuteScenario(selectedScenario)}
                disabled={isExecuting}
                style={{
                  background: selectedScenario.badgeColor,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontWeight: 800
                }}
              >
                <FiPlay /> {selectedScenario.actionLabel}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default DemoShowcaseModal;
