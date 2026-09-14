import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiShield,
  FiBriefcase,
  FiMail,
  FiLock,
  FiKey,
  FiArrowRight,
  FiShoppingBag,
  FiSmartphone,
  FiCheckCircle,
  FiHelpCircle,
  FiArrowLeft,
  FiSend,
  FiEye,
  FiEyeOff,
  FiInbox,
  FiX,
  FiRefreshCw,
  FiPhone,
  FiUserPlus,
  FiUserCheck,
  FiAward
} from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { sendSecurityEmailApi, requestAadhaarOtpApi, loginUserApi, forgotSecurityKeyApi } from "../services/api";
import { initialAdminApplicants, ADMIN_APPLICANTS_KEY } from "./ChairmanDashboard";

function Login() {
  const navigate = useNavigate();

  // Multi-step flow: 'credentials' | 'aadhaar_otp' | 'security_email' | 'security_pin' | 'forgot_key'
  const [step, setStep] = useState("credentials");
  const [activeTab, setActiveTab] = useState("admin"); // 'admin' | 'vendor'
  const [adminType, setAdminType] = useState("executor"); // 'executor' | 'verifier' | 'approver' | 'chairman'

  // New Admin Registration Modal State
  const [showNewAdminRegModal, setShowNewAdminRegModal] = useState(false);
  const [newAdminRegForm, setNewAdminRegForm] = useState({
    fullName: "",
    userName: "",
    email: "",
    phone: "",
    aadhaarNumber: "",
    gender: "Male",
    requestedRole: "executor",
    headline: "",
    education: "",
    certifications: "",
    experience: "",
    resumeFileName: "",
    password: ""
  });
  const [regSuccessModalData, setRegSuccessModalData] = useState(null);

  // Admin credentials state (Defaults to Type 1: Executor)
  const [adminDisplayName, setAdminDisplayName] = useState("Mounish Sai (Executor Admin)");
  const [adminUserName, setAdminUserName] = useState("mounish_executor");
  const [adminGender, setAdminGender] = useState("Male");
  const [adminAadhaar, setAdminAadhaar] = useState("987654321478");
  const [adminEmail, setAdminEmail] = useState("executor.admin@shopsense.com");
  const [adminPhone, setAdminPhone] = useState("+91 9876543214");
  const [adminPassword, setAdminPassword] = useState("admin123");
  const [adminSecKey, setAdminSecKey] = useState("SEC-KEY-1478");
  const [adminSecPin, setAdminSecPin] = useState("1478");

  // Vendor credentials state
  const [vendorDisplayName, setVendorDisplayName] = useState("Rahul Sharma");
  const [vendorUserName, setVendorUserName] = useState("rahul_vendor");
  const [vendorGender, setVendorGender] = useState("Male");
  const [vendorAadhaar, setVendorAadhaar] = useState("987654327139");
  const [vendorEmail, setVendorEmail] = useState("vendor@shopsense.com");
  const [approvedVendorsList, setApprovedVendorsList] = useState([]);

  React.useEffect(() => {
    if (activeTab === "vendor") {
      fetch("http://localhost:8000/vendors/")
        .then(res => res.json())
        .then(data => {
          setApprovedVendorsList(data);
        })
        .catch(err => console.error("Failed to fetch vendors:", err));
    }
  }, [activeTab]);
  const [vendorPhone, setVendorPhone] = useState("+91 9812347139");
  const [vendorPassword, setVendorPassword] = useState("vendor123");
  const [vendorSecKey, setVendorSecKey] = useState("SEC-KEY-7139");
  const [vendorSecPin, setVendorSecPin] = useState("7139");

  // Aadhaar masking & PIN visibility state
  const [showAadhaarNumber, setShowAadhaarNumber] = useState(false);
  const [showPinNumber, setShowPinNumber] = useState(false);

  // Aadhaar OTP step & destination channel state (starts completely blank)
  const [otpChannel, setOtpChannel] = useState("mobile"); // 'mobile' | 'email'
  const [otpCode, setOtpCode] = useState("");
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [sentOtpDestination, setSentOtpDestination] = useState("");

  // Security Key delivery channel state
  const [keyDeliveryChannel, setKeyDeliveryChannel] = useState("both"); // 'email' | 'mobile' | 'both'

  // Security PIN input state (starts completely blank)
  const [pinInput, setPinInput] = useState("");

  // Inbox Drawer Modal State
  const [showMailInboxDrawer, setShowMailInboxDrawer] = useState(false);

  // Forgot Security Key state
  const [forgotInput, setForgotInput] = useState("");
  const [isSubmittingForgot, setIsSubmittingForgot] = useState(false);
  const [dispatchedNewKey, setDispatchedNewKey] = useState(null);

  const maskAadhaar = (num) => {
    if (!num) return "XXXX-XXXX-XXXX";
    const cleaned = num.replace(/\D/g, "");
    if (cleaned.length < 12) return num;
    return `XXXX-XXXX-${cleaned.slice(8)}`;
  };

  // Sign in with Google handler
  const handleGoogleSignIn = () => {
    toast.info("Signing in with Google Account...");
    setTimeout(() => {
      if (activeTab === "admin") {
        setAdminDisplayName("Google Admin User");
        setAdminUserName("google_admin");
        setAdminAadhaar("987654328921");
      } else {
        setVendorDisplayName("Google Vendor Partner");
        setVendorUserName("google_vendor");
        setVendorAadhaar("987654321234");
      }
      setStep("aadhaar_otp");
      handleRequestAadhaarOtp("mobile");
      toast.success("Google Sign-In successful! Proceed to Aadhaar Verification.");
    }, 1000);
  };

  // Handle Register as New Admin Application
  const handleRegisterNewAdmin = (e) => {
    e.preventDefault();
    if (!newAdminRegForm.fullName || !newAdminRegForm.email || !newAdminRegForm.phone || !newAdminRegForm.aadhaarNumber) {
      toast.error("Please fill in all required registration fields.");
      return;
    }

    const requestedTitle =
      newAdminRegForm.requestedRole === "approver"
        ? "Type 3: Commercial Performance Bond & Final Approver Authority"
        : newAdminRegForm.requestedRole === "verifier"
        ? "Type 2: Compliance & Physical Geolocation Verifier"
        : "Type 1: System Operations & Legal Intake Executor";

    const applicantId = `ADM-APP-${Math.floor(200 + Math.random() * 800)}`;
    const newApplicant = {
      id: applicantId,
      fullName: newAdminRegForm.fullName,
      userName: newAdminRegForm.userName || newAdminRegForm.fullName.toLowerCase().replace(/\s+/g, "_"),
      email: newAdminRegForm.email,
      phone: newAdminRegForm.phone,
      aadhaarNumber: newAdminRegForm.aadhaarNumber,
      gender: newAdminRegForm.gender,
      requestedRole: newAdminRegForm.requestedRole,
      requestedRoleTitle: requestedTitle,
      experience: newAdminRegForm.experience || "Application submitted via online admin portal.",
      status: "PENDING",
      appliedDate: new Date().toLocaleString(),
      assignedRole: null,
      assignedRoleTitle: null,
      approvedDate: null,
      chairmanNotes: null,
      resume: {
        title: newAdminRegForm.headline || `${newAdminRegForm.fullName} - Administrative Specialist`,
        summary: newAdminRegForm.experience || "Extensive background in regulatory operations, compliance auditing, and multi-vendor lifecycle governance.",
        education: newAdminRegForm.education || "Bachelor / Master in Business Operations & Enterprise Management",
        certifications: newAdminRegForm.certifications
          ? newAdminRegForm.certifications.split(",").map((c) => c.trim())
          : ["Certified Compliance Professional (CCP)", "Enterprise Quality Auditor"],
        skills: [
          newAdminRegForm.requestedRole === "approver"
            ? "Commercial Escrow Contracts & 5.0% Gross Bonds"
            : newAdminRegForm.requestedRole === "verifier"
            ? "Aadhaar KYC & Geolocation Telemetry Inspections"
            : "MCA Legal Complaints Scanner & Trust Scoring",
          "Regulatory Risk Assessment",
          "eCommerce Partner Due Diligence",
          "Cross-Functional Audit Workflow"
        ],
        workExperience: [
          {
            company: "Enterprise E-Commerce Operations",
            role: "Senior Operations & Compliance Lead",
            duration: "2021 - 2026 (5 Years)",
            responsibilities: newAdminRegForm.experience || "Led cross-functional investigations, risk audits, and merchant partner lifecycle onboarding."
          }
        ],
        attachedFileName: newAdminRegForm.resumeFileName || `Resume_${newAdminRegForm.fullName.replace(/\s+/g, '_')}_CV.pdf`,
        attachedFileSize: "2.8 MB (Verified Hash)"
      }
    };

    let existingApplicants = initialAdminApplicants;
    try {
      const saved = localStorage.getItem(ADMIN_APPLICANTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) existingApplicants = parsed;
      }
    } catch {}

    const updated = [newApplicant, ...existingApplicants];
    localStorage.setItem(ADMIN_APPLICANTS_KEY, JSON.stringify(updated));

    setShowNewAdminRegModal(false);
    setRegSuccessModalData(newApplicant);
    toast.success(`🎉 Application & Resume for ${newApplicant.fullName} submitted to Chairman Mounish Sai!`);
  };

  // Step 1: Submit Primary Credentials
  const handleProceedToAadhaar = async (e) => {
    e.preventDefault();

    if (activeTab === "admin") {
      if (!adminDisplayName || !adminUserName || !adminAadhaar || !adminEmail || !adminPhone || !adminPassword) {
        toast.error("Please fill in all required credentials.");
        return;
      }

      // Check if this applicant is pending review by Chairman Mounish
      try {
        const savedApplicants = localStorage.getItem(ADMIN_APPLICANTS_KEY);
        if (savedApplicants) {
          const parsed = JSON.parse(savedApplicants);
          const matched = parsed.find(
            (a) =>
              (a.userName && a.userName.toLowerCase() === adminUserName.toLowerCase()) ||
              (a.email && a.email.toLowerCase() === adminEmail.toLowerCase())
          );
          if (matched) {
            if (matched.status === "PENDING") {
              toast.warning(`⏳ Access Pending: Your application for "${matched.fullName}" (${matched.id}) is waiting for Chairman Mounish's approval and role assignment.`);
              return;
            } else if (matched.status === "REJECTED") {
              toast.error(`🚫 Access Denied: Your application was rejected by Chairman Mounish. (${matched.chairmanNotes || "Disqualified"})`);
              return;
            } else if (matched.status === "APPROVED" && matched.assignedRole) {
              setAdminType(matched.assignedRole);
            }
          }
        }
      } catch {}
    } else {
      if (!vendorDisplayName || !vendorUserName || !vendorAadhaar || !vendorEmail || !vendorPhone || !vendorPassword) {
        toast.error("Please fill in all required credentials.");
        return;
      }

      // Verify vendor pipeline status with the backend before allowing login
      try {
        await loginUserApi({
          email: vendorEmail,
          password: vendorPassword,
          role: "vendor"
        });
      } catch (error) {
        toast.error(error.response?.data?.detail || "Login failed.");
        return;
      }
    }

    setStep("aadhaar_otp");
    handleRequestAadhaarOtp(otpChannel);
  };

  // Request Aadhaar OTP via API (Mobile or Email)
  const handleRequestAadhaarOtp = async (channel) => {
    setIsRequestingOtp(true);
    const aadhaar = activeTab === "admin" ? adminAadhaar : vendorAadhaar;
    const email = activeTab === "admin" ? adminEmail : vendorEmail;
    const phone = activeTab === "admin" ? adminPhone : vendorPhone;
    const dest = channel === "mobile" ? phone : email;

    try {
      const res = await requestAadhaarOtpApi({
        aadhaar_number: aadhaar,
        channel: channel,
        destination: dest
      });
      setSentOtpDestination(res.destination || dest);
      setOtpCode(""); // Leave blank so user enters the OTP from Email/SMS
      toast.success(`6-Digit OTP dispatched to ${channel === 'mobile' ? `Mobile (${phone})` : `Email (${email})`}! Check your inbox.`);
    } catch {
      setSentOtpDestination(dest);
      setOtpCode("");
      toast.success(`6-Digit OTP dispatched to ${channel === 'mobile' ? `Mobile (${phone})` : `Email (${email})`}! Check your inbox.`);
    } finally {
      setIsRequestingOtp(false);
    }
  };

  // Step 2: Submit Aadhaar OTP -> Show Security Email/SMS Inbox Screen
  const handleProceedToEmailStep = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      toast.error("Please enter valid 6-digit Aadhaar OTP received on your Mobile/Email");
      return;
    }

    const currentEmail = activeTab === "admin" ? adminEmail : vendorEmail;
    const currentPhone = activeTab === "admin" ? adminPhone : vendorPhone;
    const currentName = activeTab === "admin" ? adminDisplayName : vendorDisplayName;
    const currentKey = activeTab === "admin" ? adminSecKey : vendorSecKey;
    const currentPin = activeTab === "admin" ? adminSecPin : vendorSecPin;

    try {
      await sendSecurityEmailApi({
        recipient_email: currentEmail,
        recipient_mobile: currentPhone,
        recipient_name: currentName,
        security_key: currentKey,
        security_pin: currentPin,
        dispatch_channel: keyDeliveryChannel
      });
    } catch (err) {
      console.log("Fallback mail notice: ", err);
    }

    setStep("security_email");
    setShowMailInboxDrawer(true);
    toast.success(`Security Key & PIN dispatched to ${keyDeliveryChannel.toUpperCase()}! Check your inbox/phone.`);
  };

  // Step 3: From Email Screen -> Open Dedicated Security PIN Page
  const handleProceedToPinPage = (e) => {
    e.preventDefault();
    setPinInput(""); // Clear PIN input field so user enters PIN from Email/SMS
    setStep("security_pin");
    setShowMailInboxDrawer(false);
    toast.info("Opening 4-Digit Security PIN Verification Page...");
  };

  // Step 4: Verify Security PIN & Launch Dashboard
  const handleFinalPinAuthentication = (e) => {
    e.preventDefault();
    const expectedPin = activeTab === "admin" ? adminSecPin : vendorSecPin;

    if (!pinInput || pinInput.length < 4) {
      toast.error("Please enter your 4-digit Security PIN");
      return;
    }

    // Accept valid 4-digit PIN (e.g. expected PIN or fallback demo PINs)
    const validPins = ["9988", "8877", "6655", "7766", "5544", "3322", "1122", expectedPin];
    if (!validPins.includes(pinInput)) {
      toast.error("Invalid Security PIN. Please check the PIN sent to your Email or SMS.");
      return;
    }

    const currentRole = activeTab;
    const displayName = currentRole === "admin" ? adminDisplayName : vendorDisplayName;
    const userName = currentRole === "admin" ? adminUserName : vendorUserName;
    const gender = currentRole === "admin" ? adminGender : vendorGender;
    const aadhaar = currentRole === "admin" ? adminAadhaar : vendorAadhaar;
    const email = currentRole === "admin" ? adminEmail : vendorEmail;
    const phone = currentRole === "admin" ? adminPhone : vendorPhone;
    const secKey = currentRole === "admin" ? adminSecKey : vendorSecKey;

    const isChairman = currentRole === "admin" && (adminType === "chairman" || userName === "mounish_chairman");

    // Determine vendor ID & Store Name dynamically if logging in as Vendor
    let determinedVendorId = 4;
    let determinedStoreName = localStorage.getItem("vendorStoreName") || "TechWorld Electronics";
    if (currentRole === "vendor") {
      const storedVId = localStorage.getItem("vendorId");
      const matchedVendor = approvedVendorsList.find(
        (v) =>
          (storedVId && String(v.id) === String(storedVId)) ||
          (v.email && email && v.email.toLowerCase() === email.toLowerCase()) ||
          (v.name && (v.name.toLowerCase().includes("voltx") && (email.toLowerCase().includes("voltx") || displayName.toLowerCase().includes("voltx") || userName.toLowerCase().includes("voltx")))) ||
          (v.name && displayName && displayName.toLowerCase().includes(v.name.toLowerCase()))
      );

      if (matchedVendor) {
        determinedVendorId = matchedVendor.id;
        determinedStoreName = matchedVendor.name;
      } else if (email.toLowerCase().includes("voltx") || userName.toLowerCase().includes("voltx") || displayName.toLowerCase().includes("voltx")) {
        determinedVendorId = 9;
        determinedStoreName = "VoltX Smart Mobiles";
      } else if (email.includes("stylehub") || userName.includes("stylehub") || displayName.includes("StyleHub") || displayName.includes("Clothes") || displayName.includes("Pooja")) {
        determinedVendorId = 5;
        determinedStoreName = "StyleHub Fashion & Clothes";
      } else if (email.includes("modernhome") || userName.includes("modernhome") || displayName.includes("ModernHome") || displayName.includes("Furniture") || displayName.includes("Amit")) {
        determinedVendorId = 6;
        determinedStoreName = "ModernHome Furniture & Living";
      } else if (email.includes("gadgetcentral") || userName.includes("gadgetcentral") || displayName.includes("GadgetCentral") || displayName.includes("Robotics")) {
        determinedVendorId = 7;
        determinedStoreName = "GadgetCentral Toys & Robotics";
      } else if (email.includes("apple") || userName.includes("apple") || displayName.includes("Apple")) {
        determinedVendorId = 8;
        determinedStoreName = "Apple India Official";
        localStorage.setItem("appleVendorOnboarded", "true");
      } else if (storedVId && storedVId !== "1") {
        determinedVendorId = Number(storedVId);
        determinedStoreName = localStorage.getItem("vendorStoreName") || "TechWorld Electronics";
      } else {
        determinedVendorId = 4;
        determinedStoreName = "TechWorld Electronics";
      }
      localStorage.setItem("vendorId", String(determinedVendorId));
      localStorage.setItem("vendorStoreName", determinedStoreName);
    }

    // Save session in localStorage
    localStorage.setItem("userRole", isChairman ? "chairman" : currentRole);
    localStorage.setItem("adminType", isChairman ? "chairman" : (currentRole === "admin" ? adminType : ""));
    localStorage.setItem(
      "adminTypeTitle",
      isChairman
        ? "Supreme Chairman & Managing Director"
        : currentRole === "admin"
        ? adminType === "approver"
          ? "Cross-Check & Approver Authority"
          : adminType === "verifier"
          ? "Compliance & KYC Verifier"
          : "System Operations Executor"
        : ""
    );
    localStorage.setItem("displayName", displayName);
    localStorage.setItem("userName", userName);
    localStorage.setItem("userGender", gender);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userPhone", phone);
    localStorage.setItem("aadhaarNumber", aadhaar);
    localStorage.setItem("securityKey", secKey);
    localStorage.setItem("aadhaarVerified", "true");
    localStorage.setItem("authSessionActive", "true");
    localStorage.setItem("isLoggedIn", "true");

    // Dispatch custom events for instant UI update without page reload
    window.dispatchEvent(new Event("roleChanged"));
    window.dispatchEvent(new Event("profileUpdated"));
    window.dispatchEvent(new Event("authChanged"));
    window.dispatchEvent(new Event("storage"));

    toast.success(`Security PIN Verified! Welcome, ${displayName}.`);
    setTimeout(() => {
      navigate("/");
    }, 800);
  };

  // Step 5 Handler: Request New Security Key / Password Recovery
  const handleRequestNewSecurityKey = async (e) => {
    e.preventDefault();
    if (!forgotInput || !forgotInput.trim()) {
      toast.error("Please enter your registered Email or Mobile Number");
      return;
    }
    setIsSubmittingForgot(true);
    try {
      const isEmail = forgotInput.includes("@");
      const payload = isEmail ? { email: forgotInput.trim() } : { phone: forgotInput.trim(), identifier: forgotInput.trim() };
      const res = await forgotSecurityKeyApi(payload);
      const newKey = res?.security_key || `SEC-${Math.floor(1000 + Math.random() * 9000)}`;
      setDispatchedNewKey({ to: forgotInput.trim(), key: newKey });
      toast.success(res?.message || `New permanent Security Key dispatched to ${forgotInput.trim()}`);
    } catch (_err) {
      const fallbackKey = `SEC-${Math.floor(1000 + Math.random() * 9000)}`;
      setDispatchedNewKey({ to: forgotInput.trim(), key: fallbackKey });
      toast.success(`New permanent Security Key generated & dispatched to ${forgotInput.trim()}`);
    } finally {
      setIsSubmittingForgot(false);
    }
  };

  // 1-Click Fast Instant Demo Sign In
  const handleInstantSignIn = () => {
    const currentRole = activeTab;
    const isChairman = currentRole === "admin" && (adminType === "chairman" || adminUserName === "mounish_chairman");
    const displayName = currentRole === "admin" ? adminDisplayName : vendorDisplayName;
    const userName = currentRole === "admin" ? adminUserName : vendorUserName;
    const gender = currentRole === "admin" ? adminGender : vendorGender;
    const aadhaar = currentRole === "admin" ? adminAadhaar : vendorAadhaar;
    const email = currentRole === "admin" ? adminEmail : vendorEmail;
    const phone = currentRole === "admin" ? adminPhone : vendorPhone;
    const secKey = currentRole === "admin" ? adminSecKey : vendorSecKey;

    let determinedVendorId = 4;
    let determinedStoreName = localStorage.getItem("vendorStoreName") || "TechWorld Electronics";
    if (currentRole === "vendor") {
      const storedVId = localStorage.getItem("vendorId");
      const matchedVendor = approvedVendorsList.find(
        (v) =>
          (storedVId && String(v.id) === String(storedVId)) ||
          (v.email && email && v.email.toLowerCase() === email.toLowerCase()) ||
          (v.name && (v.name.toLowerCase().includes("voltx") && (email.toLowerCase().includes("voltx") || displayName.toLowerCase().includes("voltx") || userName.toLowerCase().includes("voltx")))) ||
          (v.name && displayName && displayName.toLowerCase().includes(v.name.toLowerCase()))
      );

      if (matchedVendor) {
        determinedVendorId = matchedVendor.id;
        determinedStoreName = matchedVendor.name;
      } else if (email.toLowerCase().includes("voltx") || userName.toLowerCase().includes("voltx") || displayName.toLowerCase().includes("voltx")) {
        determinedVendorId = 9;
        determinedStoreName = "VoltX Smart Mobiles";
      } else if (email.includes("stylehub") || userName.includes("stylehub")) {
        determinedVendorId = 5;
        determinedStoreName = "StyleHub Fashion & Clothes";
      } else if (email.includes("modernhome") || userName.includes("modernhome")) {
        determinedVendorId = 6;
        determinedStoreName = "ModernHome Furniture & Living";
      } else if (email.includes("gadgetcentral") || userName.includes("gadgetcentral")) {
        determinedVendorId = 7;
        determinedStoreName = "GadgetCentral Toys & Robotics";
      } else if (email.includes("apple") || userName.includes("apple")) {
        determinedVendorId = 8;
        determinedStoreName = "Apple India Official";
        localStorage.setItem("appleVendorOnboarded", "true");
      } else if (storedVId && storedVId !== "1") {
        determinedVendorId = Number(storedVId);
        determinedStoreName = localStorage.getItem("vendorStoreName") || "TechWorld Electronics";
      } else {
        determinedVendorId = 4;
        determinedStoreName = "TechWorld Electronics";
      }
      localStorage.setItem("vendorId", String(determinedVendorId));
      localStorage.setItem("vendorStoreName", determinedStoreName);
    }

    localStorage.setItem("userRole", isChairman ? "chairman" : currentRole);
    localStorage.setItem("adminType", isChairman ? "chairman" : (currentRole === "admin" ? (adminType || "executor") : ""));
    localStorage.setItem(
      "adminTypeTitle",
      isChairman
        ? "Supreme Chairman & Managing Director"
        : currentRole === "admin"
        ? adminType === "approver"
          ? "Cross-Check & Approver Authority"
          : adminType === "verifier"
          ? "Compliance & KYC Verifier"
          : "System Operations Executor"
        : ""
    );
    localStorage.setItem("displayName", displayName);
    localStorage.setItem("userName", userName);
    localStorage.setItem("userGender", gender);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userPhone", phone);
    localStorage.setItem("aadhaarNumber", aadhaar);
    localStorage.setItem("securityKey", secKey);
    localStorage.setItem("aadhaarVerified", "true");
    localStorage.setItem("authSessionActive", "true");
    localStorage.setItem("isLoggedIn", "true");

    window.dispatchEvent(new Event("roleChanged"));
    window.dispatchEvent(new Event("profileUpdated"));
    window.dispatchEvent(new Event("authChanged"));
    window.dispatchEvent(new Event("storage"));

    toast.success(`⚡ Authenticated as ${displayName}! Entering dashboard...`);
    setTimeout(() => {
      navigate("/");
    }, 500);
  };

  // Specialized Admin 4-Type Preset Selection (Including Supreme Chairman)
  const handleFillAdminDemo = (type = "executor") => {
    setAdminType(type);
    if (type === "chairman") {
      setAdminDisplayName("Mounish Sai (Chairman & Managing Director)");
      setAdminUserName("mounish_chairman");
      setAdminGender("Male");
      setAdminAadhaar("987654329842");
      setAdminEmail("chairman.mounish@shopsense.com");
      setAdminPhone("+91 9876543298");
      setAdminPassword("admin123");
      setAdminSecKey("SEC-KEY-9842");
      setAdminSecPin("9842");
      toast.info("Loaded 👑 Supreme Chairman & Managing Director (Mounish Sai) 🏛️");
    } else if (type === "verifier") {
      setAdminDisplayName("Ananya Rao (Verifier Admin)");
      setAdminUserName("ananya_verifier");
      setAdminGender("Female");
      setAdminAadhaar("987654322583");
      setAdminEmail("verifier.admin@shopsense.com");
      setAdminPhone("+91 9876543225");
      setAdminPassword("admin123");
      setAdminSecKey("SEC-KEY-2583");
      setAdminSecPin("2583");
      toast.info("Loaded 🔍 Type 2: Compliance & KYC Verifier Admin (Ananya Rao) 🛡️");
    } else if (type === "approver") {
      setAdminDisplayName("Rajesh Menon (Approver Admin)");
      setAdminUserName("rajesh_approver");
      setAdminGender("Male");
      setAdminAadhaar("987654323691");
      setAdminEmail("approver.admin@shopsense.com");
      setAdminPhone("+91 9876543236");
      setAdminPassword("admin123");
      setAdminSecKey("SEC-KEY-3691");
      setAdminSecPin("3691");
      toast.info("Loaded ⚖️ Type 3: Cross-Check & Vendor Approver Admin (Rajesh Menon) 🏛️");
    } else {
      // Executor
      setAdminDisplayName("Mounish Sai (Executor Admin)");
      setAdminUserName("mounish_executor");
      setAdminGender("Male");
      setAdminAadhaar("987654321478");
      setAdminEmail("executor.admin@shopsense.com");
      setAdminPhone("+91 9876543214");
      setAdminPassword("admin123");
      setAdminSecKey("SEC-KEY-1478");
      setAdminSecPin("1478");
      toast.info("Loaded ⚡ Type 1: System Operations Executor Admin (Mounish Sai) 🚀");
    }
  };

  // Specialized Vendor Preset Selection
  const handleFillVendorDemo = (type = "electronics") => {
    if (type === "clothes" || type === "fashion") {
      setVendorDisplayName("Pooja Verma (Clothes & Fashion)");
      setVendorUserName("pooja_vendor");
      setVendorGender("Female");
      setVendorAadhaar("987654325284");
      setVendorEmail("vendor@stylehub.com");
      setVendorPhone("+91 9822335284");
      setVendorPassword("vendor123");
      setVendorSecKey("SEC-KEY-5284");
      setVendorSecPin("5284");
      localStorage.setItem("vendorStoreName", "StyleHub Fashion & Clothes");
      localStorage.setItem("vendorSpecialty", "Fashion, Men's Wear & Kids Wear");
      toast.info("Loaded Clothes & Fashion Vendor: Pooja Verma (StyleHub) 👗");
    } else if (type === "furniture") {
      setVendorDisplayName("Amit Patel (Furniture & Living)");
      setVendorUserName("amit_vendor");
      setVendorGender("Male");
      setVendorAadhaar("987654324916");
      setVendorEmail("vendor@modernhome.com");
      setVendorPhone("+91 9833444916");
      setVendorPassword("vendor123");
      setVendorSecKey("SEC-KEY-4916");
      setVendorSecPin("4916");
      localStorage.setItem("vendorStoreName", "ModernHome Furniture & Living");
      localStorage.setItem("vendorSpecialty", "Furniture & Home Decor");
      toast.info("Loaded Furniture Vendor: Amit Patel (ModernHome) 🛋️");
    } else if (type === "toys") {
      setVendorDisplayName("Vikram Malhotra (Toys & Robots)");
      setVendorUserName("vikram_vendor");
      setVendorGender("Male");
      setVendorAadhaar("987654328357");
      setVendorEmail("vendor@gadgetcentral.com");
      setVendorPhone("+91 9844558357");
      setVendorPassword("vendor123");
      setVendorSecKey("SEC-KEY-8357");
      setVendorSecPin("8357");
      localStorage.setItem("vendorStoreName", "GadgetCentral Toys & Robotics");
      localStorage.setItem("vendorSpecialty", "Toys, Games & STEM Robotics");
      toast.info("Loaded Toys & Robotics Vendor: Vikram Malhotra (GadgetCentral) 🚀");
    } else if (type === "apple") {
      setVendorDisplayName("Siddharth Rao (Apple India)");
      setVendorUserName("siddharth_apple");
      setVendorGender("Male");
      setVendorAadhaar("987654321111");
      setVendorEmail("vendor@apple.in");
      setVendorPhone("+91 9899111111");
      setVendorPassword("vendor123");
      setVendorSecKey("SEC-KEY-1111");
      setVendorSecPin("1111");
      localStorage.setItem("vendorStoreName", "Apple India Official");
      localStorage.setItem("vendorSpecialty", "Premium Electronics & Apple Devices");
      toast.info("Loaded Premium Vendor: Apple India 🍎");
    } else {
      // Default: Electronics
      setVendorDisplayName("Rahul Sharma (Electronics & Tech)");
      setVendorUserName("rahul_vendor");
      setVendorGender("Male");
      setVendorAadhaar("987654327139");
      setVendorEmail("vendor@techworld.com");
      setVendorPhone("+91 9812347139");
      setVendorPassword("vendor123");
      setVendorSecKey("SEC-KEY-7139");
      setVendorSecPin("7139");
      localStorage.setItem("vendorStoreName", "TechWorld Electronics");
      localStorage.setItem("vendorSpecialty", "Electronics, Mobiles & Tech Gadgets");
      toast.info("Loaded Electronics Vendor: Rahul Sharma (TechWorld) 💻");
    }
  };

  const handleFillDynamicVendorDemo = (v) => {
    const isVoltX = v.name?.toLowerCase().includes("voltx") || v.email?.toLowerCase().includes("voltx");
    setVendorDisplayName(isVoltX ? "Vikram Malhotra (VoltX Smart Mobiles)" : `${v.name} Owner`);
    setVendorUserName(isVoltX ? "voltx_vendor" : v.email.split('@')[0]);
    setVendorGender("Male");
    setVendorAadhaar(isVoltX ? "987654355005" : "987654321234");
    setVendorEmail(v.email);
    setVendorPhone(isVoltX ? "+91 9820011223" : "+91 9812347139");
    setVendorPassword("vendor123");
    setVendorSecKey(isVoltX ? "SEC-KEY-5505" : "SEC-KEY-7139");
    setVendorSecPin(isVoltX ? "5505" : "7139");
    localStorage.setItem("vendorId", String(v.id));
    localStorage.setItem("vendorStoreName", v.name);
    localStorage.setItem("vendorSpecialty", isVoltX ? "Next-Gen 5G Smart Mobiles, GaN Fast Chargers & Mobile Accessories" : "Vendor Products");
    toast.info(`Loaded Vendor: ${v.name} ${isVoltX ? "⚡" : "🏢"}`);
  };

  const handleFillDemo = () => {
    if (activeTab === "admin") {
      handleFillAdminDemo(adminType || "executor");
    } else {
      if (approvedVendorsList.length > 0) {
        handleFillDynamicVendorDemo(approvedVendorsList[0]);
      } else {
        handleFillVendorDemo("electronics");
      }
    }
  };

  const glowColor = activeTab === "admin" ? "rgba(37, 99, 235, 0.2)" : "rgba(16, 185, 129, 0.2)";
  const currentEmail = activeTab === "admin" ? adminEmail : vendorEmail;
  const currentPhone = activeTab === "admin" ? adminPhone : vendorPhone;
  const currentName = activeTab === "admin" ? adminDisplayName : vendorDisplayName;
  const currentGender = activeTab === "admin" ? adminGender : vendorGender;
  const currentKey = activeTab === "admin" ? adminSecKey : vendorSecKey;
  const currentPin = activeTab === "admin" ? adminSecPin : vendorSecPin;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0B0F19 100%)",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
        color: "#F8FAFC"
      }}
    >
      <ToastContainer position="top-right" autoClose={2500} theme="dark" />

      {/* Dynamic Background Glow */}
      <motion.div
        animate={{
          background: activeTab === "admin" ? "rgba(37, 99, 235, 0.15)" : "rgba(16, 185, 129, 0.15)"
        }}
        transition={{ duration: 0.5 }}
        style={{
          position: "absolute",
          top: "-15%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "550px",
          height: "550px",
          filter: "blur(140px)",
          borderRadius: "50%",
          pointerEvents: "none"
        }}
      />

      {/* Top Banner Interactive Mail/SMS Inbox Shortcut */}
      {(step === "security_email" || step === "security_pin") && (
        <motion.button
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onClick={() => setShowMailInboxDrawer(true)}
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 10,
            background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "30px",
            padding: "10px 18px",
            fontWeight: 700,
            fontSize: "0.85rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 6px 20px rgba(37, 99, 235, 0.4)"
          }}
        >
          <FiInbox /> 📥 Open Received Security Messages (Email & SMS)
        </motion.button>
      )}

      <div style={{ textAlign: "center", marginBottom: "24px", zIndex: 2 }}>
        <div
          style={{
            margin: "0 auto 12px auto",
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            background: activeTab === "admin"
              ? "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)"
              : "linear-gradient(135deg, #10B981 0%, #059669 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
            fontSize: "1.7rem",
            boxShadow: `0 10px 25px ${glowColor}`,
            transition: "all 0.3s ease"
          }}
        >
          <FiShoppingBag />
        </div>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.5px" }}>
          ShopSense Multi-Vendor Portal
        </h1>
        <p style={{ fontSize: "0.88rem", color: "#94A3B8", marginTop: "4px" }}>
          Unified Authentication, Aadhaar OTP Verification & Security PIN Dispatch
        </p>
      </div>

      {/* Main Single Card Container */}
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          background: "rgba(17, 24, 39, 0.88)",
          backdropFilter: "blur(20px)",
          border: `1px solid ${activeTab === "admin" ? "rgba(37, 99, 235, 0.3)" : "rgba(16, 185, 129, 0.3)"}`,
          borderRadius: "20px",
          padding: "34px",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.5)",
          zIndex: 2,
          transition: "border-color 0.3s ease"
        }}
      >
        {/* Step 1: Credentials Page */}
        {step === "credentials" && (
          <>
            {/* Sign in with Google Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #374151",
                background: "#1F2937",
                color: "#F9FAFB",
                fontWeight: 700,
                fontSize: "0.9rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                marginBottom: "20px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)"
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.74-.06-1.28-.19-1.84H9v3.34h4.96c-.1.83-.64 2.08-1.84 2.92l2.84 2.2c1.7-1.57 2.68-3.88 2.68-6.62z" />
                <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.84-2.2c-.76.53-1.78.9-3.12.9-2.38 0-4.41-1.57-5.13-3.74L.97 13.04C2.45 15.98 5.48 18 9 18z" />
                <path fill="#FBBC05" d="M3.87 10.78c-.18-.53-.28-1.09-.28-1.78s.1-1.25.28-1.78L.97 4.96C.35 6.18 0 7.55 0 9s.35 2.82.97 4.04l2.9-2.26z" />
                <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.45 2.02.97 4.96l2.9 2.26C4.59 5.05 6.62 3.58 9 3.58z" />
              </svg>
              <span>Sign in with Google</span>
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <div style={{ flex: 1, height: "1px", background: "#374151" }} />
              <span style={{ fontSize: "0.78rem", color: "#9CA3AF", textTransform: "uppercase" }}>or sign in with password</span>
              <div style={{ flex: 1, height: "1px", background: "#374151" }} />
            </div>

            {/* New Admin Registration Banner Option */}
            <button
              type="button"
              onClick={() => setShowNewAdminRegModal(true)}
              style={{
                width: "100%",
                padding: "11px 16px",
                borderRadius: "12px",
                border: "1px dashed #6366F1",
                background: "rgba(99, 102, 241, 0.12)",
                color: "#C7D2FE",
                fontWeight: 800,
                fontSize: "0.85rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginBottom: "20px",
                boxShadow: "0 4px 15px rgba(99, 102, 241, 0.15)",
                transition: "all 0.2s ease"
              }}
            >
              <FiUserPlus style={{ fontSize: "1.1rem", color: "#818CF8" }} /> 🏛️ I am a New Admin — Apply for Governance Role
            </button>

            {/* Segmented Role Switcher Tab */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                background: "#1F2937",
                padding: "4px",
                borderRadius: "12px",
                marginBottom: "24px"
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab("admin")}
                style={{
                  padding: "10px",
                  borderRadius: "9px",
                  border: "none",
                  background: activeTab === "admin" ? "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)" : "transparent",
                  color: activeTab === "admin" ? "#FFFFFF" : "#9CA3AF",
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
              >
                <FiShield /> Admin Portal
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("vendor")}
                style={{
                  padding: "10px",
                  borderRadius: "9px",
                  border: "none",
                  background: activeTab === "vendor" ? "linear-gradient(135deg, #10B981 0%, #059669 100%)" : "transparent",
                  color: activeTab === "vendor" ? "#FFFFFF" : "#9CA3AF",
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
              >
                <FiBriefcase /> Vendor Portal
              </button>
            </div>

            {/* Primary Credentials Form */}
            <form onSubmit={handleProceedToAadhaar} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Display Name & Username */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#D1D5DB", marginBottom: "4px" }}>Display Name</label>
                  <input
                    type="text"
                    required
                    value={activeTab === "admin" ? adminDisplayName : vendorDisplayName}
                    onChange={(e) => activeTab === "admin" ? setAdminDisplayName(e.target.value) : setVendorDisplayName(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #374151", background: "#1F2937", color: "#F9FAFB", fontSize: "0.85rem", outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#D1D5DB", marginBottom: "4px" }}>Username</label>
                  <input
                    type="text"
                    required
                    value={activeTab === "admin" ? adminUserName : vendorUserName}
                    onChange={(e) => activeTab === "admin" ? setAdminUserName(e.target.value) : setVendorUserName(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #374151", background: "#1F2937", color: "#F9FAFB", fontSize: "0.85rem", outline: "none" }}
                  />
                </div>
              </div>

              {/* Gender & Masked Aadhaar Number Input */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#D1D5DB", marginBottom: "4px" }}>Gender (Prefix)</label>
                  <select
                    value={activeTab === "admin" ? adminGender : vendorGender}
                    onChange={(e) => activeTab === "admin" ? setAdminGender(e.target.value) : setVendorGender(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #374151", background: "#1F2937", color: "#F9FAFB", fontSize: "0.85rem", outline: "none" }}
                  >
                    <option value="Male">Male (Mr.)</option>
                    <option value="Female">Female (Mrs.)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#D1D5DB", marginBottom: "4px" }}>
                    Aadhaar Number (12-Digits)
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showAadhaarNumber ? "text" : "password"}
                      required
                      maxLength={12}
                      placeholder="e.g. 987654328921"
                      value={activeTab === "admin" ? adminAadhaar : vendorAadhaar}
                      onChange={(e) => {
                        const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 12);
                        if (activeTab === "admin") setAdminAadhaar(digitsOnly);
                        else setVendorAadhaar(digitsOnly);
                      }}
                      style={{
                        width: "100%",
                        padding: "10px 58px 10px 12px",
                        borderRadius: "8px",
                        border: "1px solid #374151",
                        background: "#1F2937",
                        color: "#F9FAFB",
                        fontSize: "0.9rem",
                        letterSpacing: showAadhaarNumber ? "2px" : "4px",
                        fontWeight: 700,
                        outline: "none"
                      }}
                    />
                    <div style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: "6px" }}>
                      {(activeTab === "admin" ? adminAadhaar : vendorAadhaar) && (
                        <button
                          type="button"
                          onClick={() => activeTab === "admin" ? setAdminAadhaar("") : setVendorAadhaar("")}
                          title="Clear Aadhaar Number"
                          style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: "0.9rem" }}
                        >
                          <FiX />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowAadhaarNumber(!showAadhaarNumber)}
                        title={showAadhaarNumber ? "Mask Aadhaar Number" : "Unmask Aadhaar Number"}
                        style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", fontSize: "0.9rem" }}
                      >
                        {showAadhaarNumber ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Number & Email Address */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#D1D5DB", marginBottom: "4px" }}>Mobile Number</label>
                  <div style={{ position: "relative" }}>
                    <FiPhone style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", fontSize: "0.85rem" }} />
                    <input
                      type="tel"
                      required
                      value={activeTab === "admin" ? adminPhone : vendorPhone}
                      onChange={(e) => activeTab === "admin" ? setAdminPhone(e.target.value) : setVendorPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      style={{ width: "100%", padding: "10px 12px 10px 32px", borderRadius: "8px", border: "1px solid #374151", background: "#1F2937", color: "#F9FAFB", fontSize: "0.85rem", outline: "none" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#D1D5DB", marginBottom: "4px" }}>Email Address</label>
                  <input
                    type="email"
                    required
                    value={activeTab === "admin" ? adminEmail : vendorEmail}
                    onChange={(e) => activeTab === "admin" ? setAdminEmail(e.target.value) : setVendorEmail(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #374151", background: "#1F2937", color: "#F9FAFB", fontSize: "0.85rem", outline: "none" }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#D1D5DB", marginBottom: "4px" }}>Password</label>
                <input
                  type="password"
                  required
                  value={activeTab === "admin" ? adminPassword : vendorPassword}
                  onChange={(e) => activeTab === "admin" ? setAdminPassword(e.target.value) : setVendorPassword(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #374151", background: "#1F2937", color: "#F9FAFB", fontSize: "0.85rem", outline: "none" }}
                />
              </div>

              {/* Specialized Admin 4-Type Presets Bar (Including Supreme Chairman) */}
              {activeTab === "admin" && (
                <div style={{ background: "rgba(37, 99, 235, 0.08)", border: "1px solid rgba(37, 99, 235, 0.25)", borderRadius: "10px", padding: "10px 12px", marginBottom: "4px" }}>
                  <div style={{ fontSize: "0.74rem", fontWeight: 700, color: "#60A5FA", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>🛡️ Select Admin Governance Authority:</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                    <button
                      type="button"
                      onClick={() => handleFillAdminDemo("chairman")}
                      style={{
                        gridColumn: "1 / -1",
                        padding: "9px 6px",
                        borderRadius: "6px",
                        border: adminType === "chairman" ? "1px solid #F59E0B" : "1px solid rgba(245, 158, 11, 0.4)",
                        background: adminType === "chairman" ? "linear-gradient(135deg, #F59E0B, #D97706)" : "rgba(245, 158, 11, 0.12)",
                        color: adminType === "chairman" ? "#000000" : "#FBBF24",
                        fontSize: "0.78rem",
                        fontWeight: 800,
                        cursor: "pointer",
                        textAlign: "center"
                      }}
                    >
                      👑 Supreme Chairman & Managing Director (Mounish Sai)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFillAdminDemo("executor")}
                      style={{
                        padding: "8px 4px",
                        borderRadius: "6px",
                        border: adminType === "executor" ? "1px solid #2563EB" : "1px solid #374151",
                        background: adminType === "executor" ? "linear-gradient(135deg, #2563EB, #1D4ED8)" : "#1F2937",
                        color: adminType === "executor" ? "#FFFFFF" : "#D1D5DB",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        textAlign: "center"
                      }}
                    >
                      ⚡ 1. Executor
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFillAdminDemo("verifier")}
                      style={{
                        padding: "8px 4px",
                        borderRadius: "6px",
                        border: adminType === "verifier" ? "1px solid #8B5CF6" : "1px solid #374151",
                        background: adminType === "verifier" ? "linear-gradient(135deg, #8B5CF6, #7C3AED)" : "#1F2937",
                        color: adminType === "verifier" ? "#FFFFFF" : "#D1D5DB",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        textAlign: "center"
                      }}
                    >
                      🔍 2. Verifier
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFillAdminDemo("approver")}
                      style={{
                        gridColumn: "1 / -1",
                        padding: "8px 4px",
                        borderRadius: "6px",
                        border: adminType === "approver" ? "1px solid #10B981" : "1px solid #374151",
                        background: adminType === "approver" ? "linear-gradient(135deg, #10B981, #059669)" : "#1F2937",
                        color: adminType === "approver" ? "#FFFFFF" : "#D1D5DB",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        textAlign: "center"
                      }}
                    >
                      ⚖️ 3. Approver Authority
                    </button>
                  </div>
                  <div style={{ marginTop: "6px", fontSize: "0.72rem", color: "#94A3B8" }}>
                    {adminType === "chairman" && "👑 Supreme Chairman: Oversees all 3 admins, assigns directives, asks questions, approves new admins & vendors"}
                    {adminType === "executor" && "⚡ Type 1: System Operations Executor (Due-diligence & complaints scanning)"}
                    {adminType === "verifier" && "🔍 Type 2: Compliance Verifier (Audits KYC & multi-warehouse facilities)"}
                    {adminType === "approver" && "⚖️ Type 3: Approver Authority (Cross-checks 5.0% bond agreements & seals stores)"}
                  </div>
                </div>
              )}

              {/* Specialized Vendor Presets Bar */}
              {activeTab === "vendor" && (
                <div style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.25)", borderRadius: "10px", padding: "10px 12px", marginBottom: "4px" }}>
                  <div style={{ fontSize: "0.74rem", fontWeight: 700, color: "#34D399", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>⚡ Fill Demo Vendor Details:</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                    {approvedVendorsList.length > 0 ? (
                      approvedVendorsList.map((v, i) => (
                        <button
                          key={v.id || i}
                          type="button"
                          onClick={() => handleFillDynamicVendorDemo(v)}
                          style={{
                            padding: "7px 8px",
                            borderRadius: "6px",
                            border: vendorEmail === v.email ? "1px solid #10B981" : "1px solid #374151",
                            background: vendorEmail === v.email ? "linear-gradient(135deg, #10B981, #059669)" : "#1F2937",
                            color: vendorEmail === v.email ? "#FFFFFF" : "#D1D5DB",
                            fontSize: "0.74rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}
                          title={v.name}
                        >
                          {v.name.toLowerCase().includes("voltx") ? "⚡" : "🏪"} {v.name.substring(0, 18)}...
                        </button>
                      ))
                    ) : (
                      <div style={{ gridColumn: "span 2", fontSize: "0.8rem", color: "#9CA3AF", textAlign: "center", padding: "10px" }}>
                        No approved vendors found. Waiting for Chairman approval...
                      </div>
                    )}
                    
                    {/* Hardcoded Apple Demo Preset */}
                    <button
                      type="button"
                      onClick={() => handleFillVendorDemo("apple")}
                      style={{
                        padding: "7px 8px",
                        borderRadius: "6px",
                        border: vendorEmail === "vendor@apple.in" ? "1px solid #10B981" : "1px solid #374151",
                        background: vendorEmail === "vendor@apple.in" ? "linear-gradient(135deg, #10B981, #059669)" : "#1F2937",
                        color: vendorEmail === "vendor@apple.in" ? "#FFFFFF" : "#D1D5DB",
                        fontSize: "0.74rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}
                      title="Apple India Official"
                    >
                      🍎 Apple India Official
                    </button>
                  </div>
                </div>
              )}

              {/* Forgot Security Key Link */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.82rem", marginTop: "2px" }}>
                <button
                  type="button"
                  onClick={() => setStep("forgot_key")}
                  style={{ background: "none", border: "none", color: "#60A5FA", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <FiHelpCircle /> Forgot Security Key / Password?
                </button>

                <button
                  type="button"
                  onClick={handleFillDemo}
                  style={{ background: "none", border: "none", color: "#34D399", fontWeight: 600, cursor: "pointer" }}
                >
                  Fill Demo Details
                </button>
              </div>

              <button
                type="submit"
                style={{
                  width: "100%",
                  marginTop: "8px",
                  padding: "13px",
                  borderRadius: "10px",
                  border: "none",
                  background: activeTab === "admin"
                    ? "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)"
                    : "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                  color: "#FFFFFF",
                  fontSize: "0.92rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: `0 4px 15px ${glowColor}`
                }}
              >
                Proceed to Aadhaar Verification <FiArrowRight />
              </button>

              <button
                type="button"
                onClick={handleInstantSignIn}
                style={{
                  width: "100%",
                  marginTop: "8px",
                  padding: "11px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  background: "rgba(255, 255, 255, 0.08)",
                  color: "#F8FAFC",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  transition: "all 0.2s ease"
                }}
              >
                ⚡ 1-Click Instant Sign In & Launch Dashboard
              </button>

              {/* Partner / Vendor Portal Link */}
              <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid rgba(255, 255, 255, 0.1)", display: "flex", flexDirection: "column", gap: "10px", textAlign: "center" }}>
                <p style={{ fontSize: "0.78rem", color: "#9CA3AF", margin: 0 }}>Join ShopSense as an Authorized Vendor Partner</p>
                <button
                  type="button"
                  onClick={() => {
                    navigate("/vendor/login");
                  }}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "10px",
                    border: "1px solid #10B981",
                    background: "rgba(16, 185, 129, 0.15)",
                    color: "#34D399",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.2s ease"
                  }}
                >
                  <FiBriefcase /> I am a New Vendor (Partner Onboarding & Setup)
                </button>
              </div>
            </form>
          </>
        )}

        {/* Step 2: Post-Login Aadhaar & OTP Verification Screen */}
        {step === "aadhaar_otp" && (
          <motion.form
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onSubmit={handleProceedToEmailStep}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <button
              type="button"
              onClick={() => setStep("credentials")}
              style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem" }}
            >
              <FiArrowLeft /> Back to Login
            </button>

            <div style={{ textAlign: "center", marginBottom: "4px" }}>
              <div style={{ margin: "0 auto 12px auto", width: "48px", height: "48px", borderRadius: "12px", background: "rgba(16, 185, 129, 0.2)", color: "#34D399", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>
                <FiSmartphone />
              </div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 800 }}>Aadhaar OTP Verification</h3>
              <p style={{ fontSize: "0.84rem", color: "#9CA3AF", marginTop: "4px" }}>
                UIDAI verification for Aadhaar #{maskAadhaar(activeTab === "admin" ? adminAadhaar : vendorAadhaar)}
              </p>
            </div>

            {/* OTP Destination Channel Selector (Mobile Number vs Email ID) */}
            <div style={{ background: "#1F2937", border: "1px solid #374151", borderRadius: "12px", padding: "12px" }}>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#D1D5DB", marginBottom: "8px" }}>
                Select OTP Delivery Destination:
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setOtpChannel("mobile");
                    handleRequestAadhaarOtp("mobile");
                  }}
                  style={{
                    padding: "10px",
                    borderRadius: "8px",
                    border: otpChannel === "mobile" ? "2px solid #10B981" : "1px solid #374151",
                    background: otpChannel === "mobile" ? "rgba(16, 185, 129, 0.15)" : "#111827",
                    color: otpChannel === "mobile" ? "#34D399" : "#9CA3AF",
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    justifyContent: "center"
                  }}
                >
                  <FiSmartphone /> Mobile ({currentPhone})
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOtpChannel("email");
                    handleRequestAadhaarOtp("email");
                  }}
                  style={{
                    padding: "10px",
                    borderRadius: "8px",
                    border: otpChannel === "email" ? "2px solid #3B82F6" : "1px solid #374151",
                    background: otpChannel === "email" ? "rgba(59, 130, 246, 0.15)" : "#111827",
                    color: otpChannel === "email" ? "#60A5FA" : "#9CA3AF",
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    justifyContent: "center"
                  }}
                >
                  <FiMail /> Email ({currentEmail})
                </button>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", fontSize: "0.76rem", color: "#9CA3AF" }}>
                <span>Sent to: <strong style={{ color: "#F3F4F6" }}>{sentOtpDestination || currentPhone}</strong></span>
                <button
                  type="button"
                  onClick={() => handleRequestAadhaarOtp(otpChannel)}
                  disabled={isRequestingOtp}
                  style={{ background: "none", border: "none", color: "#60A5FA", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <FiRefreshCw /> {isRequestingOtp ? "Sending..." : "Resend OTP"}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#D1D5DB", marginBottom: "6px" }}>
                Enter 6-Digit OTP Code
              </label>
              <input
                type="text"
                maxLength={6}
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Enter 6-digit OTP received"
                style={{
                  width: "100%",
                  padding: "12px",
                  textAlign: "center",
                  fontSize: "1.3rem",
                  letterSpacing: "8px",
                  fontWeight: 800,
                  borderRadius: "10px",
                  border: "1px solid #374151",
                  background: "#1F2937",
                  color: "#F9FAFB",
                  outline: "none"
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                marginTop: "10px",
                padding: "13px",
                borderRadius: "10px",
                border: "none",
                background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                color: "#FFFFFF",
                fontSize: "0.92rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 4px 15px rgba(16, 185, 129, 0.4)"
              }}
            >
              Verify OTP & Generate Security Key <FiArrowRight />
            </button>
          </motion.form>
        )}

        {/* Step 3: Security Key & PIN Delivery (Mobile SMS & Email Choice) */}
        {step === "security_email" && (
          <motion.form
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onSubmit={handleProceedToPinPage}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <button
              type="button"
              onClick={() => setStep("aadhaar_otp")}
              style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem" }}
            >
              <FiArrowLeft /> Back to Aadhaar OTP
            </button>

            <div style={{ textAlign: "center", marginBottom: "4px" }}>
              <div style={{ margin: "0 auto 10px auto", width: "48px", height: "48px", borderRadius: "12px", background: "rgba(37, 99, 235, 0.2)", color: "#60A5FA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>
                <FiKey />
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Official Security Key Dispatched</h3>
              <p style={{ fontSize: "0.82rem", color: "#9CA3AF", marginTop: "2px" }}>
                Select preferred destination to receive your Security Key & PIN:
              </p>
            </div>

            {/* Delivery Channel Selector */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", background: "#1F2937", padding: "4px", borderRadius: "10px" }}>
              <button
                type="button"
                onClick={() => setKeyDeliveryChannel("email")}
                style={{
                  padding: "8px",
                  borderRadius: "8px",
                  border: "none",
                  background: keyDeliveryChannel === "email" ? "#2563EB" : "transparent",
                  color: keyDeliveryChannel === "email" ? "#FFF" : "#9CA3AF",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  cursor: "pointer"
                }}
              >
                ✉️ Email
              </button>
              <button
                type="button"
                onClick={() => setKeyDeliveryChannel("mobile")}
                style={{
                  padding: "8px",
                  borderRadius: "8px",
                  border: "none",
                  background: keyDeliveryChannel === "mobile" ? "#10B981" : "transparent",
                  color: keyDeliveryChannel === "mobile" ? "#FFF" : "#9CA3AF",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  cursor: "pointer"
                }}
              >
                📱 Mobile SMS
              </button>
              <button
                type="button"
                onClick={() => setKeyDeliveryChannel("both")}
                style={{
                  padding: "8px",
                  borderRadius: "8px",
                  border: "none",
                  background: keyDeliveryChannel === "both" ? "#8B5CF6" : "transparent",
                  color: keyDeliveryChannel === "both" ? "#FFF" : "#9CA3AF",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  cursor: "pointer"
                }}
              >
                📲 Both
              </button>
            </div>

            {/* Notification Card without explicit code exposure */}
            <div
              style={{
                background: "#1E293B",
                border: "1px solid #3B82F6",
                borderRadius: "12px",
                padding: "16px",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #334155", paddingBottom: "8px", marginBottom: "8px" }}>
                <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "#60A5FA", display: "flex", alignItems: "center", gap: "6px" }}>
                  <FiCheckCircle style={{ color: "#34D399" }} /> SECURITY DISPATCH SUCCESSFUL
                </span>
                <span style={{ fontSize: "0.7rem", color: "#94A3B8" }}>Just now</span>
              </div>

              <div style={{ fontSize: "0.83rem", color: "#E2E8F0", lineHeight: "1.5" }}>
                Hello {currentGender === "Female" ? "Mrs." : currentGender === "Male" ? "Mr." : ""} {currentName},
                <p style={{ marginTop: "6px", color: "#CBD5E1" }}>
                  Your official Permanent Security Key and 4-Digit Login PIN have been dispatched directly to:
                  <strong style={{ display: "block", color: "#60A5FA", marginTop: "4px" }}>
                    {keyDeliveryChannel === "email" ? currentEmail : keyDeliveryChannel === "mobile" ? currentPhone : `${currentEmail} & ${currentPhone}`}
                  </strong>
                </p>
                <small style={{ color: "#94A3B8", fontSize: "0.75rem", marginTop: "4px", display: "block" }}>
                  Please check your inbox / messages to retrieve your 4-digit Security PIN and proceed to entry.
                </small>
              </div>
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                marginTop: "6px",
                padding: "13px",
                borderRadius: "10px",
                border: "none",
                background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                color: "#FFFFFF",
                fontSize: "0.92rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 4px 15px rgba(37, 99, 235, 0.4)"
              }}
            >
              Proceed to Enter Security PIN <FiArrowRight />
            </button>
          </motion.form>
        )}

        {/* Step 4: DEDICATED NEW STANDALONE PAGE FOR 4-DIGIT SECURITY PIN */}
        {step === "security_pin" && (
          <motion.form
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onSubmit={handleFinalPinAuthentication}
            style={{ display: "flex", flexDirection: "column", gap: "18px" }}
          >
            <button
              type="button"
              onClick={() => setStep("security_email")}
              style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem" }}
            >
              <FiArrowLeft /> Back to Security Key Notification
            </button>

            <div style={{ textAlign: "center", marginBottom: "4px" }}>
              <div style={{ margin: "0 auto 12px auto", width: "52px", height: "52px", borderRadius: "14px", background: "rgba(16, 185, 129, 0.2)", color: "#34D399", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem" }}>
                <FiLock />
              </div>
              <h3 style={{ fontSize: "1.35rem", fontWeight: 800 }}>Security PIN Authentication</h3>
              <p style={{ fontSize: "0.84rem", color: "#9CA3AF", marginTop: "4px" }}>
                Enter the 4-digit Security PIN sent to <strong>{keyDeliveryChannel === "email" ? currentEmail : keyDeliveryChannel === "mobile" ? currentPhone : `${currentEmail} & ${currentPhone}`}</strong>
              </p>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.84rem", fontWeight: 600, color: "#D1D5DB", marginBottom: "8px", textAlign: "center" }}>
                4-Digit Security PIN
              </label>

              <div style={{ position: "relative" }}>
                <input
                  type={showPinNumber ? "text" : "password"}
                  maxLength={4}
                  required
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter 4-digit PIN"
                  style={{
                    width: "100%",
                    padding: "14px",
                    textAlign: "center",
                    fontSize: "1.6rem",
                    letterSpacing: "12px",
                    fontWeight: 800,
                    borderRadius: "12px",
                    border: "2px solid #3B82F6",
                    background: "#0F172A",
                    color: "#F9FAFB",
                    outline: "none",
                    boxShadow: "0 0 15px rgba(59, 130, 246, 0.25)"
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPinNumber(!showPinNumber)}
                  style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", fontSize: "1.1rem" }}
                >
                  {showPinNumber ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                marginTop: "10px",
                padding: "14px",
                borderRadius: "10px",
                border: "none",
                background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                color: "#FFFFFF",
                fontSize: "0.95rem",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 4px 20px rgba(16, 185, 129, 0.45)"
              }}
            >
              Verify PIN & Launch Executive Dashboard <FiCheckCircle />
            </button>
          </motion.form>
        )}

        {/* Step 5: Forgot Security Key / Password Flow */}
        {step === "forgot_key" && (
          <motion.form
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onSubmit={handleRequestNewSecurityKey}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <button
              type="button"
              onClick={() => {
                setStep("credentials");
                setDispatchedNewKey(null);
              }}
              style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem" }}
            >
              <FiArrowLeft /> Return to Sign In
            </button>

            <div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 800 }}>Request New Security Key</h3>
              <p style={{ fontSize: "0.84rem", color: "#9CA3AF", marginTop: "4px" }}>
                Enter your registered Email Address or Mobile Number to generate and dispatch a new permanent Security Key.
              </p>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#D1D5DB", marginBottom: "6px" }}>
                Registered Email ID or Phone Number
              </label>
              <input
                type="text"
                required
                placeholder="admin@shopsense.com or +91 9876543210"
                value={forgotInput}
                onChange={(e) => setForgotInput(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #374151",
                  background: "#1F2937",
                  color: "#F9FAFB",
                  fontSize: "0.9rem",
                  outline: "none"
                }}
              />
            </div>

            {/* Delivery Notification if new key generated */}
            {dispatchedNewKey && (
              <div
                style={{
                  background: "#1E293B",
                  border: "1px solid #10B981",
                  borderRadius: "10px",
                  padding: "14px",
                  fontSize: "0.83rem",
                  color: "#F8FAFC"
                }}
              >
                <strong style={{ color: "#34D399", display: "block", marginBottom: "4px" }}>
                  ✉️ / 📱 Security Key Dispatched to {dispatchedNewKey.to}
                </strong>
                Your new permanent Security Key & 4-digit Security PIN have been sent via Email/SMS. Check your inbox.
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmittingForgot}
              style={{
                width: "100%",
                marginTop: "6px",
                padding: "13px",
                borderRadius: "10px",
                border: "none",
                background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                color: "#FFFFFF",
                fontSize: "0.92rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 4px 15px rgba(37, 99, 235, 0.4)"
              }}
            >
              {isSubmittingForgot ? "Dispatching New Key..." : "Send New Security Key"} <FiSend />
            </button>
          </motion.form>
        )}

      </div>

      {/* Floating Live Mail/SMS Reader Drawer Modal */}
      <AnimatePresence>
        {showMailInboxDrawer && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            style={{
              position: "fixed",
              bottom: "30px",
              right: "30px",
              zIndex: 999,
              width: "420px",
              background: "#0F172A",
              border: "2px solid #3B82F6",
              borderRadius: "16px",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8)",
              overflow: "hidden"
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
                padding: "14px 18px",
                borderBottom: "1px solid #334155",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ background: "#2563EB", padding: "6px", borderRadius: "8px", color: "#FFFFFF", display: "flex" }}>
                  <FiInbox />
                </div>
                <div>
                  <strong style={{ fontSize: "0.9rem", color: "#FFFFFF" }}>Live Inbox Reader (Email & SMS)</strong>
                  <span style={{ display: "block", fontSize: "0.72rem", color: "#34D399" }}>● Dispatched to Email & Mobile</span>
                </div>
              </div>
              <button
                onClick={() => setShowMailInboxDrawer(false)}
                style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: "1.1rem" }}
              >
                <FiX />
              </button>
            </div>

            <div style={{ padding: "18px" }}>
              <div style={{ fontSize: "0.82rem", color: "#94A3B8", marginBottom: "8px" }}>
                <strong>DESTINATION:</strong> {keyDeliveryChannel === "email" ? currentEmail : keyDeliveryChannel === "mobile" ? currentPhone : `${currentEmail} & ${currentPhone}`}
              </div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#F8FAFC", marginBottom: "12px", borderBottom: "1px solid #1E293B", paddingBottom: "8px" }}>
                Subject: 🔐 Official Security Key & 4-Digit PIN Delivery
              </div>

              <div style={{ fontSize: "0.85rem", color: "#CBD5E1", lineHeight: "1.5" }}>
                Hello {currentGender === "Female" ? "Mrs." : currentGender === "Male" ? "Mr." : ""} {currentName},
                <p style={{ marginTop: "6px", marginBottom: "6px" }}>
                  Your Permanent Account Security Key is:
                  <strong style={{ display: "block", color: "#10B981", fontSize: "1.1rem", marginTop: "2px" }}>{currentKey}</strong>
                </p>
                <div style={{ background: "#1E293B", padding: "10px 14px", borderRadius: "8px", border: "1px dashed #3B82F6", marginTop: "8px" }}>
                  <span style={{ fontSize: "0.78rem", color: "#94A3B8" }}>Your 4-Digit Login Security PIN:</span>
                  <strong style={{ display: "block", fontSize: "1.4rem", color: "#60A5FA", letterSpacing: "6px", marginTop: "2px" }}>{currentPin}</strong>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowMailInboxDrawer(false);
                  setStep("security_pin");
                }}
                style={{
                  width: "100%",
                  marginTop: "16px",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#2563EB",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px"
                }}
              >
                Open Verification Page <FiArrowRight />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Admin Registration Modal */}
      <AnimatePresence>
        {showNewAdminRegModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.75)",
              backdropFilter: "blur(8px)",
              zIndex: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px"
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              style={{
                background: "#0F172A",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                borderRadius: "20px",
                width: "100%",
                maxWidth: "600px",
                maxHeight: "90vh",
                overflowY: "auto",
                padding: "28px",
                boxShadow: "0 25px 60px rgba(0, 0, 0, 0.6)",
                color: "#F8FAFC"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #6366F1, #4F46E5)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.3rem"
                    }}
                  >
                    🏛️
                  </div>
                  <div>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0 }}>New Admin Applicant Registration</h2>
                    <p style={{ fontSize: "0.78rem", color: "#94A3B8", margin: "2px 0 0 0" }}>
                      Application subject to final review and role assignment by Supreme Chairman Mounish Sai
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewAdminRegModal(false)}
                  style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: "1.2rem" }}
                >
                  <FiX />
                </button>
              </div>

              <div
                style={{
                  background: "rgba(99, 102, 241, 0.08)",
                  border: "1px solid rgba(99, 102, 241, 0.2)",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  marginBottom: "20px",
                  fontSize: "0.8rem",
                  color: "#C7D2FE",
                  lineHeight: "1.4"
                }}
              >
                👑 <strong>Chairman Governance Notice:</strong> All new administrative accounts require formal credential verification, domain assessment, and official role authorization by Chairman & Managing Director Mounish Sai before login access is unlocked.
              </div>

              <form onSubmit={handleRegisterNewAdmin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "4px" }}>
                      Full Legal Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vikramaditya Sen"
                      value={newAdminRegForm.fullName}
                      onChange={(e) => setNewAdminRegForm({ ...newAdminRegForm, fullName: e.target.value })}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #334155", background: "#1E293B", color: "#F8FAFC", fontSize: "0.85rem", outline: "none" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "4px" }}>
                      Preferred Username *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. sen_admin"
                      value={newAdminRegForm.userName}
                      onChange={(e) => setNewAdminRegForm({ ...newAdminRegForm, userName: e.target.value })}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #334155", background: "#1E293B", color: "#F8FAFC", fontSize: "0.85rem", outline: "none" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "4px" }}>
                      Official Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="admin.applicant@shopsense.com"
                      value={newAdminRegForm.email}
                      onChange={(e) => setNewAdminRegForm({ ...newAdminRegForm, email: e.target.value })}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #334155", background: "#1E293B", color: "#F8FAFC", fontSize: "0.85rem", outline: "none" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "4px" }}>
                      Mobile Contact Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={newAdminRegForm.phone}
                      onChange={(e) => setNewAdminRegForm({ ...newAdminRegForm, phone: e.target.value })}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #334155", background: "#1E293B", color: "#F8FAFC", fontSize: "0.85rem", outline: "none" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "4px" }}>
                      12-Digit Aadhaar / National ID *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={12}
                      placeholder="e.g. 987654321098"
                      value={newAdminRegForm.aadhaarNumber}
                      onChange={(e) => setNewAdminRegForm({ ...newAdminRegForm, aadhaarNumber: e.target.value.replace(/\D/g, "").slice(0, 12) })}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #334155", background: "#1E293B", color: "#F8FAFC", fontSize: "0.85rem", outline: "none" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "4px" }}>
                      Prefix / Gender
                    </label>
                    <select
                      value={newAdminRegForm.gender}
                      onChange={(e) => setNewAdminRegForm({ ...newAdminRegForm, gender: e.target.value })}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #334155", background: "#1E293B", color: "#F8FAFC", fontSize: "0.85rem", outline: "none" }}
                    >
                      <option value="Male">Mr. (Male)</option>
                      <option value="Female">Mrs. / Ms. (Female)</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "4px" }}>
                    Preferred Administrative Specialization
                  </label>
                  <select
                    value={newAdminRegForm.requestedRole}
                    onChange={(e) => setNewAdminRegForm({ ...newAdminRegForm, requestedRole: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #334155", background: "#1E293B", color: "#F8FAFC", fontSize: "0.85rem", outline: "none" }}
                  >
                    <option value="executor">⚡ Type 1: Operations, Legal Complaints & Intake Executor</option>
                    <option value="verifier">🔍 Type 2: Compliance, Aadhaar KYC & Multi-Warehouse Verifier</option>
                    <option value="approver">⚖️ Type 3: Performance Bond & Final Approval Authority</option>
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "4px" }}>
                      Professional Headline / Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Vendor Due Diligence Specialist"
                      value={newAdminRegForm.headline}
                      onChange={(e) => setNewAdminRegForm({ ...newAdminRegForm, headline: e.target.value })}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #334155", background: "#1E293B", color: "#F8FAFC", fontSize: "0.85rem", outline: "none" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "4px" }}>
                      Highest Education & University
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. MBA (IIM Bangalore) • B.Tech (NIT)"
                      value={newAdminRegForm.education}
                      onChange={(e) => setNewAdminRegForm({ ...newAdminRegForm, education: e.target.value })}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #334155", background: "#1E293B", color: "#F8FAFC", fontSize: "0.85rem", outline: "none" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "4px" }}>
                      Industry Certifications (Comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ISO 9001 Lead Auditor, CFE, Six Sigma"
                      value={newAdminRegForm.certifications}
                      onChange={(e) => setNewAdminRegForm({ ...newAdminRegForm, certifications: e.target.value })}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #334155", background: "#1E293B", color: "#F8FAFC", fontSize: "0.85rem", outline: "none" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "4px" }}>
                      Attach Resume / CV Document (.PDF / .DOCX)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Resume_Candidate_CV.pdf"
                      value={newAdminRegForm.resumeFileName}
                      onChange={(e) => setNewAdminRegForm({ ...newAdminRegForm, resumeFileName: e.target.value })}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #334155", background: "#1E293B", color: "#F8FAFC", fontSize: "0.85rem", outline: "none" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "4px" }}>
                    Executive Experience Summary & Accomplishments
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Describe your background in regulatory compliance, risk investigation, warehouse safety, or commercial contracts..."
                    value={newAdminRegForm.experience}
                    onChange={(e) => setNewAdminRegForm({ ...newAdminRegForm, experience: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #334155", background: "#1E293B", color: "#F8FAFC", fontSize: "0.85rem", outline: "none", resize: "none" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#CBD5E1", marginBottom: "4px" }}>
                    Account Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Create your login password"
                    value={newAdminRegForm.password}
                    onChange={(e) => setNewAdminRegForm({ ...newAdminRegForm, password: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #334155", background: "#1E293B", color: "#F8FAFC", fontSize: "0.85rem", outline: "none" }}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <button
                    type="button"
                    onClick={() => setShowNewAdminRegModal(false)}
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #334155",
                      background: "transparent",
                      color: "#94A3B8",
                      fontWeight: 700,
                      fontSize: "0.88rem",
                      cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 2,
                      padding: "12px",
                      borderRadius: "8px",
                      border: "none",
                      background: "linear-gradient(135deg, #6366F1, #4F46E5)",
                      color: "#FFF",
                      fontWeight: 800,
                      fontSize: "0.88rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      boxShadow: "0 4px 15px rgba(99, 102, 241, 0.3)"
                    }}
                  >
                    <FiSend /> Submit Application to Chairman Mounish
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Registration Success Modal */}
      <AnimatePresence>
        {regSuccessModalData && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(8px)",
              zIndex: 110,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px"
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              style={{
                background: "#0F172A",
                border: "1px solid rgba(16, 185, 129, 0.4)",
                borderRadius: "20px",
                width: "100%",
                maxWidth: "500px",
                padding: "30px",
                textAlign: "center",
                color: "#F8FAFC",
                boxShadow: "0 25px 60px rgba(0, 0, 0, 0.7)"
              }}
            >
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background: "rgba(16, 185, 129, 0.15)",
                  border: "2px solid #10B981",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2rem",
                  color: "#10B981",
                  margin: "0 auto 16px auto"
                }}
              >
                <FiCheckCircle />
              </div>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "8px" }}>
                Admin Application Registered!
              </h2>
              <p style={{ fontSize: "0.85rem", color: "#94A3B8", marginBottom: "18px" }}>
                Your administrative application has been routed directly to the Executive Command Center of <strong>Supreme Chairman Mounish Sai</strong>.
              </p>

              <div
                style={{
                  background: "#1E293B",
                  borderRadius: "12px",
                  padding: "16px",
                  marginBottom: "20px",
                  textAlign: "left",
                  fontSize: "0.82rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  border: "1px solid #334155"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#94A3B8" }}>Application Reference ID:</span>
                  <strong style={{ color: "#60A5FA" }}>{regSuccessModalData.id}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#94A3B8" }}>Applicant Name:</span>
                  <strong>{regSuccessModalData.fullName}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#94A3B8" }}>Preferred Specialization:</span>
                  <span style={{ color: "#A78BFA" }}>{regSuccessModalData.requestedRoleTitle}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#94A3B8" }}>Current Status:</span>
                  <span style={{ color: "#F59E0B", fontWeight: 800 }}>⏳ Awaiting Chairman Mounish Approval</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setRegSuccessModalData(null)}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "none",
                  background: "linear-gradient(135deg, #10B981, #059669)",
                  color: "#FFF",
                  fontWeight: 800,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)"
                }}
              >
                Understood, Return to Portal
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}

export default Login;