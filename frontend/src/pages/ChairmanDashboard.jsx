import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiShield,
  FiUsers,
  FiCheckCircle,
  FiXCircle,
  FiUserCheck,
  FiUserPlus,
  FiSend,
  FiMessageSquare,
  FiClipboard,
  FiActivity,
  FiAward,
  FiFileText,
  FiDownload,
  FiBookOpen,
  FiMapPin,
  FiMail,
  FiPhone,
  FiPlus,
  FiClock,
  FiCheck,
  FiSearch,
  FiBox,
  FiBriefcase,
  FiChevronRight,
  FiTrendingUp,
  FiDollarSign,
  FiCalendar,
  FiAlertTriangle,
  FiEye,
  FiRefreshCw
} from "react-icons/fi";
import { toast } from "react-toastify";
import Header from "../components/Header";
import StatsCard from "../components/StatsCard";
import {
  registerVendor,
  getVendorPipeline,
  executorApproveStage1,
  executorCancelStage1,
  verifierApproveStage2,
  verifierReturnStage2,
  approverSealStage3,
  approverReturnStage3,
  chairmanFinalApprove,
  chairmanReject
} from "../services/api";

// Initial Demo Admin Applicant Requests with Full Resumes
export const initialAdminApplicants = [
  {
    id: "ADM-APP-201",
    fullName: "Vikas Sharma",
    userName: "vikas_sharma",
    email: "vikas.sharma@shopsense.com",
    phone: "+91 9876501122",
    aadhaarNumber: "987654320011",
    gender: "Male",
    requestedRole: "executor",
    requestedRoleTitle: "Type 1: System Operations & Legal Intake Executor",
    experience: "5 years experience in corporate due-diligence, vendor risk assessment, and fraud detection at Flipkart.",
    status: "PENDING", // 'PENDING' | 'APPROVED' | 'REJECTED'
    appliedDate: "2026-08-15 14:30",
    assignedRole: null,
    assignedRoleTitle: null,
    approvedDate: null,
    chairmanNotes: null,
    resume: {
      title: "Senior Enterprise Supply Chain & Regulatory Due-Diligence Specialist",
      summary: "Over 5+ years specializing in vendor due-diligence, corporate litigation database scanning, police FIR investigations, and trustability scoring across Tier-1 eCommerce marketplaces.",
      education: "MBA in Operations Management (IIM Lucknow, 2019) • B.Tech in Computer Science (NIT Jaipur, 2016)",
      certifications: ["Certified Fraud Examiner (CFE)", "ISO 27001 Information Security Auditor", "Six Sigma Green Belt"],
      skills: ["e-Courts Litigation Database Scanning", "MCA Regulatory Records Audit", "Corporate Trustability Scoring", "Police Complaints & Dispute Screening", "Supply Chain Integrity"],
      workExperience: [
        {
          company: "Flipkart Internet Pvt Ltd",
          role: "Senior Associate - Seller Risk & Compliance Intake",
          duration: "2021 - 2026 (5 Years)",
          responsibilities: "Audited legal intake of 4,500+ commercial vendors. Scanned corporate registry databases for disputes and executed automated fraud screening."
        },
        {
          company: "Tata Consultancy Services (TCS)",
          role: "Supply Chain Risk Analyst",
          duration: "2019 - 2021 (2 Years)",
          responsibilities: "Built automated risk assessment templates for enterprise retail procurement across APAC."
        }
      ],
      attachedFileName: "Resume_Vikas_Sharma_CV.pdf",
      attachedFileSize: "2.4 MB (Verified Cryptographic Hash)"
    }
  },
  {
    id: "ADM-APP-202",
    fullName: "Priya Nair",
    userName: "priya_nair",
    email: "priya.nair@shopsense.com",
    phone: "+91 9876502233",
    aadhaarNumber: "987654320022",
    gender: "Female",
    requestedRole: "verifier",
    requestedRoleTitle: "Type 2: Compliance & Physical Geolocation Verifier",
    experience: "4 years as Senior Supply Chain Auditor at Amazon India specializing in warehouse safety and ISO certifications.",
    status: "PENDING",
    appliedDate: "2026-08-16 09:15",
    assignedRole: null,
    assignedRoleTitle: null,
    approvedDate: null,
    chairmanNotes: null,
    resume: {
      title: "Senior Geolocation Compliance & Multi-Warehouse Facility Auditor",
      summary: "4 years as Senior Supply Chain Auditor at Amazon India directing physical cleanroom verification, drone GPS telemetry checking, and multi-warehouse safety regulations.",
      education: "M.Tech in Industrial Engineering (IIT Bombay, 2020) • B.E. in Production Engineering (VJTI Mumbai, 2018)",
      certifications: ["Certified Supply Chain Professional (CSCP)", "ISO 9001:2015 Quality Lead Auditor", "FM-200 Workplace Safety Certificate"],
      skills: ["Physical Geolocation (Real vs Fake Hubs)", "Drone Airspace & GPS Telemetry", "Aadhaar KYC Auditing", "Workplace Safety & Fire Grid Inspection", "Cleanroom Humidity & ESD Control"],
      workExperience: [
        {
          company: "Amazon India Fulfillment Operations",
          role: "Senior Supply Chain & Facility Compliance Auditor",
          duration: "2022 - 2026 (4 Years)",
          responsibilities: "Audited 120+ fulfillment centers across Western India. Implemented drone GPS verification protocols preventing fake warehouse claims."
        },
        {
          company: "DHL Supply Chain India",
          role: "Quality & Workplace Safety Inspector",
          duration: "2020 - 2022 (2 Years)",
          responsibilities: "Led ISO 9001 and OSHA compliance inspections across multi-tier regional distribution hubs."
        }
      ],
      attachedFileName: "Resume_Priya_Nair_CV.pdf",
      attachedFileSize: "3.1 MB (Verified Cryptographic Hash)"
    }
  },
  {
    id: "ADM-APP-203",
    fullName: "Arvind Swaminathan",
    userName: "arvind_swami",
    email: "arvind.s@shopsense.com",
    phone: "+91 9876503344",
    aadhaarNumber: "987654320033",
    gender: "Male",
    requestedRole: "approver",
    requestedRoleTitle: "Type 3: Commercial Performance Bond & Final Approver Authority",
    experience: "7 years in commercial banking & merchant escrow contracts at HDFC Bank. Specialist in merchant bond governance.",
    status: "PENDING",
    appliedDate: "2026-08-16 11:45",
    assignedRole: null,
    assignedRoleTitle: null,
    approvedDate: null,
    chairmanNotes: null,
    resume: {
      title: "Commercial Banking, Escrow Contracts & 5.0% Performance Bond Authority",
      summary: "7 years directing commercial banking, merchant escrow accounts, and 5.0% gross performance bond governance at HDFC Bank and Razorpay Merchant Services.",
      education: "Chartered Financial Analyst (CFA Charterholder) • MBA in Finance (XLRI Jamshedpur, 2017) • B.Com (Hons) (Loyola College, 2014)",
      certifications: ["Certified Anti-Money Laundering Specialist (CAMS)", "Commercial Escrow & Merchant Law Diploma", "Financial Risk Manager (FRM)"],
      skills: ["5.0% Gross Performance Bond Governance", "Merchant Escrow Account Underwriting", "Final Merchant Seal Authorization", "Daily T+1 Settlement Verification", "Commercial Contract Law"],
      workExperience: [
        {
          company: "HDFC Bank Commercial Banking Group",
          role: "Assistant Vice President - Merchant Escrow & Risk",
          duration: "2020 - 2026 (6 Years)",
          responsibilities: "Governed performance bond covenants and merchant escrow reserves for over 3,000 corporate eCommerce sellers with zero default loss."
        },
        {
          company: "ICICI Bank Corporate",
          role: "Merchant Credit & Risk Underwriter",
          duration: "2017 - 2020 (3 Years)",
          responsibilities: "Evaluated corporate balance sheets and structured vendor security deposits and settlement schedules."
        }
      ],
      attachedFileName: "Resume_Arvind_Swaminathan_CV.pdf",
      attachedFileSize: "2.9 MB (Verified Cryptographic Hash)"
    }
  }
];

// Rich Pool of Additional Unique Admin Applicant Templates for Auto-Replenishment in Chairman Queue
export const additionalAdminApplicantPool = [
  {
    id: "ADM-APP-204",
    fullName: "Meera Krishnan",
    userName: "meera_krishnan",
    email: "meera.k@shopsense.com",
    phone: "+91 9876504455",
    aadhaarNumber: "987654320044",
    gender: "Female",
    requestedRole: "verifier",
    requestedRoleTitle: "Type 2: Compliance & Physical Geolocation Verifier",
    experience: "6 years leading geolocation physical inspections, cleanroom verification, and supply chain telemetry at Delhivery and Flipkart.",
    status: "PENDING",
    appliedDate: new Date().toLocaleString(),
    assignedRole: null,
    assignedRoleTitle: null,
    approvedDate: null,
    chairmanNotes: null,
    resume: {
      title: "Senior Supply Chain Telemetry & Geolocation Audit Lead",
      summary: "6 years leading geolocation physical inspections, cleanroom verification, and supply chain telemetry at Delhivery and Flipkart. Specialist in multi-tier fulfillment hub audits.",
      education: "M.Tech in Industrial Engineering (IIT Madras, 2019) • B.Tech in Mechanical Engineering (NIT Calicut, 2017)",
      certifications: ["Certified Supply Chain Professional (CSCP)", "ISO 9001:2015 Lead Auditor", "FM-200 Fire Safety Inspector"],
      skills: ["GPS Geolocation Audits", "Drone Telemetry Verification", "Warehouse Workplace Safety", "Cleanroom Humidity & ESD Checks", "Aadhaar KYC Verification"],
      workExperience: [
        {
          company: "Delhivery Corporate Fulfillment",
          role: "National Warehouse Audit Lead",
          duration: "2021 - Present (3 Years)",
          responsibilities: "Conducted physical audits across 350+ fulfillment centers in Southern and Western India."
        },
        {
          company: "Flipkart Supply Chain",
          role: "Facility Compliance Auditor",
          duration: "2018 - 2021 (3 Years)",
          responsibilities: "Audited warehouse workplace safety, CCTV surveillance, and fire safety systems."
        }
      ],
      attachedFileName: "Resume_Meera_Krishnan_CV.pdf",
      attachedFileSize: "2.7 MB (Verified Hash)"
    }
  },
  {
    id: "ADM-APP-205",
    fullName: "Karthik Nambiar",
    userName: "karthik_nambiar",
    email: "karthik.n@shopsense.com",
    phone: "+91 9876505566",
    aadhaarNumber: "987654320055",
    gender: "Male",
    requestedRole: "approver",
    requestedRoleTitle: "Type 3: Commercial Performance Bond & Final Approver Authority",
    experience: "8+ years in commercial banking, merchant escrow settlement, and 5.0% performance bond enforcement at ICICI Corporate Banking and Razorpay.",
    status: "PENDING",
    appliedDate: new Date().toLocaleString(),
    assignedRole: null,
    assignedRoleTitle: null,
    approvedDate: null,
    chairmanNotes: null,
    resume: {
      title: "Commercial Escrow & Merchant Performance Bond Governance Specialist",
      summary: "8+ years in commercial banking, merchant escrow settlement, and 5.0% performance bond enforcement at ICICI Corporate Banking and Razorpay.",
      education: "MBA in Finance & Risk Governance (XLRI Jamshedpur, 2017) • Chartered Financial Analyst (CFA Charterholder)",
      certifications: ["Certified Anti-Money Laundering Specialist (CAMS)", "Merchant Contract Law Certification"],
      skills: ["5.0% Gross Bond Review", "Escrow Contract Enforcement", "Merchant Seal Authorization", "T+1 Payout Settlement Audits", "Financial Fraud Mitigation"],
      workExperience: [
        {
          company: "Razorpay Enterprise Merchant Desk",
          role: "Senior Bond Governance Manager",
          duration: "2020 - Present (4 Years)",
          responsibilities: "Structured and enforced escrow security agreements for over 2,500 enterprise merchants."
        },
        {
          company: "ICICI Corporate Banking",
          role: "Merchant Risk Analyst",
          duration: "2016 - 2020 (4 Years)",
          responsibilities: "Managed commercial risk underwriting and escrow reserves."
        }
      ],
      attachedFileName: "Resume_Karthik_Nambiar_CV.pdf",
      attachedFileSize: "3.2 MB (Verified Hash)"
    }
  },
  {
    id: "ADM-APP-206",
    fullName: "Rohan Singhania",
    userName: "rohan_singhania",
    email: "rohan.s@shopsense.com",
    phone: "+91 9876506677",
    aadhaarNumber: "987654320066",
    gender: "Male",
    requestedRole: "executor",
    requestedRoleTitle: "Type 1: System Operations & Legal Intake Executor",
    experience: "7 years forensic background investigation and corporate litigation audits at PwC India and Ministry of Corporate Affairs (MCA) advisory cell.",
    status: "PENDING",
    appliedDate: new Date().toLocaleString(),
    assignedRole: null,
    assignedRoleTitle: null,
    approvedDate: null,
    chairmanNotes: null,
    resume: {
      title: "Corporate Forensic Investigator & Legal Complaints Scanner Lead",
      summary: "7 years forensic background investigation and corporate litigation audits at PwC India and Ministry of Corporate Affairs (MCA) advisory cell.",
      education: "LL.B (National Law School of India University, NLSIU Bangalore, 2016) • B.Com (Hons) (SRCC Delhi, 2013)",
      certifications: ["Certified Fraud Examiner (CFE)", "Corporate Law Compliance Specialist"],
      skills: ["e-Courts Litigation Database Scanning", "Police FIR & Disputes Clearance", "Corporate Trustability Scoring", "MCA Registry Investigation", "Contract Risk Analysis"],
      workExperience: [
        {
          company: "PwC India Forensic Services",
          role: "Associate Director - Vendor Integrity & Due Diligence",
          duration: "2019 - Present (5 Years)",
          responsibilities: "Led background screenings for high-profile mergers and e-commerce vendor networks."
        },
        {
          company: "Ministry of Corporate Affairs Advisory Cell",
          role: "Legal Compliance Investigator",
          duration: "2016 - 2019 (3 Years)",
          responsibilities: "Investigated corporate dispute filings and compliance infractions."
        }
      ],
      attachedFileName: "Resume_Rohan_Singhania_CV.pdf",
      attachedFileSize: "2.8 MB (Verified Hash)"
    }
  },
  {
    id: "ADM-APP-207",
    fullName: "Sneha Sen Gupta",
    userName: "sneha_sengupta",
    email: "sneha.sg@shopsense.com",
    phone: "+91 9876507788",
    aadhaarNumber: "987654320077",
    gender: "Female",
    requestedRole: "verifier",
    requestedRoleTitle: "Type 2: Compliance & Physical Geolocation Verifier",
    experience: "6 years at Myntra & Flipkart directing apparel and consumer goods quality inspection laboratories and regional dispatch yards.",
    status: "PENDING",
    appliedDate: new Date().toLocaleString(),
    assignedRole: null,
    assignedRoleTitle: null,
    approvedDate: null,
    chairmanNotes: null,
    resume: {
      title: "Fulfillment Safety & Product Authenticity Verification Lead",
      summary: "6 years at Myntra & Flipkart directing apparel and consumer goods quality inspection laboratories and regional dispatch yards.",
      education: "M.S. in Quality Management (BITS Pilani, 2018) • B.Tech in Textile Technology (IIT Delhi, 2016)",
      certifications: ["Six Sigma Black Belt", "ISO 14001 Environmental Auditor", "BIS Lab Safety Certification"],
      skills: ["Product Authenticity Scoring", "Workplace Safety Inspection", "Fabric & Hardware Testing", "Physical Facility Audits", "Cleanroom Climate Control"],
      workExperience: [
        {
          company: "Myntra Quality Logistics",
          role: "Senior Quality & Compliance Manager",
          duration: "2020 - Present (4 Years)",
          responsibilities: "Managed product quality verification and warehouse safety compliance across 18 regional hubs."
        },
        {
          company: "Flipkart Quality Labs",
          role: "Quality Assurance Specialist",
          duration: "2018 - 2020 (2 Years)",
          responsibilities: "Conducted material durability tests and authentic SKU verification."
        }
      ],
      attachedFileName: "Resume_Sneha_SenGupta_CV.pdf",
      attachedFileSize: "2.5 MB (Verified Hash)"
    }
  },
  {
    id: "ADM-APP-208",
    fullName: "Abhishek Mukherjee",
    userName: "abhishek_mukherjee",
    email: "abhishek.m@shopsense.com",
    phone: "+91 9876508899",
    aadhaarNumber: "987654320088",
    gender: "Male",
    requestedRole: "approver",
    requestedRoleTitle: "Type 3: Commercial Performance Bond & Final Approver Authority",
    experience: "9 years in fintech banking and high-volume merchant escrow underwriting at HDFC Bank and Paytm Payments Bank.",
    status: "PENDING",
    appliedDate: new Date().toLocaleString(),
    assignedRole: null,
    assignedRoleTitle: null,
    approvedDate: null,
    chairmanNotes: null,
    resume: {
      title: "Senior Commercial Risk & Merchant Contract Authority",
      summary: "9 years in fintech banking and high-volume merchant escrow underwriting at HDFC Bank and Paytm Payments Bank.",
      education: "Chartered Accountant (ICAI, 2015) • B.Com (St. Xavier's College Kolkata, 2012)",
      certifications: ["Fellow Chartered Accountant (FCA)", "Certified Financial Risk Manager (FRM)"],
      skills: ["Commercial Bond Governance", "Risk Underwriting", "Merchant Seal Approval", "Regulatory Compliance", "Escrow Vault Management"],
      workExperience: [
        {
          company: "Paytm Payments Bank Corporate",
          role: "VP - Merchant Escrow & Settlement Governance",
          duration: "2018 - Present (6 Years)",
          responsibilities: "Authorized performance bonds and managed ₹400 Cr escrow portfolio."
        },
        {
          company: "HDFC Bank",
          role: "Senior Credit Underwriter",
          duration: "2015 - 2018 (3 Years)",
          responsibilities: "Audited merchant balance sheets and verified tax filings."
        }
      ],
      attachedFileName: "Resume_Abhishek_Mukherjee_CV.pdf",
      attachedFileSize: "3.4 MB (Verified Hash)"
    }
  }
];

// Helper: Auto-generates the next distinct unique admin applicant to replenish the Chairman queue
export const generateNextUniqueAdminApplicant = (existingApplicants = []) => {
  const existingIds = new Set(existingApplicants.map((a) => a.id));
  const existingUsernames = new Set(existingApplicants.map((a) => (a.userName || "").toLowerCase().trim()));
  const existingEmails = new Set(existingApplicants.map((a) => (a.email || "").toLowerCase().trim()));

  // 1. Search in predefined additional pool for any unused template
  for (const template of additionalAdminApplicantPool) {
    if (
      !existingIds.has(template.id) &&
      !existingUsernames.has(template.userName.toLowerCase().trim()) &&
      !existingEmails.has(template.email.toLowerCase().trim())
    ) {
      const copy = JSON.parse(JSON.stringify(template));
      copy.appliedDate = new Date().toLocaleString();
      return copy;
    }
  }

  // 2. If all predefined templates exhausted, procedurally generate a unique new candidate
  let nextNum = 209;
  while (existingIds.has(`ADM-APP-${nextNum}`)) {
    nextNum++;
  }

  const proceduralCandidates = [
    { name: "Dr. Sandeep Vardhan", role: "executor", roleTitle: "Type 1: System Operations & Legal Intake Executor", domain: "Forensic Legal Investigation", exp: "8 years in corporate litigation & fraud detection at Deloitte India.", edu: "Ph.D in Corporate Law (NLSIU) • MBA (FMS Delhi)", certs: ["Certified Fraud Examiner", "ISO 27001 Auditor"] },
    { name: "Ananya Deshmukh", role: "verifier", roleTitle: "Type 2: Compliance & Physical Geolocation Verifier", domain: "Autonomous Telemetry & Facility Safety", exp: "5 years leading GPS geolocation & cleanroom inspections at Swiggy Instamart fulfillment hubs.", edu: "M.Tech (IIT Kharagpur) • B.Tech (COEP Pune)", certs: ["CSCP Supply Chain", "OSHA Safety Auditor"] },
    { name: "Raghavendra Hegde", role: "approver", roleTitle: "Type 3: Commercial Performance Bond & Final Approver Authority", domain: "Commercial Escrow & Merchant Bonds", exp: "7 years in commercial banking & merchant bond risk underwriting at Kotak Mahindra Bank.", edu: "CA (ICAI) • CFA Charterholder", certs: ["CAMS AML Specialist", "Commercial Escrow Diploma"] },
    { name: "Sunita Choudhury", role: "executor", roleTitle: "Type 1: System Operations & Legal Intake Executor", domain: "Corporate Trustability & Police Discrepancy Audits", exp: "6 years background screening and police complaint registry scanner at Ernst & Young.", edu: "LL.M (ILU) • B.Com (SRCC)", certs: ["Certified Compliance Officer", "MCA Legal Specialist"] },
    { name: "Tushar Banerjee", role: "verifier", roleTitle: "Type 2: Compliance & Physical Geolocation Verifier", domain: "Industrial Cleanroom & Warehouse Workplace Safety", exp: "6 years inspecting multi-tier warehouse logistics facilities at BlueDart Express.", edu: "M.S. (BITS Pilani) • B.Tech (Jadavpur Univ)", certs: ["Six Sigma Black Belt", "ISO 9001 Auditor"] }
  ];

  const candidate = proceduralCandidates[(nextNum - 209) % proceduralCandidates.length];
  const uniqueId = `ADM-APP-${nextNum}`;
  const uniqueFullName = nextNum > 213 ? `${candidate.name} (Applicant ${nextNum})` : candidate.name;
  const username = `${candidate.name.toLowerCase().replace(/[^a-z]/g, "_").replace(/__+/g, "_")}_${nextNum}`;
  const email = `${candidate.name.toLowerCase().replace(/[^a-z]/g, "")}${nextNum}@shopsense.com`;
  const phone = `+91 98765${String(nextNum).padStart(5, "0")}`;
  const aadhaar = `9876543${String(nextNum).padStart(5, "0")}`;

  return {
    id: uniqueId,
    fullName: uniqueFullName,
    userName: username,
    email: email,
    phone: phone,
    aadhaarNumber: aadhaar,
    gender: candidate.name.startsWith("Ananya") || candidate.name.startsWith("Sunita") ? "Female" : "Male",
    requestedRole: candidate.role,
    requestedRoleTitle: candidate.roleTitle,
    experience: candidate.exp,
    status: "PENDING",
    appliedDate: new Date().toLocaleString(),
    assignedRole: null,
    assignedRoleTitle: null,
    approvedDate: null,
    chairmanNotes: null,
    resume: {
      title: `${candidate.domain} Specialist`,
      summary: candidate.exp,
      education: candidate.edu,
      certifications: candidate.certs,
      skills: ["Regulatory Risk Audits", "eCommerce Merchant Lifecycle Governance", "Compliance Telemetry Verification", "National Security Standards"],
      workExperience: [
        {
          company: "Tier-1 Enterprise Logistics & Risk Bureau",
          role: `Senior ${candidate.domain} Lead`,
          duration: "2020 - Present (4+ Years)",
          responsibilities: candidate.exp
        }
      ],
      attachedFileName: `Resume_${candidate.name.replace(/[^a-zA-Z]/g, '_')}_CV.pdf`,
      attachedFileSize: "2.6 MB (Verified Hash)"
    }
  };
};

// Initial Tasks Assigned by Chairman Mounish to the 3 Admins
export const initialChairmanTasks = [
  {
    id: "TASK-801",
    targetAdmin: "executor",
    targetAdminName: "Executor Admin (System Operations)",
    title: "Expedite Due-Diligence for High-Volume Sports Equipment Vendors",
    description: "Scan corporate litigation database and verify zero pending FIRs for VAPP-105 (ApexFit Pro) and upcoming fitness brands. Ensure Tier-A trust score verification before dispatching to Verifier.",
    priority: "HIGH", // 'URGENT' | 'HIGH' | 'NORMAL'
    status: "IN_PROGRESS", // 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
    assignedDate: "2026-08-16 10:00",
    dueDate: "2026-08-17 18:00",
    completionNotes: ""
  },
  {
    id: "TASK-802",
    targetAdmin: "verifier",
    targetAdminName: "Verifier Admin (Compliance & KYC)",
    title: "Mandatory GPS Drone Telemetry Check for Bangalore Hubs",
    description: "Conduct double verification of physical cleanroom coordinates and FM-200 fire safety systems across all newly declared secondary fulfillment hubs in Bommanahalli & Whitefield.",
    priority: "URGENT",
    status: "IN_PROGRESS",
    assignedDate: "2026-08-16 11:30",
    dueDate: "2026-08-17 12:00",
    completionNotes: ""
  },
  {
    id: "TASK-803",
    targetAdmin: "approver",
    targetAdminName: "Approver Admin (Seal Authority)",
    title: "Verify 5.0% Gross Performance Bond Terms for Luxury Watch Merchants",
    description: "Ensure that all inducted luxury horology and high-value tech vendors strictly execute the daily settlement T+1 bond agreement and ₹25,000 escrow clause prior to issuing the official merchant seal.",
    priority: "NORMAL",
    status: "COMPLETED",
    assignedDate: "2026-08-15 16:00",
    dueDate: "2026-08-16 17:00",
    completionNotes: "All 5.0% performance bond clauses cross-checked and verified for active luxury partners."
  }
];

// Initial Direct Inquiries & Questions Asked by Chairman Mounish
export const initialChairmanInquiries = [
  {
    id: "INQ-501",
    targetAdmin: "verifier",
    targetAdminName: "Ananya Rao (Verifier Admin)",
    subject: "Clarification on VAPP-103 Surat Silk Warehouse Humidity Verification",
    question: "Ananya, please confirm if the multi-layer fabric preservation and fire safety sprinklers in Surat facility were physically inspected via drone telemetry or on-site field agent?",
    timestamp: "2026-08-16 12:10",
    status: "ANSWERED", // 'PENDING_REPLY' | 'ANSWERED'
    reply: "Chairman Mounish, our team verified both on-site GPS logs and the live CCTV stream from the Surat textile corridor. Fire NOC is valid until 2028 with 0 humidity variance flags.",
    replyTimestamp: "2026-08-16 12:45"
  },
  {
    id: "INQ-502",
    targetAdmin: "executor",
    targetAdminName: "Mounish Sai (Executor Desk)",
    subject: "Intake Velocity & Legal Checks SLA Review",
    question: "What is the average turnaround time for scanning police complaints and court registries for incoming vendor batches this week?",
    timestamp: "2026-08-16 14:00",
    status: "ANSWERED",
    reply: "Chairman, current turnaround is under 14 minutes per application with 100% automated API cross-referencing against the national e-Courts and MCA registry.",
    replyTimestamp: "2026-08-16 14:20"
  },
  {
    id: "INQ-503",
    targetAdmin: "approver",
    targetAdminName: "Rajesh Menon (Approver Admin)",
    subject: "5.0% Performance Bond Escrow Deposit Confirmation for Electronics Brands",
    question: "Rajesh, please confirm if the refundable ₹25,000 escrow security deposit was credited to the central ShopSense escrow vault before sealing VAPP-101 (TechWorld)?",
    timestamp: "2026-08-16 15:30",
    status: "PENDING_REPLY",
    reply: null,
    replyTimestamp: null
  }
];

export const ADMIN_APPLICANTS_KEY = "adminApplicantRequests_v1";
export const CHAIRMAN_TASKS_KEY = "chairmanAssignedTasks_v1";
export const CHAIRMAN_INQUIRIES_KEY = "chairmanInquiries_v1";

export default function ChairmanDashboard() {
  // Navigation Tabs for Chairman Executive Command Center
  const [activeTab, setActiveTab] = useState("admin_onboarding"); // 'admin_onboarding' | 'admins_oversight' | 'vendors_oversight' | 'task_assignment' | 'inquiries'

  // Admin Applicants State
  const [applicants, setApplicants] = useState(() => {
    try {
      const saved = localStorage.getItem(ADMIN_APPLICANTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialAdminApplicants;
  });

  // Tasks State
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem(CHAIRMAN_TASKS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialChairmanTasks;
  });

  // Inquiries State
  const [inquiries, setInquiries] = useState(() => {
    try {
      const saved = localStorage.getItem(CHAIRMAN_INQUIRIES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialChairmanInquiries;
  });

  // Pipeline Vendors State from backend
  const [pipelineApps, setPipelineApps] = useState([]);

  const fetchPipeline = async () => {
    try {
      const data = await getVendorPipeline();
      if (Array.isArray(data)) {
        const normalized = data.map((a) => ({
          ...a,
          id: a.app_ref || a.id,
          app_ref: a.app_ref || a.id,
          storeName: a.store_name || a.storeName || "Vendor Store",
          ownerName: a.owner_name || a.ownerName || "Merchant Owner",
          overallStatus: a.overall_status || a.overallStatus || "STAGE_1_EXECUTOR",
          overall_status: a.overall_status || a.overallStatus || "STAGE_1_EXECUTOR",
          category: a.category || "General",
          gstin: a.gstin || "N/A",
          email: a.email || "vendor@shopsense.com",
          stage1_status: a.stage1_status || "PENDING",
          stage2_status: a.stage2_status || "LOCKED",
          stage3_status: a.stage3_status || "LOCKED",
          stage4_status: a.stage4_status || "LOCKED",
        }));
        setPipelineApps(normalized);
      }
    } catch (err) {
      console.error("Failed to fetch vendor pipeline", err);
    }
  };

  useEffect(() => {
    fetchPipeline();
    let channel = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        channel = new BroadcastChannel("shopsense_live_pipeline");
        channel.onmessage = (event) => {
          if (event.data?.type === "STAGE_ADVANCED" || event.data?.type === "NEW_VENDOR_APPLICATION") {
            fetchPipeline();
          }
        };
      } catch (err) {
        console.warn("BroadcastChannel notice:", err);
      }
    }
    return () => {
      if (channel) channel.close();
    };
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(ADMIN_APPLICANTS_KEY, JSON.stringify(applicants));
  }, [applicants]);

  useEffect(() => {
    localStorage.setItem(CHAIRMAN_TASKS_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(CHAIRMAN_INQUIRIES_KEY, JSON.stringify(inquiries));
  }, [inquiries]);

  // Modal States
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [assignRoleChoice, setAssignRoleChoice] = useState("executor");
  const [chairmanApprovalNotes, setChairmanApprovalNotes] = useState("Authorized by Supreme Chairman Mounish. Credentials and access privileges granted.");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("Insufficient background verification credentials.");

  // Resume Modal State
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [activeResumeApplicant, setActiveResumeApplicant] = useState(null);

  // New Task Modal State
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTaskTarget, setNewTaskTarget] = useState("executor");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("HIGH");
  const [newTaskDueDate, setNewTaskDueDate] = useState("2026-08-18 18:00");

  // New Inquiry Modal State
  const [showNewInquiryModal, setShowNewInquiryModal] = useState(false);
  const [newInqTarget, setNewInqTarget] = useState("verifier");
  const [newInqSubject, setNewInqSubject] = useState("");
  const [newInqQuestion, setNewInqQuestion] = useState("");

  // Filter States - Defaults strictly to PENDING so assigned/rejected applicants automatically disappear from active intake
  const [applicantFilter, setApplicantFilter] = useState("PENDING");
  const [searchQuery, setSearchQuery] = useState("");

  // Approve Admin Applicant Handler (with auto-replenishment of new candidate example)
  const handleApproveApplicant = (e) => {
    if (e) e.preventDefault();
    const targetApp = selectedApplicant || activeResumeApplicant;
    if (!targetApp) return;

    const roleTitle =
      assignRoleChoice === "approver"
        ? "Type 3: Cross-Check & Vendor Approver Authority"
        : assignRoleChoice === "verifier"
        ? "Type 2: Compliance & KYC Verifier Admin"
        : "Type 1: System Operations Executor Admin";

    let updated = applicants.map((app) => {
      if (app.id === targetApp.id) {
        return {
          ...app,
          status: "APPROVED",
          assignedRole: assignRoleChoice,
          assignedRoleTitle: roleTitle,
          approvedDate: new Date().toLocaleString(),
          chairmanNotes: chairmanApprovalNotes || "Authorized and assigned by Supreme Chairman Mounish Sai."
        };
      }
      return app;
    });

    // Auto-generate next distinct unique admin applicant to replenish Chairman review queue
    const nextCandidate = generateNextUniqueAdminApplicant(updated);
    if (nextCandidate) {
      updated = [nextCandidate, ...updated];
    }

    setApplicants(updated);
    localStorage.setItem(ADMIN_APPLICANTS_KEY, JSON.stringify(updated));
    toast.success(`👑 Admin "${targetApp.fullName}" APPROVED as [${roleTitle}]! Removed from Pending Queue -> Moved to Approved Admins.`);
    setSelectedApplicant(null);
    setActiveResumeApplicant(null);
    setShowResumeModal(false);
  };

  // Reject Admin Applicant Handler (with auto-replenishment of new candidate example)
  const handleRejectApplicant = (e) => {
    if (e) e.preventDefault();
    const targetApp = selectedApplicant || activeResumeApplicant;
    if (!targetApp) return;

    let updated = applicants.map((app) => {
      if (app.id === targetApp.id) {
        return {
          ...app,
          status: "REJECTED",
          approvedDate: new Date().toLocaleString(),
          chairmanNotes: `Disqualified by Chairman Mounish: ${rejectionReason}`
        };
      }
      return app;
    });

    // Auto-generate next distinct unique admin applicant to replenish Chairman review queue
    const nextCandidate = generateNextUniqueAdminApplicant(updated);
    if (nextCandidate) {
      updated = [nextCandidate, ...updated];
    }

    setApplicants(updated);
    localStorage.setItem(ADMIN_APPLICANTS_KEY, JSON.stringify(updated));
    toast.error(`🚫 Admin Application for "${targetApp.fullName}" rejected! Removed from Pending Queue -> Moved to Rejected Archive.`);
    setSelectedApplicant(null);
    setActiveResumeApplicant(null);
    setShowRejectModal(false);
    setShowResumeModal(false);
  };

  // Create New Task Handler
  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskDesc.trim()) {
      toast.error("Please fill in task title and detailed directives.");
      return;
    }

    const targetName =
      newTaskTarget === "approver"
        ? "Approver Admin (Seal Authority)"
        : newTaskTarget === "verifier"
        ? "Verifier Admin (Compliance & KYC)"
        : "Executor Admin (System Operations)";

    const newTaskObj = {
      id: `TASK-${Math.floor(800 + Math.random() * 900)}`,
      targetAdmin: newTaskTarget,
      targetAdminName: targetName,
      title: newTaskTitle,
      description: newTaskDesc,
      priority: newTaskPriority,
      status: "PENDING",
      assignedDate: new Date().toLocaleString(),
      dueDate: newTaskDueDate,
      completionNotes: ""
    };

    const updated = [newTaskObj, ...tasks];
    setTasks(updated);
    toast.success(`📋 Directive dispatched to ${targetName}!`);
    setShowNewTaskModal(false);
    setNewTaskTitle("");
    setNewTaskDesc("");
  };

  // Create New Inquiry Handler
  const handleCreateInquiry = (e) => {
    e.preventDefault();
    if (!newInqSubject.trim() || !newInqQuestion.trim()) {
      toast.error("Please enter inquiry subject and question.");
      return;
    }

    const targetName =
      newInqTarget === "approver"
        ? "Rajesh Menon (Approver Admin)"
        : newInqTarget === "verifier"
        ? "Ananya Rao (Verifier Admin)"
        : "Mounish Sai (Executor Desk)";

    const newInqObj = {
      id: `INQ-${Math.floor(500 + Math.random() * 500)}`,
      targetAdmin: newInqTarget,
      targetAdminName: targetName,
      subject: newInqSubject,
      question: newInqQuestion,
      timestamp: new Date().toLocaleString(),
      status: "PENDING_REPLY",
      reply: null,
      replyTimestamp: null
    };

    const updated = [newInqObj, ...inquiries];
    setInquiries(updated);
    toast.success(`💬 Official Chairman Inquiry dispatched to ${targetName}!`);
    setShowNewInquiryModal(false);
    setNewInqSubject("");
    setNewInqQuestion("");
  };

  // Filtered applicants
  const filteredApplicants = useMemo(() => {
    return applicants.filter((app) => {
      const matchSearch =
        (app.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.id || "").toLowerCase().includes(searchQuery.toLowerCase());
      if (applicantFilter === "ALL") return matchSearch;
      return matchSearch && app.status === applicantFilter;
    });
  }, [applicants, applicantFilter, searchQuery]);

  // Metrics computation
  const pendingApplicantsCount = applicants.filter((a) => a.status === "PENDING").length;
  const approvedApplicantsCount = applicants.filter((a) => a.status === "APPROVED").length;
  const rejectedApplicantsCount = applicants.filter((a) => a.status === "REJECTED").length;
  const approvedAdminsCount = approvedApplicantsCount + 3; // +3 predefined core admins
  const isPendingChairman = (a) => {
    const ov = a.overallStatus || a.overall_status;
    const s3 = a.stage3_approver?.status || a.stage3_status;
    const s4 = a.stage4_status;
    return (
      ov === "STAGE_4_CHAIRMAN" ||
      ov === "PENDING_CHAIRMAN_APPROVAL" ||
      (s3 === "COMPLETED" && s4 !== "APPROVED" && ov !== "APPROVED_LIVE" && ov !== "APPROVED")
    );
  };

  const stage1ApprovedVendors = pipelineApps.filter((a) => (a.stage1_executor?.status || a.stage1_status) === "COMPLETED").length;
  const stage2ApprovedVendors = pipelineApps.filter((a) => (a.stage2_verifier?.status || a.stage2_status) === "COMPLETED").length;
  const stage3ApprovedVendors = pipelineApps.filter((a) => (a.stage3_approver?.status || a.stage3_status) === "COMPLETED" || (a.stage3_approver?.status || a.stage3_status) === "APPROVED" || (a.stage3_approver?.status || a.stage3_status) === "APPROVED_AND_FORWARDED").length;
  const pendingChairmanVendorsCount = pipelineApps.filter(isPendingChairman).length;
  const totalActiveStores = 12 + pipelineApps.filter((a) => (a.overallStatus || a.overall_status) === "APPROVED_LIVE" || (a.overallStatus || a.overall_status) === "APPROVED" || a.stage4_status === "APPROVED").length;

  const handleChairmanGrantAccess = async (appId, storeName, email) => {
    try {
      try {
        await chairmanFinalApprove(appId, {
          chairman_notes: "Supreme Chairman Mounish has authorized live vendor portal access and officially commissioned the store."
        });
      } catch (apiErr) {
        console.warn("Backend chairman approve notice:", apiErr);
      }

      try {
        await registerVendor({
          name: storeName,
          email: email || `vendor_${String(appId).toLowerCase()}@shopsense.com`
        });
      } catch (regErr) {
        console.warn("Vendor registration notice:", regErr);
      }
      
      const updated = pipelineApps.map(app => {
        if (app.id === appId || app.app_ref === appId) {
          return {
            ...app,
            overallStatus: "APPROVED_LIVE",
            overall_status: "APPROVED_LIVE",
            stage4_status: "APPROVED",
            chairman_approval: {
              status: "ACCESS_GRANTED",
              timestamp: new Date().toLocaleString()
            }
          };
        }
        return app;
      });
      
      setPipelineApps(updated);
      const PIPELINE_STORAGE_KEY = "vendorRegistrationPipeline_v7";
      localStorage.setItem(PIPELINE_STORAGE_KEY, JSON.stringify(updated));

      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        try {
          const bc = new BroadcastChannel("shopsense_live_pipeline");
          bc.postMessage({ type: "STAGE_ADVANCED", stage: 5, appRef: appId, timestamp: Date.now() });
          setTimeout(() => bc.close(), 100);
        } catch {}
      }

      await fetchPipeline();
      toast.success(`👑 PORTAL ACCESS GRANTED! "${storeName}" is now live and authorized for the ShopSense Vendor Portal.`);
    } catch (err) {
      toast.error("Failed to grant live portal access.");
      console.error(err);
    }
  };

  return (
    <div className="dashboard-container" style={{ paddingBottom: "60px" }}>
      {/* Supreme Chairman Executive Header */}
      <Header
        title="👑 Supreme Chairman & Managing Director Executive Command Center"
        subtitle="Mounish Sai — Ultimate Authority over All Admins, Vendor Governance & Enterprise Operations"
      />

      {/* Chairman Executive Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #1E1B4B 0%, #0F172A 50%, #172554 100%)",
          border: "1px solid #6366F1",
          borderRadius: "16px",
          padding: "20px 24px",
          marginBottom: "24px",
          boxShadow: "0 12px 30px rgba(99, 102, 241, 0.2)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.8rem",
              color: "#FFF",
              boxShadow: "0 4px 15px rgba(245, 158, 11, 0.4)"
            }}
          >
            👑
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h2 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 800, color: "#F8FAFC" }}>
                Mounish Sai
              </h2>
              <span
                style={{
                  background: "rgba(245, 158, 11, 0.15)",
                  color: "#FBBF24",
                  border: "1px solid rgba(245, 158, 11, 0.4)",
                  padding: "3px 10px",
                  borderRadius: "20px",
                  fontSize: "0.75rem",
                  fontWeight: 800
                }}
              >
                CHAIRMAN & SUPREME MANAGER
              </span>
            </div>
            <p style={{ margin: "4px 0 0", color: "#94A3B8", fontSize: "0.85rem" }}>
              Apex Governance Authority: Evaluating new admin applicant submissions, overseeing all 3 admins' execution performance, monitoring vendor approvals velocity, and assigning executive directives.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setShowNewTaskModal(true)}
            style={{
              background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
              color: "#FFF",
              border: "none",
              padding: "10px 18px",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)"
            }}
          >
            <FiPlus /> Assign New Work
          </button>
          <button
            onClick={() => setShowNewInquiryModal(true)}
            style={{
              background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
              color: "#FFF",
              border: "none",
              padding: "10px 18px",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)"
            }}
          >
            <FiMessageSquare /> Ask Question to Admin
          </button>
        </div>
      </div>

      {/* Top Executive Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "24px"
        }}
      >
        <StatsCard
          title="Pending Admin Applicants"
          value={pendingApplicantsCount}
          subtitle="Waiting for Chairman role assignment"
          icon={<FiUserPlus />}
          trend={pendingApplicantsCount > 0 ? "warning" : "positive"}
        />
        <StatsCard
          title="Active Approved Admins"
          value={approvedAdminsCount}
          subtitle="Governing 3 Sequential Tiers"
          icon={<FiUserCheck />}
          trend="positive"
        />
        <StatsCard
          title="Vendors Cleared Stage 1"
          value={stage1ApprovedVendors}
          subtitle="Executor Due-Diligence Cleared"
          icon={<FiCheckCircle />}
          trend="positive"
        />
        <StatsCard
          title="Vendors Cleared Stage 2"
          value={stage2ApprovedVendors}
          subtitle="Verifier Geolocation Audited"
          icon={<FiShield />}
          trend="positive"
        />
        <StatsCard
          title="Live Inducted Vendors"
          value={totalActiveStores}
          subtitle="5.0% Gross Performance Bond Sealed"
          icon={<FiAward />}
          trend="positive"
        />
      </div>

      {/* Chairman Navigation Suite Tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          borderBottom: "1px solid #334155",
          paddingBottom: "12px",
          marginBottom: "20px",
          overflowX: "auto"
        }}
      >
        <button
          onClick={() => setActiveTab("admin_onboarding")}
          style={{
            background: activeTab === "admin_onboarding" ? "#4F46E5" : "rgba(255, 255, 255, 0.05)",
            color: activeTab === "admin_onboarding" ? "#FFF" : "#94A3B8",
            border: activeTab === "admin_onboarding" ? "1px solid #6366F1" : "1px solid transparent",
            padding: "10px 18px",
            borderRadius: "10px",
            fontWeight: 700,
            fontSize: "0.86rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s ease"
          }}
        >
          <FiUserPlus /> New Admin Onboarding & Role Assignment
          {pendingApplicantsCount > 0 && (
            <span
              style={{
                background: "#EF4444",
                color: "#FFF",
                fontSize: "0.72rem",
                padding: "2px 7px",
                borderRadius: "10px",
                fontWeight: 800
              }}
            >
              {pendingApplicantsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("admins_oversight")}
          style={{
            background: activeTab === "admins_oversight" ? "#2563EB" : "rgba(255, 255, 255, 0.05)",
            color: activeTab === "admins_oversight" ? "#FFF" : "#94A3B8",
            border: activeTab === "admins_oversight" ? "1px solid #3B82F6" : "1px solid transparent",
            padding: "10px 18px",
            borderRadius: "10px",
            fontWeight: 700,
            fontSize: "0.86rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s ease"
          }}
        >
          <FiActivity /> 3-Admin Work Oversight & Audit Stream
        </button>

        <button
          onClick={() => setActiveTab("vendors_oversight")}
          style={{
            background: activeTab === "vendors_oversight" ? "#059669" : "rgba(255, 255, 255, 0.05)",
            color: activeTab === "vendors_oversight" ? "#FFF" : "#94A3B8",
            border: activeTab === "vendors_oversight" ? "1px solid #10B981" : "1px solid transparent",
            padding: "10px 18px",
            borderRadius: "10px",
            fontWeight: 700,
            fontSize: "0.86rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s ease"
          }}
        >
          <FiBox /> Vendor Approval Velocity & Stores
        </button>

        <button
          onClick={() => setActiveTab("vendor_portal_access")}
          style={{
            background: activeTab === "vendor_portal_access" ? "#DC2626" : "rgba(255, 255, 255, 0.05)",
            color: activeTab === "vendor_portal_access" ? "#FFF" : "#94A3B8",
            border: activeTab === "vendor_portal_access" ? "1px solid #EF4444" : "1px solid transparent",
            padding: "10px 18px",
            borderRadius: "10px",
            fontWeight: 700,
            fontSize: "0.86rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s ease"
          }}
        >
          <FiShield /> Final Portal Access Requests
          {pendingChairmanVendorsCount > 0 && (
            <span
              style={{
                background: "#EF4444",
                color: "#FFF",
                fontSize: "0.72rem",
                padding: "2px 7px",
                borderRadius: "10px",
                fontWeight: 800
              }}
            >
              {pendingChairmanVendorsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("task_assignment")}
          style={{
            background: activeTab === "task_assignment" ? "#D97706" : "rgba(255, 255, 255, 0.05)",
            color: activeTab === "task_assignment" ? "#FFF" : "#94A3B8",
            border: activeTab === "task_assignment" ? "1px solid #F59E0B" : "1px solid transparent",
            padding: "10px 18px",
            borderRadius: "10px",
            fontWeight: 700,
            fontSize: "0.86rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s ease"
          }}
        >
          <FiClipboard /> Assigned Directives ({tasks.length})
        </button>

        <button
          onClick={() => setActiveTab("inquiries")}
          style={{
            background: activeTab === "inquiries" ? "#7C3AED" : "rgba(255, 255, 255, 0.05)",
            color: activeTab === "inquiries" ? "#FFF" : "#94A3B8",
            border: activeTab === "inquiries" ? "1px solid #8B5CF6" : "1px solid transparent",
            padding: "10px 18px",
            borderRadius: "10px",
            fontWeight: 700,
            fontSize: "0.86rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s ease"
          }}
        >
          <FiMessageSquare /> Direct Admin Inquiries ({inquiries.length})
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: NEW ADMIN APPLICANTS ONBOARDING & ROLE ASSIGNMENT                  */}
      {/* ========================================================================= */}
      {activeTab === "admin_onboarding" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          {/* Segmented Admin View Selector & Search Controls */}
          <div
            style={{
              background: "#0F172A",
              border: "1px solid #1E293B",
              borderRadius: "14px",
              padding: "16px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "14px",
              marginBottom: "16px",
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.25)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#94A3B8" }}>Admin Desk View:</span>

              {/* 1. Pending Applicants Queue Button */}
              <button
                onClick={() => setApplicantFilter("PENDING")}
                style={{
                  background:
                    applicantFilter === "PENDING"
                      ? "linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)"
                      : "rgba(255, 255, 255, 0.06)",
                  color: applicantFilter === "PENDING" ? "#FFF" : "#CBD5E1",
                  border: applicantFilter === "PENDING" ? "1px solid #6366F1" : "1px solid rgba(255, 255, 255, 0.1)",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: applicantFilter === "PENDING" ? "0 4px 14px rgba(79, 70, 229, 0.3)" : "none",
                  transition: "all 0.2s"
                }}
              >
                <FiClock /> ⏳ Pending Applicants Queue
                <span
                  style={{
                    background: applicantFilter === "PENDING" ? "#EF4444" : "rgba(255, 255, 255, 0.15)",
                    color: "#FFF",
                    padding: "2px 7px",
                    borderRadius: "10px",
                    fontSize: "0.72rem",
                    fontWeight: 800
                  }}
                >
                  {pendingApplicantsCount}
                </span>
              </button>

              {/* 2. Approved Admins Roster Button */}
              <button
                onClick={() => setApplicantFilter("APPROVED")}
                style={{
                  background:
                    applicantFilter === "APPROVED"
                      ? "linear-gradient(135deg, #059669 0%, #047857 100%)"
                      : "rgba(255, 255, 255, 0.06)",
                  color: applicantFilter === "APPROVED" ? "#FFF" : "#CBD5E1",
                  border: applicantFilter === "APPROVED" ? "1px solid #10B981" : "1px solid rgba(255, 255, 255, 0.1)",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: applicantFilter === "APPROVED" ? "0 4px 14px rgba(5, 150, 105, 0.3)" : "none",
                  transition: "all 0.2s"
                }}
              >
                <FiCheckCircle /> ✅ Approved Admins Roster
                <span
                  style={{
                    background: applicantFilter === "APPROVED" ? "#10B981" : "rgba(255, 255, 255, 0.15)",
                    color: "#FFF",
                    padding: "2px 7px",
                    borderRadius: "10px",
                    fontSize: "0.72rem",
                    fontWeight: 800
                  }}
                >
                  {approvedApplicantsCount}
                </span>
              </button>

              {/* 3. Rejected Candidates Archive Button */}
              <button
                onClick={() => setApplicantFilter("REJECTED")}
                style={{
                  background:
                    applicantFilter === "REJECTED"
                      ? "linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)"
                      : "rgba(255, 255, 255, 0.06)",
                  color: applicantFilter === "REJECTED" ? "#FFF" : "#CBD5E1",
                  border: applicantFilter === "REJECTED" ? "1px solid #EF4444" : "1px solid rgba(255, 255, 255, 0.1)",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: applicantFilter === "REJECTED" ? "0 4px 14px rgba(220, 38, 38, 0.3)" : "none",
                  transition: "all 0.2s"
                }}
              >
                <FiXCircle /> 🚫 Rejected Candidates Archive
                <span
                  style={{
                    background: applicantFilter === "REJECTED" ? "#EF4444" : "rgba(255, 255, 255, 0.15)",
                    color: "#FFF",
                    padding: "2px 7px",
                    borderRadius: "10px",
                    fontSize: "0.72rem",
                    fontWeight: 800
                  }}
                >
                  {rejectedApplicantsCount}
                </span>
              </button>

              {/* 4. All Historical Records Button */}
              <button
                onClick={() => setApplicantFilter("ALL")}
                style={{
                  background: applicantFilter === "ALL" ? "#3B82F6" : "rgba(255, 255, 255, 0.06)",
                  color: applicantFilter === "ALL" ? "#FFF" : "#CBD5E1",
                  border: applicantFilter === "ALL" ? "1px solid #3B82F6" : "1px solid rgba(255, 255, 255, 0.1)",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.2s"
                }}
              >
                <FiFileText /> 📋 All Records ({applicants.length})
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", position: "relative" }}>
              <FiSearch style={{ position: "absolute", left: "10px", color: "#64748B" }} />
              <input
                type="text"
                placeholder="Search applicants by name, email, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: "#020617",
                  border: "1px solid #334155",
                  padding: "8px 12px 8px 32px",
                  borderRadius: "8px",
                  color: "#F8FAFC",
                  fontSize: "0.82rem",
                  width: "280px"
                }}
              />
            </div>
          </div>

          {/* Dynamic Explanatory Context Banner */}
          <div
            style={{
              background:
                applicantFilter === "PENDING"
                  ? "rgba(79, 70, 229, 0.1)"
                  : applicantFilter === "APPROVED"
                  ? "rgba(16, 185, 129, 0.1)"
                  : applicantFilter === "REJECTED"
                  ? "rgba(239, 68, 68, 0.1)"
                  : "rgba(59, 130, 246, 0.1)",
              border:
                applicantFilter === "PENDING"
                  ? "1px solid rgba(99, 102, 241, 0.3)"
                  : applicantFilter === "APPROVED"
                  ? "1px solid rgba(16, 185, 129, 0.3)"
                  : applicantFilter === "REJECTED"
                  ? "1px solid rgba(239, 68, 68, 0.3)"
                  : "1px solid rgba(59, 130, 246, 0.3)",
              borderRadius: "10px",
              padding: "12px 18px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "10px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "1.2rem" }}>
                {applicantFilter === "PENDING"
                  ? "⚡"
                  : applicantFilter === "APPROVED"
                  ? "👑"
                  : applicantFilter === "REJECTED"
                  ? "🚫"
                  : "📋"}
              </span>
              <div>
                <strong style={{ color: "#F8FAFC", fontSize: "0.88rem", display: "block" }}>
                  {applicantFilter === "PENDING"
                    ? "Pending Admin Intake Queue (Active Review)"
                    : applicantFilter === "APPROVED"
                    ? "Commissioned Administrative Officers Roster"
                    : applicantFilter === "REJECTED"
                    ? "Disqualified / Rejected Applicants Archive"
                    : "Complete Historical Admin Applicants Registry"}
                </strong>
                <span style={{ color: "#94A3B8", fontSize: "0.78rem" }}>
                  {applicantFilter === "PENDING"
                    ? "Applications waiting for Chairman review. When you approve (and assign a role) or reject an applicant, they are automatically removed from this queue and moved to the Approved Admins or Rejected Archive, and a new unique candidate is replenished."
                    : applicantFilter === "APPROVED"
                    ? "These applicants have been approved by Chairman Mounish and granted active operational administrative roles (Executor, Verifier, or Approver)."
                    : applicantFilter === "REJECTED"
                    ? "These applicants failed Chairman due-diligence criteria and were declined for administrative appointments."
                    : "Full historical database containing all pending, approved, and rejected candidate records."}
                </span>
              </div>
            </div>
            <div style={{ color: "#CBD5E1", fontSize: "0.8rem", fontWeight: 700 }}>
              Showing {filteredApplicants.length} Record{filteredApplicants.length === 1 ? "" : "s"}
            </div>
          </div>

          {/* Applicants List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {filteredApplicants.length === 0 ? (
              <div
                style={{
                  background: "#0F172A",
                  border: "1px dashed #334155",
                  borderRadius: "14px",
                  padding: "48px 24px",
                  textAlign: "center",
                  color: "#94A3B8"
                }}
              >
                <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(99, 102, 241, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: "2rem", color: "#818CF8" }}>
                  {applicantFilter === "PENDING" ? "⏳" : applicantFilter === "APPROVED" ? "✅" : applicantFilter === "REJECTED" ? "🚫" : "📋"}
                </div>
                <h3 style={{ margin: "0 0 8px", color: "#F8FAFC", fontSize: "1.2rem" }}>
                  {applicantFilter === "PENDING"
                    ? "All Pending Applications Processed!"
                    : applicantFilter === "APPROVED"
                    ? "No Approved Admins in Roster Yet"
                    : applicantFilter === "REJECTED"
                    ? "No Rejected Applicants"
                    : "No Admin Applications Found"}
                </h3>
                <p style={{ fontSize: "0.85rem", maxWidth: "500px", margin: "0 auto 20px", color: "#94A3B8" }}>
                  {applicantFilter === "PENDING"
                    ? "You have evaluated all pending admin applicants. Switch to Approved Admins or Rejected Archive to view historical decisions."
                    : applicantFilter === "APPROVED"
                    ? "When you approve and assign operational roles to pending applicants, they will appear here."
                    : applicantFilter === "REJECTED"
                    ? "No candidate applications have been rejected by Chairman Mounish."
                    : "No applicants match the current search query."}
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                  <button
                    onClick={() => setApplicantFilter("PENDING")}
                    style={{
                      background: "rgba(99, 102, 241, 0.15)",
                      color: "#A5B4FC",
                      border: "1px solid rgba(99, 102, 241, 0.3)",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    View Pending Queue ({pendingApplicantsCount})
                  </button>
                  <button
                    onClick={() => setApplicantFilter("APPROVED")}
                    style={{
                      background: "rgba(16, 185, 129, 0.15)",
                      color: "#34D399",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    View Approved Admins ({approvedApplicantsCount})
                  </button>
                </div>
              </div>
            ) : (
              filteredApplicants.map((app) => (
                <div
                  key={app.id}
                  style={{
                    background: "#0F172A",
                    border: app.status === "PENDING" ? "1px solid #6366F1" : "1px solid #1E293B",
                    borderRadius: "14px",
                    padding: "20px",
                    boxShadow: app.status === "PENDING" ? "0 4px 20px rgba(99, 102, 241, 0.15)" : "none"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                      <div
                        style={{
                          width: "46px",
                          height: "46px",
                          borderRadius: "12px",
                          background: app.status === "APPROVED" ? "rgba(16, 185, 129, 0.15)" : app.status === "REJECTED" ? "rgba(239, 68, 68, 0.15)" : "rgba(99, 102, 241, 0.15)",
                          color: app.status === "APPROVED" ? "#34D399" : app.status === "REJECTED" ? "#F87171" : "#818CF8",
                          border: `1px solid ${app.status === "APPROVED" ? "rgba(16, 185, 129, 0.3)" : app.status === "REJECTED" ? "rgba(239, 68, 68, 0.3)" : "rgba(99, 102, 241, 0.3)"}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.4rem"
                        }}
                      >
                        {app.status === "APPROVED" ? <FiCheck /> : app.status === "REJECTED" ? <FiXCircle /> : <FiClock />}
                      </div>

                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#F8FAFC" }}>
                            {app.fullName}
                          </h3>
                          <span
                            style={{
                              background: "rgba(255, 255, 255, 0.08)",
                              color: "#CBD5E1",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              padding: "2px 8px",
                              borderRadius: "6px"
                            }}
                          >
                            {app.id}
                          </span>
                          <span
                            style={{
                              background:
                                app.status === "APPROVED"
                                  ? "rgba(16, 185, 129, 0.15)"
                                  : app.status === "REJECTED"
                                  ? "rgba(239, 68, 68, 0.15)"
                                  : "rgba(245, 158, 11, 0.15)",
                              color: app.status === "APPROVED" ? "#34D399" : app.status === "REJECTED" ? "#F87171" : "#FBBF24",
                              border: `1px solid ${app.status === "APPROVED" ? "rgba(16, 185, 129, 0.3)" : app.status === "REJECTED" ? "rgba(239, 68, 68, 0.3)" : "rgba(245, 158, 11, 0.3)"}`,
                              fontSize: "0.72rem",
                              fontWeight: 800,
                              padding: "2px 10px",
                              borderRadius: "12px"
                            }}
                          >
                            {app.status === "APPROVED" ? "APPROVED & ROLE ASSIGNED" : app.status === "REJECTED" ? "REJECTED" : "PENDING CHAIRMAN APPROVAL"}
                          </span>
                        </div>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginTop: "8px", fontSize: "0.82rem", color: "#94A3B8" }}>
                          <span>📧 <strong>Email:</strong> {app.email}</span>
                          <span>📱 <strong>Phone:</strong> {app.phone}</span>
                          <span>🆔 <strong>Aadhaar:</strong> {app.aadhaarNumber}</span>
                          <span>📅 <strong>Applied:</strong> {app.appliedDate}</span>
                        </div>

                        <div style={{ marginTop: "10px", fontSize: "0.84rem", color: "#CBD5E1" }}>
                          <span style={{ color: "#94A3B8" }}>Requested Specialization:</span>{" "}
                          <span style={{ color: "#60A5FA", fontWeight: 700 }}>{app.requestedRoleTitle || app.requestedRole}</span>
                        </div>

                        <div style={{ marginTop: "6px", fontSize: "0.83rem", color: "#94A3B8", background: "rgba(0, 0, 0, 0.25)", padding: "8px 12px", borderRadius: "8px", border: "1px solid #1E293B" }}>
                          💼 <strong>Qualifications & Background:</strong> {app.experience}
                        </div>

                        {app.status === "APPROVED" && (
                          <div style={{ marginTop: "10px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.25)", padding: "10px 14px", borderRadius: "8px" }}>
                            <div style={{ color: "#34D399", fontWeight: 800, fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "6px" }}>
                              👑 Chairman Mounish's Appointment Decree:
                            </div>
                            <div style={{ fontSize: "0.82rem", color: "#E2E8F0", marginTop: "4px" }}>
                              Assigned Operating Authority: <strong>{app.assignedRoleTitle}</strong> | Authorized at {app.approvedDate}
                            </div>
                            <div style={{ fontSize: "0.78rem", color: "#94A3B8", marginTop: "2px" }}>
                              Note: {app.chairmanNotes}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Chairman Action Buttons & Resume Viewer */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
                      <button
                        onClick={() => {
                          setActiveResumeApplicant(app);
                          setSelectedApplicant(app);
                          setAssignRoleChoice(app.requestedRole || "executor");
                          setShowResumeModal(true);
                        }}
                        style={{
                          background: "rgba(99, 102, 241, 0.15)",
                          color: "#A5B4FC",
                          border: "1px solid rgba(99, 102, 241, 0.35)",
                          padding: "9px 16px",
                          borderRadius: "8px",
                          fontWeight: 700,
                          fontSize: "0.82rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          transition: "all 0.2s"
                        }}
                      >
                        <FiFileText /> 📄 View Full Resume & CV
                      </button>

                      {app.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedApplicant(app);
                              setAssignRoleChoice(app.requestedRole || "executor");
                            }}
                            style={{
                              background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                              color: "#FFF",
                              border: "none",
                              padding: "9px 18px",
                              borderRadius: "8px",
                              fontWeight: 800,
                              fontSize: "0.82rem",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)"
                            }}
                          >
                            <FiCheckCircle /> ⚡ Approve & Assign Role
                          </button>
                          <button
                            onClick={() => {
                              setSelectedApplicant(app);
                              setShowRejectModal(true);
                            }}
                            style={{
                              background: "rgba(239, 68, 68, 0.15)",
                              color: "#F87171",
                              border: "1px solid rgba(239, 68, 68, 0.3)",
                              padding: "9px 14px",
                              borderRadius: "8px",
                              fontWeight: 700,
                              fontSize: "0.82rem",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px"
                            }}
                          >
                            <FiXCircle /> Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: 3-ADMIN WORK OVERSIGHT & LIVE AUDIT STREAM                         */}
      {/* ========================================================================= */}
      {activeTab === "admins_oversight" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
            {/* Tier 1: Executor Admin Card */}
            <div style={{ background: "#0F172A", border: "1px solid #2563EB", borderRadius: "16px", padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div>
                  <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#60A5FA", background: "rgba(37, 99, 235, 0.15)", padding: "3px 8px", borderRadius: "6px" }}>
                    TIER 1 GOVERNANCE
                  </span>
                  <h3 style={{ margin: "6px 0 0", color: "#F8FAFC", fontSize: "1.1rem" }}>
                    ⚡ System Operations Executor Desk
                  </h3>
                  <p style={{ margin: "2px 0 0", color: "#94A3B8", fontSize: "0.8rem" }}>
                    Active Lead: Mounish Sai (System Operations Executor)
                  </p>
                </div>
                <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(37, 99, 235, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", color: "#60A5FA" }}>
                  ⚡
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
                <div style={{ background: "#020617", padding: "10px", borderRadius: "8px", border: "1px solid #1E293B" }}>
                  <div style={{ fontSize: "0.72rem", color: "#94A3B8" }}>Intake Queue</div>
                  <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#60A5FA" }}>
                    {pipelineApps.filter((a) => a.stage1_executor?.status === "PENDING").length} Vendors
                  </div>
                </div>
                <div style={{ background: "#020617", padding: "10px", borderRadius: "8px", border: "1px solid #1E293B" }}>
                  <div style={{ fontSize: "0.72rem", color: "#94A3B8" }}>Due-Diligence Cleared</div>
                  <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#34D399" }}>
                    {stage1ApprovedVendors} Approved
                  </div>
                </div>
              </div>

              <div style={{ fontSize: "0.82rem", color: "#CBD5E1" }}>
                <strong>Key Responsibilities:</strong>
                <ul style={{ margin: "6px 0 0", paddingLeft: "20px", color: "#94A3B8", fontSize: "0.78rem" }}>
                  <li>Scanning e-Courts and national police FIR records</li>
                  <li>Validating 90+ trust score and AA+ financial rating</li>
                  <li>Writing formal Stage 1 clearance letters to Verifier</li>
                </ul>
              </div>
            </div>

            {/* Tier 2: Verifier Admin Card */}
            <div style={{ background: "#0F172A", border: "1px solid #8B5CF6", borderRadius: "16px", padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div>
                  <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#A78BFA", background: "rgba(139, 92, 246, 0.15)", padding: "3px 8px", borderRadius: "6px" }}>
                    TIER 2 GOVERNANCE
                  </span>
                  <h3 style={{ margin: "6px 0 0", color: "#F8FAFC", fontSize: "1.1rem" }}>
                    🔍 Compliance & KYC Verifier Desk
                  </h3>
                  <p style={{ margin: "2px 0 0", color: "#94A3B8", fontSize: "0.8rem" }}>
                    Active Lead: Ananya Rao (Compliance & Security)
                  </p>
                </div>
                <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(139, 92, 246, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", color: "#A78BFA" }}>
                  🔍
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
                <div style={{ background: "#020617", padding: "10px", borderRadius: "8px", border: "1px solid #1E293B" }}>
                  <div style={{ fontSize: "0.72rem", color: "#94A3B8" }}>Audit Queue</div>
                  <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#A78BFA" }}>
                    {pipelineApps.filter((a) => a.stage1_executor?.status === "COMPLETED" && a.stage2_verifier?.status === "PENDING").length} Vendors
                  </div>
                </div>
                <div style={{ background: "#020617", padding: "10px", borderRadius: "8px", border: "1px solid #1E293B" }}>
                  <div style={{ fontSize: "0.72rem", color: "#94A3B8" }}>Hubs Audited</div>
                  <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#34D399" }}>
                    {stage2ApprovedVendors} Cleared
                  </div>
                </div>
              </div>

              <div style={{ fontSize: "0.82rem", color: "#CBD5E1" }}>
                <strong>Key Responsibilities:</strong>
                <ul style={{ margin: "6px 0 0", paddingLeft: "20px", color: "#94A3B8", fontSize: "0.78rem" }}>
                  <li>Physical satellite and drone telemetry geolocation check</li>
                  <li>Catalog consistency verification (0 counterfeit SKUs)</li>
                  <li>Workplace fire safety NOC and cleanroom inspections</li>
                </ul>
              </div>
            </div>

            {/* Tier 3: Approver Admin Card */}
            <div style={{ background: "#0F172A", border: "1px solid #10B981", borderRadius: "16px", padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div>
                  <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#34D399", background: "rgba(16, 185, 129, 0.15)", padding: "3px 8px", borderRadius: "6px" }}>
                    TIER 3 GOVERNANCE
                  </span>
                  <h3 style={{ margin: "6px 0 0", color: "#F8FAFC", fontSize: "1.1rem" }}>
                    ⚖️ Cross-Check & Approver Authority
                  </h3>
                  <p style={{ margin: "2px 0 0", color: "#94A3B8", fontSize: "0.8rem" }}>
                    Active Lead: Rajesh Menon (Approval Authority)
                  </p>
                </div>
                <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", color: "#34D399" }}>
                  🏛️
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
                <div style={{ background: "#020617", padding: "10px", borderRadius: "8px", border: "1px solid #1E293B" }}>
                  <div style={{ fontSize: "0.72rem", color: "#94A3B8" }}>Pending Final Seal</div>
                  <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#FBBF24" }}>
                    {pipelineApps.filter((a) => a.stage1_executor?.status === "COMPLETED" && a.stage2_verifier?.status === "COMPLETED" && a.stage3_approver?.status !== "APPROVED").length} Vendors
                  </div>
                </div>
                <div style={{ background: "#020617", padding: "10px", borderRadius: "8px", border: "1px solid #1E293B" }}>
                  <div style={{ fontSize: "0.72rem", color: "#94A3B8" }}>Live Stores Sealed</div>
                  <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#34D399" }}>
                    {stage3ApprovedVendors} Sealed
                  </div>
                </div>
              </div>

              <div style={{ fontSize: "0.82rem", color: "#CBD5E1" }}>
                <strong>Key Responsibilities:</strong>
                <ul style={{ margin: "6px 0 0", paddingLeft: "20px", color: "#94A3B8", fontSize: "0.78rem" }}>
                  <li>5.0% Gross performance bond agreement execution</li>
                  <li>Issuing cryptographic ShopSense Official Merchant Seal</li>
                  <li>Live storefront activation and catalog induction</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: VENDORS OVERSIGHT & PIPELINE PROGRESSION STREAM                    */}
      {/* ========================================================================= */}
      {activeTab === "vendors_oversight" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <div style={{ background: "#0F172A", border: "1px solid #1E293B", borderRadius: "14px", padding: "20px", marginBottom: "20px" }}>
            <h3 style={{ margin: "0 0 12px", fontSize: "1.1rem", color: "#F8FAFC", display: "flex", alignItems: "center", gap: "8px" }}>
              <FiBox /> Vendor Applications Progression Across All 3 Admins
            </h3>
            <p style={{ margin: "0 0 16px", color: "#94A3B8", fontSize: "0.84rem" }}>
              Chairman Mounish oversees the continuous flow from Stage 1 Executor intake → Stage 2 Verifier audit → Stage 3 Approver seal.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {pipelineApps.slice(0, 10).map((app) => (
                <div
                  key={app.id}
                  style={{
                    background: "#020617",
                    border: "1px solid #1E293B",
                    borderRadius: "10px",
                    padding: "14px 18px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px"
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ color: "#60A5FA", fontWeight: 800, fontSize: "0.82rem" }}>{app.id}</span>
                      <h4 style={{ margin: 0, color: "#F8FAFC", fontSize: "0.95rem" }}>{app.storeName}</h4>
                      <span style={{ background: "rgba(255, 255, 255, 0.08)", color: "#CBD5E1", fontSize: "0.72rem", padding: "2px 8px", borderRadius: "6px" }}>
                        {app.category}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "14px", marginTop: "6px", fontSize: "0.78rem", color: "#94A3B8" }}>
                      <span>👤 Owner: {app.ownerName}</span>
                      <span>🏢 Hubs: {app.warehouses?.length || 2} Facilities</span>
                      <span>📜 Bond: 5.0% Gross Performance Bond</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {/* Stage 1 Indicator */}
                    <div
                      style={{
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        background: app.stage1_executor?.status === "COMPLETED" ? "rgba(16, 185, 129, 0.15)" : "rgba(37, 99, 235, 0.15)",
                        color: app.stage1_executor?.status === "COMPLETED" ? "#34D399" : "#60A5FA",
                        border: `1px solid ${app.stage1_executor?.status === "COMPLETED" ? "rgba(16, 185, 129, 0.3)" : "rgba(37, 99, 235, 0.3)"}`
                      }}
                    >
                      Stage 1: {app.stage1_executor?.status || "PENDING"}
                    </div>
                    <FiChevronRight style={{ color: "#475569" }} />
                    {/* Stage 2 Indicator */}
                    <div
                      style={{
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        background: app.stage2_verifier?.status === "COMPLETED" ? "rgba(16, 185, 129, 0.15)" : "rgba(139, 92, 246, 0.15)",
                        color: app.stage2_verifier?.status === "COMPLETED" ? "#34D399" : "#A78BFA",
                        border: `1px solid ${app.stage2_verifier?.status === "COMPLETED" ? "rgba(16, 185, 129, 0.3)" : "rgba(139, 92, 246, 0.3)"}`
                      }}
                    >
                      Stage 2: {app.stage2_verifier?.status || "LOCKED"}
                    </div>
                    <FiChevronRight style={{ color: "#475569" }} />
                    {/* Stage 3 Indicator */}
                    <div
                      style={{
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        background: (app.stage3_approver?.status === "APPROVED" || app.stage3_approver?.status === "COMPLETED" || app.stage3_status === "COMPLETED") ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 158, 11, 0.15)",
                        color: (app.stage3_approver?.status === "APPROVED" || app.stage3_approver?.status === "COMPLETED" || app.stage3_status === "COMPLETED") ? "#34D399" : "#FBBF24",
                        border: `1px solid ${(app.stage3_approver?.status === "APPROVED" || app.stage3_approver?.status === "COMPLETED" || app.stage3_status === "COMPLETED") ? "rgba(16, 185, 129, 0.4)" : "rgba(245, 158, 11, 0.3)"}`
                      }}
                    >
                      Stage 3: {(app.stage3_approver?.status === "APPROVED" || app.stage3_approver?.status === "COMPLETED" || app.stage3_status === "COMPLETED") ? "SEALED" : "AWAITING SEAL"}
                    </div>
                    <FiChevronRight style={{ color: "#475569" }} />
                    {/* Stage 4 Portal Access Indicator */}
                    <div
                      style={{
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        background: (app.overallStatus === "APPROVED_LIVE" || app.overall_status === "APPROVED_LIVE" || app.stage4_status === "APPROVED") ? "rgba(16, 185, 129, 0.2)" : isPendingChairman(app) ? "rgba(239, 68, 68, 0.2)" : "rgba(100, 116, 139, 0.2)",
                        color: (app.overallStatus === "APPROVED_LIVE" || app.overall_status === "APPROVED_LIVE" || app.stage4_status === "APPROVED") ? "#34D399" : isPendingChairman(app) ? "#F87171" : "#94A3B8",
                        border: `1px solid ${(app.overallStatus === "APPROVED_LIVE" || app.overall_status === "APPROVED_LIVE" || app.stage4_status === "APPROVED") ? "rgba(16, 185, 129, 0.4)" : isPendingChairman(app) ? "rgba(239, 68, 68, 0.4)" : "rgba(100, 116, 139, 0.3)"}`
                      }}
                    >
                      Stage 4: {(app.overallStatus === "APPROVED_LIVE" || app.overall_status === "APPROVED_LIVE" || app.stage4_status === "APPROVED") ? "PORTAL ACTIVE" : isPendingChairman(app) ? "ACTION REQUIRED" : "LOCKED"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 3.5: VENDOR PORTAL ACCESS REQUESTS (CHAIRMAN FINAL APPROVAL) */}
      {/* ========================================================================= */}
      {activeTab === "vendor_portal_access" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#F8FAFC", display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
              <FiShield style={{ color: "#EF4444" }} /> Chairman Vendor Portal Access Gateway
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {pipelineApps.filter(isPendingChairman).length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", background: "#0F172A", borderRadius: "14px", border: "1px dashed #334155" }}>
                <FiCheckCircle style={{ fontSize: "3rem", color: "#10B981", marginBottom: "16px" }} />
                <h3 style={{ margin: "0 0 8px 0", color: "#F1F5F9" }}>All clear, Chairman!</h3>
                <p style={{ margin: 0, color: "#94A3B8" }}>There are no pending vendor access requests at the moment.</p>
              </div>
            ) : (
              pipelineApps
                .filter(isPendingChairman)
                .map((app) => (
                  <div key={app.id} style={{ background: "#0F172A", borderRadius: "14px", padding: "20px", border: "1px solid #1E293B", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h3 style={{ margin: "0 0 6px 0", fontSize: "1.2rem", color: "#F8FAFC" }}>{app.storeName} <span style={{ fontSize: "0.85rem", padding: "3px 8px", background: "#1E293B", borderRadius: "6px", marginLeft: "10px", color: "#94A3B8" }}>{app.category}</span></h3>
                      <p style={{ margin: "0 0 12px 0", color: "#94A3B8", fontSize: "0.9rem" }}>Owner: {app.ownerName} | GSTIN: {app.gstin}</p>
                      <div style={{ display: "flex", gap: "12px" }}>
                        <div style={{ fontSize: "0.8rem", color: "#10B981", background: "rgba(16, 185, 129, 0.1)", padding: "4px 8px", borderRadius: "6px", border: "1px solid rgba(16, 185, 129, 0.2)" }}>✓ Stage 1 Cleared</div>
                        <div style={{ fontSize: "0.8rem", color: "#10B981", background: "rgba(16, 185, 129, 0.1)", padding: "4px 8px", borderRadius: "6px", border: "1px solid rgba(16, 185, 129, 0.2)" }}>✓ Stage 2 Cleared</div>
                        <div style={{ fontSize: "0.8rem", color: "#10B981", background: "rgba(16, 185, 129, 0.1)", padding: "4px 8px", borderRadius: "6px", border: "1px solid rgba(16, 185, 129, 0.2)" }}>✓ Stage 3 Sealed</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleChairmanGrantAccess(app.id, app.storeName, app.email)}
                      style={{ background: "#EF4444", color: "#FFF", border: "none", padding: "12px 24px", borderRadius: "10px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s ease" }}
                      onMouseOver={(e) => (e.currentTarget.style.background = "#DC2626")}
                      onMouseOut={(e) => (e.currentTarget.style.background = "#EF4444")}
                    >
                      <FiCheckCircle /> Grant Live Portal Access
                    </button>
                  </div>
                ))
            )}
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: TASK ASSIGNMENT & WORK DIRECTIVES DISPATCH ("ASSIGN WORK")         */}
      {/* ========================================================================= */}
      {activeTab === "task_assignment" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#F8FAFC" }}>
                📋 Directives & Work Assignments Dispatched by Chairman Mounish
              </h3>
              <p style={{ margin: "4px 0 0", color: "#94A3B8", fontSize: "0.82rem" }}>
                Mandatory work orders assigned to Executor, Verifier, and Approver Admins.
              </p>
            </div>
            <button
              onClick={() => setShowNewTaskModal(true)}
              style={{
                background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                color: "#FFF",
                border: "none",
                padding: "8px 16px",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "0.82rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <FiPlus /> Assign New Work
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {tasks.map((task) => (
              <div
                key={task.id}
                style={{
                  background: "#0F172A",
                  border: "1px solid #1E293B",
                  borderRadius: "12px",
                  padding: "18px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: "12px"
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ color: "#60A5FA", fontWeight: 800, fontSize: "0.78rem" }}>{task.id}</span>
                    <h4 style={{ margin: 0, color: "#F8FAFC", fontSize: "1rem" }}>{task.title}</h4>
                    <span
                      style={{
                        background:
                          task.priority === "URGENT"
                            ? "rgba(239, 68, 68, 0.15)"
                            : task.priority === "HIGH"
                            ? "rgba(245, 158, 11, 0.15)"
                            : "rgba(59, 130, 246, 0.15)",
                        color: task.priority === "URGENT" ? "#F87171" : task.priority === "HIGH" ? "#FBBF24" : "#60A5FA",
                        fontSize: "0.7rem",
                        fontWeight: 800,
                        padding: "2px 8px",
                        borderRadius: "6px"
                      }}
                    >
                      {task.priority} PRIORITY
                    </span>
                    <span
                      style={{
                        background: task.status === "COMPLETED" ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                        color: task.status === "COMPLETED" ? "#34D399" : "#FBBF24",
                        fontSize: "0.7rem",
                        fontWeight: 800,
                        padding: "2px 8px",
                        borderRadius: "6px"
                      }}
                    >
                      {task.status}
                    </span>
                  </div>

                  <div style={{ marginTop: "8px", fontSize: "0.83rem", color: "#CBD5E1" }}>
                    {task.description}
                  </div>

                  <div style={{ display: "flex", gap: "16px", marginTop: "10px", fontSize: "0.78rem", color: "#94A3B8" }}>
                    <span>🎯 <strong>Assigned To:</strong> {task.targetAdminName}</span>
                    <span>📅 <strong>Dispatched:</strong> {task.assignedDate}</span>
                    <span>⏰ <strong>Due:</strong> {task.dueDate}</span>
                  </div>

                  {task.status === "COMPLETED" && (
                    <div style={{ marginTop: "8px", background: "rgba(16, 185, 129, 0.1)", padding: "6px 10px", borderRadius: "6px", fontSize: "0.78rem", color: "#34D399" }}>
                      ✅ <strong>Admin Completion Report:</strong> {task.completionNotes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: DIRECT INQUIRIES & Q&A SYSTEM ("ASK QUESTIONS")                    */}
      {/* ========================================================================= */}
      {activeTab === "inquiries" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#F8FAFC" }}>
                💬 Official Direct Inquiries & Interrogatories from Chairman Mounish
              </h3>
              <p style={{ margin: "4px 0 0", color: "#94A3B8", fontSize: "0.82rem" }}>
                Formal explanations and investigations queried to specific admin authorities.
              </p>
            </div>
            <button
              onClick={() => setShowNewInquiryModal(true)}
              style={{
                background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
                color: "#FFF",
                border: "none",
                padding: "8px 16px",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "0.82rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <FiMessageSquare /> Ask Question to Admin
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {inquiries.map((inq) => (
              <div
                key={inq.id}
                style={{
                  background: "#0F172A",
                  border: "1px solid #1E293B",
                  borderRadius: "14px",
                  padding: "18px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ color: "#A78BFA", fontWeight: 800, fontSize: "0.78rem" }}>{inq.id}</span>
                    <h4 style={{ margin: 0, color: "#F8FAFC", fontSize: "1rem" }}>{inq.subject}</h4>
                    <span
                      style={{
                        background: inq.status === "ANSWERED" ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                        color: inq.status === "ANSWERED" ? "#34D399" : "#FBBF24",
                        fontSize: "0.7rem",
                        fontWeight: 800,
                        padding: "2px 8px",
                        borderRadius: "6px"
                      }}
                    >
                      {inq.status === "ANSWERED" ? "ANSWERED" : "AWAITING ADMIN REPLY"}
                    </span>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "#64748B" }}>{inq.timestamp}</span>
                </div>

                <div style={{ fontSize: "0.84rem", color: "#E2E8F0", background: "rgba(0, 0, 0, 0.2)", padding: "10px 14px", borderRadius: "8px", border: "1px solid #1E293B" }}>
                  <div style={{ color: "#94A3B8", fontSize: "0.74rem", fontWeight: 700, marginBottom: "4px" }}>
                    👑 QUESTION FROM CHAIRMAN MOUNISH TO [{inq.targetAdminName.toUpperCase()}]:
                  </div>
                  "{inq.question}"
                </div>

                {inq.reply ? (
                  <div style={{ marginTop: "10px", fontSize: "0.83rem", color: "#CBD5E1", background: "rgba(139, 92, 246, 0.08)", padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(139, 92, 246, 0.25)" }}>
                    <div style={{ color: "#A78BFA", fontSize: "0.74rem", fontWeight: 700, marginBottom: "4px", display: "flex", justifyContent: "space-between" }}>
                      <span>🛡️ RESPONSE FROM {inq.targetAdminName.toUpperCase()}:</span>
                      <span style={{ color: "#64748B" }}>{inq.replyTimestamp}</span>
                    </div>
                    "{inq.reply}"
                  </div>
                ) : (
                  <div style={{ marginTop: "8px", fontSize: "0.78rem", color: "#FBBF24", fontStyle: "italic" }}>
                    ⏳ Awaiting formal explanation letter from {inq.targetAdminName}...
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: APPROVE & ASSIGN ROLE MODAL (CHAIRMAN GOVERNANCE)               */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedApplicant && !showRejectModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "20px"
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                background: "#0F172A",
                border: "1px solid #6366F1",
                borderRadius: "16px",
                width: "100%",
                maxWidth: "600px",
                padding: "24px",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ margin: 0, color: "#F8FAFC", fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "8px" }}>
                  👑 Chairman's Role Assignment & Official Appointment Decree
                </h3>
                <button
                  onClick={() => setSelectedApplicant(null)}
                  style={{ background: "transparent", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: "1.2rem" }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleApproveApplicant}>
                <div style={{ background: "#020617", padding: "12px 16px", borderRadius: "10px", border: "1px solid #1E293B", marginBottom: "16px" }}>
                  <div style={{ fontSize: "0.82rem", color: "#94A3B8" }}>Applicant Name:</div>
                  <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#F8FAFC" }}>{selectedApplicant.fullName}</div>
                  <div style={{ fontSize: "0.78rem", color: "#64748B", marginTop: "2px" }}>
                    Email: {selectedApplicant.email} | Phone: {selectedApplicant.phone}
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "0.84rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "8px" }}>
                    Assign Operating Admin Authority & Role:
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {[
                      { role: "executor", title: "⚡ Type 1: System Operations Executor Admin (Intake & Due-Diligence)", desc: "Responsible for scanning legal complaints, checking trust scores, and due-diligence." },
                      { role: "verifier", title: "🔍 Type 2: Compliance & KYC Verifier Admin (Geolocation & Audits)", desc: "Responsible for physical drone/satellite geolocation audits, cleanroom safety, and catalog checks." },
                      { role: "approver", title: "⚖️ Type 3: Cross-Check & Vendor Approver Authority (Bonds & Seals)", desc: "Responsible for 5.0% gross selling performance bonds, seals, and live store inductions." }
                    ].map((opt) => (
                      <label
                        key={opt.role}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "10px",
                          background: assignRoleChoice === opt.role ? "rgba(99, 102, 241, 0.15)" : "#020617",
                          border: assignRoleChoice === opt.role ? "1px solid #6366F1" : "1px solid #1E293B",
                          padding: "10px 14px",
                          borderRadius: "10px",
                          cursor: "pointer"
                        }}
                      >
                        <input
                          type="radio"
                          name="assignedRoleChoice"
                          value={opt.role}
                          checked={assignRoleChoice === opt.role}
                          onChange={() => setAssignRoleChoice(opt.role)}
                          style={{ marginTop: "4px" }}
                        />
                        <div>
                          <div style={{ fontWeight: 800, fontSize: "0.85rem", color: assignRoleChoice === opt.role ? "#818CF8" : "#F8FAFC" }}>
                            {opt.title}
                          </div>
                          <div style={{ fontSize: "0.74rem", color: "#94A3B8", marginTop: "2px" }}>
                            {opt.desc}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "6px" }}>
                    Chairman Appointment Decree Notes:
                  </label>
                  <textarea
                    rows={3}
                    value={chairmanApprovalNotes}
                    onChange={(e) => setChairmanApprovalNotes(e.target.value)}
                    style={{
                      width: "100%",
                      background: "#020617",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      padding: "10px 12px",
                      color: "#F8FAFC",
                      fontSize: "0.82rem"
                    }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => setSelectedApplicant(null)}
                    style={{
                      background: "transparent",
                      color: "#94A3B8",
                      border: "1px solid #334155",
                      padding: "10px 18px",
                      borderRadius: "8px",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                      color: "#FFF",
                      border: "none",
                      padding: "10px 22px",
                      borderRadius: "8px",
                      fontSize: "0.85rem",
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    <FiCheckCircle /> Authorize & Issue Role Access
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 2: REJECT APPLICANT MODAL                                          */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showRejectModal && selectedApplicant && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "20px"
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                background: "#0F172A",
                border: "1px solid #EF4444",
                borderRadius: "16px",
                width: "100%",
                maxWidth: "500px",
                padding: "24px"
              }}
            >
              <h3 style={{ margin: "0 0 14px", color: "#F87171", fontSize: "1.15rem", display: "flex", alignItems: "center", gap: "8px" }}>
                🚫 Disqualify Admin Applicant
              </h3>

              <form onSubmit={handleRejectApplicant}>
                <p style={{ fontSize: "0.84rem", color: "#CBD5E1", marginBottom: "14px" }}>
                  Are you sure you want to reject the admin application for <strong>{selectedApplicant.fullName}</strong>?
                </p>

                <div style={{ marginBottom: "18px" }}>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "6px" }}>
                    Reason for Disqualification:
                  </label>
                  <textarea
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    style={{
                      width: "100%",
                      background: "#020617",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      padding: "10px 12px",
                      color: "#F8FAFC",
                      fontSize: "0.82rem"
                    }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRejectModal(false);
                      setSelectedApplicant(null);
                    }}
                    style={{
                      background: "transparent",
                      color: "#94A3B8",
                      border: "1px solid #334155",
                      padding: "9px 16px",
                      borderRadius: "8px",
                      fontSize: "0.82rem",
                      cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      background: "#EF4444",
                      color: "#FFF",
                      border: "none",
                      padding: "9px 18px",
                      borderRadius: "8px",
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      cursor: "pointer"
                    }}
                  >
                    Confirm Rejection
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 3: ASSIGN NEW DIRECTIVE / TASK MODAL                                */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showNewTaskModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "20px"
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                background: "#0F172A",
                border: "1px solid #3B82F6",
                borderRadius: "16px",
                width: "100%",
                maxWidth: "580px",
                padding: "24px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ margin: 0, color: "#F8FAFC", fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "8px" }}>
                  📋 Dispatch Executive Directive / Work Assignment
                </h3>
                <button
                  onClick={() => setShowNewTaskModal(false)}
                  style={{ background: "transparent", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: "1.2rem" }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateTask}>
                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "6px" }}>
                    Target Admin Authority:
                  </label>
                  <select
                    value={newTaskTarget}
                    onChange={(e) => setNewTaskTarget(e.target.value)}
                    style={{
                      width: "100%",
                      background: "#020617",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      padding: "9px 12px",
                      color: "#F8FAFC",
                      fontSize: "0.84rem"
                    }}
                  >
                    <option value="executor">⚡ Type 1: System Operations Executor Admin</option>
                    <option value="verifier">🔍 Type 2: Compliance & KYC Verifier Admin</option>
                    <option value="approver">⚖️ Type 3: Cross-Check & Vendor Approver Authority</option>
                  </select>
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "6px" }}>
                    Directive Title:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Conduct Special Investigation on Electronic Component Vendors"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    style={{
                      width: "100%",
                      background: "#020617",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      padding: "9px 12px",
                      color: "#F8FAFC",
                      fontSize: "0.84rem"
                    }}
                  />
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "6px" }}>
                    Detailed Instructions & Specific Directives:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe specific tasks, coordinates to verify, or clauses to audit..."
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                    style={{
                      width: "100%",
                      background: "#020617",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      padding: "9px 12px",
                      color: "#F8FAFC",
                      fontSize: "0.82rem"
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "6px" }}>
                      Priority Level:
                    </label>
                    <select
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value)}
                      style={{
                        width: "100%",
                        background: "#020617",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                        padding: "9px 12px",
                        color: "#F8FAFC",
                        fontSize: "0.84rem"
                      }}
                    >
                      <option value="NORMAL">NORMAL PRIORITY</option>
                      <option value="HIGH">HIGH PRIORITY</option>
                      <option value="URGENT">CRITICAL / URGENT</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "6px" }}>
                      Due Date & Time:
                    </label>
                    <input
                      type="text"
                      value={newTaskDueDate}
                      onChange={(e) => setNewTaskDueDate(e.target.value)}
                      style={{
                        width: "100%",
                        background: "#020617",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                        padding: "9px 12px",
                        color: "#F8FAFC",
                        fontSize: "0.84rem"
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => setShowNewTaskModal(false)}
                    style={{
                      background: "transparent",
                      color: "#94A3B8",
                      border: "1px solid #334155",
                      padding: "9px 16px",
                      borderRadius: "8px",
                      fontSize: "0.82rem",
                      cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                      color: "#FFF",
                      border: "none",
                      padding: "9px 20px",
                      borderRadius: "8px",
                      fontWeight: 800,
                      fontSize: "0.84rem",
                      cursor: "pointer"
                    }}
                  >
                    Dispatch Directive
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 4: ASK QUESTION / DIRECT INQUIRY MODAL                             */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showNewInquiryModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "20px"
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                background: "#0F172A",
                border: "1px solid #8B5CF6",
                borderRadius: "16px",
                width: "100%",
                maxWidth: "560px",
                padding: "24px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ margin: 0, color: "#F8FAFC", fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "8px" }}>
                  💬 Issue Official Direct Inquiry from Chairman Mounish
                </h3>
                <button
                  onClick={() => setShowNewInquiryModal(false)}
                  style={{ background: "transparent", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: "1.2rem" }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateInquiry}>
                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "6px" }}>
                    Target Admin Authority:
                  </label>
                  <select
                    value={newInqTarget}
                    onChange={(e) => setNewInqTarget(e.target.value)}
                    style={{
                      width: "100%",
                      background: "#020617",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      padding: "9px 12px",
                      color: "#F8FAFC",
                      fontSize: "0.84rem"
                    }}
                  >
                    <option value="executor">⚡ Executor Desk (Mounish Sai - Operations)</option>
                    <option value="verifier">🔍 Verifier Desk (Ananya Rao - Compliance & Audits)</option>
                    <option value="approver">⚖️ Approver Desk (Rajesh Menon - Seal Authority)</option>
                  </select>
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "6px" }}>
                    Inquiry Subject:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Discrepancy explanation on VAPP-104 cleanroom audit"
                    value={newInqSubject}
                    onChange={(e) => setNewInqSubject(e.target.value)}
                    style={{
                      width: "100%",
                      background: "#020617",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      padding: "9px 12px",
                      color: "#F8FAFC",
                      fontSize: "0.84rem"
                    }}
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "6px" }}>
                    Question / Inquiry Body:
                  </label>
                  <textarea
                    rows={4}
                    placeholder="State your question clearly. The admin will be required to submit a formal response..."
                    value={newInqQuestion}
                    onChange={(e) => setNewInqQuestion(e.target.value)}
                    style={{
                      width: "100%",
                      background: "#020617",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                      padding: "9px 12px",
                      color: "#F8FAFC",
                      fontSize: "0.82rem"
                    }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => setShowNewInquiryModal(false)}
                    style={{
                      background: "transparent",
                      color: "#94A3B8",
                      border: "1px solid #334155",
                      padding: "9px 16px",
                      borderRadius: "8px",
                      fontSize: "0.82rem",
                      cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
                      color: "#FFF",
                      border: "none",
                      padding: "9px 20px",
                      borderRadius: "8px",
                      fontWeight: 800,
                      fontSize: "0.84rem",
                      cursor: "pointer"
                    }}
                  >
                    Send Inquiry
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 5: EXECUTIVE APPLICANT RESUME & CURRICULUM VITAE (CV) VIEWER        */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showResumeModal && activeResumeApplicant && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.85)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "20px"
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              style={{
                background: "#0F172A",
                border: "1px solid #6366F1",
                borderRadius: "18px",
                width: "100%",
                maxWidth: "760px",
                maxHeight: "90vh",
                overflowY: "auto",
                padding: "28px",
                boxShadow: "0 25px 60px rgba(0, 0, 0, 0.7), 0 0 35px rgba(99, 102, 241, 0.25)"
              }}
            >
              {/* Modal Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #1E293B", paddingBottom: "16px", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "14px",
                      background: "linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%)",
                      color: "#FFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.6rem",
                      fontWeight: 800,
                      boxShadow: "0 4px 14px rgba(79, 70, 229, 0.4)"
                    }}
                  >
                    {activeResumeApplicant.fullName.charAt(0)}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <h2 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 800, color: "#F8FAFC" }}>
                        {activeResumeApplicant.fullName}
                      </h2>
                      <span
                        style={{
                          background: "rgba(99, 102, 241, 0.2)",
                          color: "#A5B4FC",
                          border: "1px solid rgba(99, 102, 241, 0.4)",
                          fontSize: "0.74rem",
                          fontWeight: 800,
                          padding: "3px 9px",
                          borderRadius: "8px"
                        }}
                      >
                        {activeResumeApplicant.id}
                      </span>
                    </div>
                    <p style={{ margin: "3px 0 0", color: "#60A5FA", fontSize: "0.86rem", fontWeight: 600 }}>
                      {activeResumeApplicant.resume?.title || activeResumeApplicant.requestedRoleTitle}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowResumeModal(false)}
                  style={{
                    background: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid #334155",
                    color: "#94A3B8",
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.1rem"
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Candidate Info Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "10px",
                  background: "#020617",
                  padding: "14px 18px",
                  borderRadius: "12px",
                  border: "1px solid #1E293B",
                  marginBottom: "20px",
                  fontSize: "0.82rem"
                }}
              >
                <div style={{ color: "#94A3B8" }}>
                  <strong style={{ color: "#E2E8F0" }}>📧 Email:</strong> {activeResumeApplicant.email}
                </div>
                <div style={{ color: "#94A3B8" }}>
                  <strong style={{ color: "#E2E8F0" }}>📱 Phone:</strong> {activeResumeApplicant.phone}
                </div>
                <div style={{ color: "#94A3B8" }}>
                  <strong style={{ color: "#E2E8F0" }}>🆔 National ID:</strong> {activeResumeApplicant.aadhaarNumber}
                </div>
                <div style={{ color: "#94A3B8" }}>
                  <strong style={{ color: "#E2E8F0" }}>🎯 Target Role:</strong>{" "}
                  <span style={{ color: "#F59E0B", fontWeight: 700 }}>{activeResumeApplicant.requestedRoleTitle}</span>
                </div>
              </div>

              {/* Executive Summary */}
              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ margin: "0 0 8px", fontSize: "0.92rem", fontWeight: 800, color: "#E2E8F0", display: "flex", alignItems: "center", gap: "8px" }}>
                  <FiBookOpen style={{ color: "#818CF8" }} /> Executive Profile & Experience Summary
                </h4>
                <div style={{ background: "#020617", padding: "12px 16px", borderRadius: "10px", border: "1px solid #1E293B", color: "#CBD5E1", fontSize: "0.84rem", lineHeight: "1.5" }}>
                  {activeResumeApplicant.resume?.summary || activeResumeApplicant.experience}
                </div>
              </div>

              {/* Work History */}
              {activeResumeApplicant.resume?.workExperience && (
                <div style={{ marginBottom: "20px" }}>
                  <h4 style={{ margin: "0 0 10px", fontSize: "0.92rem", fontWeight: 800, color: "#E2E8F0", display: "flex", alignItems: "center", gap: "8px" }}>
                    <FiBriefcase style={{ color: "#34D399" }} /> Career History & Operational Milestones
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {activeResumeApplicant.resume.workExperience.map((exp, idx) => (
                      <div key={idx} style={{ background: "#020617", padding: "12px 16px", borderRadius: "10px", border: "1px solid #1E293B" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 800, fontSize: "0.88rem", color: "#F8FAFC" }}>{exp.role}</span>
                          <span style={{ fontSize: "0.75rem", color: "#60A5FA", fontWeight: 700, background: "rgba(59, 130, 246, 0.15)", padding: "2px 8px", borderRadius: "6px" }}>
                            {exp.duration}
                          </span>
                        </div>
                        <div style={{ color: "#94A3B8", fontSize: "0.8rem", fontWeight: 600, marginTop: "2px" }}>
                          🏢 {exp.company}
                        </div>
                        <p style={{ margin: "6px 0 0", color: "#CBD5E1", fontSize: "0.82rem", lineHeight: "1.4" }}>
                          {exp.responsibilities}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education & Certifications */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>
                <div style={{ background: "#020617", padding: "14px", borderRadius: "10px", border: "1px solid #1E293B" }}>
                  <h5 style={{ margin: "0 0 8px", color: "#A5B4FC", fontSize: "0.82rem", fontWeight: 800 }}>
                    🎓 Higher Education & Credentials
                  </h5>
                  <p style={{ margin: 0, color: "#CBD5E1", fontSize: "0.8rem", lineHeight: "1.4" }}>
                    {activeResumeApplicant.resume?.education || "Bachelor of Technology / Business Administration"}
                  </p>
                </div>

                <div style={{ background: "#020617", padding: "14px", borderRadius: "10px", border: "1px solid #1E293B" }}>
                  <h5 style={{ margin: "0 0 8px", color: "#34D399", fontSize: "0.82rem", fontWeight: 800 }}>
                    📜 Certifications & Accreditations
                  </h5>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {(activeResumeApplicant.resume?.certifications || ["Certified Compliance Auditor", "ISO 9001"]).map((c, i) => (
                      <span key={i} style={{ background: "rgba(16, 185, 129, 0.12)", color: "#34D399", fontSize: "0.72rem", fontWeight: 700, padding: "2px 8px", borderRadius: "6px", border: "1px solid rgba(16, 185, 129, 0.25)" }}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Skills Grid */}
              {activeResumeApplicant.resume?.skills && (
                <div style={{ marginBottom: "20px" }}>
                  <h5 style={{ margin: "0 0 8px", color: "#94A3B8", fontSize: "0.8rem", fontWeight: 700 }}>
                    ⚡ Key Core Competencies & Compliance Tooling:
                  </h5>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {activeResumeApplicant.resume.skills.map((s, i) => (
                      <span key={i} style={{ background: "rgba(255, 255, 255, 0.05)", color: "#E2E8F0", fontSize: "0.74rem", padding: "4px 10px", borderRadius: "6px", border: "1px solid #334155" }}>
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Attached Resume Document Badge */}
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)",
                  border: "1px dashed #4F46E5",
                  borderRadius: "12px",
                  padding: "14px 18px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "24px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "rgba(239, 68, 68, 0.15)", color: "#F87171", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" }}>
                    <FiFileText />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "0.85rem", color: "#F8FAFC" }}>
                      {activeResumeApplicant.resume?.attachedFileName || `Resume_${activeResumeApplicant.fullName.replace(/\s+/g, '_')}_CV.pdf`}
                    </div>
                    <div style={{ fontSize: "0.74rem", color: "#94A3B8" }}>
                      {activeResumeApplicant.resume?.attachedFileSize || "2.8 MB"} • Cryptographic SHA-256 Verified
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => toast.info(`📄 Opening verified digital resume document for ${activeResumeApplicant.fullName}...`)}
                  style={{
                    background: "rgba(99, 102, 241, 0.2)",
                    color: "#A5B4FC",
                    border: "1px solid rgba(99, 102, 241, 0.4)",
                    padding: "8px 14px",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <FiDownload /> Download CV
                </button>
              </div>

              {/* Action Bar */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", borderTop: "1px solid #1E293B", paddingTop: "18px" }}>
                <button
                  type="button"
                  onClick={() => setShowResumeModal(false)}
                  style={{
                    background: "transparent",
                    color: "#94A3B8",
                    border: "1px solid #334155",
                    padding: "10px 18px",
                    borderRadius: "8px",
                    fontSize: "0.84rem",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  Close Viewer
                </button>

                {activeResumeApplicant.status === "PENDING" && (
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => {
                        setSelectedApplicant(activeResumeApplicant);
                        setAssignRoleChoice(activeResumeApplicant.requestedRole || "executor");
                        setShowResumeModal(false);
                      }}
                      style={{
                        background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                        color: "#FFF",
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        fontWeight: 800,
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)"
                      }}
                    >
                      <FiCheckCircle /> ⚡ Approve & Assign Role
                    </button>
                    <button
                      onClick={() => {
                        setSelectedApplicant(activeResumeApplicant);
                        setShowRejectModal(true);
                        setShowResumeModal(false);
                      }}
                      style={{
                        background: "rgba(239, 68, 68, 0.15)",
                        color: "#F87171",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        padding: "10px 16px",
                        borderRadius: "8px",
                        fontWeight: 700,
                        fontSize: "0.84rem",
                        cursor: "pointer"
                      }}
                    >
                      <FiXCircle /> Reject Candidate
                    </button>
                  </div>
                )}

                {activeResumeApplicant.status === "APPROVED" && (
                  <div style={{ color: "#34D399", fontWeight: 800, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
                    <FiCheckCircle /> Approved as {activeResumeApplicant.assignedRoleTitle}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
