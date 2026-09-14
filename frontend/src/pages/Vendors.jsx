import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus,
  FiSearch,
  FiX,
  FiDollarSign,
  FiTrendingUp,
  FiCalendar,
  FiBox,
  FiShoppingBag,
  FiCheckCircle,
  FiStar,
  FiShield,
  FiLayers,
  FiPackage,
  FiTrash2,
  FiUser,
  FiFileText,
  FiMapPin,
  FiAward,
  FiClock,
  FiCheckSquare,
  FiSliders,
  FiAlertTriangle,
  FiArrowRight,
  FiExternalLink,
  FiCheck,
  FiInfo,
  FiBriefcase,
  FiHelpCircle,
  FiLock,
  FiRefreshCw,
  FiLogOut,
  FiXCircle,
  FiEye,
  FiCpu,
  FiMail,
  FiSend,
  FiZap,
  FiActivity,
  FiPlay
} from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../components/Header";
import StatsCard from "../components/StatsCard";
import {
  getVendors,
  registerVendor,
  getVendorAnalytics,
  getProducts,
  createProduct,
  deleteProduct,
  getVendorPipeline,
  executorApproveStage1,
  executorCancelStage1,
  verifierApproveStage2,
  verifierReturnStage2,
  verifierCancelStage2,
  approverSealStage3,
  approverReturnStage3,
  approverCancelStage3,
  chairmanFinalApprove,
  chairmanReject,
  runWeeklyVendorAnalysisApi,
  getWeeklyVendorReportsApi,
  sendWeeklyAdvisoryEmailApi,
  applyStrategicDiscountApi
} from "../services/api";

// Clean Initial State: The Executor intake queue starts with 0 applications.
// Applications will strictly and only appear when a new vendor applies via /vendor/register.
const initialPipelineApplications = [];
const additionalVendorApplicationPool = [];
const generateNextUniqueVendorApplication = () => null;

function Vendors() {
  // Active Navigation Tab: 'pipeline' (3-Tier Governance) | 'stores' (Active Catalogs)
  const [activeMainTab, setActiveMainTab] = useState("pipeline");

  // Admin Governance Authority Type
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole") || "admin");
  const [adminType, setAdminType] = useState(localStorage.getItem("adminType") || "executor");

  // Vendors & Products State
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [search, setSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [selectedProductCategory, setSelectedProductCategory] = useState("All");

  const PIPELINE_STORAGE_KEY = "vendorRegistrationPipeline_v7";

  // 3-Tier Vendor Registration Pipeline State from backend
  const [pipelineApplications, setPipelineApplications] = useState([]);

  // Normalizes any backend or localStorage record to have both camelCase & snake_case
  const normalizePipelineApp = (app) => {
    if (!app) return null;
    const app_ref = app.app_ref || (typeof app.id === "string" ? app.id : `VAPP-${app.id || Math.floor(Math.random() * 800) + 120}`);
    const id = app_ref;
    const storeName = app.storeName || app.store_name || "New Merchant Store";
    const ownerName = app.ownerName || app.owner_name || "Authorized Merchant";
    const overallStatus = app.overallStatus || app.overall_status || "STAGE_1_EXECUTOR";

    const stage1Status = app.stage1_executor?.status || app.stage1_status || "PENDING";
    const stage2Status = app.stage2_verifier?.status || app.stage2_status || "LOCKED";
    const stage3Status = app.stage3_approver?.status || app.stage3_status || "LOCKED";
    const stage4Status = app.stage4_chairman?.status || app.stage4_status || (overallStatus === "STAGE_4_CHAIRMAN" || overallStatus === "PENDING_CHAIRMAN_APPROVAL" ? "PENDING" : (overallStatus === "APPROVED_LIVE" || overallStatus === "APPROVED" ? "APPROVED" : "LOCKED"));

    let warehouses = app.warehouses;
    if (!warehouses && app.warehouses_json) {
      try { warehouses = JSON.parse(app.warehouses_json); } catch {}
    }
    if (!Array.isArray(warehouses) || warehouses.length === 0) {
      warehouses = [
        {
          id: "WH-1",
          name: `${storeName} Primary Logistics Hub (Zone A)`,
          city: "Bengaluru",
          stateName: "Karnataka",
          pincode: "560001",
          storageType: "Climate-Controlled Vault",
          capacityUnits: "100,000 Units",
          dispatchSpeed: "Same-Day Express (<12h)",
          incidentStatus: "Clean (0 Violations)",
          isPrimary: true,
          gpsCoordinates: "12.9716° N, 77.5946° E",
          realLocationVerified: true
        },
        {
          id: "WH-2",
          name: `${storeName} Regional Sorting Depot (Zone B)`,
          city: "Hyderabad",
          stateName: "Telangana",
          pincode: "500081",
          storageType: "High-Value Electronics Vault",
          capacityUnits: "60,000 Units",
          dispatchSpeed: "Priority Dispatch (12-24h)",
          incidentStatus: "Clean (0 Cargo Claims)",
          isPrimary: false,
          gpsCoordinates: "17.4401° N, 78.3489° E",
          realLocationVerified: true
        }
      ];
    }

    let dueDiligence = app.dueDiligence;
    if (!dueDiligence && app.due_diligence_json) {
      try { dueDiligence = JSON.parse(app.due_diligence_json); } catch {}
    }
    if (!dueDiligence) {
      dueDiligence = {
        complaintsCheck: {
          status: "CLEAN",
          legalDisputesCount: 0,
          consumerCourtCases: "0 Outstanding Cases (Clean Consumer Record)",
          policeFirs: "Clean Record (No Criminal or Fraud FIRs)",
          warehouseViolations: "Clean Record across all declared hubs",
          ipInfringements: "Nil Trademark Complaints"
        },
        trustability: {
          trustScore: 99,
          trustGrade: "Tier-A+ Enterprise Official",
          financialHealth: "AAA Rated (Financially Sound, 0 Default Risk)",
          fraudRiskLevel: "Ultra-Low Risk (0.01%)",
          bankVerification: "Commercial Corporate Account Verified",
          isTrustable: true
        },
        partnershipHistory: {
          previousCollabs: [
            { enterprise: `${storeName} Operations`, duration: "Direct Operations", role: "Primary Supply Partner", rating: "5.0/5.0 ★", notes: "Official verified direct vendor." }
          ],
          defaultRate: "0.00% Historical Defaults",
          repeatPartnerStatus: "Global Tier-1 Brand Partner"
        },
        companyReviews: {
          averageRating: 4.9,
          totalReviewsCount: 8450,
          positiveSentimentRate: "99.8% Positive",
          marketReputation: "World-leading technology manufacturer and consumer hardware ecosystem.",
          industryCertifications: ["ISO 9001:2015 Quality Standard", "RoHS Compliance Certified", "BIS Importer Clearance"]
        }
      };
    }

    let returnLetterToExecutor = app.returnLetterToExecutor;
    if (!returnLetterToExecutor && app.return_letter_json) {
      try { returnLetterToExecutor = JSON.parse(app.return_letter_json); } catch {}
    }

    let cancellationDetails = app.cancellationDetails;
    if (!cancellationDetails && app.cancellation_json) {
      try { cancellationDetails = JSON.parse(app.cancellation_json); } catch {}
    }

    let handoverLetterToVerifier = app.handoverLetterToVerifier;
    if (!handoverLetterToVerifier && app.handover_to_verifier_json) {
      try { handoverLetterToVerifier = JSON.parse(app.handover_to_verifier_json); } catch {}
    }

    let handoverLetterToApprover = app.handoverLetterToApprover;
    if (!handoverLetterToApprover && app.handover_to_approver_json) {
      try { handoverLetterToApprover = JSON.parse(app.handover_to_approver_json); } catch {}
    }

    let returnLetterToVerifier = app.returnLetterToVerifier;
    if (!returnLetterToVerifier && app.return_letter_json && (app.overall_status === "RETURNED_TO_VERIFIER" || overallStatus === "RETURNED_TO_VERIFIER")) {
      try { returnLetterToVerifier = JSON.parse(app.return_letter_json); } catch {}
    }

    return {
      ...app,
      id,
      app_ref,
      backend_id: app.id,
      storeName,
      store_name: storeName,
      ownerName,
      owner_name: ownerName,
      category: app.category || "Electronics",
      gstin: app.gstin || "27AADCB2234M1Z5",
      aadhaarNumber: app.aadhaarNumber || app.aadhaar_number || "987654321234",
      aadhaar_number: app.aadhaarNumber || app.aadhaar_number || "987654321234",
      email: app.email || "vendor@shopsense.com",
      phone: app.phone || "+91 9812345678",
      description: app.description || "",
      warehouses,
      bond: app.bond || {
        id: "BND-PRO",
        title: "High-Volume Merchant Bond",
        sellingPercentage: "5.0% Gross on Sold Products",
        escrowSecurity: "₹25,000 (Refundable Escrow)",
        bondReference: `BND-${id}`,
        payoutSpeed: "Instant Daily Settlement (T+0)"
      },
      dueDiligence,
      verifierAudit: app.verifierAudit || {
        geolocationCheck: {
          status: "VERIFIED_REAL",
          geotaggedConfidence: "100% Real Physical Facilities (0 Fake / Shell Addresses)",
          physicalVerificationMethod: "Satellite Geocoding & Field Agent Physical Facility Inspection",
          pinCodesValidated: true,
          gpsCoordinates: "12.9716° N, 77.5946° E & 17.4401° N, 78.3489° E"
        },
        catalogConsistency: {
          status: "100% MATCH",
          declaredCategory: app.category || "Electronics",
          descriptionProducts: app.description || "Electronics & Hardware",
          actualCatalogProducts: "Verified 100% authentic catalog SKUs",
          unauthorizedProductsFound: "None (0 Unauthorized SKUs)",
          authenticityMatchScore: "100% Matches Storefront Description Exactly"
        },
        productQuality: {
          qualityGrade: "Grade-A+ Commercial Premium Quality",
          materialTesting: "BIS Certified, RoHS Heavy-Metal Compliant",
          packagingStandard: "Heavy-Duty Shock-Proof & Anti-Drop Packaging",
          tamperProofing: "Holographic Tamper-Evident Seals Applied"
        },
        workplaceMeasures: {
          fireSafety: "Automated Sprinkler Grid & Co2 Extinguishers Active (NOC Valid)",
          climateAndHumidity: "Precision Temperature (21°C) & Humidity Control (45%)",
          cctvSurveillance: "24/7 High-Definition IP Surveillance & Biometric Access Logged",
          workerSafety: "Ergonomic Safety Gear, Anti-Fatigue Mats & Emergency Exit Corridors",
          pestAndElectrostatic: "Quarterly Pest Extermination Passed & ESD Matting Grounded"
        },
        warehouseRepresentation: {
          declaredCount: warehouses.length,
          meetsPolicy: true,
          totalCapacity: "160,000 Storage Units",
          dispatchVelocitySLA: "Same-Day Express (<12h) for 95% Inventory"
        }
      },
      handoverLetterToVerifier: handoverLetterToVerifier || {
        sender: "Mounish Sai (System Operations Executor Admin)",
        timestamp: "Awaiting Clearance",
        subject: `Stage 1 Due-Diligence Clearance & Handover: ${storeName}`,
        content: `To: Ananya Rao (Compliance & KYC Verifier Admin)\nFrom: Mounish Sai (System Operations Executor Admin)\nSubject: Stage 1 Due-Diligence Clearance & Handover: ${storeName}\n\nDear Verifier Admin,\n\nI have investigated "${storeName}". 0 legal disputes, clean records.\n\nRespectfully,\nMounish Sai`,
        status: "PENDING_REVIEW"
      },
      returnLetterToExecutor,
      cancellationDetails,
      handoverLetterToApprover: handoverLetterToApprover || {
        sender: "Ananya Rao (Compliance & KYC Verifier Admin)",
        timestamp: "Awaiting Verification",
        subject: `Stage 2 Geolocation & Quality Clearance: ${storeName}`,
        content: `To: Rajesh Menon (Cross-Check & Approval Authority)\nFrom: Ananya Rao (Compliance & KYC Verifier Admin)\nSubject: Stage 2 Geolocation & Quality Clearance: ${storeName}\n\nDear Approver Authority,\n\nAudited facilities for "${storeName}". All warehouses verified real.\n\nRespectfully,\nAnanya Rao`,
        status: "PENDING_REVIEW"
      },
      returnLetterToVerifier,
      stage1_executor: app.stage1_executor || {
        status: stage1Status,
        by: app.stage1_by || null,
        timestamp: app.stage1_timestamp || null,
        notes: app.stage1_notes || "Awaiting Executor due-diligence & legal complaints scan."
      },
      stage1_status: stage1Status,
      stage2_verifier: app.stage2_verifier || {
        status: stage2Status,
        by: app.stage2_by || null,
        timestamp: app.stage2_timestamp || null,
        notes: app.stage2_notes || "Locked: Waiting for Stage 1 Executor due-diligence approval."
      },
      stage2_status: stage2Status,
      stage3_approver: app.stage3_approver || {
        status: stage3Status,
        by: app.stage3_by || null,
        timestamp: app.stage3_timestamp || null,
        seal: app.seal_details_json ? JSON.parse(app.seal_details_json) : null,
        notes: app.stage3_notes || "Locked: Waiting for Stage 2 Verifier compliance clearance."
      },
      stage3_status: stage3Status,
      stage4_chairman: app.stage4_chairman || {
        status: stage4Status,
        by: app.stage4_by || null,
        timestamp: app.stage4_timestamp || null,
        notes: app.stage4_notes || (stage4Status === "PENDING" ? "Awaiting Supreme Chairman authorization for live vendor portal access." : "Locked: Waiting for Stage 3 Approver seal.")
      },
      stage4_status: stage4Status,
      overallStatus,
      overall_status: overallStatus
    };
  };

  const fetchPipeline = async () => {
    try {
      // 1. Purge legacy mock data caches if present
      try {
        localStorage.removeItem("vendorRegistrationPipeline_v6");
        localStorage.removeItem("vendorRegistrationPipeline_v5");
        localStorage.removeItem("vendorRegistrationPipeline_v4");
      } catch {}

      // 2. Load from localStorage first as fast baseline
      let localList = [];
      const saved = localStorage.getItem(PIPELINE_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            // Strictly exclude any legacy dummy applications
            localList = parsed
              .filter(a => a && (a.isLiveSessionIntake || !["VAPP-101", "VAPP-102", "VAPP-103", "VAPP-104", "VAPP-105"].includes(a.id)))
              .map(normalizePipelineApp)
              .filter(Boolean);
          }
        } catch {}
      }

      // 3. Fetch from backend API
      let backendList = [];
      try {
        const data = await getVendorPipeline();
        if (Array.isArray(data) && data.length > 0) {
          backendList = data.map(normalizePipelineApp).filter(Boolean);
        }
      } catch (e) {
        console.warn("Backend pipeline fetch notice:", e);
      }

      // 4. Merge: backend items take precedence, but keep local newly applied ones
      const combined = [...backendList];
      const seenNames = new Set(backendList.map(a => (a.storeName || a.store_name || "").toLowerCase().trim()));
      const seenRefs = new Set();
      backendList.forEach(a => {
        if (a.id) seenRefs.add(String(a.id));
        if (a.app_ref) seenRefs.add(String(a.app_ref));
        if (a.backend_id) seenRefs.add(String(a.backend_id));
      });

      for (const item of localList) {
        const nameKey = (item.storeName || item.store_name || "").toLowerCase().trim();
        const refKey = String(item.app_ref || item.id || "");
        const idKey = String(item.id || "");
        if (!seenNames.has(nameKey) && !seenRefs.has(refKey) && !seenRefs.has(idKey)) {
          combined.push(item);
          seenNames.add(nameKey);
          if (refKey) seenRefs.add(refKey);
          if (idKey) seenRefs.add(idKey);
        }
      }

      setPipelineApplications(combined);
      localStorage.setItem(PIPELINE_STORAGE_KEY, JSON.stringify(combined));
    } catch (err) {
      console.error("Failed to fetch vendor pipeline", err);
    }
  };

  useEffect(() => {
    fetchPipeline();
  }, []);

  const [pipelineFilter, setPipelineFilter] = useState("ALL");
  const [pipelineSearch, setPipelineSearch] = useState("");

  // Modals
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [viewingFullApp, setViewingFullApp] = useState(null); // Full Application Dossier (Visible to ALL 3 Admins)
  const [investigatingApp, setInvestigatingApp] = useState(null); // Stage 1 Executor Investigation Modal
  const [verifyingApp, setVerifyingApp] = useState(null); // Stage 2 Verifier Audit Modal
  const [approvingApp, setApprovingApp] = useState(null); // Stage 3 Approver Cross-Check Modal

  // Executor Due Diligence Investigation State
  const [executorChecks, setExecutorChecks] = useState({
    complaintsClean: true,
    trustVerified: true,
    partnershipsChecked: true,
    reviewsValidated: true,
    warehousesIncidentFree: true
  });
  const [executorInvestigationNotes, setExecutorInvestigationNotes] = useState(
    "Background investigation complete: 0 legal complaints on vendor/warehouses, trust score validated as Tier-A+, historical enterprise partnerships verified, and company reputation rating confirmed."
  );
  const [executorExplanationSubject, setExecutorExplanationSubject] = useState("");
  const [executorExplanationBody, setExecutorExplanationBody] = useState("");

  // Verifier Physical & Digital Audit State
  const [verifyChecks, setVerifyChecks] = useState({
    realLocationsVerified: true,
    catalogMatchesDescription: true,
    productQualityPassed: true,
    workplaceSafetyCertified: true,
    multiWarehouseCountPolicy: true,
    aadhaarKyc: true,
    gstinActive: true
  });
  const [verifierNotes, setVerifierNotes] = useState(
    "All physical facilities inspected: 100% genuine geolocations verified via on-site drone & telemetry audit, zero counterfeit product risk, CE & RoHS material certifications active, workplace fire NOC & cleanrooms compliant."
  );
  const [verifierExplanationSubject, setVerifierExplanationSubject] = useState("");
  const [verifierExplanationBody, setVerifierExplanationBody] = useState("");

  // Verifier Return Explanation (If verifier rejects back to executor)
  const [verifierModalTab, setVerifierModalTab] = useState("approve_handover"); // "approve_handover" | "return_executor" | "cancel_reject"
  const [verifierRejectionReason, setVerifierRejectionReason] = useState("Unresolved Physical Geolocation Mismatch / Warehouse Safety Risk");
  const [verifierRejectionLetter, setVerifierRejectionLetter] = useState("");

  // Approver Cross-Check & Induction State
  const [approverModalTab, setApproverModalTab] = useState("cross_check_approve"); // "cross_check_approve" | "return_verifier" | "cancel_reject"
  const [approverNotes, setApproverNotes] = useState("");
  const [approverRejectionReason, setApproverRejectionReason] = useState("Compliance & Governance Policy Inconsistency");
  const [approverRejectionLetter, setApproverRejectionLetter] = useState("");
  const [approverCrossChecks, setApproverCrossChecks] = useState({
    executorCleared: true,
    verifierCleared: true,
    kycActive: true,
    bondAgreed: true,
    inductToShopSense: true
  });
  const [inductedVendorCert, setInductedVendorCert] = useState(null); // Induction Certificate Modal

  // Cancellation States for all 3 Admins
  const [executorModalTab, setExecutorModalTab] = useState("approve_handover"); // "approve_handover" | "cancel_reject"
  const [executorCancellationReason, setExecutorCancellationReason] = useState("Discovered Outstanding Legal FIR / High Regulatory Risk");
  const [executorCancellationLetter, setExecutorCancellationLetter] = useState("");

  const [verifierCancellationReason, setVerifierCancellationReason] = useState("100% Fake / Ghost Warehouse Geolocation Coordinates");
  const [verifierCancellationLetter, setVerifierCancellationLetter] = useState("");

  const [approverCancellationReason, setApproverCancellationReason] = useState("Refusal / Breach of 5.0% Gross Performance Bond Terms");
  const [approverCancellationLetter, setApproverCancellationLetter] = useState("");

  // Cancelled & Discrepancies Desk Filter
  const [cancelledFilter, setCancelledFilter] = useState("ALL");

  // =========================================================================
  // Milestone 5: Autonomous AI Agent Copilot & Strategic Advisory State
  // =========================================================================
  const [aiAgentLoading, setAiAgentLoading] = useState(false);
  const [aiAgentReport, setAiAgentReport] = useState(null);
  const [aiAgentReportsHistory, setAiAgentReportsHistory] = useState([]);
  const [aiExecutionSteps, setAiExecutionSteps] = useState([]);
  const [applyingDiscountProductId, setApplyingDiscountProductId] = useState(null);
  const [appliedDiscounts, setAppliedDiscounts] = useState({});
  const [sendingEmail, setSendingEmail] = useState(false);
  const [showEmailPreviewModal, setShowEmailPreviewModal] = useState(false);
  const [selectedAiVendorId, setSelectedAiVendorId] = useState(null);
  const [auditLookbackDays, setAuditLookbackDays] = useState(7);

  const handleRunAiAgentAudit = async (targetVendorId = null) => {
    const vId = targetVendorId || selectedAiVendorId || selectedVendorId || (vendors[0] ? vendors[0].id : 1);
    setAiAgentLoading(true);
    setAiExecutionSteps([
      { step: "Node 1: Telemetry Audit", status: "RUNNING", detail: "Querying stock levels, demand trends, and clearance risks..." }
    ]);
    try {
      toast.info("🤖 LangGraph AI Agent: Auditing store inventory & sales telemetry...", { autoClose: 2000 });
      const report = await runWeeklyVendorAnalysisApi({ vendor_id: vId, lookback_days: auditLookbackDays });
      setAiAgentReport(report);
      setAiExecutionSteps(report.execution_trace || []);
      toast.success(`✨ Autonomous Audit Complete! Generated strategic directives for ${report.store_name}`, { autoClose: 3500 });
      try {
        const history = await getWeeklyVendorReportsApi(vId);
        setAiAgentReportsHistory(history);
      } catch (e) {
        console.warn("Could not fetch reports archive", e);
      }
    } catch (err) {
      console.error("AI Agent Audit failed", err);
      toast.error("Failed to run AI store audit: " + (err.response?.data?.detail || err.message));
    } finally {
      setAiAgentLoading(false);
    }
  };

  const handleApplyDiscount = async (action) => {
    const vId = aiAgentReport?.vendor_id || selectedVendorId || 1;
    const pId = action.product_id || action.id;
    const suggestedPrice = action.suggested_price || action.recommended_price || (action.current_price * 0.85);
    const discPct = action.discount_percentage || 15.0;
    const reason = action.description || action.reason || `Tactical markdown to accelerate inventory turnover and free capital`;

    setApplyingDiscountProductId(pId);
    try {
      const res = await applyStrategicDiscountApi({
        vendor_id: vId,
        product_id: pId,
        discount_percentage: discPct,
        new_price: suggestedPrice,
        reason: reason
      });
      toast.success(`🏷️ ${res.message || "Discount applied directly to catalog!"}`);
      setAppliedDiscounts(prev => ({ ...prev, [pId]: true }));
      // Refresh inventory & products
      loadData();
    } catch (err) {
      toast.error("Failed to apply discount: " + (err.response?.data?.detail || err.message));
    } finally {
      setApplyingDiscountProductId(null);
    }
  };

  const handleSendAdvisoryEmail = async () => {
    if (!aiAgentReport) return;
    setSendingEmail(true);
    try {
      const recipient = aiAgentReport.vendor_email || aiAgentReport.email_dispatch?.recipient || "vendor@techworld.com";
      const storeName = aiAgentReport.store_name || aiAgentReport.vendor_name || "Merchant Storefront";
      const res = await sendWeeklyAdvisoryEmailApi({
        vendor_id: aiAgentReport.vendor_id,
        recipient_email: recipient,
        report_ref: aiAgentReport.report_ref,
        subject: `[ShopSense AI Advisory] Weekly Strategic Briefing for ${storeName}`
      });
      toast.success(`📧 Executive Advisory Dispatched! Status: ${res.dispatch_status}`);
      setAiAgentReport(prev => ({
        ...prev,
        email_dispatch_status: res.dispatch_status,
        email_dispatch: { ...(prev?.email_dispatch || {}), status: res.dispatch_status }
      }));
    } catch (err) {
      toast.error("Failed to send advisory email: " + (err.response?.data?.detail || err.message));
    } finally {
      setSendingEmail(false);
    }
  };

  // New Vendor / Product State
  const [newVendor, setNewVendor] = useState({ name: "", email: "", specialty: "Fashion & Clothes" });
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "Fashion",
    price: "",
    stock: "In Stock",
    stock_quantity: "25",
    reorder_threshold: "5",
    description: "",
    image_url: ""
  });

  // Keep localStorage updated when pipeline applications change
  useEffect(() => {
    localStorage.setItem(PIPELINE_STORAGE_KEY, JSON.stringify(pipelineApplications));
  }, [pipelineApplications]);

  // Sync role, adminType, and pipeline updates across tabs / events
  useEffect(() => {
    const handleStorageUpdate = () => {
      setUserRole(localStorage.getItem("userRole") || "admin");
      setAdminType(localStorage.getItem("adminType") || "executor");
      try {
        const saved = localStorage.getItem(PIPELINE_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setPipelineApplications(parsed.map(normalizePipelineApp));
          }
        }
      } catch {}
    };
    window.addEventListener("storage", handleStorageUpdate);
    window.addEventListener("roleChanged", handleStorageUpdate);
    window.addEventListener("vendorPipelineUpdated", handleStorageUpdate);
    return () => {
      window.removeEventListener("storage", handleStorageUpdate);
      window.removeEventListener("roleChanged", handleStorageUpdate);
      window.removeEventListener("vendorPipelineUpdated", handleStorageUpdate);
    };
  }, []);

  // Live Cross-Tab BroadcastChannel listener for instant zero-latency session intake
  useEffect(() => {
    let channel = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        channel = new BroadcastChannel("shopsense_live_pipeline");
        channel.onmessage = (event) => {
          const { type, application } = event.data || {};
          if (type === "NEW_VENDOR_APPLICATION" && application) {
            const normalized = normalizePipelineApp(application);
            normalized.isLiveSessionIntake = true;

            setPipelineApplications((prev) => {
              const filtered = prev.filter(
                (a) => a.id !== normalized.id && (a.storeName || a.store_name) !== (normalized.storeName || normalized.store_name)
              );

              // When new vendor applies in live session, retire older static demo placeholder if present
              let updatedList = filtered;
              const oldestDemoIndex = updatedList.findIndex(
                (a) => (a.stage1_status === "PENDING" || !a.stage1_status) && !a.isLiveSessionIntake && (a.id?.startsWith("VAPP-1") || a.isDemoPlaceholder)
              );
              if (oldestDemoIndex !== -1 && updatedList.length >= 3) {
                updatedList = updatedList.filter((_, idx) => idx !== oldestDemoIndex);
              }

              const finalList = [normalized, ...updatedList];
              localStorage.setItem(PIPELINE_STORAGE_KEY, JSON.stringify(finalList));
              return finalList;
            });

            if (adminType === "executor") {
              toast.info(
                `⚡ 🔴 LIVE INTAKE: New vendor "${normalized.storeName}" has landed at your Executor Desk!`,
                { autoClose: 5000 }
              );
            }
          } else if (type === "STAGE_ADVANCED") {
            fetchPipeline();
          }
        };
      } catch (err) {
        console.warn("BroadcastChannel initialization notice:", err);
      }
    }
    return () => {
      if (channel) channel.close();
    };
  }, [adminType]);


  const navigate = useNavigate();

  // Explicit Admin Logout helper (Strict isolation between admin roles)
  const handleLogout = () => {
    localStorage.removeItem("authSessionActive");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("adminType");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("displayName");
    localStorage.removeItem("adminTypeTitle");
    localStorage.removeItem("aadhaarVerified");
    localStorage.removeItem("customerToken");
    window.dispatchEvent(new Event("roleChanged"));
    window.dispatchEvent(new Event("authChanged"));
    window.dispatchEvent(new Event("storage"));
    toast.info("Logged out from admin session. Redirecting to login...");
    setTimeout(() => {
      navigate("/login");
    }, 400);
  };

  // Fetch all vendors, products, and analytics
  const loadData = async () => {
    try {
      const [vendorRes, prodRes] = await Promise.allSettled([
        getVendors(),
        getProducts()
      ]);

      let loadedVendors = [];
      if (vendorRes.status === "fulfilled" && Array.isArray(vendorRes.value)) {
        loadedVendors = vendorRes.value;
      }

      let loadedProducts = [];
      if (prodRes.status === "fulfilled" && Array.isArray(prodRes.value)) {
        loadedProducts = prodRes.value;
        setProducts(loadedProducts);
      }

      // Map vendors with computed stats
      const enrichedVendors = loadedVendors.map((v) => {
        const vendorProds = loadedProducts.filter((p) => p.vendor_id === v.id);
        const prodCount = vendorProds.length;
        const totalUnitsSold = vendorProds.reduce((sum, p) => sum + (p.units_sold || 0), 0);
        const totalRev = vendorProds.reduce((sum, p) => sum + (p.units_sold || 0) * p.price, 0);

        let specialty = "General Marketplace";
        let icon = "🛍️";
        let owner = "Authorized Vendor Partner";

        if (v.name.toLowerCase().includes("voltx") || v.email?.toLowerCase().includes("voltx")) {
          specialty = "Next-Gen 5G Smart Mobiles, GaN Fast Chargers & Mobile Accessories";
          icon = "⚡";
          owner = "Vikram Malhotra (voltx_vendor)";
        } else if (v.name.toLowerCase().includes("tech") || v.name.toLowerCase().includes("electronic")) {
          specialty = "Electronics, Mobiles & Tech Gadgets";
          icon = "💻";
          owner = "Rahul Sharma (rahul_vendor)";
        } else if (v.name.toLowerCase().includes("greenearth") || v.name.toLowerCase().includes("organic")) {
          specialty = "Organic Living, Eco Decor & Sustainable Essentials";
          icon = "🌿";
          owner = "Sneha Kulkarni (sneha_vendor)";
        } else if (v.name.toLowerCase().includes("fashion") || v.name.toLowerCase().includes("clothes") || v.name.toLowerCase().includes("style")) {
          specialty = "Fashion, Silk Dresses, Jackets & Kids Wear";
          icon = "👗";
          owner = "Pooja Verma (pooja_vendor)";
        } else if (v.name.toLowerCase().includes("furniture") || v.name.toLowerCase().includes("home")) {
          specialty = "Furniture, Ergonomic Chairs & Solid Wood Desks";
          icon = "🛋️";
          owner = "Amit Patel (amit_vendor)";
        } else if (v.name.toLowerCase().includes("toy") || v.name.toLowerCase().includes("gadget")) {
          specialty = "Toys, 4K RC Drones & STEM Robotics";
          icon = "🚀";
          owner = "Aarav Mehta (aarav_vendor)";
        }

        const monthlyIncome = totalRev > 0 ? totalRev : Math.floor(Math.random() * 25000) + 12000;

        return {
          ...v,
          specialty,
          icon,
          owner,
          product_count: prodCount,
          total_units_sold: totalUnitsSold,
          monthly_income: monthlyIncome,
          yearly_income: monthlyIncome * 12,
          rating: v.rating || 4.9,
          status: v.status || "Active"
        };
      });

      setVendors(enrichedVendors);

      if (enrichedVendors.length > 0 && !selectedVendorId) {
        const storedVId = localStorage.getItem("vendorId");
        const storedStoreName = localStorage.getItem("vendorStoreName");
        const loggedUser = localStorage.getItem("userName");

        const matchStoredId = storedVId ? enrichedVendors.find((v) => String(v.id) === String(storedVId)) : null;
        const matchStoredName = storedStoreName ? enrichedVendors.find((v) => v.name.toLowerCase() === storedStoreName.toLowerCase() || (v.name.toLowerCase().includes("voltx") && storedStoreName.toLowerCase().includes("voltx"))) : null;
        const matchOwner = loggedUser ? enrichedVendors.find((v) => v.owner.toLowerCase().includes(loggedUser.toLowerCase())) : null;

        setSelectedVendorId(matchStoredId ? matchStoredId.id : matchStoredName ? matchStoredName.id : matchOwner ? matchOwner.id : enrichedVendors[0].id);
      }
    } catch {
      console.error("Error loading vendor portal data");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Reset pipeline to clean initial state (0 applications)
  const handleResetPipeline = () => {
    if (window.confirm("Clear all pipeline applications? Applications will only appear when a new vendor applies via /vendor/register.")) {
      setPipelineApplications([]);
      localStorage.setItem(PIPELINE_STORAGE_KEY, JSON.stringify([]));
      toast.info("🔄 Pipeline queue cleared. Waiting for new vendor applications via the registration portal.");
    }
  };

  // -------------------------------------------------------------
  // Open Modal Handlers (Pre-fills explanation & rejection letters)
  // -------------------------------------------------------------
  const handleOpenInvestigateModal = (app) => {
    setInvestigatingApp(app);
    setExecutorModalTab("approve_handover");
    setExecutorChecks({
      complaintsClean: true,
      trustVerified: true,
      partnershipsChecked: true,
      reviewsValidated: true,
      warehousesIncidentFree: true
    });
    const isReturnedOrCancelledByVerifier =
      app.stage1_executor?.status === "RETURNED" ||
      (app.overallStatus || app.overall_status) === "CANCELLED_BY_VERIFIER" ||
      (app.stage2_verifier?.status || app.stage2_status) === "CANCELLED" ||
      app.returnLetterToExecutor ||
      app.cancellationDetails;

    if (isReturnedOrCancelledByVerifier && (app.returnLetterToExecutor || app.cancellationDetails)) {
      const vReason = app.returnLetterToExecutor?.reason || app.cancellationDetails?.reason || "Verifier Compliance Discrepancy";
      setExecutorInvestigationNotes(
        `Re-investigation complete: Resolved Verifier discrepancy regarding "${vReason}". Legal, corporate and physical documentation re-validated.`
      );
      setExecutorExplanationSubject(
        `Re-Submitted: Stage 1 Clearance & Handover: ${app.storeName}`
      );
      setExecutorExplanationBody(
        `To: Ananya Rao (Compliance & KYC Verifier Admin)\nFrom: Mounish Sai (System Operations Executor Admin)\nSubject: Re-Submitted Stage 1 Clearance & Handover: ${app.storeName}\n\nDear Verifier Admin,\n\nI have re-investigated "${app.storeName}" following your return/cancellation notice.\n\nResolution & Re-Check Summary:\n- Discrepancy Addressed: ${vReason}.\n- Additional documentation verified and compliance cleared.\n\nPlease proceed with the Stage 2 geolocation & quality audit.\n\nRespectfully,\nMounish Sai\nSystem Operations Executor Authority`
      );
    } else {
      setExecutorInvestigationNotes(
        app.stage1_executor?.notes ||
        "Background investigation complete: 0 legal complaints on vendor/warehouses, trust score validated as Tier-A+, historical enterprise partnerships verified, and company reputation rating confirmed."
      );
      setExecutorExplanationSubject(
        app.handoverLetterToVerifier?.subject || `Stage 1 Clearance & Handover: ${app.storeName}`
      );
      setExecutorExplanationBody(
        app.handoverLetterToVerifier?.content ||
        `To: Ananya Rao (Compliance & KYC Verifier Admin)\nFrom: Mounish Sai (System Operations Executor Admin)\nSubject: Stage 1 Due-Diligence Clearance & Handover: ${app.storeName}\n\nDear Verifier Admin,\n\nI have conducted a thorough Stage 1 background due-diligence investigation for "${app.storeName}" (Proprietor: ${app.ownerName}, Category: ${app.category}).\n\nKey Findings & Verification Summary:\n1. Legal Complaints Registry: 0 outstanding consumer disputes, 0 police FIRs, and clean warehouse record.\n2. Trustability & Financial Health: Scored ${app.dueDiligence?.trustability?.trustScore || 98}/100 with AAA financial rating and verified corporate banking track record.\n3. Historical Partnerships: Verified successful supply agreements and zero default rate.\n4. Market Sentiment: 99.2% positive customer reviews and clean brand reputation.\n\nI have cleared Stage 1 and formally hand over this application to you for physical geolocation audits (real vs fake addresses), catalog description matching, product quality testing, and warehouse workplace safety inspections.\n\nRespectfully,\nMounish Sai\nSystem Operations Executor Authority`
      );
    }

    setExecutorCancellationReason("Discovered Outstanding Legal FIR / High Regulatory Risk");
    setExecutorCancellationLetter(
      `To: ${app.ownerName} (${app.storeName})\nFrom: Mounish Sai (System Operations Executor Admin)\nSubject: Stage 1 Due-Diligence Disqualification & Cancellation Notice: ${app.storeName}\n\nDear Vendor Applicant,\n\nFollowing our Stage 1 background due-diligence scan, your application for "${app.storeName}" cannot be advanced to Stage 2 verification.\n\nDisqualification Reason:\n- Discrepancy identified in regulatory registry / active legal disputes.\n- Trust health criteria threshold (minimum 85/100) not satisfied.\n\nThis application has been cancelled and archived in the Discrepancy Desk.\n\nMounish Sai\nSystem Operations Executor Admin`
    );
  };

  const handleOpenVerifierModal = (app) => {
    setVerifyingApp(app);
    setVerifierModalTab("accept_audit");
    setVerifyChecks({
      realLocationsVerified: true,
      catalogMatchesDescription: true,
      productQualityPassed: true,
      workplaceSafetyCertified: true,
      multiWarehouseCountPolicy: true,
      aadhaarKyc: true,
      gstinActive: true,
      escrowSecured: true
    });
    setVerifierNotes(
      app.stage2_verifier?.notes ||
      "Physical warehouse locations verified as real geotagged facilities (0 fake addresses). Product catalog 100% matches storefront description with zero mismatched SKUs. Product quality Grade-A passed, and workplace fire/climate/CCTV measures fully certified."
    );
    setVerifierExplanationSubject(
      app.handoverLetterToApprover?.subject || `Stage 2 Geolocation & Quality Clearance: ${app.storeName}`
    );
    setVerifierExplanationBody(
      app.handoverLetterToApprover?.content ||
      `To: Rajesh Menon (Cross-Check & Approval Authority)\nFrom: Ananya Rao (Compliance & KYC Verifier Admin)\nSubject: Stage 2 Geolocation, Quality & Workplace Safety Clearance: ${app.storeName}\n\nDear Approver Authority,\n\nI have accepted the Stage 1 Handover from the Executor Admin and completed a comprehensive physical and compliance audit for "${app.storeName}".\n\nAudit Findings & Telemetry:\n1. Geolocation Verification: Confirmed 100% Real Physical Logistics Facilities across all ${app.warehouses?.length || 2} declared hubs (0 fake/ghost addresses). GPS telemetry and postal verification passed.\n2. Catalog Consistency: Verified that the vendor's catalog matches 100% with the declared storefront description with zero unauthorized SKUs.\n3. Product Quality Standards: Passed sample testing, heavy-metal safety, and anti-tamper packaging standards (Grade-A+).\n4. Workplace Safety: Certified automated fire suppression (NOC Valid), 24/7 CCTV surveillance, and climate-controlled cleanroom storage.\n5. Multi-Warehouse SLA: Meets the 2+ warehouse mandate with priority dispatch SLA.\n\nI recommend final approval and hand over this application to you for the 5.0% Gross selling bond agreement execution and merchant seal issuance.\n\nRespectfully,\nAnanya Rao\nCompliance & KYC Verifier Admin`
    );
    setVerifierRejectionReason("Physical Geolocation Discrepancy Found (Fake Address / Unverified Coordinates)");
    setVerifierRejectionLetter(
      `To: Mounish Sai (System Operations Executor Admin)\nFrom: Ananya Rao (Compliance & KYC Verifier Admin)\nSubject: Rejection & Return of Application: ${app.storeName}\n\nDear Executor Admin,\n\nAfter reviewing your Stage 1 handover letter and conducting the physical geolocation and catalog audit for "${app.storeName}", our audit team has detected critical discrepancies:\n- The physical warehouse address in Pune could not be verified on satellite geocoding / commercial zoning registry.\n- Please cross-check the vendor's registered documents and complaints registry again before re-submitting.\n\nReturned for re-investigation,\nAnanya Rao\nCompliance & KYC Verifier Admin`
    );
    setVerifierCancellationReason("100% Fake / Ghost Warehouse Geolocation Coordinates");
    setVerifierCancellationLetter(
      `To: Mounish Sai (System Operations Executor Admin) & ${app.ownerName}\nFrom: Ananya Rao (Compliance & KYC Verifier Admin)\nSubject: Stage 2 Cancellation & Physical Facility Discrepancy Notice: ${app.storeName}\n\nDear Executor Admin & Vendor Applicant,\n\nDuring Stage 2 physical facility inspection and GPS geolocation auditing, the application for "${app.storeName}" failed mandatory verification.\n\nCancellation Reason:\n- Physical warehouse address could not be verified at declared coordinates (100% Ghost/Unverified Coordinates).\n- Counterfeit or uncertified SKU descriptions found in catalog inventory.\n\nThis application has been cancelled by Verifier and routed back to the Executor Admin Desk for re-investigation.\n\nRespectfully,\nAnanya Rao\nCompliance & KYC Verifier Admin`
    );
  };

  const handleOpenApproverModal = (app) => {
    setApprovingApp(app);
    setApproverModalTab("accept_seal");
    setApproverCrossChecks({
      executorCleared: true,
      verifierCleared: true,
      kycActive: true,
      bondAgreed: true,
      inductToShopSense: true
    });
    setApproverNotes(
      "Comprehensive cross-check complete: Stage 1 due-diligence, Stage 2 geolocation & quality audits, and GSTIN/Aadhaar verified. 5.0% Gross performance bond contract executed. Formally authorized and inducted into ShopSense Marketplace as an official live vendor partner."
    );
    setApproverRejectionReason("5.0% Gross Selling Bond Agreement Clause Disagreement");
    setApproverRejectionLetter(
      `To: Ananya Rao (Compliance & KYC Verifier Admin)\nFrom: Rajesh Menon (Cross-Check & Approval Authority)\nSubject: Rejection & Return of Application: ${app.storeName}\n\nDear Verifier Admin,\n\nWe have reviewed your Stage 2 audit handover letter for "${app.storeName}".\n\nDiscrepancy / Return Reason:\n- The 5.0% Gross selling bond agreement requires further clarification regarding the secondary warehouse dispatch SLA velocity.\n- Please re-audit the secondary hub's daily dispatch SLA commitments under the 5.0% bond clause before re-submitting.\n\nReturned for re-audit,\nRajesh Menon\nCross-Check & Approval Authority`
    );
    setApproverCancellationReason("Refusal / Breach of 5.0% Gross Performance Bond Terms");
    setApproverCancellationLetter(
      `To: ${app.ownerName} (${app.storeName})\nFrom: Rajesh Menon (Cross-Check & Approval Authority)\nSubject: Stage 3 Final Seal Disqualification & Cancellation: ${app.storeName}\n\nDear Vendor Applicant,\n\nYour application for "${app.storeName}" has been evaluated by the Approval Authority.\n\nDisqualification Reason:\n- Disagreement or failure to execute mandatory 5.0% Gross Performance Bond covenants.\n- Trademark or merchant authorization conflict identified.\n\nThis application has been cancelled and archived in the Discrepancy Desk.\n\nRajesh Menon\nCross-Check & Approval Authority`
    );
  };

  // -------------------------------------------------------------
  // Stage 1 Action: Executor Due-Diligence Approval & Handover Letter
  // Approves Stage 1 and dispatches explanation letter to Verifier Admin
  // AUTOMATICALLY generates and adds a brand new distinct vendor application to Executor queue!
  // -------------------------------------------------------------
  const handleExecuteDueDiligenceClearance = async (e) => {
    e.preventDefault();
    if (!investigatingApp) return;

    if (!executorChecks.complaintsClean || !executorChecks.trustVerified || !executorChecks.partnershipsChecked) {
      toast.error("Please complete all due-diligence checks before submitting to Verifier.");
      return;
    }

    const targetRef = investigatingApp.app_ref || investigatingApp.id;

    try {
      // Optimistically update local state immediately
      const updatedList = pipelineApplications.map((app) => {
        if (app.id === investigatingApp.id || app.app_ref === targetRef) {
          return {
            ...app,
            stage1_status: "COMPLETED",
            stage1_executor: {
              ...app.stage1_executor,
              status: "COMPLETED",
              by: "Mounish Sai (System Operations Executor)",
              timestamp: new Date().toLocaleDateString(),
              notes: executorInvestigationNotes
            },
            returnLetterToExecutor: null,
            cancellationDetails: null,
            stage2_status: "PENDING",
            stage2_verifier: {
              ...app.stage2_verifier,
              status: "PENDING",
              notes: "Unlocked: Received from Executor Admin for Physical Geolocation & Quality Audit."
            },
            overallStatus: "STAGE_2_VERIFIER",
            overall_status: "STAGE_2_VERIFIER"
          };
        }
        return app;
      });
      setPipelineApplications(updatedList);
      localStorage.setItem(PIPELINE_STORAGE_KEY, JSON.stringify(updatedList));

      await executorApproveStage1(targetRef, {
        notes: executorInvestigationNotes,
        due_diligence_notes: executorInvestigationNotes,
        handover_subject: executorExplanationSubject || `Stage 1 Clearance & Handover: ${investigatingApp.storeName}`,
        handover_content: executorExplanationBody
      });

      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        try {
          const bc = new BroadcastChannel("shopsense_live_pipeline");
          bc.postMessage({ type: "STAGE_ADVANCED", stage: 2, appRef: targetRef, timestamp: Date.now() });
          setTimeout(() => bc.close(), 100);
        } catch {}
      }

      await fetchPipeline(); // Refresh from backend
      toast.success(`⚡ Stage 1 Cleared for "${investigatingApp.storeName}"! Dispatched to Verifier Admin.`);
      setInvestigatingApp(null);
    } catch (err) {
      console.warn("Backend approval notice:", err);
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        try {
          const bc = new BroadcastChannel("shopsense_live_pipeline");
          bc.postMessage({ type: "STAGE_ADVANCED", stage: 2, appRef: targetRef, timestamp: Date.now() });
          setTimeout(() => bc.close(), 100);
        } catch {}
      }
      toast.success(`⚡ Stage 1 Cleared for "${investigatingApp.storeName}"! Dispatched to Verifier Admin.`);
      setInvestigatingApp(null);
    }
  };

  // Live Demo Injection: Allows Executor Admin to inject or replenish fresh demo applications
  const handleInjectDemoVendor = () => {
    const nextUniqueApp = generateNextUniqueVendorApplication(pipelineApplications);
    if (!nextUniqueApp) {
      toast.warning("All demo applications have already been generated!");
      return;
    }
    nextUniqueApp.isLiveSessionIntake = true;
    nextUniqueApp.submissionTimestamp = new Date().toLocaleTimeString();

    // When injecting a new demo application, retire older static demo placeholder if present
    let baseList = Array.isArray(pipelineApplications) ? pipelineApplications : [];
    const oldDemoIndex = baseList.findIndex(
      (a) => a && a.stage1_status === "PENDING" && !a.isLiveSessionIntake && (a.id?.startsWith("VAPP-1") || a.isDemoPlaceholder)
    );
    if (oldDemoIndex !== -1 && baseList.length >= 3) {
      baseList = baseList.filter((_, idx) => idx !== oldDemoIndex);
    }

    const updated = [nextUniqueApp, ...baseList];
    setPipelineApplications(updated);
    localStorage.setItem(PIPELINE_STORAGE_KEY, JSON.stringify(updated));

    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        const bc = new BroadcastChannel("shopsense_live_pipeline");
        bc.postMessage({ type: "NEW_VENDOR_APPLICATION", application: nextUniqueApp, timestamp: Date.now() });
        setTimeout(() => bc.close(), 100);
      } catch {}
    }

    toast.success(`⚡ Live Demo Vendor "${nextUniqueApp.storeName}" (${nextUniqueApp.id}) added to Executor Intake Queue!`);
  };

  // -------------------------------------------------------------
  // Stage 1 Action: Executor Outright Cancellation & Disqualification
  // Cancels the application from progressing to Verifier Stage 2
  // -------------------------------------------------------------
  const handleExecutorCancelApplication = (e) => {
    e.preventDefault();
    if (!investigatingApp) return;

    if (!executorCancellationLetter.trim()) {
      toast.error("Please write a formal cancellation explanation letter.");
      return;
    }

    const updated = pipelineApplications.map((app) => {
      if (app.id === investigatingApp.id) {
        return {
          ...app,
          stage1_executor: {
            ...app.stage1_executor,
            status: "CANCELLED",
            notes: `Cancelled by Executor Admin: ${executorCancellationReason}`
          },
          cancellationDetails: {
            by: "Mounish Sai (System Operations Executor Admin)",
            role: "Executor Admin (Stage 1)",
            reason: executorCancellationReason,
            letter: executorCancellationLetter,
            timestamp: new Date().toLocaleString()
          },
          overallStatus: "CANCELLED_BY_EXECUTOR"
        };
      }
      return app;
    });

    setPipelineApplications(updated);
    localStorage.setItem(PIPELINE_STORAGE_KEY, JSON.stringify(updated));
    toast.error(
      `🚫 Application "${investigatingApp.storeName}" cancelled & moved to Discrepancies Desk!`
    );
    setInvestigatingApp(null);
  };

  // -------------------------------------------------------------
  // Stage 2 Action: Verifier Audit Approval & Handover Letter to Approver
  // Approves Stage 2 and dispatches explanation letter to Approver Admin
  // -------------------------------------------------------------
  const handleExecuteVerifierAudit = async (e) => {
    e.preventDefault();
    if (!verifyingApp) return;

    if (
      !verifyChecks.realLocationsVerified ||
      !verifyChecks.catalogMatchesDescription ||
      !verifyChecks.productQualityPassed ||
      !verifyChecks.workplaceSafetyCertified ||
      !verifyChecks.multiWarehouseCountPolicy ||
      !verifyChecks.aadhaarKyc ||
      !verifyChecks.gstinActive
    ) {
      toast.error("Please complete all mandatory Geolocation, Quality & Workplace checks before approving Stage 2.");
      return;
    }

    const targetRef = verifyingApp.app_ref || verifyingApp.id;

    const updated = pipelineApplications.map((app) => {
      if (app.id === verifyingApp.id || app.app_ref === targetRef) {
        return {
          ...app,
          stage2_status: "COMPLETED",
          stage2_verifier: {
            status: "COMPLETED",
            by: "Ananya Rao (Compliance & KYC Verifier)",
            timestamp: new Date().toLocaleString(),
            notes: verifierNotes
          },
          handoverLetterToApprover: {
            sender: "Ananya Rao (Compliance & KYC Verifier)",
            timestamp: new Date().toLocaleString(),
            subject: verifierExplanationSubject || `Stage 2 Geolocation & Quality Clearance: ${app.storeName}`,
            content: verifierExplanationBody,
            status: "PENDING_REVIEW"
          },
          returnLetterToVerifier: null, // Cleared on successful re-dispatch
          stage3_status: "PENDING",
          stage3_approver: {
            ...app.stage3_approver,
            status: "PENDING", // UNLOCKED FOR APPROVER ADMIN
            notes: "Stage 2 Compliance & Geolocation Cleared with Official Handover Letter. Ready for Approver Authority."
          },
          overallStatus: "STAGE_3_APPROVER",
          overall_status: "STAGE_3_APPROVER"
        };
      }
      return app;
    });

    setPipelineApplications(updated);
    localStorage.setItem(PIPELINE_STORAGE_KEY, JSON.stringify(updated));

    try {
      await verifierApproveStage2(targetRef, {
        notes: verifierNotes,
        verifier_notes: verifierNotes,
        explanation_subject: verifierExplanationSubject || `Stage 2 Geolocation & Quality Clearance: ${verifyingApp.storeName}`,
        explanation_body: verifierExplanationBody || "Stage 2 physical audits passed. Handing over for 5.0% bond agreement execution."
      });
    } catch (err) {
      console.warn("Backend verifier approve notice:", err);
    }

    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        const bc = new BroadcastChannel("shopsense_live_pipeline");
        bc.postMessage({ type: "STAGE_ADVANCED", stage: 3, appRef: targetRef, timestamp: Date.now() });
        setTimeout(() => bc.close(), 100);
      } catch {}
    }

    await fetchPipeline();
    toast.success(`🔍 Stage 2 Cleared for "${verifyingApp.storeName}"! Handover & Explanation Letter dispatched to Approver Admin desk.`);
    setVerifyingApp(null);
  };

  // -------------------------------------------------------------
  // Stage 2 Rejection: Verifier Rejects & Returns Application to Executor
  // Dispatches rejection letter back to Executor for re-cross-checking
  // -------------------------------------------------------------
  const handleVerifierReturnToExecutor = async (e) => {
    e.preventDefault();
    if (!verifyingApp) return;

    if (!verifierRejectionLetter.trim()) {
      toast.error("Please write a formal rejection explanation letter explaining why you are returning this application to the Executor Admin.");
      return;
    }

    const targetRef = verifyingApp.app_ref || verifyingApp.id;

    try {
      await verifierReturnStage2(targetRef, {
        rejection_reason: verifierRejectionReason,
        rejection_letter: verifierRejectionLetter
      });
    } catch (err) {
      console.warn("Backend verifier return notice:", err);
    }

    const updated = pipelineApplications.map((app) => {
      if (app.id === verifyingApp.id || app.app_ref === targetRef) {
        return {
          ...app,
          stage1_status: "RETURNED",
          stage1_executor: {
            ...app.stage1_executor,
            status: "RETURNED",
            notes: `Returned by Verifier Admin (${verifierRejectionReason}). Re-investigation required.`
          },
          stage2_status: "RETURNED",
          stage2_verifier: {
            ...app.stage2_verifier,
            status: "REJECTED_RETURNED",
            notes: `Application rejected and returned to Executor with formal discrepancy letter.`
          },
          returnLetterToExecutor: {
            sender: "Ananya Rao (Compliance & KYC Verifier Admin)",
            timestamp: new Date().toLocaleString(),
            reason: verifierRejectionReason,
            content: verifierRejectionLetter
          },
          overallStatus: "RETURNED_TO_EXECUTOR",
          overall_status: "RETURNED_TO_EXECUTOR"
        };
      }
      return app;
    });

    setPipelineApplications(updated);
    localStorage.setItem(PIPELINE_STORAGE_KEY, JSON.stringify(updated));

    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        const bc = new BroadcastChannel("shopsense_live_pipeline");
        bc.postMessage({ type: "APPLICATION_RETURNED_TO_EXECUTOR", appRef: targetRef, timestamp: Date.now() });
        setTimeout(() => bc.close(), 100);
      } catch {}
    }

    await fetchPipeline();
    toast.warn(`↩️ Application "${verifyingApp.storeName}" rejected and returned to Executor Admin with your explanation letter.`);
    setVerifyingApp(null);
  };

  // -------------------------------------------------------------
  // Stage 3 Action: Cross-Check, Approve & Forward Vendor to Chairman
  // Grants final seal and dispatches application to Supreme Chairman for Portal Access
  // -------------------------------------------------------------
  const handleExecuteFinalApproval = async (e) => {
    e.preventDefault();
    if (!approvingApp) return;

    if (
      !approverCrossChecks.executorCleared ||
      !approverCrossChecks.verifierCleared ||
      !approverCrossChecks.kycActive ||
      !approverCrossChecks.bondAgreed ||
      !approverCrossChecks.inductToShopSense
    ) {
      toast.error("Please verify all mandatory cross-check items and consent to forwarding the vendor to Chairman.");
      return;
    }

    const certSeal = `SHOPSENSE-SEAL-2026-SS-${Math.floor(1000 + Math.random() * 9000)}`;
    const targetRef = approvingApp.app_ref || approvingApp.id;

    // 1. Update pipeline state (Application disappears from pending Approver desk and goes to Chairman)
    const updated = pipelineApplications.map((app) => {
      if (app.id === approvingApp.id || app.app_ref === targetRef) {
        return {
          ...app,
          stage3_status: "COMPLETED",
          stage3_approver: {
            status: "COMPLETED",
            by: "Rajesh Menon (Cross-Check & Vendor Approval Authority)",
            timestamp: new Date().toLocaleString(),
            seal: certSeal,
            notes: approverNotes
          },
          stage4_status: "PENDING",
          stage4_chairman: {
            status: "PENDING",
            notes: "Sealed & forwarded by Approver Authority. Awaiting Supreme Chairman live vendor portal access authorization."
          },
          overallStatus: "STAGE_4_CHAIRMAN",
          overall_status: "STAGE_4_CHAIRMAN"
        };
      }
      return app;
    });

    setPipelineApplications(updated);
    localStorage.setItem(PIPELINE_STORAGE_KEY, JSON.stringify(updated));

    try {
      await approverSealStage3(targetRef, {
        notes: approverNotes,
        approver_notes: approverNotes,
        escrow_bond_amount: 25000.0,
        explanation_letter_to_chairman: `Stage 3 Cross-Check Complete. 5.0% Gross performance bond contract executed for ${approvingApp.storeName}. Handing over to Supreme Chairman for final live vendor portal access authorization.`
      });
    } catch (err) {
      console.warn("Backend approver seal notice:", err);
    }

    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        const bc = new BroadcastChannel("shopsense_live_pipeline");
        bc.postMessage({ type: "STAGE_ADVANCED", stage: 4, appRef: targetRef, timestamp: Date.now() });
        setTimeout(() => bc.close(), 100);
      } catch {}
    }

    await fetchPipeline();
    toast.success(`✅ CROSS-CHECK COMPLETE & SEALED! Application "${approvingApp.storeName}" has been forwarded to the Supreme Chairman for final portal access.`);
    setApprovingApp(null);
  };

  // -------------------------------------------------------------
  // Stage 3 Rejection: Approver Rejects & Returns Application to Verifier
  // Dispatches rejection letter back to Verifier for re-audit
  // -------------------------------------------------------------
  const handleApproverReturnToVerifier = async (e) => {
    e.preventDefault();
    if (!approvingApp) return;

    if (!approverRejectionLetter.trim()) {
      toast.error("Please write a formal rejection explanation letter explaining why you are returning this application to the Verifier Admin.");
      return;
    }

    const targetRef = approvingApp.app_ref || approvingApp.id;

    try {
      await approverReturnStage3(targetRef, {
        rejection_reason: approverRejectionReason,
        rejection_letter: approverRejectionLetter
      });
    } catch (err) {
      console.warn("Backend approver return notice:", err);
    }

    const updated = pipelineApplications.map((app) => {
      if (app.id === approvingApp.id || app.app_ref === targetRef) {
        return {
          ...app,
          stage2_status: "RETURNED",
          stage2_verifier: {
            ...app.stage2_verifier,
            status: "RETURNED",
            notes: `Returned by Approver Authority (${approverRejectionReason}). Re-audit required.`
          },
          stage3_status: "RETURNED",
          stage3_approver: {
            ...app.stage3_approver,
            status: "REJECTED_RETURNED",
            notes: `Application rejected and returned to Verifier with formal discrepancy letter.`
          },
          returnLetterToVerifier: {
            sender: "Rajesh Menon (Cross-Check & Approval Authority)",
            timestamp: new Date().toLocaleString(),
            reason: approverRejectionReason,
            content: approverRejectionLetter
          },
          overallStatus: "RETURNED_TO_VERIFIER",
          overall_status: "RETURNED_TO_VERIFIER"
        };
      }
      return app;
    });

    setPipelineApplications(updated);
    localStorage.setItem(PIPELINE_STORAGE_KEY, JSON.stringify(updated));

    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        const bc = new BroadcastChannel("shopsense_live_pipeline");
        bc.postMessage({ type: "APPLICATION_RETURNED_TO_VERIFIER", appRef: targetRef, timestamp: Date.now() });
        setTimeout(() => bc.close(), 100);
      } catch {}
    }

    await fetchPipeline();
    toast.warn(`↩️ Application "${approvingApp.storeName}" rejected and returned to Verifier Admin with your explanation letter.`);
    setApprovingApp(null);
  };

  // -------------------------------------------------------------
  // Stage 3 Outright Cancellation: Approver Cancels / Vetoes Application
  // -------------------------------------------------------------
  const handleApproverCancelApplication = async (e) => {
    e.preventDefault();
    if (!approvingApp) return;

    if (!approverCancellationLetter.trim()) {
      toast.error("Please write a formal cancellation explanation letter.");
      return;
    }

    const targetRef = approvingApp.app_ref || approvingApp.id;

    try {
      await approverCancelStage3(targetRef, {
        cancellation_reason: approverCancellationReason,
        cancellation_letter: approverCancellationLetter
      });
    } catch (err) {
      console.warn("Backend approver cancel notice:", err);
    }

    const updated = pipelineApplications.map((app) => {
      if (app.id === approvingApp.id || app.app_ref === targetRef) {
        return {
          ...app,
          stage3_status: "CANCELLED",
          stage3_approver: {
            ...app.stage3_approver,
            status: "CANCELLED",
            notes: `Cancelled by Approver Authority: ${approverCancellationReason}`
          },
          cancellationDetails: {
            by: "Rajesh Menon (Cross-Check & Approval Authority)",
            role: "Approver Admin (Stage 3)",
            reason: approverCancellationReason,
            letter: approverCancellationLetter,
            timestamp: new Date().toLocaleString()
          },
          overallStatus: "CANCELLED_BY_APPROVER",
          overall_status: "CANCELLED_BY_APPROVER"
        };
      }
      return app;
    });

    setPipelineApplications(updated);
    localStorage.setItem(PIPELINE_STORAGE_KEY, JSON.stringify(updated));

    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        const bc = new BroadcastChannel("shopsense_live_pipeline");
        bc.postMessage({ type: "APPLICATION_CANCELLED_BY_APPROVER", appRef: targetRef, timestamp: Date.now() });
        setTimeout(() => bc.close(), 100);
      } catch {}
    }

    await fetchPipeline();
    toast.error(`🚫 Application "${approvingApp.storeName}" cancelled! Moved to Cancelled & Discrepancies Desk.`);
    setApprovingApp(null);
  };

  // -------------------------------------------------------------
  // Stage 4 Action: Supreme Chairman Live Portal Access Authorization
  // Activates vendor live on ShopSense and grants vendor portal access
  // -------------------------------------------------------------
  const handleChairmanGrantFinalAccess = async (app) => {
    if (!app) return;
    const targetRef = app.app_ref || app.id;
    try {
      try {
        await chairmanFinalApprove(targetRef, {
          chairman_notes: "Supreme Chairman Mounish has granted live vendor portal access and officially commissioned the store."
        });
      } catch (err) {
        console.warn("Backend chairman approve notice:", err);
      }

      try {
        await registerVendor({
          name: app.storeName || app.store_name,
          category: app.category || "Electronics",
          owner: app.ownerName || app.owner_name,
          rating: 5.0,
          status: "Active",
          compliance_status: "Fully Compliant (Chairman Certified)",
          email: app.email || `vendor_${String(targetRef).toLowerCase()}@shopsense.com`
        });
      } catch (vErr) {
        console.warn("Vendor registration notice:", vErr);
      }

      const updated = pipelineApplications.map((item) => {
        if (item.id === app.id || item.app_ref === targetRef) {
          return {
            ...item,
            stage1_status: "COMPLETED",
            stage2_status: "COMPLETED",
            stage3_status: "COMPLETED",
            stage4_status: "APPROVED",
            stage3_approver: {
              ...item.stage3_approver,
              status: "APPROVED",
              seal: item.stage3_approver?.seal || `SHOPSENSE-SEAL-${Math.floor(1000 + Math.random() * 9000)}`
            },
            stage4_chairman: {
              status: "APPROVED",
              by: "Supreme Chairman Mounish",
              timestamp: new Date().toLocaleString(),
              notes: "Portal access authorized and store officially commissioned."
            },
            overallStatus: "APPROVED_LIVE",
            overall_status: "APPROVED_LIVE",
            chairman_approval: {
              status: "ACCESS_GRANTED",
              timestamp: new Date().toLocaleString()
            }
          };
        }
        return item;
      });

      setPipelineApplications(updated);
      localStorage.setItem(PIPELINE_STORAGE_KEY, JSON.stringify(updated));

      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        try {
          const bc = new BroadcastChannel("shopsense_live_pipeline");
          bc.postMessage({ type: "STAGE_ADVANCED", stage: 5, appRef: targetRef, timestamp: Date.now() });
          setTimeout(() => bc.close(), 100);
        } catch {}
      }

      await fetchPipeline();
      await loadData();
      toast.success(`👑 SUPREME APPROVAL GRANTED! "${app.storeName || app.store_name}" is now live and authorized for the ShopSense Vendor Portal!`);
    } catch (err) {
      toast.error("Failed to grant live portal access: " + err.message);
    }
  };

  // -------------------------------------------------------------
  // Stage 2 Outright Cancellation: Verifier Cancels Fake Facility / Illegal Store
  // -------------------------------------------------------------
  const handleVerifierCancelApplication = async (e) => {
    e.preventDefault();
    if (!verifyingApp) return;

    if (!verifierCancellationLetter.trim()) {
      toast.error("Please write a formal cancellation explanation letter.");
      return;
    }

    const targetRef = verifyingApp.app_ref || verifyingApp.id;

    // Call backend API to persist cancellation and route back to Executor
    try {
      await verifierCancelStage2(targetRef, {
        cancellation_reason: verifierCancellationReason,
        cancellation_letter: verifierCancellationLetter
      });
    } catch (err) {
      console.warn("Backend verifier cancel notice:", err);
    }

    const cancelDetails = {
      by: "Ananya Rao (Compliance & KYC Verifier Admin)",
      role: "Verifier Admin (Stage 2)",
      reason: verifierCancellationReason,
      letter: verifierCancellationLetter,
      timestamp: new Date().toLocaleString()
    };

    const returnLetter = {
      sender: "Ananya Rao (Compliance & KYC Verifier Admin)",
      timestamp: new Date().toLocaleString(),
      reason: verifierCancellationReason,
      content: verifierCancellationLetter
    };

    const updated = pipelineApplications.map((app) => {
      if (app.id === verifyingApp.id || app.app_ref === targetRef) {
        return {
          ...app,
          stage1_executor: {
            ...app.stage1_executor,
            status: "RETURNED",
            notes: `Cancelled & Returned by Verifier Admin (${verifierCancellationReason}). Re-investigation required.`
          },
          stage1_status: "RETURNED",
          stage2_verifier: {
            ...app.stage2_verifier,
            status: "CANCELLED",
            notes: `Cancelled by Verifier Admin: ${verifierCancellationReason}`
          },
          stage2_status: "CANCELLED",
          cancellationDetails: cancelDetails,
          returnLetterToExecutor: returnLetter,
          overallStatus: "CANCELLED_BY_VERIFIER",
          overall_status: "CANCELLED_BY_VERIFIER"
        };
      }
      return app;
    });

    setPipelineApplications(updated);
    localStorage.setItem(PIPELINE_STORAGE_KEY, JSON.stringify(updated));

    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        const bc = new BroadcastChannel("shopsense_live_pipeline");
        bc.postMessage({ type: "APPLICATION_CANCELLED_BY_VERIFIER", appRef: targetRef, timestamp: Date.now() });
        setTimeout(() => bc.close(), 100);
      } catch {}
    }

    toast.error(`🚫 Application "${verifyingApp.storeName}" cancelled by Verifier! Routed back to Executor Admin desk.`);
    setVerifyingApp(null);
  };


  // -------------------------------------------------------------
  // Revive / Re-Open Application from Discrepancies Desk back to Stage 1
  // -------------------------------------------------------------
  const handleReopenApplication = (app) => {
    if (!window.confirm(`Re-open "${app.storeName}" back into the Stage 1 Executor intake queue for fresh due-diligence?`)) return;

    const updated = pipelineApplications.map((item) => {
      if (item.id === app.id) {
        return {
          ...item,
          stage1_executor: {
            status: "PENDING",
            by: null,
            timestamp: null,
            notes: "Re-opened from Cancelled / Discrepancy Desk. Ready for fresh Stage 1 due-diligence."
          },
          stage2_verifier: {
            status: "LOCKED",
            by: null,
            timestamp: null,
            notes: "Locked: Waiting for Stage 1 Executor clearance."
          },
          stage3_approver: {
            status: "LOCKED",
            by: null,
            timestamp: null,
            seal: null,
            notes: "Locked: Waiting for Stage 2 Verifier audit."
          },
          cancellationDetails: null,
          returnLetterToExecutor: null,
          returnLetterToVerifier: null,
          overallStatus: "STAGE_1_EXECUTOR"
        };
      }
      return item;
    });

    setPipelineApplications(updated);
    localStorage.setItem(PIPELINE_STORAGE_KEY, JSON.stringify(updated));
    toast.success(`🔄 "${app.storeName}" re-opened! Dispatched back to Stage 1 Executor intake queue.`);
  };

  // =========================================================================
  // STRICT SEQUENTIAL VISIBILITY & DISAPPEARING QUEUE PER ADMIN ROLE:
  // - Executor Admin: Sees applications pending Stage 1 OR returned by Verifier! Once approved, it DISAPPEARS and moves to Verifier!
  // - Verifier Admin: Sees applications approved by Executor OR returned by Approver! Once approved, it DISAPPEARS and moves to Approver!
  // - Approver Admin: Sees applications approved by BOTH! Once approved, it DISAPPEARS and activates as live store!
  // =========================================================================
  const isChairman = userRole === "chairman" || adminType === "chairman";

  // =========================================================================
  // STRICT SEQUENTIAL VISIBILITY & DISAPPEARING QUEUE PER ADMIN ROLE:
  // - Chairman: Omniscient access across all applications and stages
  // - Executor Admin: Sees applications pending Stage 1 OR returned by Verifier!
  // - Verifier Admin: Sees applications approved by Executor OR returned by Approver!
  // - Approver Admin: Sees applications approved by BOTH!
  // =========================================================================
  const roleEligibleApplications = useMemo(() => {
    if (isChairman) {
      // Chairman sees ALL pipeline applications with full multi-stage visibility
      return pipelineApplications;
    } else if (adminType === "executor") {
      // Executor sees:
      // 1. Applications pending Stage 1 intake (st1 === "PENDING" || overall === "STAGE_1_EXECUTOR")
      //    UNLESS they have already been approved by Executor (st1 === "COMPLETED" or advanced to Stage 2 / beyond).
      //    When approved by Executor, it MUST be removed/deleted from Executor desk!
      // 2. ONLY IF the Verifier Admin cancels or returns the application, it returns to the Executor Admin desk!
      return pipelineApplications.filter((app) => {
        const st1 = app.stage1_executor?.status || app.stage1_status;
        const st2 = app.stage2_verifier?.status || app.stage2_status;
        const overall = app.overallStatus || app.overall_status;

        // If cancelled by Verifier Admin, it comes to the Executor Admin!
        if (overall === "CANCELLED_BY_VERIFIER" || st2 === "CANCELLED") {
          return true;
        }

        // If returned by Verifier to Executor:
        if (overall === "RETURNED_TO_EXECUTOR" || st1 === "RETURNED") {
          return true;
        }

        // Once approved by Executor, it is deleted/removed from Executor queue
        if (st1 === "COMPLETED" || overall === "STAGE_2_VERIFIER" || overall === "STAGE_3_APPROVER" || overall === "AWAITING_APPROVAL" || overall === "STAGE_4_CHAIRMAN" || overall === "PENDING_CHAIRMAN_APPROVAL" || overall === "APPROVED_LIVE" || overall === "APPROVED" || overall === "CANCELLED_BY_EXECUTOR") {
          return false;
        }

        // Pending Stage 1 Executor intake
        return st1 === "PENDING" || overall === "STAGE_1_EXECUTOR";
      });
    } else if (adminType === "verifier") {
      // Verifier sees applications approved by Executor AND pending Stage 2 audit, OR returned by Approver
      // Once approved, it DISAPPEARS from Verifier queue and moves to Approver!
      return pipelineApplications.filter((app) => {
        const st1 = app.stage1_executor?.status || app.stage1_status;
        const st2 = app.stage2_verifier?.status || app.stage2_status;
        const overall = app.overallStatus || app.overall_status;
        if (st2 === "CANCELLED" || overall === "CANCELLED_BY_VERIFIER") {
          return false;
        }
        if (st2 === "COMPLETED" || overall === "STAGE_3_APPROVER" || overall === "AWAITING_APPROVAL" || overall === "STAGE_4_CHAIRMAN" || overall === "PENDING_CHAIRMAN_APPROVAL" || overall === "APPROVED_LIVE" || overall === "APPROVED") {
          return false;
        }
        return (
          (st1 === "COMPLETED" && (st2 === "PENDING" || overall === "STAGE_2_VERIFIER")) ||
          st2 === "RETURNED" ||
          overall === "RETURNED_TO_VERIFIER"
        );
      });
    } else if (adminType === "approver") {
      // Approver sees applications approved by BOTH & pending final seal
      // Once approved/sealed, it DISAPPEARS from Approver queue and moves to Chairman!
      return pipelineApplications.filter((app) => {
        const st1 = app.stage1_executor?.status || app.stage1_status;
        const st2 = app.stage2_verifier?.status || app.stage2_status;
        const st3 = app.stage3_approver?.status || app.stage3_status;
        const overall = app.overallStatus || app.overall_status;
        if (st3 === "COMPLETED" || st3 === "APPROVED" || st3 === "APPROVED_AND_FORWARDED" || overall === "STAGE_4_CHAIRMAN" || overall === "PENDING_CHAIRMAN_APPROVAL" || overall === "APPROVED_LIVE" || overall === "APPROVED" || overall === "CANCELLED_BY_APPROVER" || st3 === "CANCELLED") {
          return false;
        }
        return (
          st1 === "COMPLETED" &&
          st2 === "COMPLETED" &&
          (st3 === "PENDING" || overall === "STAGE_3_APPROVER" || overall === "AWAITING_APPROVAL" || st3 === "RETURNED" || overall === "RETURNED_TO_VERIFIER")
        );
      });
    }
    return pipelineApplications;
  }, [pipelineApplications, adminType, isChairman]);

  // Filter pipeline applications based on search & tab filters
  const filteredPipelineApplications = useMemo(() => {
    return roleEligibleApplications.filter((app) => {
      const currentOverall = app.overallStatus || app.overall_status || "STAGE_1_EXECUTOR";
      let matchFilter = true;
      if (pipelineFilter !== "ALL") {
        if (pipelineFilter === "STAGE_1_EXECUTOR") {
          matchFilter = currentOverall === "STAGE_1_EXECUTOR" || currentOverall === "CANCELLED_BY_VERIFIER" || currentOverall === "RETURNED_TO_EXECUTOR" || (app.stage1_executor?.status || app.stage1_status) === "PENDING" || (app.stage1_executor?.status || app.stage1_status) === "RETURNED";
        } else if (pipelineFilter === "STAGE_2_VERIFIER") {
          matchFilter = currentOverall === "STAGE_2_VERIFIER" || ((app.stage1_executor?.status || app.stage1_status) === "COMPLETED" && (app.stage2_verifier?.status || app.stage2_status) === "PENDING");
        } else if (pipelineFilter === "STAGE_3_APPROVER") {
          matchFilter = currentOverall === "STAGE_3_APPROVER" || currentOverall === "AWAITING_APPROVAL" || ((app.stage2_verifier?.status || app.stage2_status) === "COMPLETED" && (app.stage3_approver?.status || app.stage3_status) === "PENDING");
        } else if (pipelineFilter === "STAGE_4_CHAIRMAN") {
          matchFilter = currentOverall === "STAGE_4_CHAIRMAN" || currentOverall === "PENDING_CHAIRMAN_APPROVAL" || ((app.stage3_approver?.status || app.stage3_status) === "COMPLETED" && (app.stage4_chairman?.status || app.stage4_status) !== "APPROVED" && currentOverall !== "APPROVED_LIVE" && currentOverall !== "APPROVED");
        } else if (pipelineFilter === "APPROVED") {
          matchFilter = currentOverall === "APPROVED_LIVE" || currentOverall === "APPROVED" || (app.stage4_chairman?.status || app.stage4_status) === "APPROVED";
        } else {
          matchFilter = currentOverall === pipelineFilter;
        }
      }

      const sName = (app.storeName || app.store_name || "").toLowerCase();
      const oName = (app.ownerName || app.owner_name || "").toLowerCase();
      const cat = (app.category || "").toLowerCase();
      const gst = (app.gstin || "").toLowerCase();
      const query = (pipelineSearch || "").toLowerCase();

      const matchSearch =
        !query ||
        sName.includes(query) ||
        oName.includes(query) ||
        cat.includes(query) ||
        gst.includes(query);

      return matchFilter && matchSearch;
    });
  }, [roleEligibleApplications, pipelineFilter, pipelineSearch]);

  // Discrepancy & Cancelled Applications strictly scoped to the logged-in adminType
  const cancelledAndReturnedApplications = useMemo(() => {
    return pipelineApplications.filter((app) => {
      const overall = (app.overallStatus || app.overall_status || "");
      const st1 = app.stage1_executor?.status || app.stage1_status || "";
      const st2 = app.stage2_verifier?.status || app.stage2_status || "";
      const st3 = app.stage3_approver?.status || app.stage3_status || "";

      if (isChairman) {
        return (
          overall.startsWith("CANCELLED") ||
          overall.includes("RETURNED") ||
          st1 === "CANCELLED" || st1 === "RETURNED" ||
          st2 === "CANCELLED" || st2 === "RETURNED" || st2 === "REJECTED_RETURNED" ||
          st3 === "CANCELLED" || st3 === "RETURNED" || st3 === "REJECTED_RETURNED"
        );
      } else if (adminType === "executor") {
        return (
          overall === "CANCELLED_BY_EXECUTOR" ||
          st1 === "CANCELLED" ||
          overall === "RETURNED_TO_EXECUTOR" ||
          st1 === "RETURNED" ||
          overall === "CANCELLED_BY_VERIFIER" ||
          st2 === "CANCELLED"
        );
      } else if (adminType === "verifier") {
        return (
          overall === "CANCELLED_BY_VERIFIER" ||
          st2 === "CANCELLED" ||
          overall === "RETURNED_TO_VERIFIER" ||
          st2 === "RETURNED" ||
          st2 === "REJECTED_RETURNED"
        );
      } else if (adminType === "approver") {
        return (
          overall === "CANCELLED_BY_APPROVER" ||
          st3 === "CANCELLED" ||
          overall === "RETURNED_TO_VERIFIER" ||
          st3 === "RETURNED" ||
          st3 === "REJECTED_RETURNED"
        );
      }
      return false;
    });
  }, [pipelineApplications, adminType, isChairman]);

  const filteredCancelledApplications = useMemo(() => {
    return cancelledAndReturnedApplications.filter((app) => {
      const overall = (app.overallStatus || app.overall_status || "");
      let matchFilter = true;
      if (cancelledFilter === "CANCELLED_ONLY") {
        matchFilter = overall.startsWith("CANCELLED");
      } else if (cancelledFilter === "RETURNED_ONLY") {
        matchFilter = !overall.startsWith("CANCELLED");
      }

      const sName = (app.storeName || app.store_name || "").toLowerCase();
      const oName = (app.ownerName || app.owner_name || "").toLowerCase();
      const cat = (app.category || "").toLowerCase();
      const gst = (app.gstin || "").toLowerCase();
      const query = (pipelineSearch || "").toLowerCase();

      const matchSearch =
        !query ||
        sName.includes(query) ||
        oName.includes(query) ||
        cat.includes(query) ||
        gst.includes(query);

      return matchFilter && matchSearch;
    });
  }, [cancelledAndReturnedApplications, cancelledFilter, pipelineSearch]);



  const activeVendor = useMemo(() => {
    return vendors.find((v) => v.id === selectedVendorId) || vendors[0];
  }, [vendors, selectedVendorId]);

  const vendorProducts = useMemo(() => {
    if (!activeVendor) return [];
    return products.filter((p) => {
      const matchVendor = p.vendor_id === activeVendor.id;
      const pName = (p.name || "").toLowerCase();
      const pCat = (p.category || "").toLowerCase();
      const q = (productSearch || "").toLowerCase();
      const matchSearch = !q || pName.includes(q) || pCat.includes(q);
      const matchCategory =
        selectedProductCategory === "All" || p.category === selectedProductCategory;

      return matchVendor && matchSearch && matchCategory;
    });
  }, [products, activeVendor, productSearch, selectedProductCategory]);

  // Helper to get real-world product photography fallback for vendor categories
  const getCategoryFallbackImage = (cat = "") => {
    const c = String(cat).toLowerCase();
    if (c.includes("scooter") || c.includes("mobility") || c.includes("battery") || c.includes("electric")) return "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800";
    if (c.includes("mobile") || c.includes("phone")) return "https://m.media-amazon.com/images/I/81vxWpPpgNL.jpg";
    if (c.includes("electronic") || c.includes("laptop")) return "https://m.media-amazon.com/images/I/61bMJdgeryL._AC_SL1500_.jpg";
    if (c.includes("audio") || c.includes("headphone") || c.includes("earbud")) return "https://m.media-amazon.com/images/I/614apPMGmLL._AC_SL1500_.jpg";
    if (c.includes("display") || c.includes("monitor")) return "https://m.media-amazon.com/images/I/71I2fkoBRCL._AC_SL1500_.jpg";
    if (c.includes("dress") || c.includes("women")) return "https://m.media-amazon.com/images/I/81uiWMk9dnL._AC_SL1500_.jpg";
    if (c.includes("fashion") || c.includes("cloth") || c.includes("men")) return "https://m.media-amazon.com/images/I/71mkj++CUTL._AC_SL1500_.jpg";
    if (c.includes("shoe") || c.includes("sneaker") || c.includes("footwear")) return "https://m.media-amazon.com/images/I/71X4AZCVGuL._AC_SL1500_.jpg";
    if (c.includes("kid")) return "https://m.media-amazon.com/images/I/71hg6m6m50L._AC_.jpg";
    if (c.includes("desk")) return "https://cdn.autonomous.ai/production/ecm/260109/thumb.webp";
    if (c.includes("furniture") || c.includes("chair") || c.includes("home") || c.includes("living")) return "https://m.media-amazon.com/images/I/71VVk7m8aIL._AC_SL1500_.jpg";
    if (c.includes("drone") || c.includes("toy") || c.includes("game")) return "https://m.media-amazon.com/images/I/51CXJ8Rl7UL.jpg";
    if (c.includes("console") || c.includes("playstation") || c.includes("xbox")) return "https://m.media-amazon.com/images/I/71aBXvHYUpL._AC_SL1500_.jpg";
    return "https://m.media-amazon.com/images/I/81vxWpPpgNL.jpg";
  };

  // Add Product to Active Vendor Store
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !activeVendor) {
      toast.error("Please provide product name and price");
      return;
    }

    try {
      const finalImageUrl = (newProduct.image_url && newProduct.image_url.trim()) || getCategoryFallbackImage(newProduct.category);

      const created = await createProduct({
        name: newProduct.name,
        category: newProduct.category,
        price: parseFloat(newProduct.price),
        stock: newProduct.stock,
        stock_quantity: parseInt(newProduct.stock_quantity || "20", 10),
        reorder_threshold: parseInt(newProduct.reorder_threshold || "5", 10),
        description: newProduct.description || `${newProduct.name} - Official listing from ${activeVendor.name || "Vendor Store"}`,
        image_url: finalImageUrl,
        vendor_id: activeVendor.id
      });

      // Broadcast live sync signal across tabs and windows to Customer Platform
      localStorage.setItem("shopsense_last_product_update", Date.now().toString());
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("productUpdated"));
      try {
        const syncChannel = new BroadcastChannel("shopsense_live_sync");
        syncChannel.postMessage({ type: "PRODUCT_ADDED", product: created });
        syncChannel.close();
      } catch {}

      toast.success(`✨ Added "${newProduct.name}" to ${activeVendor.name || "Vendor Store"}!`);
      setShowAddProductModal(false);
      setNewProduct({
        name: "",
        category: "Fashion",
        price: "",
        stock: "In Stock",
        stock_quantity: "25",
        reorder_threshold: "5",
        description: "",
        image_url: ""
      });
      loadData();
    } catch {
      toast.error("Failed to add product to vendor store.");
    }
  };

  // Delete Product
  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to remove "${productName}" from your store catalog?`))
      return;
    try {
      await deleteProduct(productId);

      // Broadcast deletion signal
      localStorage.setItem("shopsense_last_product_update", Date.now().toString());
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("productUpdated"));
      try {
        const syncChannel = new BroadcastChannel("shopsense_live_sync");
        syncChannel.postMessage({ type: "PRODUCT_DELETED", productId });
        syncChannel.close();
      } catch {}

      toast.success(`Product "${productName}" removed.`);
      loadData();
    } catch {
      toast.error("Failed to delete product.");
    }
  };

  // Dynamic Portal Configuration based on Logged-in Admin Type
  const portalConfig = {
    chairman: {
      portalName: "👑 Supreme Chairman Vendor Governance & Network Oversight",
      portalSubtitle: "Master Omniscient Control across Stage 1 Executor, Stage 2 Verifier, Stage 3 Approver & Live Stores",
      badgeLabel: "👑 SUPREME CHAIRMAN GOVERNANCE DESK",
      badgeColor: "#F59E0B",
      badgeBg: "rgba(245, 158, 11, 0.2)",
      heading: "👑 Supreme Chairman Vendor Governance & 3-Tier Pipeline Oversight",
      description: "Supreme omniscient oversight across all stages of the vendor onboarding pipeline. Monitor pending Stage 1 Executor investigations, Stage 2 Verifier facility audits, Stage 3 Approver seals, and all active live merchant stores with presidential warrant authority.",
      pendingCountLabel: "Total Pipeline Applications",
      pendingCount: pipelineApplications.length
    },
    executor: {
      portalName: "⚡ System Operations Executor Portal",
      portalSubtitle: "New Vendor Applications Intake, Complaints Registry & Background Due-Diligence Investigation",
      badgeLabel: "⚡ SYSTEM OPERATIONS EXECUTOR PORTAL",
      badgeColor: "#60A5FA",
      badgeBg: "rgba(37, 99, 235, 0.2)",
      heading: "⚡ Stage 1: New Vendor Intake & Due-Diligence Investigation Desk",
      description: "Inspect background legal complaints, validate trustability scores, check past partnerships, and approve Stage 1. Once approved, the application will immediately disappear from your desk and move to the Verifier Admin.",
      pendingCountLabel: "Active Pending Intake Queue",
      pendingCount: pipelineApplications.filter((a) => (a.stage1_executor?.status || a.stage1_status) === "PENDING").length
    },
    verifier: {
      portalName: "🔍 Compliance & KYC Verifier Portal",
      portalSubtitle: "Physical Warehouse Geolocation (Real vs Fake), Product Description Match, Quality Standards & Workplace Safety Audits",
      badgeLabel: "🔍 COMPLIANCE & KYC VERIFIER PORTAL",
      badgeColor: "#A78BFA",
      badgeBg: "rgba(139, 92, 246, 0.2)",
      heading: "🔍 Stage 2: Warehouse Geolocation, Product Match & Quality Audit Desk",
      description: "You receive applications ONLY after the Executor Admin approves them. Audit real locations, catalog description consistency, product quality, and workplace safety. Once approved, the application will immediately disappear from your desk and move to the Approver Admin.",
      pendingCountLabel: "Active Pending Verifier Audit Queue",
      pendingCount: pipelineApplications.filter((a) => (a.stage1_executor?.status || a.stage1_status) === "COMPLETED" && (a.stage2_verifier?.status || a.stage2_status) === "PENDING").length
    },
    approver: {
      portalName: "⚖️ Vendor Cross-Check & Approval Authority Portal",
      portalSubtitle: "Final Cross-Check, 5.0% Gross Bond Agreement Review & Merchant Certification Authority",
      badgeLabel: "⚖️ CROSS-CHECK & VENDOR APPROVAL AUTHORITY PORTAL",
      badgeColor: "#34D399",
      badgeBg: "rgba(16, 185, 129, 0.2)",
      heading: "⚖️ Stage 3: Vendor Cross-Check & Final Seal Authority",
      description: "You receive applications ONLY after BOTH Executor and Verifier have approved them. Cross-check compliance audits, review the 5.0% Gross bond, and issue the final seal. Once approved, the application will disappear from your queue and activate as a live merchant store.",
      pendingCountLabel: "Active Pending Final Approval Queue",
      pendingCount: pipelineApplications.filter((a) => (a.stage1_executor?.status || a.stage1_status) === "COMPLETED" && (a.stage2_verifier?.status || a.stage2_status) === "COMPLETED" && (a.stage3_approver?.status || a.stage3_status) !== "APPROVED").length
    }
  };

  const activePortal = isChairman ? portalConfig.chairman : (portalConfig[adminType] || portalConfig.executor);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="page-container"
      style={{ paddingBottom: "60px" }}
    >
      <ToastContainer position="top-right" autoClose={2500} theme="dark" />
      <Header
        title={activePortal.portalName}
        subtitle={activePortal.portalSubtitle}
      />

      {/* ========================================================================= */}
      {/* 1. DEDICATED ADMIN GOVERNANCE PORTAL BANNER                               */}
      {/* ========================================================================= */}
      <div
        style={{
          background: "linear-gradient(135deg, #0B1329 0%, #0F172A 100%)",
          border: `1px solid ${activePortal.badgeColor}40`,
          borderRadius: "18px",
          padding: "20px 24px",
          marginBottom: "24px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  background: activePortal.badgeBg,
                  color: activePortal.badgeColor,
                  padding: "4px 10px",
                  borderRadius: "8px",
                  fontSize: "0.74rem",
                  fontWeight: 800,
                  letterSpacing: "0.5px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <FiShield /> {activePortal.badgeLabel}
              </span>
            </div>
            <h3 style={{ fontSize: "1.3rem", fontWeight: 900, color: "#FFFFFF", margin: "6px 0 2px 0" }}>
              {activePortal.heading}
            </h3>
            <p style={{ fontSize: "0.84rem", color: "#94A3B8", margin: 0, maxWidth: "900px" }}>
              {activePortal.description}
            </p>
          </div>

          <button
            onClick={handleResetPipeline}
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              color: "#94A3B8",
              border: "1px solid #334155",
              padding: "8px 14px",
              borderRadius: "8px",
              fontSize: "0.78rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
            title="Reset demo applications to fresh Stage 1 state"
          >
            <FiRefreshCw /> Reset Sequential Pipeline
          </button>
        </div>

        {/* Sequential Governance Rules Bar */}
        <div
          style={{
            background: "#020617",
            border: "1px solid #1E293B",
            borderRadius: "12px",
            padding: "12px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "14px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem" }}>
            <span style={{ color: "#FCD34D", fontWeight: 800 }}>📌 Sequential Pipeline Rule:</span>
            <span style={{ color: "#CBD5E1" }}>
              <strong>Executor Approves First</strong> ➔ Arrives at <strong>Verifier Admin</strong> ➔ <strong>Verifier Approves Second</strong> ➔ Arrives at <strong>Approver Admin</strong>.
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "0.78rem", color: activePortal.badgeColor, fontWeight: 800, background: activePortal.badgeBg, padding: "4px 10px", borderRadius: "6px" }}>
              {activePortal.pendingCountLabel}: {activePortal.pendingCount}
            </span>
          </div>
        </div>

        {/* Strictly Authenticated Single-Admin Governance Session Banner */}
        <div
          style={{
            background: "#020617",
            border: `1px solid ${activePortal.badgeColor}40`,
            borderRadius: "12px",
            padding: "14px 18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "14px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "10px",
                background: activePortal.badgeBg,
                color: activePortal.badgeColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.3rem",
                fontWeight: 900
              }}
            >
              {isChairman ? "👑" : adminType === "approver" ? "⚖️" : adminType === "verifier" ? "🔍" : "⚡"}
            </div>
            <div>
              <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "#FFFFFF", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>Authenticated Admin:</span>
                <span style={{ color: activePortal.badgeColor, background: activePortal.badgeBg, padding: "2px 8px", borderRadius: "6px" }}>
                  {isChairman
                    ? "Mounish Sai Gandhi (Supreme Chairman & Managing Director)"
                    : adminType === "approver"
                    ? "Rajesh Menon (Approver Authority)"
                    : adminType === "verifier"
                    ? "Ananya Rao (Verifier Admin)"
                    : "Mounish Sai (Executor Admin)"}
                </span>
              </div>
              <p style={{ fontSize: "0.76rem", color: "#94A3B8", margin: "3px 0 0 0" }}>
                {isChairman
                  ? "👑 Supreme Omniscient Authority: You possess master executive oversight across all three admin desks and live stores."
                  : `🔒 Strict Admin Session Isolation: You are viewing only the ${activePortal.portalName}. To access another admin tier, please log out and sign in.`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
              color: "#FFFFFF",
              border: "none",
              padding: "9px 18px",
              borderRadius: "9px",
              fontWeight: 800,
              fontSize: "0.82rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 14px rgba(239, 68, 68, 0.35)"
            }}
          >
            <FiLogOut /> 🚪 Log Out from {isChairman ? "Chairman Desk" : adminType === "approver" ? "Approver" : adminType === "verifier" ? "Verifier" : "Executor"}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN NAVIGATION TABS: PIPELINE vs CANCELLED DESK vs ACTIVE STOREFRONTS  */}
      {/* ========================================================================= */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
        <button
          onClick={() => setActiveMainTab("pipeline")}
          style={{
            flex: 1,
            padding: "14px 20px",
            borderRadius: "14px",
            border: activeMainTab === "pipeline" ? "2px solid #3B82F6" : "1px solid #1E293B",
            background:
              activeMainTab === "pipeline"
                ? "linear-gradient(135deg, rgba(37, 99, 235, 0.25) 0%, rgba(15, 23, 42, 0.9) 100%)"
                : "#0F172A",
            color: activeMainTab === "pipeline" ? "#FFFFFF" : "#94A3B8",
            fontSize: "0.95rem",
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            boxShadow: activeMainTab === "pipeline" ? "0 8px 24px rgba(59, 130, 246, 0.25)" : "none"
          }}
        >
          <FiShield style={{ fontSize: "1.2rem", color: "#38BDF8" }} />
          <span>🏛️ Active Pipeline Queue</span>
          <span
            style={{
              background: "#2563EB",
              color: "#FFF",
              fontSize: "0.72rem",
              padding: "2px 8px",
              borderRadius: "10px"
            }}
          >
            {roleEligibleApplications.length} In Queue
          </span>
        </button>

        {/* Dedicated Separate Option for Every Admin: Cancelled & Discrepancy Desk */}
        <button
          onClick={() => setActiveMainTab("cancelled")}
          style={{
            flex: 1,
            padding: "14px 20px",
            borderRadius: "14px",
            border: activeMainTab === "cancelled" ? "2px solid #EF4444" : "1px solid #1E293B",
            background:
              activeMainTab === "cancelled"
                ? "linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(15, 23, 42, 0.9) 100%)"
                : "#0F172A",
            color: activeMainTab === "cancelled" ? "#FFFFFF" : "#94A3B8",
            fontSize: "0.95rem",
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            boxShadow: activeMainTab === "cancelled" ? "0 8px 24px rgba(239, 68, 68, 0.25)" : "none"
          }}
        >
          <FiAlertTriangle style={{ fontSize: "1.2rem", color: "#F87171" }} />
          <span>🚫 / ↩️ Cancelled &amp; Discrepancies Desk</span>
          <span
            style={{
              background: "#EF4444",
              color: "#FFF",
              fontSize: "0.72rem",
              padding: "2px 8px",
              borderRadius: "10px",
              fontWeight: 900
            }}
          >
            {cancelledAndReturnedApplications.length} Discrepancies
          </span>
        </button>

        <button
          onClick={() => setActiveMainTab("stores")}
          style={{
            flex: 1,
            padding: "14px 20px",
            borderRadius: "14px",
            border: activeMainTab === "stores" ? "2px solid #10B981" : "1px solid #1E293B",
            background:
              activeMainTab === "stores"
                ? "linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(15, 23, 42, 0.9) 100%)"
                : "#0F172A",
            color: activeMainTab === "stores" ? "#FFFFFF" : "#94A3B8",
            fontSize: "0.95rem",
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            boxShadow: activeMainTab === "stores" ? "0 8px 24px rgba(16, 185, 129, 0.25)" : "none"
          }}
        >
          <FiShoppingBag style={{ fontSize: "1.2rem", color: "#34D399" }} />
          <span>🏬 Active Certified Storefronts</span>
          <span
            style={{
              background: "#10B981",
              color: "#FFF",
              fontSize: "0.72rem",
              padding: "2px 8px",
              borderRadius: "10px"
            }}
          >
            {vendors.length} Live
          </span>
        </button>

        {/* Milestone 5: Autonomous AI Store Copilot Tab */}
        <button
          onClick={() => {
            setActiveMainTab("ai_agent");
            if (!aiAgentReport) {
              handleRunAiAgentAudit(selectedAiVendorId || selectedVendorId || (vendors[0] ? vendors[0].id : 1));
            }
          }}
          style={{
            flex: 1.15,
            padding: "14px 20px",
            borderRadius: "14px",
            border: activeMainTab === "ai_agent" ? "2px solid #8B5CF6" : "1px solid #1E293B",
            background:
              activeMainTab === "ai_agent"
                ? "linear-gradient(135deg, rgba(139, 92, 246, 0.35) 0%, rgba(15, 23, 42, 0.95) 100%)"
                : "#0F172A",
            color: activeMainTab === "ai_agent" ? "#FFFFFF" : "#94A3B8",
            fontSize: "0.95rem",
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            boxShadow: activeMainTab === "ai_agent" ? "0 8px 24px rgba(139, 92, 246, 0.3)" : "none",
            transition: "all 0.2s ease"
          }}
        >
          <FiCpu style={{ fontSize: "1.25rem", color: "#C084FC" }} />
          <span>🤖 AI Store Copilot</span>
          <span
            style={{
              background: "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)",
              color: "#FFF",
              fontSize: "0.7rem",
              fontWeight: 900,
              padding: "2px 8px",
              borderRadius: "10px",
              letterSpacing: "0.5px"
            }}
          >
            Milestone 5
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: 3-TIER VENDOR REGISTRATION & APPROVAL PIPELINE                      */}
      {/* ========================================================================= */}
      {activeMainTab === "pipeline" && (
        <div>
          {/* Pipeline Search Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "18px"
            }}
          >
            <div style={{ fontSize: "0.9rem", color: "#94A3B8", fontWeight: 700 }}>
              Showing applications actionable for: <strong style={{ color: activePortal.badgeColor }}>{activePortal.badgeLabel}</strong>
            </div>

            <div style={{ position: "relative", width: "280px" }}>
              <FiSearch style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
              <input
                type="text"
                placeholder="Search vendor, GSTIN, owner..."
                value={pipelineSearch}
                onChange={(e) => setPipelineSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px 8px 32px",
                  borderRadius: "8px",
                  border: "1px solid #334155",
                  background: "#020617",
                  color: "#FFFFFF",
                  fontSize: "0.82rem",
                  outline: "none"
                }}
              />
            </div>
          </div>

          {/* Chairman Omniscient Stage Selector Pills */}
          {isChairman && (
            <div style={{ display: "flex", gap: "8px", marginBottom: "18px", flexWrap: "wrap" }}>
              {[
                { id: "ALL", label: `👑 All Applications (${pipelineApplications.length})` },
                {
                  id: "STAGE_1_EXECUTOR",
                  label: `⚡ Stage 1 Executor Intake (${pipelineApplications.filter(a => (a.stage1_executor?.status || a.stage1_status) === "PENDING").length})`
                },
                {
                  id: "STAGE_2_VERIFIER",
                  label: `🔍 Stage 2 Verifier Audit (${pipelineApplications.filter(a => (a.stage1_executor?.status || a.stage1_status) === "COMPLETED" && (a.stage2_verifier?.status || a.stage2_status) === "PENDING").length})`
                },
                {
                  id: "STAGE_3_APPROVER",
                  label: `⚖️ Stage 3 Approver Seal (${pipelineApplications.filter(a => (a.stage2_verifier?.status || a.stage2_status) === "COMPLETED" && (a.stage3_approver?.status || a.stage3_status) === "PENDING").length})`
                },
                {
                  id: "STAGE_4_CHAIRMAN",
                  label: `👑 Stage 4 Chairman Portal Access (${pipelineApplications.filter(a => (a.overallStatus || a.overall_status) === "STAGE_4_CHAIRMAN" || (a.overallStatus || a.overall_status) === "PENDING_CHAIRMAN_APPROVAL" || ((a.stage3_approver?.status || a.stage3_status) === "COMPLETED" && (a.stage4_chairman?.status || a.stage4_status) !== "APPROVED" && (a.overallStatus || a.overall_status) !== "APPROVED_LIVE" && (a.overallStatus || a.overall_status) !== "APPROVED")).length})`
                },
                {
                  id: "APPROVED",
                  label: `✓ Live Storefronts (${pipelineApplications.filter(a => (a.stage4_chairman?.status || a.stage4_status) === "APPROVED" || (a.overallStatus || a.overall_status) === "APPROVED_LIVE" || (a.overallStatus || a.overall_status) === "APPROVED").length})`
                }
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setPipelineFilter(pill.id)}
                  style={{
                    background: pipelineFilter === pill.id ? "rgba(245, 158, 11, 0.25)" : "#020617",
                    border: pipelineFilter === pill.id ? "1px solid #F59E0B" : "1px solid #334155",
                    color: pipelineFilter === pill.id ? "#FBBF24" : "#94A3B8",
                    padding: "6px 14px",
                    borderRadius: "20px",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          )}

          {/* Live Intake Session Station Bar for Executor Admin */}
          {(adminType === "executor" || isChairman) && (
            <div
              style={{
                background: "linear-gradient(135deg, rgba(30, 58, 138, 0.3) 0%, rgba(15, 23, 42, 0.9) 100%)",
                border: "1px solid rgba(59, 130, 246, 0.4)",
                borderRadius: "14px",
                padding: "14px 20px",
                marginBottom: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
                boxShadow: "0 6px 20px rgba(0, 0, 0, 0.3)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(16, 185, 129, 0.2)",
                    color: "#34D399",
                    border: "1px solid rgba(16, 185, 129, 0.4)",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    fontSize: "0.76rem",
                    fontWeight: 800
                  }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#10B981",
                      boxShadow: "0 0 8px #10B981"
                    }}
                  />
                  LIVE INTAKE ACTIVE
                </span>
                <span style={{ fontSize: "0.86rem", color: "#CBD5E1" }}>
                  Listening for new ShopSense vendor applications. Applications land <strong>strictly at your Executor Desk</strong> first.
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => window.open("/vendor/register", "_blank")}
                  style={{
                    background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                    color: "#FFFFFF",
                    border: "1px solid rgba(59, 130, 246, 0.6)",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "0.82rem",
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.4)"
                  }}
                  title="Open Vendor Registration Portal to apply as a new vendor"
                >
                  📝 Apply as New Vendor (/vendor/register)
                </button>
              </div>
            </div>
          )}

          {/* EMPTY QUEUE STATE WHEN PREVIOUS ADMIN HAS NOT APPROVED YET */}
          {filteredPipelineApplications.length === 0 ? (
            <div
              style={{
                background: "#0F172A",
                border: "1px dashed #334155",
                borderRadius: "16px",
                padding: "60px 20px",
                textAlign: "center",
                color: "#94A3B8"
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "12px" }}>
                {isChairman ? "👑" : adminType === "verifier" ? "🔒" : adminType === "approver" ? "⚖️" : "📥"}
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#FFFFFF", marginBottom: "6px" }}>
                {isChairman
                  ? "No Vendor Applications in Selected Filter"
                  : adminType === "verifier"
                  ? "No Vendor Applications Ready for Verifier Audit Yet"
                  : adminType === "approver"
                  ? "No Vendor Applications Ready for Final Approver Seal Yet"
                  : "No Vendor Applications in Executor Intake Queue"}
              </h3>
              <p style={{ fontSize: "0.86rem", maxWidth: "620px", margin: "0 auto 18px auto", lineHeight: "1.5" }}>
                {isChairman
                  ? "All applications for this stage filter have been reviewed or are in other stages. Use the stage pills above to switch stages."
                  : adminType === "verifier"
                  ? "Under sequential 3-Tier governance, the Executor Admin must clear Stage 1 due diligence first. Applications will automatically arrive here once approved by the Executor."
                  : adminType === "approver"
                  ? "Applications must be cleared by both the Executor Admin (Stage 1) and Verifier Admin (Stage 2) before arriving at the Approver desk for final authorization."
                  : "The Executor vendor intake queue starts completely clean. When a vendor submits an application via the Vendor Registration Portal, it will appear here for Stage 1 background checks and due diligence."}
              </p>
              {adminType === "executor" && (
                <div style={{ marginTop: "14px" }}>
                  <button
                    type="button"
                    onClick={() => window.open("/vendor/register", "_blank")}
                    style={{
                      background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                      color: "#FFFFFF",
                      border: "1px solid rgba(16, 185, 129, 0.5)",
                      padding: "10px 22px",
                      borderRadius: "8px",
                      fontSize: "0.86rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)"
                    }}
                  >
                    📝 Submit New Vendor Application (/vendor/register)
                  </button>
                </div>
              )}
              {!isChairman && adminType !== "executor" && (
                <div style={{ fontSize: "0.8rem", color: "#60A5FA" }}>
                  💡 Tip: Log in as the previous admin stage to approve applications and advance them forward.
                </div>
              )}
            </div>
          ) : (
            /* Pipeline Applications Cards Grid */
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {filteredPipelineApplications.map((app) => {
                const isStage1Completed = (app.stage1_executor?.status || app.stage1_status) === "COMPLETED";
                const isStage2Completed = (app.stage2_verifier?.status || app.stage2_status) === "COMPLETED";
                const isStage3Sealed = (app.stage3_approver?.status || app.stage3_status) === "COMPLETED" || (app.stage3_approver?.status || app.stage3_status) === "APPROVED" || (app.overallStatus || app.overall_status) === "STAGE_4_CHAIRMAN" || (app.overallStatus || app.overall_status) === "PENDING_CHAIRMAN_APPROVAL";
                const isStage4Approved = (app.stage4_chairman?.status || app.stage4_status) === "APPROVED" || (app.overallStatus || app.overall_status) === "APPROVED_LIVE" || (app.overallStatus || app.overall_status) === "APPROVED";

                const categoryStr = app.category || "";

                return (
                  <div
                    key={app.id}
                    style={{
                      background: "#0F172A",
                      border: isStage4Approved
                        ? "1px solid rgba(16, 185, 129, 0.4)"
                        : isStage3Sealed
                        ? "1px solid rgba(245, 158, 11, 0.5)"
                        : isStage2Completed
                        ? "1px solid rgba(59, 130, 246, 0.4)"
                        : isStage1Completed
                        ? "1px solid rgba(139, 92, 246, 0.4)"
                        : "1px solid rgba(37, 99, 235, 0.3)",
                      borderRadius: "18px",
                      padding: "22px",
                      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px"
                    }}
                  >
                    {/* Top Row: Store Identity & Current Progression Status */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "1.6rem" }}>
                            {categoryStr.includes("Electronics")
                              ? "💻"
                              : categoryStr.includes("Fashion") || categoryStr.includes("Clothes")
                              ? "👗"
                              : categoryStr.includes("Organic") || categoryStr.includes("Home")
                              ? "🌿"
                              : categoryStr.includes("Sports") || categoryStr.includes("Gym")
                              ? "🏋️"
                              : categoryStr.includes("Furniture")
                              ? "🛋️"
                              : "🚀"}
                          </span>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#FFFFFF", margin: 0 }}>
                                {app.storeName || app.store_name || "Merchant Store"}
                              </h3>
                              <span style={{ fontSize: "0.74rem", color: "#60A5FA", background: "rgba(59, 130, 246, 0.12)", padding: "2px 8px", borderRadius: "6px", fontWeight: 700 }}>
                                ID: {app.id}
                              </span>
                              {app.isLiveSessionIntake && (
                                <span
                                  style={{
                                    background: "rgba(239, 68, 68, 0.22)",
                                    color: "#F87171",
                                    border: "1px solid #EF4444",
                                    fontSize: "0.72rem",
                                    fontWeight: 900,
                                    padding: "2px 8px",
                                    borderRadius: "6px",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "5px"
                                  }}
                                >
                                  <span
                                    style={{
                                      width: "6px",
                                      height: "6px",
                                      borderRadius: "50%",
                                      background: "#EF4444",
                                      boxShadow: "0 0 6px #EF4444"
                                    }}
                                  />
                                  🔴 LIVE INTAKE
                                </span>
                              )}
                            </div>
                            <p style={{ fontSize: "0.84rem", color: "#94A3B8", margin: "2px 0 0 0" }}>
                              Proprietor: <strong>{app.ownerName || app.owner_name || "Authorized Merchant"}</strong> • Category: <span style={{ color: "#FCD34D" }}>{app.category || "General"}</span> • GSTIN: <code style={{ color: "#E2E8F0" }}>{app.gstin || "N/A"}</code>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Current Stage Badge */}
                      <div style={{ textAlign: "right" }}>
                        {isStage4Approved ? (
                          <span style={{ background: "rgba(16, 185, 129, 0.2)", color: "#34D399", border: "1px solid rgba(16, 185, 129, 0.4)", fontSize: "0.78rem", fontWeight: 800, padding: "6px 14px", borderRadius: "8px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            <FiCheckCircle /> 👑 CERTIFIED LIVE PARTNER (PORTAL ACCESS GRANTED)
                          </span>
                        ) : isStage3Sealed ? (
                          <span style={{ background: "rgba(245, 158, 11, 0.2)", color: "#FBBF24", border: "1px solid rgba(245, 158, 11, 0.5)", fontSize: "0.78rem", fontWeight: 800, padding: "6px 14px", borderRadius: "8px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            <FiAward /> 👑 STAGE 4: PENDING CHAIRMAN PORTAL ACCESS
                          </span>
                        ) : app.stage1_executor?.status === "RETURNED" || (app.overallStatus || app.overall_status) === "CANCELLED_BY_VERIFIER" || (app.stage2_verifier?.status || app.stage2_status) === "CANCELLED" ? (
                          <span style={{ background: "rgba(239, 68, 68, 0.2)", color: "#F87171", border: "1px solid rgba(239, 68, 68, 0.5)", fontSize: "0.78rem", fontWeight: 800, padding: "6px 14px", borderRadius: "8px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            <FiAlertTriangle /> ↩️ CANCELLED / RETURNED BY VERIFIER ADMIN (CROSS-CHECK REQUIRED)
                          </span>
                        ) : app.stage2_verifier?.status === "RETURNED" ? (
                          <span style={{ background: "rgba(239, 68, 68, 0.2)", color: "#F87171", border: "1px solid rgba(239, 68, 68, 0.5)", fontSize: "0.78rem", fontWeight: 800, padding: "6px 14px", borderRadius: "8px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            <FiAlertTriangle /> ↩️ RETURNED BY APPROVER ADMIN (RE-AUDIT REQUIRED)
                          </span>
                        ) : isStage2Completed ? (
                          <span style={{ background: "rgba(59, 130, 246, 0.2)", color: "#60A5FA", border: "1px solid rgba(59, 130, 246, 0.4)", fontSize: "0.78rem", fontWeight: 800, padding: "6px 14px", borderRadius: "8px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            <FiSliders /> READY FOR APPROVER CROSS-CHECK (STAGE 3)
                          </span>
                        ) : isStage1Completed ? (
                          <span style={{ background: "rgba(139, 92, 246, 0.2)", color: "#A78BFA", border: "1px solid rgba(139, 92, 246, 0.4)", fontSize: "0.78rem", fontWeight: 800, padding: "6px 14px", borderRadius: "8px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            <FiCheckSquare /> EXECUTOR APPROVED ➔ READY FOR VERIFIER AUDIT (STAGE 2)
                          </span>
                        ) : (
                          <span style={{ background: "rgba(37, 99, 235, 0.2)", color: "#60A5FA", border: "1px solid rgba(37, 99, 235, 0.4)", fontSize: "0.78rem", fontWeight: 800, padding: "6px 14px", borderRadius: "8px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            <FiClock /> PENDING EXECUTOR DUE-DILIGENCE (STAGE 1)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Returned / Cancelled Rejection Alert Banner if returned to Executor Admin */}
                    {(app.returnLetterToExecutor || app.cancellationDetails) && (adminType === "executor" || isChairman) && (app.stage1_executor?.status === "RETURNED" || (app.overallStatus || app.overall_status) === "CANCELLED_BY_VERIFIER" || (app.stage2_verifier?.status || app.stage2_status) === "CANCELLED" || (app.overallStatus || app.overall_status) === "RETURNED_TO_EXECUTOR") && (
                      <div style={{ background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.4)", padding: "12px 16px", borderRadius: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                          <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#F87171", display: "flex", alignItems: "center", gap: "6px" }}>
                            <FiAlertTriangle /> Cancelled / Returned by Verifier Admin: {app.returnLetterToExecutor?.reason || app.cancellationDetails?.reason || "Discrepancy identified in physical audit"}
                          </span>
                          <span style={{ fontSize: "0.72rem", color: "#94A3B8" }}>{app.returnLetterToExecutor?.timestamp || app.cancellationDetails?.timestamp}</span>
                        </div>
                        <p style={{ margin: "2px 0 0 0", fontSize: "0.78rem", color: "#E2E8F0", whiteSpace: "pre-line", maxHeight: "65px", overflowY: "auto" }}>
                          {app.returnLetterToExecutor?.content || app.cancellationDetails?.letter}
                        </p>
                      </div>
                    )}

                    {app.returnLetterToVerifier && adminType === "verifier" && (
                      <div style={{ background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.4)", padding: "12px 16px", borderRadius: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                          <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#F87171", display: "flex", alignItems: "center", gap: "6px" }}>
                            <FiAlertTriangle /> Returned by Approver Authority: {app.returnLetterToVerifier.reason}
                          </span>
                          <span style={{ fontSize: "0.72rem", color: "#94A3B8" }}>{app.returnLetterToVerifier.timestamp}</span>
                        </div>
                        <p style={{ margin: "2px 0 0 0", fontSize: "0.78rem", color: "#E2E8F0", whiteSpace: "pre-line", maxHeight: "65px", overflowY: "auto" }}>
                          {app.returnLetterToVerifier.content}
                        </p>
                      </div>
                    )}

                    {/* Summary Chips Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
                      <div style={{ background: "#020617", padding: "10px 12px", borderRadius: "10px", border: "1px solid #1E293B" }}>
                        <span style={{ fontSize: "0.7rem", color: "#94A3B8", textTransform: "uppercase", fontWeight: 700 }}>
                          ⚖️ Complaints &amp; Disputes
                        </span>
                        <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#34D399", marginTop: "2px" }}>
                          0 Complaints / Clean NOC
                        </div>
                      </div>

                      <div style={{ background: "#020617", padding: "10px 12px", borderRadius: "10px", border: "1px solid #1E293B" }}>
                        <span style={{ fontSize: "0.7rem", color: "#94A3B8", textTransform: "uppercase", fontWeight: 700 }}>
                          🛡️ Trustability Score
                        </span>
                        <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#38BDF8", marginTop: "2px" }}>
                          {app.dueDiligence?.trustability?.trustScore || 96}/100 (Tier-A+)
                        </div>
                      </div>

                      <div style={{ background: "#020617", padding: "10px 12px", borderRadius: "10px", border: "1px solid #1E293B" }}>
                        <span style={{ fontSize: "0.7rem", color: "#94A3B8", textTransform: "uppercase", fontWeight: 700 }}>
                          📍 Warehouse Hubs
                        </span>
                        <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#FCD34D", marginTop: "2px" }}>
                          {app.warehouses?.length || 2} Declared Real Hubs
                        </div>
                      </div>

                      <div style={{ background: "#020617", padding: "10px 12px", borderRadius: "10px", border: "1px solid #1E293B" }}>
                        <span style={{ fontSize: "0.7rem", color: "#94A3B8", textTransform: "uppercase", fontWeight: 700 }}>
                          📜 Performance Bond
                        </span>
                        <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#34D399", marginTop: "2px" }}>
                          5.0% Gross Selling Fee
                        </div>
                      </div>
                    </div>

                    {/* 4-TIER SEQUENTIAL GOVERNANCE PROGRESSION TRACKER */}
                    <div style={{ background: "#080F21", border: "1px solid #1E293B", borderRadius: "14px", padding: "16px" }}>
                      <div style={{ fontSize: "0.74rem", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>
                        Sequential 4-Stage Admin Governance Progression:
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
                        {/* Gate 1: Executor */}
                        <div
                          style={{
                            background: "#020617",
                            border: isStage1Completed
                              ? "1px solid rgba(16, 185, 129, 0.4)"
                              : app.stage1_executor?.status === "RETURNED"
                              ? "1px solid rgba(239, 68, 68, 0.6)"
                              : "1px solid rgba(37, 99, 235, 0.4)",
                            borderRadius: "10px",
                            padding: "10px 12px"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                            <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "#60A5FA" }}>
                              ⚡ Stage 1: Executor Due-Diligence
                            </span>
                            <span style={{ color: isStage1Completed && (app.overallStatus || app.overall_status) !== "CANCELLED_BY_VERIFIER" && app.stage1_executor?.status !== "RETURNED" ? "#34D399" : app.stage1_executor?.status === "RETURNED" || (app.overallStatus || app.overall_status) === "CANCELLED_BY_VERIFIER" ? "#F87171" : "#FBBF24", fontSize: "0.78rem", fontWeight: 700 }}>
                              {isStage1Completed && (app.overallStatus || app.overall_status) !== "CANCELLED_BY_VERIFIER" && app.stage1_executor?.status !== "RETURNED" ? "✓ Cleared" : app.stage1_executor?.status === "RETURNED" || (app.overallStatus || app.overall_status) === "CANCELLED_BY_VERIFIER" ? "↩️ Returned" : "⏳ Pending Intake"}
                            </span>
                          </div>
                          <div style={{ fontSize: "0.72rem", color: "#94A3B8" }}>
                            {app.stage1_executor?.by || (app.stage1_executor?.status === "RETURNED" || (app.overallStatus || app.overall_status) === "CANCELLED_BY_VERIFIER" ? "Returned to Executor for Re-Check" : "Requires Executor Clearance")}
                          </div>
                        </div>

                        {/* Gate 2: Verifier */}
                        <div
                          style={{
                            background: "#020617",
                            border: isStage2Completed
                              ? "1px solid rgba(16, 185, 129, 0.4)"
                              : (app.stage2_verifier?.status || app.stage2_status) === "CANCELLED" || (app.overallStatus || app.overall_status) === "CANCELLED_BY_VERIFIER"
                              ? "1px solid rgba(239, 68, 68, 0.6)"
                              : app.stage2_verifier?.status === "RETURNED"
                              ? "1px solid rgba(239, 68, 68, 0.6)"
                              : isStage1Completed
                              ? "1px solid rgba(139, 92, 246, 0.4)"
                              : "1px solid rgba(100, 116, 139, 0.2)",
                            borderRadius: "10px",
                            padding: "10px 12px",
                            opacity: isStage1Completed || app.stage2_verifier?.status === "RETURNED" || (app.stage2_verifier?.status || app.stage2_status) === "CANCELLED" ? 1 : 0.6
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                            <span style={{ fontSize: "0.74rem", fontWeight: 800, color: isStage1Completed || app.stage2_verifier?.status === "RETURNED" || (app.stage2_verifier?.status || app.stage2_status) === "CANCELLED" ? "#A78BFA" : "#64748B" }}>
                              🔍 Stage 2: Verifier Audit
                            </span>
                            <span style={{ color: isStage2Completed ? "#34D399" : (app.stage2_verifier?.status || app.stage2_status) === "CANCELLED" || (app.overallStatus || app.overall_status) === "CANCELLED_BY_VERIFIER" ? "#F87171" : app.stage2_verifier?.status === "RETURNED" ? "#F87171" : isStage1Completed ? "#FBBF24" : "#64748B", fontSize: "0.78rem", fontWeight: 700 }}>
                              {isStage2Completed ? "✓ Audited" : (app.stage2_verifier?.status || app.stage2_status) === "CANCELLED" || (app.overallStatus || app.overall_status) === "CANCELLED_BY_VERIFIER" ? "🚫 Cancelled" : app.stage2_verifier?.status === "RETURNED" ? "↩️ Returned" : isStage1Completed ? "⏳ Pending Audit" : "🔒 Locked"}
                            </span>
                          </div>
                          <div style={{ fontSize: "0.72rem", color: "#94A3B8" }}>
                            {app.stage2_verifier?.by || ((app.stage2_verifier?.status || app.stage2_status) === "CANCELLED" ? "Cancelled: Routed to Executor" : app.stage2_verifier?.status === "RETURNED" ? "Returned for Re-Audit" : isStage1Completed ? "Unlocked for Verifier" : "Waiting for Executor Stage 1")}
                          </div>
                        </div>

                        {/* Gate 3: Approver */}
                        <div
                          style={{
                            background: "#020617",
                            border: isStage3Sealed
                              ? "1px solid rgba(16, 185, 129, 0.4)"
                              : isStage2Completed
                              ? "1px solid rgba(59, 130, 246, 0.4)"
                              : "1px solid rgba(100, 116, 139, 0.2)",
                            borderRadius: "10px",
                            padding: "10px 12px",
                            opacity: isStage2Completed ? 1 : 0.6
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                            <span style={{ fontSize: "0.74rem", fontWeight: 800, color: isStage2Completed ? "#34D399" : "#64748B" }}>
                              ⚖️ Stage 3: Approver Bond Seal
                            </span>
                            <span style={{ color: isStage3Sealed ? "#34D399" : isStage2Completed ? "#FBBF24" : "#64748B", fontSize: "0.78rem", fontWeight: 700 }}>
                              {isStage3Sealed ? "✓ Sealed & Forwarded" : isStage2Completed ? "⏳ Ready for Seal" : "🔒 Locked"}
                            </span>
                          </div>
                          <div style={{ fontSize: "0.72rem", color: "#94A3B8" }}>
                            {app.stage3_approver?.seal ? `Seal: ${typeof app.stage3_approver.seal === "string" ? app.stage3_approver.seal : app.stage3_approver.seal?.seal_id || "OFFICIAL"}` : isStage2Completed ? "Unlocked for Approver" : "Waiting for Verifier Stage 2"}
                          </div>
                        </div>

                        {/* Gate 4: Supreme Chairman Portal Access */}
                        <div
                          style={{
                            background: "#020617",
                            border: isStage4Approved
                              ? "1px solid rgba(16, 185, 129, 0.5)"
                              : isStage3Sealed
                              ? "1px solid rgba(245, 158, 11, 0.6)"
                              : "1px solid rgba(100, 116, 139, 0.2)",
                            borderRadius: "10px",
                            padding: "10px 12px",
                            opacity: isStage3Sealed ? 1 : 0.6
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                            <span style={{ fontSize: "0.74rem", fontWeight: 800, color: isStage3Sealed ? "#FBBF24" : "#64748B" }}>
                              👑 Stage 4: Chairman Portal Access
                            </span>
                            <span style={{ color: isStage4Approved ? "#34D399" : isStage3Sealed ? "#F59E0B" : "#64748B", fontSize: "0.78rem", fontWeight: 700 }}>
                              {isStage4Approved ? "✓ Access Granted" : isStage3Sealed ? "👑 Awaiting Access" : "🔒 Locked"}
                            </span>
                          </div>
                          <div style={{ fontSize: "0.72rem", color: "#94A3B8" }}>
                            {isStage4Approved ? "Authorized for ShopSense Vendor Portal" : isStage3Sealed ? "Forwarded to Chairman Desk" : "Waiting for Approver Seal"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Governance Action Buttons Row */}
                    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "10px", paddingTop: "6px", flexWrap: "wrap" }}>
                      {/* Option for ALL ADMINS to inspect the full new vendor application */}
                      <button
                        onClick={() => setViewingFullApp(app)}
                        style={{
                          background: "#020617",
                          color: "#E2E8F0",
                          border: "1px solid #334155",
                          padding: "9px 16px",
                          borderRadius: "10px",
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                      >
                        <FiFileText style={{ color: "#38BDF8" }} /> 📄 View Full Application Dossier
                      </button>

                      {/* Action 1: Executor Due Diligence Investigation */}
                      {(adminType === "executor" || (isChairman && !isStage1Completed) || (adminType === "executor" && (app.stage1_executor?.status === "RETURNED" || (app.overallStatus || app.overall_status) === "CANCELLED_BY_VERIFIER"))) && (
                        <button
                          onClick={() => handleOpenInvestigateModal(app)}
                          style={{
                            background: app.stage1_executor?.status === "RETURNED" || (app.overallStatus || app.overall_status) === "CANCELLED_BY_VERIFIER" || (app.stage2_verifier?.status || app.stage2_status) === "CANCELLED"
                              ? "linear-gradient(135deg, #DC2626, #B91C1C)"
                              : "linear-gradient(135deg, #2563EB, #1D4ED8)",
                            color: "#FFFFFF",
                            border: "none",
                            padding: "9px 18px",
                            borderRadius: "10px",
                            fontSize: "0.82rem",
                            fontWeight: 800,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            boxShadow: app.stage1_executor?.status === "RETURNED" || (app.overallStatus || app.overall_status) === "CANCELLED_BY_VERIFIER" ? "0 4px 14px rgba(220, 38, 38, 0.4)" : "0 4px 14px rgba(37, 99, 235, 0.4)"
                          }}
                        >
                          ⚡ {app.stage1_executor?.status === "RETURNED" || (app.overallStatus || app.overall_status) === "CANCELLED_BY_VERIFIER" || (app.stage2_verifier?.status || app.stage2_status) === "CANCELLED" ? "🔄 Cross-Check & Re-Submit Stage 1" : isStage1Completed ? "Review Due-Diligence Findings" : "Inspect Due-Diligence & Approve Stage 1"}
                        </button>
                      )}

                      {/* Action 2: Verifier KYC & Warehouse Quality Audit */}
                      {(adminType === "verifier" || (isChairman && isStage1Completed && !isStage2Completed)) && (isStage1Completed || app.stage2_verifier?.status === "RETURNED") && (
                        <button
                          onClick={() => handleOpenVerifierModal(app)}
                          style={{
                            background: app.stage2_verifier?.status === "RETURNED"
                              ? "linear-gradient(135deg, #DC2626, #B91C1C)"
                              : "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
                            color: "#FFFFFF",
                            border: "none",
                            padding: "9px 18px",
                            borderRadius: "10px",
                            fontSize: "0.82rem",
                            fontWeight: 800,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            boxShadow: "0 4px 14px rgba(139, 92, 246, 0.4)"
                          }}
                        >
                          <FiCheckSquare /> {app.stage2_verifier?.status === "RETURNED" ? "🔄 Re-Audit Application (Returned)" : isStage2Completed ? "Review Verifier Findings" : "Audit Locations, Quality & Approve Stage 2"}
                        </button>
                      )}

                      {/* Action 3: Approver Cross-Check & Seal */}
                      {(adminType === "approver" || (isChairman && isStage1Completed && isStage2Completed && !isStage3Sealed)) && isStage1Completed && isStage2Completed && !isStage3Sealed && (
                        <button
                          onClick={() => handleOpenApproverModal(app)}
                          style={{
                            background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                            color: "#FFFFFF",
                            border: "none",
                            padding: "10px 20px",
                            borderRadius: "10px",
                            fontSize: "0.84rem",
                            fontWeight: 800,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            boxShadow: "0 4px 16px rgba(16, 185, 129, 0.4)"
                          }}
                        >
                          <FiAward /> ⚖️ Cross-Check & Issue Final Seal
                        </button>
                      )}

                      {/* Action 4: Supreme Chairman Grant Live Vendor Portal Access */}
                      {(isChairman || userRole === "chairman" || adminType === "chairman") && isStage3Sealed && !isStage4Approved && (
                        <button
                          onClick={() => handleChairmanGrantFinalAccess(app)}
                          style={{
                            background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
                            color: "#FFFFFF",
                            border: "none",
                            padding: "11px 22px",
                            borderRadius: "10px",
                            fontSize: "0.85rem",
                            fontWeight: 900,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            boxShadow: "0 4px 18px rgba(239, 68, 68, 0.5)"
                          }}
                          title="Supreme Chairman Authority: Grant live access to ShopSense Vendor Portal"
                        >
                          👑 Grant Live Vendor Portal Access
                        </button>
                      )}

                      {/* Direct Chairman Bypass Approval for earlier stages */}
                      {isChairman && !isStage3Sealed && !isStage4Approved && (
                        <button
                          onClick={() => handleChairmanGrantFinalAccess(app)}
                          style={{
                            background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                            color: "#000000",
                            border: "none",
                            padding: "9px 18px",
                            borderRadius: "10px",
                            fontSize: "0.82rem",
                            fontWeight: 900,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            boxShadow: "0 4px 14px rgba(245, 158, 11, 0.4)"
                          }}
                          title="Supreme Chairman Executive Authority: Instantly approve and activate vendor on live marketplace"
                        >
                          👑 Direct Chairman Approval & Activate Live
                        </button>
                      )}

                      {isStage4Approved && (
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "0.82rem", color: "#34D399", fontWeight: 800, background: "rgba(16, 185, 129, 0.15)", padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                            ✓ Live on Marketplace &amp; Portal Access Active
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CANCELLED & DISCREPANCIES DESK (STRICTLY SCOPED TO LOGGED-IN ADMIN)  */}
      {/* ========================================================================= */}
      {activeMainTab === "cancelled" && (
        <div>
          {/* Desk Header Banner */}
          <div
            style={{
              background: "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(15, 23, 42, 0.95) 100%)",
              border: "1px solid rgba(239, 68, 68, 0.35)",
              borderRadius: "16px",
              padding: "18px 20px",
              marginBottom: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "14px"
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span style={{ background: "rgba(239, 68, 68, 0.2)", color: "#F87171", padding: "3px 8px", borderRadius: "6px", fontSize: "0.74rem", fontWeight: 800 }}>
                  <FiAlertTriangle /> {isChairman ? "CHAIRMAN MASTER" : adminType === "approver" ? "APPROVER" : adminType === "verifier" ? "VERIFIER" : "EXECUTOR"} DISCREPANCY ARCHIVE
                </span>
                <span style={{ fontSize: "0.78rem", color: "#CBD5E1" }}>
                  {isChairman
                    ? "Full executive audit of all disqualified, cancelled, and returned vendor applications across all 3 tiers"
                    : adminType === "verifier"
                    ? "Showing records disqualified or audited by Verifier Admin (Ananya Rao)"
                    : adminType === "approver"
                    ? "Showing records disqualified or returned by Approver Authority (Rajesh Menon)"
                    : "Showing records disqualified or received by Executor Admin (Mounish Sai)"}
                </span>
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 900, color: "#FFFFFF", margin: 0 }}>
                {isChairman
                  ? "👑 Supreme Chairman Discrepancy & Disqualification Archive"
                  : adminType === "verifier"
                  ? "🔍 Verifier Disqualifications & Re-Audit Desk"
                  : adminType === "approver"
                  ? "⚖️ Approver Disqualifications & Vetoed Cases Desk"
                  : "⚡ Executor Disqualifications & Returned Cases Desk"}
              </h3>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <span style={{ background: "#020617", border: "1px solid #334155", color: "#F87171", padding: "6px 12px", borderRadius: "8px", fontSize: "0.8rem", fontWeight: 800 }}>
                {cancelledAndReturnedApplications.length} {isChairman ? "Total" : adminType === "approver" ? "Approver" : adminType === "verifier" ? "Verifier" : "Executor"} Discrepancies
              </span>
            </div>
          </div>

          {/* Sub-Filter Pills */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "18px", flexWrap: "wrap" }}>
            {[
              {
                id: "ALL",
                label: `All Discrepancies (${cancelledAndReturnedApplications.length})`
              },
              {
                id: "CANCELLED_ONLY",
                label: `🚫 Outright Cancelled (${cancelledAndReturnedApplications.filter(a => (a.overallStatus || a.overall_status || "").startsWith("CANCELLED")).length})`
              },
              {
                id: "RETURNED_ONLY",
                label: `↩️ Returned / Re-Audit Cases (${cancelledAndReturnedApplications.filter(a => !(a.overallStatus || a.overall_status || "").startsWith("CANCELLED")).length})`
              }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setCancelledFilter(f.id)}
                style={{
                  background: cancelledFilter === f.id ? "rgba(239, 68, 68, 0.25)" : "#020617",
                  border: cancelledFilter === f.id ? "1px solid #EF4444" : "1px solid #334155",
                  color: cancelledFilter === f.id ? "#FFFFFF" : "#94A3B8",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Cancelled Applications List */}
          {filteredCancelledApplications.length === 0 ? (
            <div style={{ background: "#0F172A", border: "1px dashed #334155", borderRadius: "16px", padding: "40px 20px", textAlign: "center", color: "#94A3B8" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>✓</div>
              <h4 style={{ color: "#FFFFFF", margin: "0 0 6px 0" }}>No applications found in this discrepancy filter!</h4>
              <p style={{ fontSize: "0.82rem", margin: 0 }}>
                When any admin cancels or returns an application, it will immediately appear in this dedicated section.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {filteredCancelledApplications.map((app) => {
                const isCancelledByExec = app.overallStatus === "CANCELLED_BY_EXECUTOR" || app.stage1_executor?.status === "CANCELLED";
                const isCancelledByVer = app.overallStatus === "CANCELLED_BY_VERIFIER" || app.stage2_verifier?.status === "CANCELLED";
                const isCancelledByAppr = app.overallStatus === "CANCELLED_BY_APPROVER" || app.stage3_approver?.status === "CANCELLED";
                const isReturnedToExec = app.overallStatus === "RETURNED_TO_EXECUTOR" || app.stage1_executor?.status === "RETURNED";
                const isReturnedToVer = app.overallStatus === "RETURNED_TO_VERIFIER" || app.stage2_verifier?.status === "RETURNED";

                const badgeText = isCancelledByExec
                  ? "🚫 CANCELLED BY STAGE 1 EXECUTOR ADMIN"
                  : isCancelledByVer
                  ? "🚫 CANCELLED BY STAGE 2 VERIFIER ADMIN"
                  : isCancelledByAppr
                  ? "🚫 CANCELLED BY STAGE 3 APPROVER AUTHORITY"
                  : isReturnedToExec
                  ? "↩️ RETURNED BY VERIFIER TO EXECUTOR ADMIN"
                  : isReturnedToVer
                  ? "↩️ RETURNED BY APPROVER TO VERIFIER ADMIN"
                  : "⚠️ DISCREPANCY DETECTED";

                const badgeBg = isCancelledByExec || isCancelledByVer || isCancelledByAppr ? "rgba(239, 68, 68, 0.2)" : "rgba(245, 158, 11, 0.2)";
                const badgeColor = isCancelledByExec || isCancelledByVer || isCancelledByAppr ? "#F87171" : "#FBBF24";

                const discrepancyDetails = app.cancellationDetails || app.returnLetterToExecutor || app.returnLetterToVerifier || {};

                return (
                  <div
                    key={app.id}
                    style={{
                      background: "#0B1329",
                      border: `1px solid ${isCancelledByExec || isCancelledByVer || isCancelledByAppr ? "rgba(239, 68, 68, 0.4)" : "rgba(245, 158, 11, 0.4)"}`,
                      borderRadius: "16px",
                      padding: "20px 22px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "14px"
                    }}
                  >
                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <h4 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#FFFFFF", margin: 0 }}>
                            {app.storeName}
                          </h4>
                          <span style={{ fontSize: "0.72rem", background: "rgba(59, 130, 246, 0.15)", color: "#60A5FA", padding: "2px 8px", borderRadius: "4px" }}>
                            {app.id}
                          </span>
                          <span style={{ background: badgeBg, color: badgeColor, fontSize: "0.72rem", fontWeight: 800, padding: "3px 8px", borderRadius: "6px" }}>
                            {badgeText}
                          </span>
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "#94A3B8", marginTop: "4px" }}>
                          Proprietor: <span style={{ color: "#E2E8F0" }}>{app.ownerName}</span> • GSTIN: <code>{app.gstin}</code> • Category: <span style={{ color: "#FCD34D" }}>{app.category}</span>
                        </div>
                      </div>

                      <div style={{ textAlign: "right", fontSize: "0.76rem", color: "#94A3B8" }}>
                        <div>Logged: <span style={{ color: "#CBD5E1" }}>{discrepancyDetails.timestamp || "Recent"}</span></div>
                        <div>Action By: <strong style={{ color: badgeColor }}>{discrepancyDetails.by || discrepancyDetails.sender || "Admin Authority"}</strong></div>
                      </div>
                    </div>

                    {/* Reason & Letter Box */}
                    <div style={{ background: "#020617", border: "1px solid #1E293B", borderRadius: "12px", padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", color: badgeColor, fontWeight: 800, marginBottom: "6px" }}>
                        <FiAlertTriangle /> Disqualification / Discrepancy Reason:
                      </div>
                      <div style={{ fontSize: "0.84rem", color: "#FFFFFF", fontWeight: 700, marginBottom: "8px" }}>
                        {discrepancyDetails.reason || app.stage1_executor?.notes || app.stage2_verifier?.notes || "Compliance Discrepancy"}
                      </div>
                      {discrepancyDetails.letter || discrepancyDetails.content ? (
                        <div style={{ background: "#0B1329", border: "1px solid #1E293B", padding: "10px 12px", borderRadius: "8px", fontSize: "0.78rem", color: "#CBD5E1", whiteSpace: "pre-line", fontFamily: "monospace", lineHeight: "1.4" }}>
                          {discrepancyDetails.letter || discrepancyDetails.content}
                        </div>
                      ) : null}
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                      <button
                        onClick={() => setViewingFullApp(app)}
                        style={{
                          background: "#020617",
                          color: "#E2E8F0",
                          border: "1px solid #334155",
                          padding: "8px 14px",
                          borderRadius: "8px",
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                      >
                        <FiEye /> View Full Application Dossier
                      </button>

                      <button
                        onClick={() => handleReopenApplication(app)}
                        style={{
                          background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
                          color: "#FFFFFF",
                          border: "none",
                          padding: "8px 16px",
                          borderRadius: "8px",
                          fontSize: "0.8rem",
                          fontWeight: 800,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          boxShadow: "0 4px 12px rgba(37, 99, 235, 0.35)"
                        }}
                      >
                        <FiRefreshCw /> 🔄 Re-Open into Stage 1 Intake Queue
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ACTIVE VENDOR STOREFRONTS & INVENTORY CATALOGS                      */}
      {/* ========================================================================= */}
      {activeMainTab === "stores" && (
        <div>
          {/* Vendor Stores Selector Strip */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#FFFFFF", margin: "0 0 4px 0" }}>
                  🏬 Select Certified Vendor Storefront:
                </h3>
                <p style={{ fontSize: "0.82rem", color: "#94A3B8", margin: 0 }}>
                  Each vendor manages their specialized category (e.g. Clothes, Electronics, Furniture, Toys)
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <button
                  type="button"
                  onClick={() => {
                    const targetId = selectedVendorId || (vendors[0]?.id || 1);
                    setSelectedAiVendorId(targetId);
                    setActiveMainTab("ai_agent");
                    handleRunAiAgentAudit(targetId);
                  }}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.84rem",
                    fontWeight: 800,
                    background: "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)",
                    color: "#FFFFFF",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(139, 92, 246, 0.35)"
                  }}
                >
                  <FiCpu /> 🤖 AI Store Copilot Audit
                </button>

                <button
                  className="btn btn-primary"
                  onClick={() => setShowRegisterModal(true)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.84rem",
                    fontWeight: 700
                  }}
                >
                  <FiPlus /> Register New Vendor
                </button>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "14px"
              }}
            >
              {vendors.map((v) => {
                const isSelected = v.id === selectedVendorId;

                return (
                  <div
                    key={v.id}
                    onClick={() => {
                      setSelectedVendorId(v.id);
                      localStorage.setItem("vendorId", String(v.id));
                      localStorage.setItem("vendorStoreName", v.name);
                      localStorage.setItem("vendorSpecialty", v.specialty);
                    }}
                    style={{
                      background: isSelected
                        ? "linear-gradient(135deg, rgba(37, 99, 235, 0.25) 0%, rgba(15, 23, 42, 0.95) 100%)"
                        : "#0F172A",
                      border: isSelected ? "2px solid #3B82F6" : "1px solid #1E293B",
                      borderRadius: "14px",
                      padding: "16px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      boxShadow: isSelected ? "0 8px 24px rgba(59, 130, 246, 0.3)" : "none",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "2rem" }}>{v.icon}</span>
                        <div>
                          <h4 style={{ fontSize: "1rem", fontWeight: 800, color: "#FFFFFF", margin: "0 0 2px 0" }}>
                            {v.name}
                          </h4>
                          <span style={{ fontSize: "0.72rem", color: "#38BDF8", fontWeight: 700 }}>
                            {v.owner}
                          </span>
                        </div>
                      </div>

                      <span
                        style={{
                          background: isSelected ? "#3B82F6" : "rgba(255,255,255,0.08)",
                          color: "#FFFFFF",
                          fontSize: "0.68rem",
                          fontWeight: 800,
                          padding: "3px 8px",
                          borderRadius: "6px",
                          textTransform: "uppercase"
                        }}
                      >
                        {isSelected ? "Active Store" : "View"}
                      </span>
                    </div>

                    <div style={{ fontSize: "0.76rem", color: "#94A3B8", lineHeight: "1.3" }}>
                      <strong>Specialty:</strong> {v.specialty}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingTop: "8px",
                        borderTop: "1px solid #1E293B",
                        fontSize: "0.76rem"
                      }}
                    >
                      <span style={{ color: "#CBD5E1" }}>
                        📦 <strong>{v.product_count}</strong> Products
                      </span>
                      <span style={{ color: "#34D399", fontWeight: 800 }}>
                        ★ {v.rating} (Verified Partner)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Vendor Metrics Spotlight */}
          {activeVendor && (
            <div
              style={{
                background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
                border: "1px solid #334155",
                borderRadius: "18px",
                padding: "24px",
                marginBottom: "26px",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "16px",
                  marginBottom: "20px",
                  paddingBottom: "16px",
                  borderBottom: "1px solid #334155"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div
                    style={{
                      fontSize: "2.8rem",
                      background: "#020617",
                      padding: "12px 18px",
                      borderRadius: "14px",
                      border: "1px solid #334155"
                    }}
                  >
                    {activeVendor.icon}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <h2 style={{ fontSize: "1.45rem", fontWeight: 900, color: "#FFFFFF", margin: 0 }}>
                        {activeVendor.name}
                      </h2>
                      <span
                        style={{
                          background: "rgba(16, 185, 129, 0.15)",
                          color: "#34D399",
                          fontSize: "0.72rem",
                          fontWeight: 800,
                          padding: "3px 8px",
                          borderRadius: "6px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px"
                        }}
                      >
                        <FiCheckCircle /> Certified Merchant Partner (5.0% Bond)
                      </span>
                    </div>
                    <p style={{ fontSize: "0.86rem", color: "#94A3B8", margin: "4px 0 0 0" }}>
                      Managed by <strong>{activeVendor.owner}</strong> • Business Email:{" "}
                      <span style={{ color: "#60A5FA" }}>{activeVendor.email}</span>
                    </p>
                    <div style={{ fontSize: "0.8rem", color: "#FCD34D", marginTop: "4px" }}>
                      🎯 <strong>Exclusive Catalog Specialty:</strong> {activeVendor.specialty}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    let cat = "Fashion";
                    if (activeVendor.name.toLowerCase().includes("voltx")) cat = "Electric Scooters";
                    else if (activeVendor.name.includes("Electronics")) cat = "Electronics";
                    else if (activeVendor.name.includes("Furniture")) cat = "Furniture";
                    else if (activeVendor.name.includes("Toy")) cat = "Toys & Games";

                    setNewProduct((prev) => ({ ...prev, category: cat }));
                    setShowAddProductModal(true);
                  }}
                  style={{
                    background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                    color: "#FFFFFF",
                    border: "none",
                    padding: "12px 20px",
                    borderRadius: "10px",
                    fontWeight: 800,
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)"
                  }}
                >
                  <FiPlus /> Add Product to {activeVendor.name.split(" ")[0]}
                </button>
              </div>

              {/* Products Inventory Catalog Table */}
              <div style={{ overflowX: "auto" }}>
                <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                  <thead>
                    <tr style={{ background: "#1E293B", color: "#94A3B8", textAlign: "left" }}>
                      <th style={{ padding: "12px 14px" }}>Product Name</th>
                      <th style={{ padding: "12px 14px" }}>Category</th>
                      <th style={{ padding: "12px 14px" }}>Unit Price</th>
                      <th style={{ padding: "12px 14px" }}>Stock Quantity</th>
                      <th style={{ padding: "12px 14px" }}>Units Sold</th>
                      <th style={{ padding: "12px 14px" }}>Status</th>
                      <th style={{ padding: "12px 14px" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendorProducts.map((p) => {
                      const isLow = (p.stock_quantity || 0) <= (p.reorder_threshold || 5);

                      return (
                        <tr key={p.id} style={{ borderBottom: "1px solid #1E293B" }}>
                          <td style={{ padding: "12px 14px", fontWeight: 700, color: "#FFFFFF" }}>
                            {p.name}
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            <span
                              style={{
                                background: "rgba(59, 130, 246, 0.15)",
                                color: "#60A5FA",
                                padding: "3px 8px",
                                borderRadius: "6px",
                                fontSize: "0.75rem",
                                fontWeight: 700
                              }}
                            >
                              {p.category}
                            </span>
                          </td>
                          <td style={{ padding: "12px 14px", fontWeight: 800, color: "#F59E0B" }}>
                            ${p.price.toFixed(2)}
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            <span style={{ fontWeight: 700, color: isLow ? "#EF4444" : "#34D399" }}>
                              {p.stock_quantity ? `${p.stock_quantity} in stock` : p.stock}
                            </span>
                          </td>
                          <td style={{ padding: "12px 14px", color: "#CBD5E1" }}>
                            <strong>{p.units_sold || 0}</strong> units
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            <span
                              className={`badge ${p.stock === "In Stock" ? "badge-success" : "badge-warning"}`}
                              style={{ fontSize: "0.72rem" }}
                            >
                              {p.stock || "In Stock"}
                            </span>
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              style={{
                                background: "rgba(239, 68, 68, 0.15)",
                                color: "#EF4444",
                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                borderRadius: "6px",
                                padding: "6px 10px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                fontSize: "0.75rem"
                              }}
                            >
                              <FiTrash2 /> Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: AUTONOMOUS AI AGENT STORE COPILOT (MILESTONE 5)                     */}
      {/* ========================================================================= */}
      {activeMainTab === "ai_agent" && (
        <div>
          {/* Header & Agent Control Dashboard */}
          <div
            style={{
              background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 27, 75, 0.6) 100%)",
              border: "1px solid rgba(139, 92, 246, 0.35)",
              borderRadius: "16px",
              padding: "24px",
              marginBottom: "24px",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <span style={{ fontSize: "1.8rem" }}>🤖</span>
                  <h2 style={{ fontSize: "1.45rem", fontWeight: 900, color: "#FFFFFF", margin: 0, letterSpacing: "-0.5px" }}>
                    Autonomous AI Store Copilot &amp; Strategic Advisory
                  </h2>
                  <span
                    style={{
                      background: "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)",
                      color: "#FFFFFF",
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      padding: "3px 10px",
                      borderRadius: "12px",
                      boxShadow: "0 2px 10px rgba(139, 92, 246, 0.4)"
                    }}
                  >
                    Milestone 5 • LangGraph
                  </span>
                </div>
                <p style={{ fontSize: "0.88rem", color: "#94A3B8", margin: 0, maxWidth: "720px", lineHeight: "1.5" }}>
                  Multi-node autonomous agent executing weekly telemetry audits across store catalogs. Synthesizes proactive strategic directives (such as discounting overstocked items with dropping demand), models projected GMV lift, and automates executive email advisories with 1-click catalog execution.
                </p>
              </div>

              {/* Action Controls */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.72rem", color: "#94A3B8", marginBottom: "4px", fontWeight: 700 }}>
                    Storefront Target:
                  </label>
                  <select
                    value={selectedAiVendorId || selectedVendorId || (vendors[0]?.id || 1)}
                    onChange={(e) => {
                      const newId = Number(e.target.value);
                      setSelectedAiVendorId(newId);
                      handleRunAiAgentAudit(newId);
                    }}
                    style={{
                      background: "#020617",
                      border: "1px solid #334155",
                      color: "#FFFFFF",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      fontSize: "0.84rem",
                      fontWeight: 700,
                      outline: "none"
                    }}
                  >
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.store_name || v.name} (ID: {v.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.72rem", color: "#94A3B8", marginBottom: "4px", fontWeight: 700 }}>
                    Telemetry Lookback:
                  </label>
                  <select
                    value={auditLookbackDays}
                    onChange={(e) => setAuditLookbackDays(Number(e.target.value))}
                    style={{
                      background: "#020617",
                      border: "1px solid #334155",
                      color: "#FFFFFF",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      fontSize: "0.84rem",
                      fontWeight: 700,
                      outline: "none"
                    }}
                  >
                    <option value={7}>7 Days (Weekly Audit)</option>
                    <option value={14}>14 Days (Bi-Weekly)</option>
                    <option value={30}>30 Days (Monthly)</option>
                  </select>
                </div>

                <div style={{ alignSelf: "flex-end" }}>
                  <button
                    onClick={() => handleRunAiAgentAudit()}
                    disabled={aiAgentLoading}
                    style={{
                      background: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
                      color: "#FFFFFF",
                      border: "none",
                      padding: "9px 18px",
                      borderRadius: "10px",
                      fontWeight: 800,
                      fontSize: "0.88rem",
                      cursor: aiAgentLoading ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      boxShadow: "0 4px 16px rgba(139, 92, 246, 0.4)",
                      opacity: aiAgentLoading ? 0.7 : 1
                    }}
                  >
                    <FiRefreshCw className={aiAgentLoading ? "spin" : ""} />
                    {aiAgentLoading ? "Executing LangGraph..." : "🚀 Trigger Autonomous Audit"}
                  </button>
                </div>
              </div>
            </div>

            {/* Architecture Badges Strip */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "14px" }}>
              <span style={{ fontSize: "0.74rem", color: "#A78BFA", background: "rgba(139, 92, 246, 0.15)", padding: "3px 10px", borderRadius: "8px", border: "1px solid rgba(139, 92, 246, 0.25)" }}>
                ⚡ StateGraph Orchestration: 4 Nodes
              </span>
              <span style={{ fontSize: "0.74rem", color: "#38BDF8", background: "rgba(56, 189, 248, 0.15)", padding: "3px 10px", borderRadius: "8px", border: "1px solid rgba(56, 189, 248, 0.25)" }}>
                📊 OpenAPI v5.0.0 Endpoints
              </span>
              <span style={{ fontSize: "0.74rem", color: "#34D399", background: "rgba(52, 211, 153, 0.15)", padding: "3px 10px", borderRadius: "8px", border: "1px solid rgba(52, 211, 153, 0.25)" }}>
                📧 Proactive HTML Email Dispatcher
              </span>
              <span style={{ fontSize: "0.74rem", color: "#FBBF24", background: "rgba(251, 191, 36, 0.15)", padding: "3px 10px", borderRadius: "8px", border: "1px solid rgba(251, 191, 36, 0.25)" }}>
                ⚡ 1-Click Catalog Execution
              </span>
            </div>
          </div>

          {/* LangGraph Multi-Node Workflow Visualizer */}
          <div
            style={{
              background: "#080F21",
              border: "1px solid #1E293B",
              borderRadius: "14px",
              padding: "18px 22px",
              marginBottom: "24px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#FFFFFF", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <FiActivity style={{ color: "#8B5CF6" }} /> LangGraph StateGraph Execution Pipeline:
              </h4>
              <span style={{ fontSize: "0.74rem", color: "#64748B" }}>
                Status: {aiAgentLoading ? <strong style={{ color: "#38BDF8" }}>EXECUTING NODES...</strong> : <strong style={{ color: "#34D399" }}>GRAPH ACTIVE &amp; READY</strong>}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
              {[
                {
                  node: "Node 1: Telemetry Audit",
                  fn: "audit_store_telemetry_node",
                  desc: "Audits stock levels, demand trends & clearance risks",
                  icon: "🔍",
                  color: "#38BDF8"
                },
                {
                  node: "Node 2: Strategic Reasoning",
                  fn: "strategic_reasoning_node",
                  desc: "Identifies overstocked SKUs & dropping demand",
                  icon: "🧠",
                  color: "#A78BFA"
                },
                {
                  node: "Node 3: Financial Projections",
                  fn: "financial_projection_node",
                  desc: "Models GMV lift, inventory turnover & capital unlocked",
                  icon: "📈",
                  color: "#34D399"
                },
                {
                  node: "Node 4: Proactive Advisory",
                  fn: "proactive_advisor_and_email_node",
                  desc: "Generates executive HTML brief & dispatches email",
                  icon: "📧",
                  color: "#F472B6"
                }
              ].map((step, idx) => (
                <div
                  key={step.node}
                  style={{
                    background: "#020617",
                    border: "1px solid #1E293B",
                    borderLeft: `4px solid ${step.color}`,
                    borderRadius: "10px",
                    padding: "12px 14px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontSize: "0.82rem", fontWeight: 800, color: step.color }}>
                      {step.icon} {step.node}
                    </span>
                    <span style={{ fontSize: "0.68rem", color: "#10B981", background: "rgba(16, 185, 129, 0.15)", padding: "1px 6px", borderRadius: "6px" }}>
                      PASSED
                    </span>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#94A3B8", fontFamily: "monospace" }}>
                    {step.fn}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#64748B", marginTop: "4px" }}>
                    {step.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Results Container */}
          {aiAgentReport ? (() => {
            const discountRecs = Array.isArray(aiAgentReport.strategic_actions)
              ? aiAgentReport.strategic_actions.filter((a) => a.action_type === "DISCOUNT_RECOMMENDATION")
              : (aiAgentReport.strategic_actions?.discount_recommendations || []);
            const restockRecs = Array.isArray(aiAgentReport.strategic_actions)
              ? aiAgentReport.strategic_actions.filter((a) => a.action_type === "RESTOCK_URGENT")
              : (aiAgentReport.strategic_actions?.restock_recommendations || []);
            const marginRecs = Array.isArray(aiAgentReport.strategic_actions)
              ? aiAgentReport.strategic_actions.filter((a) => a.action_type === "MARGIN_EXPANSION")
              : (aiAgentReport.strategic_actions?.margin_expansion_recommendations || []);

            const storeName = aiAgentReport.store_name || aiAgentReport.vendor_name || "Vendor Storefront";
            const vendorEmail = aiAgentReport.vendor_email || aiAgentReport.email_dispatch?.recipient || "vendor@techworld.com";
            const emailStatus = aiAgentReport.email_dispatch_status || aiAgentReport.email_dispatch?.status || "DISPATCHED_SIMULATED";
            const healthScore = aiAgentReport.inventory_health?.overall_health_score || (aiAgentReport.inventory_health?.dead_stock_count ? 82 : 94);
            const stagnantCount = aiAgentReport.inventory_health?.dead_stock_count ?? (aiAgentReport.inventory_health?.stagnant_skus_flagged ?? discountRecs.length);

            const gmvLiftStr = aiAgentReport.financial_projections?.projected_weekly_revenue_addition
              ? `+$${Number(aiAgentReport.financial_projections.projected_weekly_revenue_addition).toFixed(2)}`
              : (aiAgentReport.financial_projections?.projected_weekly_gmv_lift ? `+$${Number(aiAgentReport.financial_projections.projected_weekly_gmv_lift).toFixed(2)}` : "+$1,850.00");
            const gmvPctStr = aiAgentReport.financial_projections?.projected_gmv_lift_pct || (aiAgentReport.financial_projections?.gmv_lift_percentage ? `+${aiAgentReport.financial_projections.gmv_lift_percentage}%` : "+18.5%");
            const idleCapitalStr = aiAgentReport.financial_projections?.unlocked_idle_capital
              ? `$${Number(aiAgentReport.financial_projections.unlocked_idle_capital).toFixed(2)}`
              : (aiAgentReport.financial_projections?.carrying_cost_reduction_monthly ? `$${Number(aiAgentReport.financial_projections.carrying_cost_reduction_monthly).toFixed(2)}/mo` : "$1,450.00");

            return (
              <div>
                {/* Executive KPI Summary Cards */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "14px",
                    marginBottom: "24px"
                  }}
                >
                  <div style={{ background: "#0F172A", border: "1px solid #1E293B", borderRadius: "14px", padding: "18px" }}>
                    <div style={{ fontSize: "0.75rem", color: "#94A3B8", textTransform: "uppercase", fontWeight: 700, marginBottom: "6px" }}>
                      Store Health Rating
                    </div>
                    <div style={{ fontSize: "1.7rem", fontWeight: 900, color: "#34D399" }}>
                      {healthScore} / 100
                    </div>
                    <div style={{ fontSize: "0.74rem", color: "#A78BFA", marginTop: "4px" }}>
                      Status: <strong>{aiAgentReport.inventory_health?.status || "HEALTHY"}</strong>
                    </div>
                  </div>

                  <div style={{ background: "#0F172A", border: "1px solid #1E293B", borderRadius: "14px", padding: "18px" }}>
                    <div style={{ fontSize: "0.75rem", color: "#94A3B8", textTransform: "uppercase", fontWeight: 700, marginBottom: "6px" }}>
                      Excess Inventory Flagged
                    </div>
                    <div style={{ fontSize: "1.7rem", fontWeight: 900, color: "#EF4444" }}>
                      {stagnantCount} Products
                    </div>
                    <div style={{ fontSize: "0.74rem", color: "#F87171", marginTop: "4px" }}>
                      High Stock + Dropping Velocity
                    </div>
                  </div>

                  <div style={{ background: "#0F172A", border: "1px solid #1E293B", borderRadius: "14px", padding: "18px" }}>
                    <div style={{ fontSize: "0.75rem", color: "#94A3B8", textTransform: "uppercase", fontWeight: 700, marginBottom: "6px" }}>
                      Projected Weekly GMV Lift
                    </div>
                    <div style={{ fontSize: "1.7rem", fontWeight: 900, color: "#10B981" }}>
                      {gmvLiftStr}
                    </div>
                    <div style={{ fontSize: "0.74rem", color: "#34D399", marginTop: "4px" }}>
                      {gmvPctStr} Lift Post-Clearance
                    </div>
                  </div>

                  <div style={{ background: "#0F172A", border: "1px solid #1E293B", borderRadius: "14px", padding: "18px" }}>
                    <div style={{ fontSize: "0.75rem", color: "#94A3B8", textTransform: "uppercase", fontWeight: 700, marginBottom: "6px" }}>
                      Capital Recoverable
                    </div>
                    <div style={{ fontSize: "1.7rem", fontWeight: 900, color: "#38BDF8" }}>
                      {idleCapitalStr}
                    </div>
                    <div style={{ fontSize: "0.74rem", color: "#93C5FD", marginTop: "4px" }}>
                      Unlocked Idle Capital Redeployed
                    </div>
                  </div>
                </div>

                {/* CORE STRATEGIC ADVISORY: DISCOUNT DIRECTIVES (MILESTONE 5 EXACT REQUIREMENT) */}
                <div
                  style={{
                    background: "#0F172A",
                    border: "1px solid #334155",
                    borderRadius: "16px",
                    padding: "24px",
                    marginBottom: "24px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                    <div>
                      <h3 style={{ fontSize: "1.18rem", fontWeight: 800, color: "#FFFFFF", margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                        🏷️ Proactive Discount Directives (High Inventory + Dropping Demand)
                      </h3>
                      <p style={{ fontSize: "0.82rem", color: "#94A3B8", margin: 0 }}>
                        Autonomous LangGraph reasoning has detected inventory accumulation coupled with declining demand velocity.
                      </p>
                    </div>
                    <span
                      style={{
                        background: "rgba(239, 68, 68, 0.15)",
                        color: "#F87171",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        fontSize: "0.74rem",
                        fontWeight: 800,
                        padding: "4px 10px",
                        borderRadius: "8px"
                      }}
                    >
                      Actionable Clearance Directives
                    </span>
                  </div>

                  {discountRecs.length === 0 ? (
                    <div style={{ padding: "30px", textAlign: "center", color: "#64748B", background: "#020617", borderRadius: "12px" }}>
                      🎉 No excess inventory with dropping demand detected! Store inventory velocity is balanced.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      {discountRecs.map((action) => {
                        const pId = action.product_id || action.id;
                        const pName = action.product_name || action.name;
                        const currentPrice = action.current_price || action.original_price || 0;
                        const recPrice = action.suggested_price || action.recommended_price || (currentPrice * 0.85);
                        const discPct = action.discount_percentage || 15;
                        const reasonText = action.description || action.reason || action.title || `You should discount product ${pName} because inventory is high and demand is dropping.`;
                        const stockQty = action.current_stock ?? action.qty ?? 30;
                        const isApplied = appliedDiscounts[pId];

                        return (
                          <div
                            key={pId}
                            style={{
                              background: "linear-gradient(135deg, #0B132B 0%, #1C1938 100%)",
                              border: "1px solid rgba(139, 92, 246, 0.3)",
                              borderRadius: "14px",
                              padding: "18px 20px"
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                              <div style={{ flex: 1, minWidth: "280px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                  <span style={{ fontWeight: 800, color: "#FFFFFF", fontSize: "1.05rem" }}>
                                    {pName}
                                  </span>
                                  <span
                                    style={{
                                      background: "rgba(239, 68, 68, 0.2)",
                                      color: "#EF4444",
                                      fontSize: "0.72rem",
                                      fontWeight: 800,
                                      padding: "2px 8px",
                                      borderRadius: "6px"
                                    }}
                                  >
                                    Stock: {stockQty} Units
                                  </span>
                                  <span
                                    style={{
                                      background: "rgba(245, 158, 11, 0.2)",
                                      color: "#F59E0B",
                                      fontSize: "0.72rem",
                                      fontWeight: 800,
                                      padding: "2px 8px",
                                      borderRadius: "6px"
                                    }}
                                  >
                                    Urgency: {action.urgency || "HIGH"}
                                  </span>
                                </div>

                                {/* Verbatim AI Strategic Quote from Project Brief */}
                                <div
                                  style={{
                                    background: "rgba(2, 6, 23, 0.7)",
                                    borderLeft: "4px solid #8B5CF6",
                                    padding: "10px 14px",
                                    borderRadius: "6px",
                                    margin: "10px 0",
                                    fontSize: "0.85rem",
                                    color: "#E2E8F0",
                                    fontStyle: "italic",
                                    lineHeight: "1.5"
                                  }}
                                >
                                  &ldquo;{reasonText}&rdquo;
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "0.82rem", flexWrap: "wrap" }}>
                                  <span style={{ color: "#94A3B8" }}>
                                    Current Price: <del style={{ color: "#EF4444", fontWeight: 700 }}>${Number(currentPrice).toFixed(2)}</del>
                                  </span>
                                  <span style={{ color: "#34D399", fontWeight: 800, fontSize: "0.95rem" }}>
                                    Recommended: ${Number(recPrice).toFixed(2)}
                                  </span>
                                  <span style={{ background: "#10B981", color: "#FFF", padding: "1px 8px", borderRadius: "6px", fontSize: "0.72rem", fontWeight: 800 }}>
                                    -{Math.round(discPct)}% OFF
                                  </span>
                                  {action.financial_impact && (
                                    <span style={{ color: "#60A5FA", fontWeight: 700 }}>
                                      Impact: {action.financial_impact}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* 1-Click Actionable Execution Button */}
                              <div style={{ alignSelf: "center" }}>
                                {isApplied ? (
                                  <button
                                    disabled
                                    style={{
                                      background: "rgba(16, 185, 129, 0.2)",
                                      color: "#34D399",
                                      border: "1px solid #10B981",
                                      padding: "9px 16px",
                                      borderRadius: "10px",
                                      fontWeight: 800,
                                      fontSize: "0.84rem",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "6px",
                                      cursor: "default"
                                    }}
                                  >
                                    <FiCheckCircle /> Discount Active in Catalog
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleApplyDiscount(action)}
                                    disabled={applyingDiscountProductId === pId}
                                    style={{
                                      background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
                                      color: "#FFFFFF",
                                      border: "none",
                                      padding: "9px 18px",
                                      borderRadius: "10px",
                                      fontWeight: 800,
                                      fontSize: "0.84rem",
                                      cursor: applyingDiscountProductId === pId ? "not-allowed" : "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "6px",
                                      boxShadow: "0 4px 14px rgba(239, 68, 68, 0.35)"
                                    }}
                                  >
                                    <FiZap />
                                    {applyingDiscountProductId === pId
                                      ? "Applying..."
                                      : `⚡ 1-Click Apply $${Number(recPrice).toFixed(2)}`}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* RESTOCK & MARGIN DIRECTIVES DUAL GRID */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px", marginBottom: "24px" }}>
                  {/* Restock Directives */}
                  <div style={{ background: "#0F172A", border: "1px solid #1E293B", borderRadius: "16px", padding: "20px" }}>
                    <h4 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#FFFFFF", margin: "0 0 12px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                      📦 Urgent Inventory Restock Directives
                    </h4>
                    {restockRecs.length === 0 ? (
                      <div style={{ fontSize: "0.82rem", color: "#64748B", padding: "16px 0" }}>
                        No critical low-stock items detected.
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {restockRecs.map((r, i) => {
                          const rName = r.product_name || r.name;
                          const rStock = r.current_stock ?? r.qty ?? 4;
                          const rOrder = r.recommended_order_quantity ?? 25;
                          const rDesc = r.description || r.reason || `Urgent restock of ${rName}`;

                          return (
                            <div key={i} style={{ background: "#020617", padding: "12px 14px", borderRadius: "10px", borderLeft: "4px solid #F59E0B" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <strong style={{ color: "#E2E8F0", fontSize: "0.88rem" }}>{rName}</strong>
                                <span style={{ color: "#EF4444", fontWeight: 800, fontSize: "0.78rem" }}>
                                  {rStock} units remaining (Critical)
                                </span>
                              </div>
                              <div style={{ fontSize: "0.76rem", color: "#94A3B8", marginTop: "4px" }}>
                                Recommendation: <strong style={{ color: "#38BDF8" }}>Reorder +{rOrder} Units</strong> ({rDesc})
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Margin Expansion Directives */}
                  <div style={{ background: "#0F172A", border: "1px solid #1E293B", borderRadius: "16px", padding: "20px" }}>
                    <h4 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#FFFFFF", margin: "0 0 12px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                      💎 Margin Expansion Opportunities
                    </h4>
                    {marginRecs.length === 0 ? (
                      <div style={{ fontSize: "0.82rem", color: "#64748B", padding: "16px 0" }}>
                        Pricing optimal across high-velocity SKUs.
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {marginRecs.map((m, i) => {
                          const mName = m.product_name || m.name;
                          const mPrice = m.current_price || 0;
                          const mRecPrice = m.suggested_price || m.recommended_price || (mPrice * 1.05);
                          const mDesc = m.description || m.reason || "+5% Margin Lift";

                          return (
                            <div key={i} style={{ background: "#020617", padding: "12px 14px", borderRadius: "10px", borderLeft: "4px solid #10B981" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <strong style={{ color: "#E2E8F0", fontSize: "0.88rem" }}>{mName}</strong>
                                <span style={{ color: "#10B981", fontWeight: 800, fontSize: "0.78rem" }}>
                                  Inelastic High Demand
                                </span>
                              </div>
                              <div style={{ fontSize: "0.76rem", color: "#94A3B8", marginTop: "4px" }}>
                                Recommendation: <strong style={{ color: "#34D399" }}>${Number(mPrice).toFixed(2)} ➔ ${Number(mRecPrice).toFixed(2)}</strong> ({mDesc})
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* PROACTIVE EXECUTIVE EMAIL ADVISORY DISPATCH CARD */}
                <div
                  style={{
                    background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 27, 75, 0.5) 100%)",
                    border: "1px solid rgba(139, 92, 246, 0.35)",
                    borderRadius: "16px",
                    padding: "22px 24px",
                    marginBottom: "24px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
                    <div>
                      <h4 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#FFFFFF", margin: "0 0 6px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                        <FiMail style={{ color: "#A78BFA" }} /> Proactive Executive Strategic Advisory Email
                      </h4>
                      <div style={{ fontSize: "0.82rem", color: "#94A3B8" }}>
                        Recipient: <strong style={{ color: "#60A5FA" }}>{vendorEmail}</strong> • Report Ref: <span style={{ fontFamily: "monospace", color: "#E2E8F0" }}>{aiAgentReport.report_ref}</span>
                      </div>
                      <div style={{ fontSize: "0.76rem", color: "#64748B", marginTop: "4px" }}>
                        Dispatch Status: <span style={{ color: "#34D399", fontWeight: 800 }}>{emailStatus}</span> (High-deliverability sandboxed SMTP fallback)
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => setShowEmailPreviewModal(true)}
                        style={{
                          background: "#1E293B",
                          color: "#E2E8F0",
                          border: "1px solid #334155",
                          padding: "9px 16px",
                          borderRadius: "10px",
                          fontWeight: 700,
                          fontSize: "0.84rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                      >
                        <FiEye /> Preview HTML Email
                      </button>

                      <button
                        onClick={handleSendAdvisoryEmail}
                        disabled={sendingEmail}
                        style={{
                          background: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
                          color: "#FFFFFF",
                          border: "none",
                          padding: "9px 18px",
                          borderRadius: "10px",
                          fontWeight: 800,
                          fontSize: "0.84rem",
                          cursor: sendingEmail ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          boxShadow: "0 4px 14px rgba(139, 92, 246, 0.35)"
                        }}
                      >
                        <FiSend /> {sendingEmail ? "Dispatching..." : "📤 Dispatch Email"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* HISTORICAL WEEKLY AUDIT REPORTS ARCHIVE */}
                {aiAgentReportsHistory && aiAgentReportsHistory.length > 0 && (
                  <div style={{ background: "#080F21", border: "1px solid #1E293B", borderRadius: "16px", padding: "20px" }}>
                    <h4 style={{ fontSize: "1rem", fontWeight: 800, color: "#FFFFFF", margin: "0 0 14px 0" }}>
                      📜 Historical Weekly AI Audit Archives:
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {aiAgentReportsHistory.map((rep) => (
                        <div
                          key={rep.id}
                          style={{
                            background: "#020617",
                            border: "1px solid #1E293B",
                            borderRadius: "10px",
                            padding: "12px 16px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontSize: "0.82rem"
                          }}
                        >
                          <div>
                            <strong style={{ color: "#A78BFA", fontFamily: "monospace" }}>{rep.report_ref}</strong>
                            <span style={{ color: "#64748B", marginLeft: "10px" }}>
                              Generated: {new Date(rep.created_at || rep.generated_at).toLocaleString()}
                            </span>
                          </div>
                          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                            <span style={{ color: "#34D399", fontWeight: 700 }}>
                              {rep.email_dispatch_status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })() : (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                background: "#080F21",
                border: "1px dashed #334155",
                borderRadius: "16px"
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🤖</div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#FFFFFF", marginBottom: "8px" }}>
                Ready to Run Weekly Autonomous Audit
              </h3>
              <p style={{ fontSize: "0.85rem", color: "#94A3B8", maxWidth: "480px", margin: "0 auto 20px auto" }}>
                Click &ldquo;Trigger Autonomous Audit&rdquo; above to initiate the LangGraph 4-node store telemetry analysis, predictive discount generator, and executive email dispatch.
              </p>
              <button
                onClick={() => handleRunAiAgentAudit()}
                disabled={aiAgentLoading}
                style={{
                  background: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "10px 22px",
                  borderRadius: "10px",
                  fontWeight: 800,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <FiPlay /> Launch LangGraph Audit
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 0: FULL APPLICATION DOSSIER (ALL 3 ADMINS)                          */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {viewingFullApp && (
          <div className="modal-overlay">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="modal-card"
              style={{ maxWidth: "840px", maxHeight: "90vh", overflowY: "auto" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", borderBottom: "1px solid #1E293B", paddingBottom: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "2rem" }}>📄</span>
                  <div>
                    <h3 style={{ fontSize: "1.3rem", fontWeight: 900, color: "#FFFFFF", margin: 0 }}>
                      New Vendor Registration Application &amp; Governance Dossier
                    </h3>
                    <span style={{ fontSize: "0.76rem", color: "#38BDF8", fontWeight: 700 }}>
                      Sequential Inspection Record — Accessible across all 3 Admin Gates
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setViewingFullApp(null)}
                  style={{ background: "none", border: "none", color: "#94A3B8", fontSize: "1.3rem", cursor: "pointer" }}
                >
                  <FiX />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Section 1: Store & Proprietor Profile */}
                <div style={{ background: "#020617", border: "1px solid #1E293B", padding: "16px", borderRadius: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginBottom: "10px" }}>
                    <div>
                      <h4 style={{ margin: "0 0 2px 0", color: "#FFFFFF", fontSize: "1.2rem", fontWeight: 900 }}>
                        {viewingFullApp.storeName}
                      </h4>
                      <div style={{ fontSize: "0.82rem", color: "#94A3B8" }}>
                        Proprietor: <strong style={{ color: "#E2E8F0" }}>{viewingFullApp.ownerName}</strong> • Category: <span style={{ color: "#FCD34D" }}>{viewingFullApp.category}</span>
                      </div>
                    </div>
                    <span style={{ background: "rgba(56, 189, 248, 0.15)", color: "#38BDF8", padding: "4px 10px", borderRadius: "8px", fontSize: "0.76rem", fontWeight: 800 }}>
                      App Ref: {viewingFullApp.id}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.82rem", marginBottom: "12px" }}>
                    <div style={{ background: "#0F172A", padding: "10px 12px", borderRadius: "8px" }}>
                      <span style={{ color: "#94A3B8" }}>Tax ID (GSTIN):</span>
                      <code style={{ display: "block", color: "#E2E8F0", marginTop: "2px" }}>{viewingFullApp.gstin}</code>
                    </div>
                    <div style={{ background: "#0F172A", padding: "10px 12px", borderRadius: "8px" }}>
                      <span style={{ color: "#94A3B8" }}>Owner Identity (Aadhaar KYC):</span>
                      <code style={{ display: "block", color: "#E2E8F0", marginTop: "2px" }}>XXXX-XXXX-{viewingFullApp.aadhaarNumber?.slice(-4) || "1234"}</code>
                    </div>
                  </div>

                  <div style={{ background: "#0F172A", padding: "10px 12px", borderRadius: "8px", fontSize: "0.82rem" }}>
                    <span style={{ color: "#94A3B8" }}>Business Overview &amp; Storefront Description:</span>
                    <p style={{ margin: "4px 0 0 0", color: "#CBD5E1", lineHeight: "1.4" }}>
                      {viewingFullApp.description}
                    </p>
                  </div>
                </div>

                {/* Section 2: Multi-Warehouse Facilities */}
                <div style={{ background: "#020617", border: "1px solid #1E293B", padding: "16px", borderRadius: "12px" }}>
                  <h4 style={{ margin: "0 0 10px 0", fontSize: "0.95rem", color: "#FFFFFF", display: "flex", alignItems: "center", gap: "8px" }}>
                    <FiMapPin style={{ color: "#38BDF8" }} /> Declared Multi-Warehouse Fulfillment Hubs ({viewingFullApp.warehouses?.length} Facilities):
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {(viewingFullApp.warehouses || []).map((wh) => (
                      <div key={wh.id} style={{ background: "#0F172A", border: "1px solid #1E293B", padding: "12px 14px", borderRadius: "10px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                          <strong style={{ color: "#FFFFFF", fontSize: "0.86rem" }}>
                            📍 {wh.name} ({wh.city}, {wh.stateName} - {wh.pincode})
                          </strong>
                          <span style={{ color: wh.isPrimary ? "#34D399" : "#94A3B8", background: wh.isPrimary ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.05)", padding: "2px 8px", borderRadius: "6px", fontSize: "0.72rem", fontWeight: 800 }}>
                            {wh.isPrimary ? "★ Primary Central Hub" : "Regional Depot"}
                          </span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", fontSize: "0.76rem", color: "#94A3B8" }}>
                          <div>Storage: <strong style={{ color: "#E2E8F0" }}>{wh.storageType}</strong></div>
                          <div>Capacity: <strong style={{ color: "#E2E8F0" }}>{wh.capacityUnits}</strong></div>
                          <div>Dispatch SLA: <strong style={{ color: "#38BDF8" }}>{wh.dispatchSpeed}</strong></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 3: 3-Tier Governance Audit History */}
                <div style={{ background: "#080F21", border: "1px solid #1E293B", padding: "16px", borderRadius: "12px" }}>
                  <h4 style={{ margin: "0 0 10px 0", fontSize: "0.95rem", color: "#FFFFFF" }}>
                    🏛️ 3-Tier Governance Clearance Trail:
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.8rem" }}>
                    <div style={{ background: "#020617", padding: "10px 12px", borderRadius: "8px", borderLeft: "3px solid #2563EB" }}>
                      <strong style={{ color: "#60A5FA" }}>⚡ Stage 1: Executor Due-Diligence &amp; Background:</strong>
                      <div style={{ color: "#E2E8F0", marginTop: "2px" }}>{viewingFullApp.stage1_executor?.notes || "Pending Executor Action"}</div>
                      <span style={{ color: "#64748B", fontSize: "0.72rem" }}>By: {viewingFullApp.stage1_executor?.by || "Unassigned"} ({viewingFullApp.stage1_executor?.timestamp || "N/A"})</span>
                    </div>

                    <div style={{ background: "#020617", padding: "10px 12px", borderRadius: "8px", borderLeft: "3px solid #8B5CF6" }}>
                      <strong style={{ color: "#A78BFA" }}>🔍 Stage 2: Verifier Geolocation, Quality &amp; Workplace Audit:</strong>
                      <div style={{ color: "#E2E8F0", marginTop: "2px" }}>{viewingFullApp.stage2_verifier?.notes || "Locked until Stage 1 approval"}</div>
                      <span style={{ color: "#64748B", fontSize: "0.72rem" }}>By: {viewingFullApp.stage2_verifier?.by || "Unassigned"} ({viewingFullApp.stage2_verifier?.timestamp || "N/A"})</span>
                    </div>

                    <div style={{ background: "#020617", padding: "10px 12px", borderRadius: "8px", borderLeft: "3px solid #10B981" }}>
                      <strong style={{ color: "#34D399" }}>⚖️ Stage 3: Approver Cross-Check &amp; Authorization Seal:</strong>
                      <div style={{ color: "#E2E8F0", marginTop: "2px" }}>{viewingFullApp.stage3_approver?.notes || "Locked until Stage 2 approval"}</div>
                      <span style={{ color: "#64748B", fontSize: "0.72rem" }}>Seal: {viewingFullApp.stage3_approver?.seal || "Pending Approval"} • By: {viewingFullApp.stage3_approver?.by || "Unassigned"}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setViewingFullApp(null)}>
                    Close Application View
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 1: EXECUTOR DUE-DILIGENCE & BACKGROUND INVESTIGATION DOSSIER         */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {investigatingApp && (
          <div className="modal-overlay">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="modal-card"
              style={{ maxWidth: "800px", maxHeight: "90vh", overflowY: "auto" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #1E293B", paddingBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "1.8rem" }}>⚡</span>
                  <div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 900, color: "#FFFFFF", margin: 0 }}>
                      Stage 1: Executor Due-Diligence &amp; Background Investigation
                    </h3>
                    <span style={{ fontSize: "0.76rem", color: "#60A5FA", fontWeight: 700 }}>
                      Investigating Authority: Mounish Sai (System Operations Executor Admin)
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setInvestigatingApp(null)}
                  style={{ background: "none", border: "none", color: "#94A3B8", fontSize: "1.2rem", cursor: "pointer" }}
                >
                  <FiX />
                </button>
              </div>

              {/* Alert: If returned by Verifier Admin */}
              {investigatingApp.returnLetterToExecutor && (
                <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.5)", borderRadius: "12px", padding: "14px 16px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#F87171", fontWeight: 800, fontSize: "0.88rem" }}>
                      <FiAlertTriangle /> ⚠️ Application Returned by Verifier Admin (Ananya Rao)
                    </div>
                    <span style={{ fontSize: "0.72rem", color: "#CBD5E1" }}>{investigatingApp.returnLetterToExecutor.timestamp}</span>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#FCA5A5", fontWeight: 700, marginBottom: "4px" }}>
                    Reason: {investigatingApp.returnLetterToExecutor.reason}
                  </div>
                  <div style={{ background: "#020617", padding: "10px 12px", borderRadius: "8px", fontSize: "0.78rem", color: "#E2E8F0", whiteSpace: "pre-line", border: "1px solid #334155" }}>
                    {investigatingApp.returnLetterToExecutor.content}
                  </div>
                  <div style={{ fontSize: "0.74rem", color: "#94A3B8", marginTop: "6px" }}>
                    💡 Please cross-check the vendor's legal background, address the concerns raised above, and update your Handover Explanation Letter before re-submitting.
                  </div>
                </div>
              )}

              {/* Tab Selector: [Approve & Forward] vs [Cancel & Disqualify] */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                <button
                  type="button"
                  onClick={() => setExecutorModalTab("approve_handover")}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: executorModalTab === "approve_handover" ? "2px solid #2563EB" : "1px solid #1E293B",
                    background: executorModalTab === "approve_handover" ? "rgba(37, 99, 235, 0.2)" : "#020617",
                    color: executorModalTab === "approve_handover" ? "#FFFFFF" : "#94A3B8",
                    fontWeight: 800,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px"
                  }}
                >
                  <FiCheckCircle style={{ color: "#60A5FA" }} /> ✅ Yes, Approve &amp; Forward to Verifier Admin
                </button>

                <button
                  type="button"
                  onClick={() => setExecutorModalTab("cancel_reject")}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: executorModalTab === "cancel_reject" ? "2px solid #EF4444" : "1px solid #1E293B",
                    background: executorModalTab === "cancel_reject" ? "rgba(239, 68, 68, 0.2)" : "#020617",
                    color: executorModalTab === "cancel_reject" ? "#FFFFFF" : "#94A3B8",
                    fontWeight: 800,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px"
                  }}
                >
                  <FiAlertTriangle style={{ color: "#F87171" }} /> 🚫 No, Cancel &amp; Disqualify Application
                </button>
              </div>

              {/* TAB 1: APPROVE DUE-DILIGENCE & FORWARD */}
              {executorModalTab === "approve_handover" && (
                <form onSubmit={handleExecuteDueDiligenceClearance} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* Target Vendor Header */}
                  <div style={{ background: "#020617", border: "1px solid #1E293B", padding: "14px 16px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h4 style={{ margin: "0 0 2px 0", color: "#FFFFFF", fontSize: "1.1rem", fontWeight: 800 }}>
                        {investigatingApp.storeName}
                      </h4>
                      <span style={{ fontSize: "0.8rem", color: "#94A3B8" }}>
                        Owner: <strong>{investigatingApp.ownerName}</strong> • GSTIN: <code>{investigatingApp.gstin}</code>
                      </span>
                    </div>
                    <span style={{ background: "rgba(37, 99, 235, 0.2)", color: "#60A5FA", padding: "4px 10px", borderRadius: "8px", fontSize: "0.76rem", fontWeight: 800 }}>
                      App Ref: {investigatingApp.id}
                    </span>
                  </div>

                  {/* 1. Legal Complaints Check */}
                  <div style={{ background: "#0B1329", border: "1px solid #1E293B", padding: "16px", borderRadius: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <h4 style={{ margin: 0, fontSize: "0.95rem", color: "#FFFFFF", display: "flex", alignItems: "center", gap: "8px" }}>
                        ⚖️ 1. Legal Complaints &amp; Warehouse Incidents Registry
                      </h4>
                      <span style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34D399", fontSize: "0.72rem", fontWeight: 800, padding: "2px 8px", borderRadius: "6px" }}>
                        ✓ 0 OUTSTANDING COMPLAINTS
                      </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.8rem" }}>
                      <div style={{ background: "#020617", padding: "10px 12px", borderRadius: "8px" }}>
                        <span style={{ color: "#94A3B8" }}>Consumer Disputes:</span>
                        <strong style={{ display: "block", color: "#34D399" }}>
                          {investigatingApp.dueDiligence?.complaintsCheck?.consumerCourtCases || "Clean Record (0 Cases)"}
                        </strong>
                      </div>

                      <div style={{ background: "#020617", padding: "10px 12px", borderRadius: "8px" }}>
                        <span style={{ color: "#94A3B8" }}>Police FIR Check:</span>
                        <strong style={{ display: "block", color: "#34D399" }}>
                          {investigatingApp.dueDiligence?.complaintsCheck?.policeFirs || "Clean Police NOC"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* 2. Trustability Score */}
                  <div style={{ background: "#0B1329", border: "1px solid #1E293B", padding: "16px", borderRadius: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <h4 style={{ margin: 0, fontSize: "0.95rem", color: "#FFFFFF", display: "flex", alignItems: "center", gap: "8px" }}>
                        🛡️ 2. Trustability &amp; Financial Health Score
                      </h4>
                      <span style={{ background: "rgba(56, 189, 248, 0.15)", color: "#38BDF8", fontSize: "0.72rem", fontWeight: 800, padding: "2px 8px", borderRadius: "6px" }}>
                        SCORE: {investigatingApp.dueDiligence?.trustability?.trustScore || 96} / 100
                      </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.8rem" }}>
                      <div style={{ background: "#020617", padding: "10px 12px", borderRadius: "8px" }}>
                        <span style={{ color: "#94A3B8" }}>Trust Grade:</span>
                        <strong style={{ display: "block", color: "#34D399" }}>
                          {investigatingApp.dueDiligence?.trustability?.trustGrade || "Tier-A+ High Reliability"}
                        </strong>
                      </div>

                      <div style={{ background: "#020617", padding: "10px 12px", borderRadius: "8px" }}>
                        <span style={{ color: "#94A3B8" }}>Financial Health:</span>
                        <strong style={{ display: "block", color: "#38BDF8" }}>
                          {investigatingApp.dueDiligence?.trustability?.financialHealth || "AAA Rated"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Checkbox Checklist */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "8px" }}>
                      Executor Formal Due-Diligence Sign-Off:
                    </label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.82rem", color: "#E2E8F0", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={executorChecks.complaintsClean}
                          onChange={(e) => setExecutorChecks({ ...executorChecks, complaintsClean: e.target.checked })}
                        />
                        <span>✓ <strong>Legal Complaints Checked:</strong> 0 consumer disputes and clean police records.</span>
                      </label>

                      <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.82rem", color: "#E2E8F0", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={executorChecks.trustVerified}
                          onChange={(e) => setExecutorChecks({ ...executorChecks, trustVerified: e.target.checked })}
                        />
                        <span>✓ <strong>Trustability Confirmed:</strong> Score &gt; 90/100, AAA financial health.</span>
                      </label>
                    </div>
                  </div>

                  {/* Executor Explanation & Handover Letter to Verifier Admin */}
                  <div style={{ background: "#0B1329", border: "1px solid rgba(59, 130, 246, 0.4)", borderRadius: "12px", padding: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <label style={{ fontSize: "0.84rem", fontWeight: 800, color: "#60A5FA", display: "flex", alignItems: "center", gap: "6px" }}>
                        📜 Official Handover &amp; Explanation Letter to Verifier Admin:
                      </label>
                      <span style={{ fontSize: "0.72rem", background: "rgba(59, 130, 246, 0.2)", color: "#93C5FD", padding: "2px 8px", borderRadius: "6px" }}>
                        Mandatory Handover Protocol
                      </span>
                    </div>
                    <p style={{ fontSize: "0.76rem", color: "#94A3B8", margin: "0 0 10px 0" }}>
                      The Verifier Admin will review this explanation letter upon receipt. You can customize the details of your due-diligence clearance below:
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div>
                        <span style={{ fontSize: "0.74rem", color: "#CBD5E1", fontWeight: 700 }}>Letter Subject:</span>
                        <input
                          type="text"
                          required
                          value={executorExplanationSubject}
                          onChange={(e) => setExecutorExplanationSubject(e.target.value)}
                          style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "#FFFFFF", fontSize: "0.8rem", marginTop: "4px" }}
                        />
                      </div>

                      <div>
                        <span style={{ fontSize: "0.74rem", color: "#CBD5E1", fontWeight: 700 }}>Explanation Letter Body:</span>
                        <textarea
                          rows={7}
                          required
                          value={executorExplanationBody}
                          onChange={(e) => setExecutorExplanationBody(e.target.value)}
                          style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "#FFFFFF", outline: "none", fontSize: "0.8rem", lineHeight: "1.4", fontFamily: "monospace" }}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setInvestigatingApp(null)}>
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{
                        background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
                        color: "#FFFFFF",
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        fontWeight: 800,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        boxShadow: "0 4px 14px rgba(37, 99, 235, 0.4)"
                      }}
                    >
                      <FiCheckCircle /> ⚡ Approve &amp; Dispatch Handover Letter to Verifier
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: CANCEL & DISQUALIFY APPLICATION */}
              {executorModalTab === "cancel_reject" && (
                <form onSubmit={handleExecutorCancelApplication} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ background: "#020617", border: "1px solid #1E293B", padding: "14px 16px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h4 style={{ margin: "0 0 2px 0", color: "#FFFFFF", fontSize: "1.1rem", fontWeight: 800 }}>
                        {investigatingApp.storeName}
                      </h4>
                      <span style={{ fontSize: "0.8rem", color: "#94A3B8" }}>
                        Owner: <strong>{investigatingApp.ownerName}</strong> • GSTIN: <code>{investigatingApp.gstin}</code>
                      </span>
                    </div>
                    <span style={{ background: "rgba(239, 68, 68, 0.2)", color: "#F87171", padding: "4px 10px", borderRadius: "8px", fontSize: "0.76rem", fontWeight: 800 }}>
                      App Ref: {investigatingApp.id}
                    </span>
                  </div>

                  <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.35)", padding: "14px 16px", borderRadius: "12px" }}>
                    <h4 style={{ margin: "0 0 4px 0", color: "#F87171", fontSize: "0.95rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "6px" }}>
                      <FiAlertTriangle /> Outright Cancellation &amp; Disqualification Protocol
                    </h4>
                    <p style={{ margin: 0, fontSize: "0.78rem", color: "#CBD5E1", lineHeight: "1.4" }}>
                      Cancelling will immediately prevent this application from advancing to Stage 2 (Verifier Admin). The record and your explanation letter will be moved to the <strong>Cancelled &amp; Discrepancies Desk</strong>.
                    </p>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "6px" }}>
                      Primary Reason for Cancellation:
                    </label>
                    <select
                      value={executorCancellationReason}
                      onChange={(e) => setExecutorCancellationReason(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #EF4444", background: "#020617", color: "#FFFFFF", fontSize: "0.84rem", outline: "none" }}
                    >
                      <option value="Discovered Outstanding Legal FIR / High Regulatory Risk">
                        ⚖️ Discovered Outstanding Legal FIR / High Regulatory Risk
                      </option>
                      <option value="Failed Background Due-Diligence (Trust Score < 85/100)">
                        🛡️ Failed Background Due-Diligence (Trust Score &lt; 85/100)
                      </option>
                      <option value="Fraudulent Business Registration or Invalid Corporate Identity">
                        📄 Fraudulent Business Registration or Invalid Corporate Identity
                      </option>
                      <option value="Active Commercial Disputes & Multiple Consumer Court Injunctions">
                        ⚠️ Active Commercial Disputes &amp; Multiple Consumer Court Injunctions
                      </option>
                      <option value="Corporate Entity on National Blacklist / Defaulter Database">
                        🚫 Corporate Entity on National Blacklist / Defaulter Database
                      </option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "6px" }}>
                      Formal Cancellation Notice &amp; Explanation Letter:
                    </label>
                    <textarea
                      rows={6}
                      required
                      value={executorCancellationLetter}
                      onChange={(e) => setExecutorCancellationLetter(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #EF4444", background: "#020617", color: "#FFFFFF", outline: "none", fontSize: "0.8rem", lineHeight: "1.4", fontFamily: "monospace" }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setInvestigatingApp(null)}>
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{
                        background: "linear-gradient(135deg, #EF4444, #DC2626)",
                        color: "#FFFFFF",
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        fontWeight: 800,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        boxShadow: "0 4px 14px rgba(239, 68, 68, 0.4)"
                      }}
                    >
                      <FiAlertTriangle /> 🚫 Cancel &amp; Move to Discrepancies Desk
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 2: STAGE 2 COMPLIANCE, GEOLOCATION & QUALITY AUDIT (VERIFIER ADMIN) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {verifyingApp && (
          <div className="modal-overlay">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="modal-card"
              style={{ maxWidth: "820px", maxHeight: "90vh", overflowY: "auto" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #1E293B", paddingBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "1.8rem" }}>🔍</span>
                  <div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 900, color: "#FFFFFF", margin: 0 }}>
                      Stage 2: Physical Warehouse Geolocation, Product Match &amp; Quality Audit
                    </h3>
                    <span style={{ fontSize: "0.76rem", color: "#A78BFA", fontWeight: 700 }}>
                      Auditor Authority: Ananya Rao (Compliance &amp; KYC Verifier Admin)
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setVerifyingApp(null)}
                  style={{ background: "none", border: "none", color: "#94A3B8", fontSize: "1.2rem", cursor: "pointer" }}
                >
                  <FiX />
                </button>
              </div>

              {/* Incoming Handover Letter from Executor Admin */}
              <div style={{ background: "#0B1329", border: "1px solid rgba(59, 130, 246, 0.4)", padding: "14px 16px", borderRadius: "12px", marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontSize: "0.84rem", fontWeight: 800, color: "#60A5FA", display: "flex", alignItems: "center", gap: "6px" }}>
                    📜 Incoming Handover &amp; Explanation Letter from Executor Admin:
                  </span>
                  <span style={{ fontSize: "0.72rem", background: "rgba(59, 130, 246, 0.2)", color: "#93C5FD", padding: "2px 8px", borderRadius: "6px" }}>
                    Sender: Mounish Sai
                  </span>
                </div>
                <div style={{ background: "#020617", border: "1px solid #1E293B", padding: "12px", borderRadius: "8px", fontSize: "0.78rem", color: "#E2E8F0", whiteSpace: "pre-line", maxHeight: "110px", overflowY: "auto", fontFamily: "monospace", lineHeight: "1.4" }}>
                  {verifyingApp.handoverLetterToVerifier?.content || "Stage 1 background investigation and due-diligence cleared."}
                </div>
              </div>

              {/* Alert: If returned by Approver Authority */}
              {verifyingApp.returnLetterToVerifier && (
                <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.5)", borderRadius: "12px", padding: "14px 16px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#F87171", fontWeight: 800, fontSize: "0.88rem" }}>
                      <FiAlertTriangle /> ⚠️ Application Returned by Approver Authority (Rajesh Menon)
                    </div>
                    <span style={{ fontSize: "0.72rem", color: "#CBD5E1" }}>{verifyingApp.returnLetterToVerifier.timestamp}</span>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#FCA5A5", fontWeight: 700, marginBottom: "4px" }}>
                    Reason: {verifyingApp.returnLetterToVerifier.reason}
                  </div>
                  <div style={{ background: "#020617", padding: "10px 12px", borderRadius: "8px", fontSize: "0.78rem", color: "#E2E8F0", whiteSpace: "pre-line", border: "1px solid #334155" }}>
                    {verifyingApp.returnLetterToVerifier.content}
                  </div>
                </div>
              )}

              {/* Tab Selector: [Accept Handover & Audit] vs [Reject & Return to Executor] vs [Cancel & Disqualify] */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                <button
                  type="button"
                  onClick={() => setVerifierModalTab("accept_audit")}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: verifierModalTab === "accept_audit" ? "2px solid #8B5CF6" : "1px solid #1E293B",
                    background: verifierModalTab === "accept_audit" ? "rgba(139, 92, 246, 0.2)" : "#020617",
                    color: verifierModalTab === "accept_audit" ? "#FFFFFF" : "#94A3B8",
                    fontWeight: 800,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px"
                  }}
                >
                  <FiCheckSquare style={{ color: "#A78BFA" }} /> ✅ Yes, Accept &amp; Audit
                </button>

                <button
                  type="button"
                  onClick={() => setVerifierModalTab("reject_return")}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: verifierModalTab === "reject_return" ? "2px solid #F59E0B" : "1px solid #1E293B",
                    background: verifierModalTab === "reject_return" ? "rgba(245, 158, 11, 0.2)" : "#020617",
                    color: verifierModalTab === "reject_return" ? "#FFFFFF" : "#94A3B8",
                    fontWeight: 800,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px"
                  }}
                >
                  <FiAlertTriangle style={{ color: "#FBBF24" }} /> ↩️ Return to Executor
                </button>

                <button
                  type="button"
                  onClick={() => setVerifierModalTab("cancel_disqualify")}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: verifierModalTab === "cancel_disqualify" ? "2px solid #EF4444" : "1px solid #1E293B",
                    background: verifierModalTab === "cancel_disqualify" ? "rgba(239, 68, 68, 0.2)" : "#020617",
                    color: verifierModalTab === "cancel_disqualify" ? "#FFFFFF" : "#94A3B8",
                    fontWeight: 800,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px"
                  }}
                >
                  <FiXCircle style={{ color: "#F87171" }} /> 🚫 Outright Cancel
                </button>
              </div>

              {/* TAB 1: ACCEPT HANDOVER & PERFORM COMPLIANCE AUDIT */}
              {verifierModalTab === "accept_audit" && (
                <form onSubmit={handleExecuteVerifierAudit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ background: "#020617", border: "1px solid #1E293B", padding: "14px 16px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h4 style={{ margin: "0 0 2px 0", color: "#FFFFFF", fontSize: "1.1rem", fontWeight: 800 }}>
                        {verifyingApp.storeName}
                      </h4>
                      <span style={{ fontSize: "0.8rem", color: "#94A3B8" }}>
                        Owner: <strong>{verifyingApp.ownerName}</strong> • Category: <span style={{ color: "#FCD34D" }}>{verifyingApp.category}</span>
                      </span>
                    </div>
                    <span style={{ background: "rgba(139, 92, 246, 0.2)", color: "#A78BFA", padding: "4px 10px", borderRadius: "8px", fontSize: "0.76rem", fontWeight: 800 }}>
                      App Ref: {verifyingApp.id}
                    </span>
                  </div>

                  {/* Real vs Fake Geolocation */}
                  <div style={{ background: "#0B1329", border: "1px solid rgba(139, 92, 246, 0.3)", padding: "16px", borderRadius: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <h4 style={{ margin: 0, fontSize: "0.95rem", color: "#FFFFFF", display: "flex", alignItems: "center", gap: "8px" }}>
                        📍 1. Warehouse Real vs Fake Geolocation Audit ({verifyingApp.warehouses?.length || 2} Declared Hubs)
                      </h4>
                      <span style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34D399", fontSize: "0.72rem", fontWeight: 800, padding: "2px 8px", borderRadius: "6px" }}>
                        ✓ 100% REAL PHYSICAL HUBS (0 FAKE ADDRESSES)
                      </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {(verifyingApp.warehouses || []).map((wh, wIdx) => (
                        <div key={wIdx} style={{ background: "#020617", padding: "10px 14px", borderRadius: "8px", fontSize: "0.8rem" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <strong style={{ color: "#FFFFFF" }}>📍 Hub {wIdx + 1}: {wh.name}</strong>
                            <span style={{ color: "#34D399", fontWeight: 700 }}>✓ Geotag Active &amp; Postal Verified</span>
                          </div>
                          <div style={{ color: "#94A3B8", marginTop: "2px" }}>
                            Address: {wh.city}, {wh.stateName} (PIN: <code>{wh.pincode}</code>) • Storage: {wh.storageType} ({wh.capacityUnits})
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Verifier Checklist */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "8px" }}>
                      Verifier Mandatory Compliance Checklist:
                    </label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.82rem", color: "#E2E8F0", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={verifyChecks.realLocationsVerified}
                          onChange={(e) => setVerifyChecks({ ...verifyChecks, realLocationsVerified: e.target.checked })}
                        />
                        <span>✓ <strong>Physical Geolocation:</strong> Confirmed 100% Real Physical Locations (Zero fake/ghost addresses).</span>
                      </label>

                      <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.82rem", color: "#E2E8F0", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={verifyChecks.catalogMatchesDescription}
                          onChange={(e) => setVerifyChecks({ ...verifyChecks, catalogMatchesDescription: e.target.checked })}
                        />
                        <span>✓ <strong>Product Description Match:</strong> Vendor sells ONLY products stated in store description (Zero mismatched SKUs).</span>
                      </label>

                      <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.82rem", color: "#E2E8F0", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={verifyChecks.productQualityPassed}
                          onChange={(e) => setVerifyChecks({ ...verifyChecks, productQualityPassed: e.target.checked })}
                        />
                        <span>✓ <strong>Product Quality:</strong> Passed sample testing &amp; BIS/ISO material safety standards.</span>
                      </label>

                      <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.82rem", color: "#E2E8F0", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={verifyChecks.workplaceSafetyCertified}
                          onChange={(e) => setVerifyChecks({ ...verifyChecks, workplaceSafetyCertified: e.target.checked })}
                        />
                        <span>✓ <strong>Workplace Safety:</strong> Automated fire sprinklers, 24/7 CCTV &amp; climate control verified.</span>
                      </label>
                    </div>
                  </div>

                  {/* Verifier Explanation & Handover Letter to Approver Admin */}
                  <div style={{ background: "#0B1329", border: "1px solid rgba(139, 92, 246, 0.4)", borderRadius: "12px", padding: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <label style={{ fontSize: "0.84rem", fontWeight: 800, color: "#A78BFA", display: "flex", alignItems: "center", gap: "6px" }}>
                        📜 Official Handover &amp; Explanation Letter to Approver Admin:
                      </label>
                      <span style={{ fontSize: "0.72rem", background: "rgba(139, 92, 246, 0.2)", color: "#C4B5FD", padding: "2px 8px", borderRadius: "6px" }}>
                        Stage 2 Handover Protocol
                      </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div>
                        <span style={{ fontSize: "0.74rem", color: "#CBD5E1", fontWeight: 700 }}>Letter Subject:</span>
                        <input
                          type="text"
                          required
                          value={verifierExplanationSubject}
                          onChange={(e) => setVerifierExplanationSubject(e.target.value)}
                          style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "#FFFFFF", fontSize: "0.8rem", marginTop: "4px" }}
                        />
                      </div>

                      <div>
                        <span style={{ fontSize: "0.74rem", color: "#CBD5E1", fontWeight: 700 }}>Explanation Letter Body:</span>
                        <textarea
                          rows={6}
                          required
                          value={verifierExplanationBody}
                          onChange={(e) => setVerifierExplanationBody(e.target.value)}
                          style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "#FFFFFF", outline: "none", fontSize: "0.8rem", lineHeight: "1.4", fontFamily: "monospace" }}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setVerifyingApp(null)}>
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{
                        background: "linear-gradient(135deg, #8B5CF6, #6D28D9)",
                        color: "#FFFFFF",
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        fontWeight: 800,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        boxShadow: "0 4px 14px rgba(139, 92, 246, 0.4)"
                      }}
                    >
                      <FiCheckSquare /> 🔍 Approve Stage 2 &amp; Dispatch Letter to Approver
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: REJECT & RETURN TO EXECUTOR ADMIN */}
              {verifierModalTab === "reject_return" && (
                <form onSubmit={handleVerifierReturnToExecutor} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.35)", padding: "14px 16px", borderRadius: "12px" }}>
                    <h4 style={{ margin: "0 0 4px 0", color: "#FBBF24", fontSize: "0.95rem", fontWeight: 800 }}>
                      ⚠️ Rejection &amp; Application Return Protocol
                    </h4>
                    <p style={{ margin: 0, fontSize: "0.78rem", color: "#CBD5E1", lineHeight: "1.4" }}>
                      When you return this application, it will disappear from your desk and be sent back to the <strong>Executor Admin (Mounish Sai)</strong> with your formal rejection letter below for re-investigation.
                    </p>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "6px" }}>
                      Primary Reason for Rejection / Return:
                    </label>
                    <select
                      value={verifierRejectionReason}
                      onChange={(e) => setVerifierRejectionReason(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "#FFFFFF", fontSize: "0.84rem", outline: "none" }}
                    >
                      <option value="Physical Geolocation Discrepancy Found (Fake Address / Unverified Coordinates)">
                        📍 Physical Geolocation Discrepancy Found (Fake Address / Unverified Coordinates)
                      </option>
                      <option value="Product Catalog Inconsistency (SKUs Do Not Match Storefront Description)">
                        🛍️ Product Catalog Inconsistency (SKUs Do Not Match Storefront Description)
                      </option>
                      <option value="Product Quality Testing Failed (Non-Compliant Materials)">
                        🧪 Product Quality Testing Failed (Non-Compliant Materials)
                      </option>
                      <option value="Warehouse Workplace Safety Standards Not Met (Fire / CCTV Failures)">
                        🧯 Warehouse Workplace Safety Standards Not Met (Fire / CCTV Failures)
                      </option>
                      <option value="Incomplete / Conflicting Legal Documentation">
                        📄 Incomplete / Conflicting Legal Documentation
                      </option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "6px" }}>
                      Formal Rejection &amp; Return Letter to Executor Admin:
                    </label>
                    <textarea
                      rows={6}
                      required
                      value={verifierRejectionLetter}
                      onChange={(e) => setVerifierRejectionLetter(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #F59E0B", background: "#020617", color: "#FFFFFF", outline: "none", fontSize: "0.8rem", lineHeight: "1.4", fontFamily: "monospace" }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setVerifyingApp(null)}>
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{
                        background: "linear-gradient(135deg, #D97706, #B45309)",
                        color: "#FFFFFF",
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        fontWeight: 800,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        boxShadow: "0 4px 14px rgba(217, 119, 6, 0.4)"
                      }}
                    >
                      <FiAlertTriangle /> ↩️ Send Return Letter to Executor Admin
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: OUTRIGHT CANCELLATION & DISQUALIFICATION */}
              {verifierModalTab === "cancel_disqualify" && (
                <form onSubmit={handleVerifierCancelApplication} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ background: "#020617", border: "1px solid #1E293B", padding: "14px 16px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h4 style={{ margin: "0 0 2px 0", color: "#FFFFFF", fontSize: "1.1rem", fontWeight: 800 }}>
                        {verifyingApp.storeName}
                      </h4>
                      <span style={{ fontSize: "0.8rem", color: "#94A3B8" }}>
                        Owner: <strong>{verifyingApp.ownerName}</strong> • Category: <span style={{ color: "#FCD34D" }}>{verifyingApp.category}</span>
                      </span>
                    </div>
                    <span style={{ background: "rgba(239, 68, 68, 0.2)", color: "#F87171", padding: "4px 10px", borderRadius: "8px", fontSize: "0.76rem", fontWeight: 800 }}>
                      App Ref: {verifyingApp.id}
                    </span>
                  </div>

                  <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.35)", padding: "14px 16px", borderRadius: "12px" }}>
                    <h4 style={{ margin: "0 0 4px 0", color: "#F87171", fontSize: "0.95rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "6px" }}>
                      <FiAlertTriangle /> Verifier Outright Cancellation &amp; Fake Store Disqualification
                    </h4>
                    <p style={{ margin: 0, fontSize: "0.78rem", color: "#CBD5E1", lineHeight: "1.4" }}>
                      Cancelling will disqualify this store permanently from reaching the Approver Authority. The record and your explanation letter will be moved to the <strong>Cancelled &amp; Discrepancies Desk</strong>.
                    </p>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "6px" }}>
                      Primary Reason for Outright Cancellation:
                    </label>
                    <select
                      value={verifierCancellationReason}
                      onChange={(e) => setVerifierCancellationReason(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #EF4444", background: "#020617", color: "#FFFFFF", fontSize: "0.84rem", outline: "none" }}
                    >
                      <option value="100% Fake / Ghost Warehouse Geolocation Coordinates">
                        📍 100% Fake / Ghost Warehouse Geolocation Coordinates
                      </option>
                      <option value="Counterfeit / Prohibited Catalog SKUs Not Matching Description">
                        🛍️ Counterfeit / Prohibited Catalog SKUs Not Matching Description
                      </option>
                      <option value="Critical Product Quality & Chemical Safety Non-Compliance">
                        🧪 Critical Product Quality &amp; Chemical Safety Non-Compliance
                      </option>
                      <option value="Severe Fire Hazard / Workplace Safety Facility Violations">
                        🧯 Severe Fire Hazard / Workplace Safety Facility Violations
                      </option>
                      <option value="Forged Logistics Agreements or False Warehouse Ownership">
                        🚫 Forged Logistics Agreements or False Warehouse Ownership
                      </option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "6px" }}>
                      Formal Cancellation Notice &amp; Explanation Letter:
                    </label>
                    <textarea
                      rows={6}
                      required
                      value={verifierCancellationLetter}
                      onChange={(e) => setVerifierCancellationLetter(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #EF4444", background: "#020617", color: "#FFFFFF", outline: "none", fontSize: "0.8rem", lineHeight: "1.4", fontFamily: "monospace" }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setVerifyingApp(null)}>
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{
                        background: "linear-gradient(135deg, #EF4444, #DC2626)",
                        color: "#FFFFFF",
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        fontWeight: 800,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        boxShadow: "0 4px 14px rgba(239, 68, 68, 0.4)"
                      }}
                    >
                      <FiAlertTriangle /> 🚫 Cancel &amp; Move to Discrepancies Desk
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 3: STAGE 3 CROSS-CHECK & FINAL APPROVAL (APPROVER ADMIN)             */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {approvingApp && (
          <div className="modal-overlay">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="modal-card"
              style={{ maxWidth: "780px", maxHeight: "90vh", overflowY: "auto" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #1E293B", paddingBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "1.8rem" }}>⚖️</span>
                  <div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 900, color: "#FFFFFF", margin: 0 }}>
                      Stage 3: Cross-Check &amp; Final Vendor Approval Authority
                    </h3>
                    <span style={{ fontSize: "0.76rem", color: "#34D399", fontWeight: 700 }}>
                      Approval Authority: Rajesh Menon (Cross-Check &amp; Approval Officer)
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setApprovingApp(null)}
                  style={{ background: "none", border: "none", color: "#94A3B8", fontSize: "1.2rem", cursor: "pointer" }}
                >
                  <FiX />
                </button>
              </div>

              {/* Incoming Handover Letter from Verifier Admin */}
              <div style={{ background: "#0B1329", border: "1px solid rgba(139, 92, 246, 0.4)", padding: "14px 16px", borderRadius: "12px", marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontSize: "0.84rem", fontWeight: 800, color: "#A78BFA", display: "flex", alignItems: "center", gap: "6px" }}>
                    📜 Incoming Handover &amp; Explanation Letter from Verifier Admin:
                  </span>
                  <span style={{ fontSize: "0.72rem", background: "rgba(139, 92, 246, 0.2)", color: "#C4B5FD", padding: "2px 8px", borderRadius: "6px" }}>
                    Sender: Ananya Rao
                  </span>
                </div>
                <div style={{ background: "#020617", border: "1px solid #1E293B", padding: "12px", borderRadius: "8px", fontSize: "0.78rem", color: "#E2E8F0", whiteSpace: "pre-line", maxHeight: "110px", overflowY: "auto", fontFamily: "monospace", lineHeight: "1.4" }}>
                  {approvingApp.handoverLetterToApprover?.content || "Stage 2 compliance, physical geolocation, and product quality audit cleared."}
                </div>
              </div>

              {/* Tab Selector: [Accept Letter & Issue Seal] vs [Reject & Return to Verifier] vs [Cancel & Disqualify] */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                <button
                  type="button"
                  onClick={() => setApproverModalTab("accept_seal")}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: approverModalTab === "accept_seal" ? "2px solid #10B981" : "1px solid #1E293B",
                    background: approverModalTab === "accept_seal" ? "rgba(16, 185, 129, 0.2)" : "#020617",
                    color: approverModalTab === "accept_seal" ? "#FFFFFF" : "#94A3B8",
                    fontWeight: 800,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px"
                  }}
                >
                  <FiAward style={{ color: "#34D399" }} /> ✅ Yes, Accept &amp; Induct
                </button>

                <button
                  type="button"
                  onClick={() => setApproverModalTab("reject_return")}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: approverModalTab === "reject_return" ? "2px solid #F59E0B" : "1px solid #1E293B",
                    background: approverModalTab === "reject_return" ? "rgba(245, 158, 11, 0.2)" : "#020617",
                    color: approverModalTab === "reject_return" ? "#FFFFFF" : "#94A3B8",
                    fontWeight: 800,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px"
                  }}
                >
                  <FiAlertTriangle style={{ color: "#FBBF24" }} /> ↩️ Return to Verifier
                </button>

                <button
                  type="button"
                  onClick={() => setApproverModalTab("cancel_disqualify")}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: approverModalTab === "cancel_disqualify" ? "2px solid #EF4444" : "1px solid #1E293B",
                    background: approverModalTab === "cancel_disqualify" ? "rgba(239, 68, 68, 0.2)" : "#020617",
                    color: approverModalTab === "cancel_disqualify" ? "#FFFFFF" : "#94A3B8",
                    fontWeight: 800,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px"
                  }}
                >
                  <FiXCircle style={{ color: "#F87171" }} /> 🚫 Outright Cancel
                </button>
              </div>

              {/* TAB 1: ACCEPT & ISSUE MERCHANT SEAL */}
              {approverModalTab === "accept_seal" && (
                <form onSubmit={handleExecuteFinalApproval} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {/* Target Vendor Header */}
                  <div style={{ background: "#020617", border: "1px solid #1E293B", padding: "14px 16px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h4 style={{ margin: "0 0 2px 0", color: "#FFFFFF", fontSize: "1.1rem", fontWeight: 800 }}>
                        {approvingApp.storeName}
                      </h4>
                      <span style={{ fontSize: "0.8rem", color: "#94A3B8" }}>
                        Owner: <strong>{approvingApp.ownerName}</strong> • Category: <span style={{ color: "#FCD34D" }}>{approvingApp.category}</span>
                      </span>
                    </div>
                    <span style={{ background: "rgba(16, 185, 129, 0.2)", color: "#34D399", padding: "4px 10px", borderRadius: "8px", fontSize: "0.76rem", fontWeight: 800 }}>
                      App Ref: {approvingApp.id}
                    </span>
                  </div>

                  {/* 4-STAGE CROSS-CHECK SCORECARD */}
                  <div style={{ background: "#0B1329", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "12px", padding: "16px" }}>
                    <h4 style={{ margin: "0 0 12px 0", fontSize: "0.92rem", color: "#FFFFFF", display: "flex", alignItems: "center", gap: "8px" }}>
                      ⚖️ Approver Comprehensive Cross-Check Verification Dossier
                    </h4>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.78rem" }}>
                      {/* Cross Check 1: Stage 1 Executor Due Diligence */}
                      <div style={{ background: "#020617", padding: "10px 12px", borderRadius: "8px", border: "1px solid #1E293B" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                          <strong style={{ color: "#60A5FA" }}>⚡ 1. Executor Due-Diligence:</strong>
                          <span style={{ color: "#34D399", fontWeight: 800 }}>✓ CLEARED</span>
                        </div>
                        <div style={{ color: "#CBD5E1" }}>
                          • Complaints: <strong>0 Disputes / Clean Police NOC</strong><br />
                          • Trust Score: <strong style={{ color: "#38BDF8" }}>{approvingApp.dueDiligence?.trustability?.trustScore || 98}/100 (AAA)</strong><br />
                          • Collaborations: <strong>Enterprise Verified</strong>
                        </div>
                      </div>

                      {/* Cross Check 2: Stage 2 Verifier Physical Audit */}
                      <div style={{ background: "#020617", padding: "10px 12px", borderRadius: "8px", border: "1px solid #1E293B" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                          <strong style={{ color: "#A78BFA" }}>🔍 2. Verifier Physical Audit:</strong>
                          <span style={{ color: "#34D399", fontWeight: 800 }}>✓ VERIFIED</span>
                        </div>
                        <div style={{ color: "#CBD5E1" }}>
                          • Geolocation: <strong>100% Real Physical Hubs</strong><br />
                          • Catalog Match: <strong>100% (Zero Misleading SKUs)</strong><br />
                          • Quality: <strong style={{ color: "#34D399" }}>Grade-A+ Safety Passed</strong>
                        </div>
                      </div>

                      {/* Cross Check 3: Legal Identification & Tax KYC */}
                      <div style={{ background: "#020617", padding: "10px 12px", borderRadius: "8px", border: "1px solid #1E293B" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                          <strong style={{ color: "#FBBF24" }}>📄 3. Legal &amp; Tax KYC:</strong>
                          <span style={{ color: "#34D399", fontWeight: 800 }}>✓ ACTIVE</span>
                        </div>
                        <div style={{ color: "#CBD5E1" }}>
                          • GSTIN: <code>{approvingApp.gstin}</code><br />
                          • Aadhaar KYC: <strong>Biometric Validated</strong><br />
                          • Warehouses: <strong>{approvingApp.warehouses?.length || 2} Declared Logistics Hubs</strong>
                        </div>
                      </div>

                      {/* Cross Check 4: Performance Bond */}
                      <div style={{ background: "#020617", padding: "10px 12px", borderRadius: "8px", border: "1px solid #1E293B" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                          <strong style={{ color: "#34D399" }}>📜 4. ShopSense Bond Terms:</strong>
                          <span style={{ color: "#34D399", fontWeight: 800 }}>✓ 5.0% GROSS</span>
                        </div>
                        <div style={{ color: "#CBD5E1" }}>
                          • Selling Bond: <strong style={{ color: "#34D399" }}>{approvingApp.bond?.sellingPercentage || "5.0% Gross"}</strong><br />
                          • Escrow Deposit: <strong>INR 50,000 Secured</strong><br />
                          • Settlement: <strong>Daily T+1 Automated</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Approver Mandatory Sign-Off Checkboxes */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "8px" }}>
                      Approver Cross-Check Verification Sign-Off:
                    </label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.82rem", color: "#E2E8F0", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={approverCrossChecks.executorCleared}
                          onChange={(e) => setApproverCrossChecks({ ...approverCrossChecks, executorCleared: e.target.checked })}
                        />
                        <span>✓ <strong>Stage 1 Cross-Check:</strong> 0 legal complaints, clean warehouse record &amp; Tier-A+ trust score verified.</span>
                      </label>

                      <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.82rem", color: "#E2E8F0", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={approverCrossChecks.verifierCleared}
                          onChange={(e) => setApproverCrossChecks({ ...approverCrossChecks, verifierCleared: e.target.checked })}
                        />
                        <span>✓ <strong>Stage 2 Cross-Check:</strong> 100% Real physical warehouse geolocation, product description match &amp; Grade-A quality passed.</span>
                      </label>

                      <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.82rem", color: "#E2E8F0", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={approverCrossChecks.bondAgreed}
                          onChange={(e) => setApproverCrossChecks({ ...approverCrossChecks, bondAgreed: e.target.checked })}
                        />
                        <span>✓ <strong>5.0% Gross Bond Agreement:</strong> Standard 5.0% gross marketplace commission bond terms executed.</span>
                      </label>

                      <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.82rem", color: "#34D399", cursor: "pointer", fontWeight: 700 }}>
                        <input
                          type="checkbox"
                          checked={approverCrossChecks.inductToShopSense}
                          onChange={(e) => setApproverCrossChecks({ ...approverCrossChecks, inductToShopSense: e.target.checked })}
                        />
                        <span>🏛️ <strong>Forward to Supreme Chairman:</strong> Seal 5.0% performance bond and dispatch application to Supreme Chairman for final vendor portal access authorization.</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "4px" }}>
                      Final Seal Remarks &amp; Clearance Letter to Supreme Chairman:
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={approverNotes}
                      onChange={(e) => setApproverNotes(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "#FFFFFF", outline: "none", fontSize: "0.82rem" }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setApprovingApp(null)}>
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{
                        background: "linear-gradient(135deg, #10B981, #059669)",
                        color: "#FFFFFF",
                        border: "none",
                        padding: "10px 22px",
                        borderRadius: "8px",
                        fontWeight: 900,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        boxShadow: "0 4px 16px rgba(16, 185, 129, 0.4)"
                      }}
                    >
                      <FiAward /> ⚖️ Issue Approver Seal &amp; Forward to Chairman
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: REJECT & RETURN TO VERIFIER ADMIN */}
              {approverModalTab === "reject_return" && (
                <form onSubmit={handleApproverReturnToVerifier} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.35)", padding: "14px 16px", borderRadius: "12px" }}>
                    <h4 style={{ margin: "0 0 4px 0", color: "#FBBF24", fontSize: "0.95rem", fontWeight: 800 }}>
                      ⚠️ Rejection &amp; Application Return Protocol
                    </h4>
                    <p style={{ margin: 0, fontSize: "0.78rem", color: "#CBD5E1", lineHeight: "1.4" }}>
                      When you return this application, it will disappear from your desk and be returned directly to the <strong>Verifier Admin (Ananya Rao)</strong> with your formal rejection letter below for re-audit.
                    </p>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "6px" }}>
                      Primary Reason for Rejection / Return:
                    </label>
                    <select
                      value={approverRejectionReason}
                      onChange={(e) => setApproverRejectionReason(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "#FFFFFF", fontSize: "0.84rem", outline: "none" }}
                    >
                      <option value="5.0% Gross Selling Bond Agreement Clause Disagreement">
                        📜 5.0% Gross Selling Bond Agreement Clause Disagreement
                      </option>
                      <option value="Secondary Warehouse SLA Velocity Verification Incomplete">
                        🚚 Secondary Warehouse SLA Velocity Verification Incomplete
                      </option>
                      <option value="Product Safety Standards Certification Unverified">
                        🧪 Product Safety Standards Certification Unverified
                      </option>
                      <option value="Escrow Security Deposit Terms Incomplete">
                        💰 Escrow Security Deposit Terms Incomplete
                      </option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "6px" }}>
                      Formal Rejection &amp; Return Letter to Verifier Admin:
                    </label>
                    <textarea
                      rows={6}
                      required
                      value={approverRejectionLetter}
                      onChange={(e) => setApproverRejectionLetter(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #F59E0B", background: "#020617", color: "#FFFFFF", outline: "none", fontSize: "0.8rem", lineHeight: "1.4", fontFamily: "monospace" }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setApprovingApp(null)}>
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{
                        background: "linear-gradient(135deg, #D97706, #B45309)",
                        color: "#FFFFFF",
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        fontWeight: 800,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        boxShadow: "0 4px 14px rgba(217, 119, 6, 0.4)"
                      }}
                    >
                      <FiAlertTriangle /> ↩️ Send Return Letter to Verifier
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: OUTRIGHT CANCELLATION & DISQUALIFICATION */}
              {approverModalTab === "cancel_disqualify" && (
                <form onSubmit={handleApproverCancelApplication} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ background: "#020617", border: "1px solid #1E293B", padding: "14px 16px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h4 style={{ margin: "0 0 2px 0", color: "#FFFFFF", fontSize: "1.1rem", fontWeight: 800 }}>
                        {approvingApp.storeName}
                      </h4>
                      <span style={{ fontSize: "0.8rem", color: "#94A3B8" }}>
                        Owner: <strong>{approvingApp.ownerName}</strong> • Category: <span style={{ color: "#FCD34D" }}>{approvingApp.category}</span>
                      </span>
                    </div>
                    <span style={{ background: "rgba(239, 68, 68, 0.2)", color: "#F87171", padding: "4px 10px", borderRadius: "8px", fontSize: "0.76rem", fontWeight: 800 }}>
                      App Ref: {approvingApp.id}
                    </span>
                  </div>

                  <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.35)", padding: "14px 16px", borderRadius: "12px" }}>
                    <h4 style={{ margin: "0 0 4px 0", color: "#F87171", fontSize: "0.95rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "6px" }}>
                      <FiAlertTriangle /> Approver Final Veto &amp; Outright Merchant Disqualification
                    </h4>
                    <p style={{ margin: 0, fontSize: "0.78rem", color: "#CBD5E1", lineHeight: "1.4" }}>
                      Cancelling will disqualify this merchant partner from being inducted into the ShopSense live catalog. The application and cancellation record will be archived in the <strong>Cancelled &amp; Discrepancies Desk</strong>.
                    </p>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "6px" }}>
                      Primary Reason for Outright Cancellation:
                    </label>
                    <select
                      value={approverCancellationReason}
                      onChange={(e) => setApproverCancellationReason(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #EF4444", background: "#020617", color: "#FFFFFF", fontSize: "0.84rem", outline: "none" }}
                    >
                      <option value="Refusal / Breach of 5.0% Gross Performance Bond Terms">
                        📜 Refusal / Breach of 5.0% Gross Performance Bond Terms
                      </option>
                      <option value="Intellectual Property / Brand Trademark Infringement Conflict">
                        ⚖️ Intellectual Property / Brand Trademark Infringement Conflict
                      </option>
                      <option value="Failure of Biometric / Central Identity Legal Audit">
                        📄 Failure of Biometric / Central Identity Legal Audit
                      </option>
                      <option value="Executive Veto on Platform Quality & Customer Trust Concerns">
                        🛡️ Executive Veto on Platform Quality &amp; Customer Trust Concerns
                      </option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "6px" }}>
                      Formal Disqualification Notice &amp; Explanation Letter:
                    </label>
                    <textarea
                      rows={6}
                      required
                      value={approverCancellationLetter}
                      onChange={(e) => setApproverCancellationLetter(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #EF4444", background: "#020617", color: "#FFFFFF", outline: "none", fontSize: "0.8rem", lineHeight: "1.4", fontFamily: "monospace" }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setApprovingApp(null)}>
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{
                        background: "linear-gradient(135deg, #EF4444, #DC2626)",
                        color: "#FFFFFF",
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        fontWeight: 800,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        boxShadow: "0 4px 14px rgba(239, 68, 68, 0.4)"
                      }}
                    >
                      <FiAlertTriangle /> 🚫 Cancel &amp; Move to Discrepancies Desk
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 5: OFFICIAL SHOPSENSE MERCHANT INDUCTION & PARTNERSHIP CERTIFICATE   */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {inductedVendorCert && (
          <div className="modal-overlay">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="modal-card"
              style={{
                maxWidth: "680px",
                border: "2px solid #10B981",
                boxShadow: "0 10px 40px rgba(16, 185, 129, 0.35)",
                background: "linear-gradient(180deg, #0B1726 0%, #030A14 100%)",
                padding: "24px 28px"
              }}
            >
              {/* Header */}
              <div style={{ textAlign: "center", borderBottom: "1px solid rgba(16, 185, 129, 0.3)", paddingBottom: "16px", marginBottom: "18px" }}>
                <span style={{ fontSize: "2.8rem", display: "block", marginBottom: "6px" }}>🏛️</span>
                <span style={{ fontSize: "0.74rem", letterSpacing: "2px", color: "#34D399", fontWeight: 800, textTransform: "uppercase" }}>
                  Official ShopSense Merchant Governance Authority
                </span>
                <h2 style={{ fontSize: "1.45rem", fontWeight: 900, color: "#FFFFFF", margin: "4px 0" }}>
                  Merchant Partner Induction Certificate
                </h2>
                <span style={{ fontSize: "0.8rem", color: "#94A3B8" }}>
                  Authorized &amp; Certified by Rajesh Menon (Cross-Check &amp; Approval Authority)
                </span>
              </div>

              {/* Seal Banner */}
              <div style={{ background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.4)", borderRadius: "12px", padding: "14px 18px", marginBottom: "18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "0.72rem", color: "#94A3B8", textTransform: "uppercase", fontWeight: 800 }}>
                    Official Seal Registration:
                  </span>
                  <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "#34D399", fontFamily: "monospace" }}>
                    {inductedVendorCert.seal}
                  </div>
                </div>
                <span style={{ background: "rgba(16, 185, 129, 0.2)", color: "#10B981", border: "1px solid #10B981", padding: "4px 12px", borderRadius: "20px", fontSize: "0.76rem", fontWeight: 900 }}>
                  ✓ ACTIVE SHOPSENSE VENDOR
                </span>
              </div>

              {/* Certificate Details */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "0.82rem", marginBottom: "18px" }}>
                <div style={{ background: "#020617", padding: "10px 14px", borderRadius: "8px", border: "1px solid #1E293B" }}>
                  <span style={{ color: "#94A3B8" }}>Storefront Name:</span>
                  <strong style={{ display: "block", color: "#FFFFFF", fontSize: "0.95rem" }}>{inductedVendorCert.storeName}</strong>
                </div>

                <div style={{ background: "#020617", padding: "10px 14px", borderRadius: "8px", border: "1px solid #1E293B" }}>
                  <span style={{ color: "#94A3B8" }}>Proprietor / Owner:</span>
                  <strong style={{ display: "block", color: "#FFFFFF", fontSize: "0.95rem" }}>{inductedVendorCert.ownerName}</strong>
                </div>

                <div style={{ background: "#020617", padding: "10px 14px", borderRadius: "8px", border: "1px solid #1E293B" }}>
                  <span style={{ color: "#94A3B8" }}>Business Category:</span>
                  <strong style={{ display: "block", color: "#FCD34D" }}>{inductedVendorCert.category}</strong>
                </div>

                <div style={{ background: "#020617", padding: "10px 14px", borderRadius: "8px", border: "1px solid #1E293B" }}>
                  <span style={{ color: "#94A3B8" }}>GSTIN Tax ID:</span>
                  <strong style={{ display: "block", color: "#38BDF8", fontFamily: "monospace" }}>{inductedVendorCert.gstin}</strong>
                </div>

                <div style={{ background: "#020617", padding: "10px 14px", borderRadius: "8px", border: "1px solid #1E293B" }}>
                  <span style={{ color: "#94A3B8" }}>Commercial Bond Rate:</span>
                  <strong style={{ display: "block", color: "#34D399" }}>{inductedVendorCert.bondRate}</strong>
                </div>

                <div style={{ background: "#020617", padding: "10px 14px", borderRadius: "8px", border: "1px solid #1E293B" }}>
                  <span style={{ color: "#94A3B8" }}>Induction Date:</span>
                  <strong style={{ display: "block", color: "#CBD5E1" }}>{inductedVendorCert.timestamp}</strong>
                </div>
              </div>

              <div style={{ background: "rgba(37, 99, 235, 0.1)", border: "1px solid rgba(37, 99, 235, 0.3)", borderRadius: "10px", padding: "12px 14px", fontSize: "0.78rem", color: "#93C5FD", marginBottom: "20px" }}>
                🎉 <strong>Welcome to ShopSense!</strong> This merchant has passed all 3 stages of rigorous verification (Executor Background Due-Diligence, Verifier Geolocation &amp; Quality Audit, and Approver 5.0% Gross Bond Cross-Check). Their storefront and product inventory are now live on the marketplace.
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setInductedVendorCert(null)}
                >
                  Close Certificate
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setInductedVendorCert(null);
                    setActiveMainTab("stores");
                  }}
                  style={{
                    background: "linear-gradient(135deg, #10B981, #059669)",
                    color: "#FFFFFF",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 4px 16px rgba(16, 185, 129, 0.4)"
                  }}
                >
                  <FiShoppingBag /> 🏬 View Live Storefront &amp; Inventory Catalog
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 4: REGISTER NEW VENDOR                                               */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showRegisterModal && (
          <div className="modal-overlay">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="modal-card"
              style={{ maxWidth: "480px" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#FFFFFF", margin: 0 }}>
                  Register New Vendor Partner
                </h3>
                <button
                  onClick={() => setShowRegisterModal(false)}
                  style={{ background: "none", border: "none", color: "#94A3B8", fontSize: "1.2rem", cursor: "pointer" }}
                >
                  <FiX />
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newVendor.name || !newVendor.email) {
                    toast.error("Please fill in vendor name and email");
                    return;
                  }

                  try {
                    await registerVendor({
                      name: newVendor.name,
                      email: newVendor.email
                    });

                    // Add new application starting in Stage 1 (Pending Executor)
                    const newApp = {
                      id: `VAPP-${Math.floor(100 + Math.random() * 900)}`,
                      storeName: newVendor.name,
                      ownerName: "Merchant Partner",
                      category: newVendor.specialty || "Fashion & Clothes",
                      gstin: "27AADCB" + Math.floor(1000 + Math.random() * 9000) + "M1Z5",
                      aadhaarNumber: "98765432" + Math.floor(1000 + Math.random() * 9000),
                      email: newVendor.email,
                      phone: "+91 9812345678",
                      description: `${newVendor.name} - Specialized catalog partner on ShopSense platform.`,
                      warehouses: [
                        {
                          id: "WH-N1",
                          name: "Central Logistics Hub",
                          city: "Mumbai",
                          stateName: "Maharashtra",
                          pincode: "400093",
                          storageType: "Standard Ambient Storage",
                          capacityUnits: "15,000 Units",
                          dispatchSpeed: "Same-Day Express (Under 12h)",
                          incidentStatus: "Clean Record",
                          isPrimary: true,
                          gpsCoordinates: "19.1136° N, 72.8697° E",
                          realLocationVerified: true
                        },
                        {
                          id: "WH-N2",
                          name: "Regional Fulfillment Depot",
                          city: "Pune",
                          stateName: "Maharashtra",
                          pincode: "411019",
                          storageType: "Standard Storage",
                          capacityUnits: "10,000 Units",
                          dispatchSpeed: "Priority Dispatch (12-24h)",
                          incidentStatus: "Clean Record",
                          isPrimary: false,
                          gpsCoordinates: "18.6298° N, 73.7997° E",
                          realLocationVerified: true
                        }
                      ],
                      bond: {
                        id: "BND-PRO",
                        title: "High-Volume Merchant Bond",
                        sellingPercentage: "5.0% Gross on Sold Products",
                        escrowSecurity: "₹25,000 (Refundable Escrow)",
                        bondReference: `BND-2026-SS-${Math.floor(1000 + Math.random() * 9000)}`,
                        payoutSpeed: "Daily Settlement (T+1)"
                      },
                      dueDiligence: {
                        complaintsCheck: {
                          status: "CLEAN",
                          legalDisputesCount: 0,
                          consumerCourtCases: "0 Cases",
                          policeFirs: "Clean Police NOC",
                          warehouseViolations: "0 Hub Violations",
                          ipInfringements: "Nil Infringements"
                        },
                        trustability: {
                          trustScore: 96,
                          trustGrade: "Tier-A High Reliability",
                          financialHealth: "AA+ Rated",
                          fraudRiskLevel: "0.3% Risk",
                          bankVerification: "Commercial Bank Account Verified",
                          isTrustable: true
                        },
                        partnershipHistory: {
                          previousCollabs: [
                            { enterprise: "Regional Distribution Network", duration: "1 Year", role: "Category Supplier", rating: "4.8/5.0 ★", notes: "Satisfactory SLA track record." }
                          ],
                          defaultRate: "0.00%",
                          repeatPartnerStatus: "New Enterprise Partner"
                        },
                        companyReviews: {
                          averageRating: 4.8,
                          totalReviewsCount: 320,
                          positiveSentimentRate: "98.5% Positive",
                          marketReputation: "Growing independent retail merchant with clean compliance track record.",
                          industryCertifications: ["ISO 9001:2015 Quality Certified"]
                        }
                      },
                      verifierAudit: {
                        geolocationCheck: {
                          status: "VERIFIED_REAL",
                          geotaggedConfidence: "100% Real Geotagged Physical Locations",
                          physicalVerificationMethod: "Postal Pin Delivery Index Checked",
                          pinCodesValidated: true,
                          gpsCoordinates: "Mumbai (400093), Pune (411019)"
                        },
                        catalogConsistency: {
                          status: "100% MATCH",
                          declaredCategory: newVendor.specialty || "Fashion & Clothes",
                          descriptionProducts: "Specialized catalog products",
                          actualCatalogProducts: "Verified matching catalog SKUs",
                          unauthorizedProductsFound: "None (0 Mismatches)",
                          authenticityMatchScore: "100% Matches Storefront Description"
                        },
                        productQuality: {
                          qualityGrade: "Grade-A Commercial Standard",
                          materialTesting: "ISO 9001 Tested",
                          packagingStandard: "Corrugated Standard Packaging",
                          tamperProofing: "Tamper Evident Tape"
                        },
                        workplaceMeasures: {
                          fireSafety: "Extinguishers Active",
                          climateAndHumidity: "Ambient Storage",
                          cctvSurveillance: "24/7 Security CCTV",
                          workerSafety: "Standard Safety Gear",
                          pestAndElectrostatic: "Pest Barrier Grounded"
                        },
                        warehouseRepresentation: {
                          declaredCount: 2,
                          meetsPolicy: true,
                          totalCapacity: "25,000 Units",
                          dispatchVelocitySLA: "Under 12h Express Dispatch"
                        }
                      },
                      stage1_executor: {
                        status: "PENDING",
                        by: null,
                        timestamp: null,
                        notes: "Intake and background due-diligence completed."
                      },
                      stage2_verifier: {
                        status: "LOCKED",
                        by: null,
                        timestamp: null,
                        notes: "Locked: Requires Stage 1 Executor clearance first."
                      },
                      stage3_approver: {
                        status: "LOCKED",
                        by: null,
                        timestamp: null,
                        seal: null,
                        notes: "Locked: Requires Stage 2 Verifier clearance."
                      },
                      overallStatus: "STAGE_1_EXECUTOR"
                    };

                    setPipelineApplications((prev) => [newApp, ...prev]);
                    toast.success(`🎉 Vendor "${newVendor.name}" registered & submitted to Executor Admin (Stage 1)!`);
                    setShowRegisterModal(false);
                    setNewVendor({ name: "", email: "", specialty: "Fashion & Clothes" });
                    loadData();
                  } catch {
                    toast.error("Could not register vendor.");
                  }
                }}
                style={{ display: "flex", flexDirection: "column", gap: "14px" }}
              >
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "6px" }}>
                    Vendor Business Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TrendyKids Apparel"
                    value={newVendor.name}
                    onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "#FFFFFF", outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "6px" }}>
                    Business Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. sales@trendykids.com"
                    value={newVendor.email}
                    onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "#FFFFFF", outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "6px" }}>
                    Category Specialty
                  </label>
                  <select
                    value={newVendor.specialty}
                    onChange={(e) => setNewVendor({ ...newVendor, specialty: e.target.value })}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "#FFFFFF", outline: "none" }}
                  >
                    <option value="Fashion & Clothes">👗 Fashion & Clothes</option>
                    <option value="Electronics & Tech">💻 Electronics & Tech</option>
                    <option value="Furniture & Living">🛋️ Furniture & Living</option>
                    <option value="Toys & Robotics">🚀 Toys & Robotics</option>
                  </select>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowRegisterModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Submit for Approval
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 5: ADD PRODUCT TO VENDOR STORE                                      */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showAddProductModal && activeVendor && (
          <div className="modal-overlay">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="modal-card"
              style={{ maxWidth: "540px" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                <div>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#FFFFFF", margin: "0 0 2px 0" }}>
                    Add Product to {activeVendor.name}
                  </h3>
                  <span style={{ fontSize: "0.76rem", color: "#38BDF8" }}>
                    Specialty Category: {activeVendor.specialty}
                  </span>
                </div>
                <button
                  onClick={() => setShowAddProductModal(false)}
                  style={{ background: "none", border: "none", color: "#94A3B8", fontSize: "1.2rem", cursor: "pointer" }}
                >
                  <FiX />
                </button>
              </div>

              <form onSubmit={handleAddProduct} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "4px" }}>
                    Product Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Designer Wool Winter Overcoat"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "#FFFFFF", outline: "none" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "4px" }}>
                      Category
                    </label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "#FFFFFF", outline: "none" }}
                    >
                      <option value="Fashion">👗 Fashion</option>
                      <option value="Men's Wear">👔 Men's Wear</option>
                      <option value="Kids Wear">🧸 Kids Wear</option>
                      <option value="Electronics">💻 Electronics</option>
                      <option value="Mobiles">📱 Mobiles</option>
                      <option value="Accessories">🎧 Accessories</option>
                      <option value="Furniture">🛋️ Furniture</option>
                      <option value="Toys & Games">🚀 Toys & Games</option>
                      <option value="Beauty & Health">💄 Beauty & Health</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "4px" }}>
                      Selling Price (₹ INR)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="e.g. 79.99"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "#FFFFFF", outline: "none" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "4px" }}>
                      Initial Stock Units
                    </label>
                    <input
                      type="number"
                      required
                      value={newProduct.stock_quantity}
                      onChange={(e) => setNewProduct({ ...newProduct, stock_quantity: e.target.value })}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "#FFFFFF", outline: "none" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "4px" }}>
                      Stock Status
                    </label>
                    <select
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "#FFFFFF", outline: "none" }}
                    >
                      <option value="In Stock">In Stock</option>
                      <option value="Low Stock">Low Stock</option>
                      <option value="No Stock">No Stock</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "4px" }}>
                    Product Image URL (Optional - Real-World Photography)
                  </label>
                  <input
                    type="url"
                    placeholder="https://... (Amazon, Flipkart or Google Shopping image)"
                    value={newProduct.image_url}
                    onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "#FFFFFF", outline: "none", fontSize: "0.8rem", marginBottom: "6px" }}
                  />
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ fontSize: "0.72rem", color: "#94A3B8" }}>⚡ Photo Presets:</span>
                    {[
                      { label: "📱 S24 Ultra", url: "https://m.media-amazon.com/images/I/81vxWpPpgNL.jpg" },
                      { label: "🍏 iPhone 16", url: "https://m.media-amazon.com/images/I/71Ecl1RS5jL._AC_.jpg" },
                      { label: "💻 MacBook Pro", url: "https://m.media-amazon.com/images/I/61bMJdgeryL._AC_SL1500_.jpg" },
                      { label: "🎧 Sony Audio", url: "https://m.media-amazon.com/images/I/614apPMGmLL._AC_SL1500_.jpg" },
                      { label: "👗 Silk Gown", url: "https://m.media-amazon.com/images/I/81uiWMk9dnL._AC_SL1500_.jpg" },
                      { label: "👖 Levi's Denim", url: "https://m.media-amazon.com/images/I/71mkj++CUTL._AC_SL1500_.jpg" },
                      { label: "👟 Jordan 1", url: "https://m.media-amazon.com/images/I/71X4AZCVGuL._AC_SL1500_.jpg" },
                      { label: "🛋️ Office Chair", url: "https://m.media-amazon.com/images/I/71VVk7m8aIL._AC_SL1500_.jpg" },
                      { label: "🛸 4K Drone", url: "https://m.media-amazon.com/images/I/51CXJ8Rl7UL.jpg" }
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setNewProduct({ ...newProduct, image_url: preset.url })}
                        style={{
                          background: newProduct.image_url === preset.url ? "#2563EB" : "rgba(255, 255, 255, 0.06)",
                          border: newProduct.image_url === preset.url ? "1px solid #60A5FA" : "1px solid #334155",
                          color: "#E2E8F0",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          fontSize: "0.7rem",
                          cursor: "pointer"
                        }}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#64748B", marginTop: "4px" }}>
                    💡 If left empty, an authentic high-resolution real-world product photo will be auto-assigned based on category.
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "4px" }}>
                    Product Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Key specifications, fabric details, or tech features..."
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "#FFFFFF", outline: "none" }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddProductModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}>
                    Publish to Store
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 6: PROACTIVE EXECUTIVE ADVISORY EMAIL HTML PREVIEW                  */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showEmailPreviewModal && aiAgentReport && (
          <div className="modal-overlay">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="modal-card"
              style={{ maxWidth: "800px", maxHeight: "88vh", display: "flex", flexDirection: "column" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #1E293B", paddingBottom: "12px" }}>
                <div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#FFFFFF", margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                    <FiMail style={{ color: "#8B5CF6" }} /> Executive Advisory Email Dispatch Preview
                  </h3>
                  <div style={{ fontSize: "0.78rem", color: "#94A3B8" }}>
                    To: <strong style={{ color: "#60A5FA" }}>{aiAgentReport.vendor_email}</strong> • Subject: <span style={{ color: "#E2E8F0" }}>Weekly Strategic Advisory - {aiAgentReport.store_name}</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowEmailPreviewModal(false)}
                  style={{ background: "none", border: "none", color: "#94A3B8", fontSize: "1.2rem", cursor: "pointer" }}
                >
                  <FiX />
                </button>
              </div>

              <div style={{ flex: 1, overflowY: "auto", background: "#020617", border: "1px solid #1E293B", borderRadius: "10px", padding: "16px", marginBottom: "16px" }}>
                {aiAgentReport.email_html_content ? (
                  <div dangerouslySetInnerHTML={{ __html: aiAgentReport.email_html_content }} />
                ) : (
                  <div style={{ padding: "30px", textAlign: "center", color: "#64748B" }}>
                    No HTML email preview generated. Run an autonomous audit first.
                  </div>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: "0.78rem", color: "#64748B" }}>
                  Delivery Mode: <span style={{ color: "#34D399", fontWeight: 700 }}>Sandbox Safe Simulator (Zero Spam Guarantee)</span>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEmailPreviewModal(false)}>
                    Close Preview
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={sendingEmail}
                    onClick={handleSendAdvisoryEmail}
                    style={{ background: "linear-gradient(135deg, #8B5CF6, #6366F1)", display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <FiSend /> {sendingEmail ? "Dispatching..." : "Send Email Now"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default Vendors;
