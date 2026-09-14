import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiShoppingBag,
  FiBriefcase,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiShield,
  FiCheckCircle,
  FiAward,
  FiArrowRight,
  FiArrowLeft,
  FiKey,
  FiCheck,
  FiZap,
  FiTruck,
  FiRefreshCw,
  FiPercent,
  FiDollarSign,
  FiFileText,
  FiTag,
  FiPlus,
  FiTrash2,
  FiBox,
  FiSliders,
  FiLock,
  FiFile
} from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./VendorLogin.css";
import { applyVendorPipeline } from "../services/api";

// -------------------------------------------------------------
// Live Demo Rotating Vendor Application Pool (9 Rich Merchant Profiles)
// -------------------------------------------------------------
export const ROTATING_DEMO_APPLICATIONS = [
  {
    storeName: "ChronoCraft Luxury Horology & Swiss Watches",
    ownerName: "Rohan Mehra",
    category: "Luxury Horology & Watches",
    gstin: "27AAACC4455M1Z8",
    aadhaarNumber: "987654311001",
    email: "rohan@chronocraft.in",
    phone: "+91 9823456711",
    description: "Official certified distributor of handcrafted Swiss-grade luxury timepieces, tourbillons, and precision chronographs with international warranty & ISO certified repair labs.",
    bondId: "BOND-ENTERPRISE",
    percentage: 3.0,
    warehouses: [
      {
        id: "WH-CC1",
        name: "Primary Horology Vault Hub (Zone A)",
        address: "Fort Heritage Business District, Colaba",
        city: "Mumbai",
        stateName: "Maharashtra",
        pincode: "400001",
        country: "India",
        storageType: "High-Security Biometric Climate Vault (20°C)",
        capacityUnits: "20,000 Units",
        dispatchSpeed: "Same-Day Express (Under 12h)",
        isPrimary: true
      },
      {
        id: "WH-CC2",
        name: "North Capital Regional Sorting Depot (Zone B)",
        address: "Aerocity Global Cargo Logistics Zone",
        city: "New Delhi",
        stateName: "Delhi NCR",
        pincode: "110037",
        country: "India",
        storageType: "Precision Dust-Free Armored Hub",
        capacityUnits: "15,000 Units",
        dispatchSpeed: "Priority Dispatch (12-24h)",
        isPrimary: false
      }
    ]
  },
  {
    storeName: "SolarWave Clean Energy Hardware & Inverters",
    ownerName: "Deepak Nair",
    category: "Clean Energy & Solar Hardware",
    gstin: "33AAACS6677M1Z4",
    aadhaarNumber: "987654322002",
    email: "deepak@solarwave.in",
    phone: "+91 9845123890",
    description: "MNRE-certified manufacturer of monocrystalline smart solar panels, hybrid inverters, and high-density LiFePO4 solar energy storage banks with 25-year performance warranty.",
    bondId: "BOND-PRO",
    percentage: 5.0,
    warehouses: [
      {
        id: "WH-SW1",
        name: "Main Solar Logistics Center (Zone A)",
        address: "SIPCOT Industrial SEZ, Sriperumbudur",
        city: "Chennai",
        stateName: "Tamil Nadu",
        pincode: "602105",
        country: "India",
        storageType: "Heavy Equipment & Photovoltaic Storage",
        capacityUnits: "40,000 Units",
        dispatchSpeed: "Priority Freight (12-24h)",
        isPrimary: true
      },
      {
        id: "WH-SW2",
        name: "Deccan Regional Solar Depot (Zone B)",
        address: "Coimbatore Industrial Corridor Hub",
        city: "Coimbatore",
        stateName: "Tamil Nadu",
        pincode: "641001",
        country: "India",
        storageType: "Climate Controlled Battery Racks",
        capacityUnits: "25,000 Units",
        dispatchSpeed: "Standard Fulfillment (24-48h)",
        isPrimary: false
      }
    ]
  },
  {
    storeName: "BrewMaster Artisan Coffee Roasters & Espresso",
    ownerName: "Kavita Rao",
    category: "Organic Groceries",
    gstin: "29AAACB8899M1Z2",
    aadhaarNumber: "987654333003",
    email: "kavita@brewmastercoffee.in",
    phone: "+91 9886745123",
    description: "SCA-certified micro-lot single-origin Arabica roasteries, nitrogen-sealed coffee pods, and manual lever espresso hardware from high-altitude estates in the Western Ghats.",
    bondId: "BOND-PRO",
    percentage: 5.0,
    warehouses: [
      {
        id: "WH-BM1",
        name: "Western Ghats Estate Roastery Hub (Zone A)",
        address: "Plantation Estate Highway, Mile 14",
        city: "Chikmagalur",
        stateName: "Karnataka",
        pincode: "577101",
        country: "India",
        storageType: "Dehumidified Nitrogen Bean Cellar",
        capacityUnits: "35,000 Units",
        dispatchSpeed: "Fresh Batch Express (<12h)",
        isPrimary: true
      },
      {
        id: "WH-BM2",
        name: "Bangalore Metro Express Fulfillment Hub (Zone B)",
        address: "Peenya Industrial Area, Stage 3",
        city: "Bengaluru",
        stateName: "Karnataka",
        pincode: "560058",
        country: "India",
        storageType: "Ambient Gourmet Packaging Warehouse",
        capacityUnits: "20,000 Units",
        dispatchSpeed: "Same-Day Express (Under 12h)",
        isPrimary: false
      }
    ]
  },
  {
    storeName: "OptiVision Precision Designer Eyewear & Optics",
    ownerName: "Arjun Kapoor",
    category: "Fashion",
    gstin: "36AAACO1123M1Z9",
    aadhaarNumber: "987654344004",
    email: "arjun@optivision.in",
    phone: "+91 9871234567",
    description: "Handcrafted Italian acetate frames, polarized blue-cut prescription lenses, and titanium sunglasses engineered for ultra-lightweight ergonomic durability.",
    bondId: "BOND-GROWTH",
    percentage: 7.0,
    warehouses: [
      {
        id: "WH-OV1",
        name: "OptiVision Central Optical Lab (Zone A)",
        address: "HITEC City Software & Hardware Zone",
        city: "Hyderabad",
        stateName: "Telangana",
        pincode: "500081",
        country: "India",
        storageType: "Cleanroom Class 10,000 Lens Laboratory",
        capacityUnits: "50,000 Units",
        dispatchSpeed: "Same-Day Express (Under 12h)",
        isPrimary: true
      },
      {
        id: "WH-OV2",
        name: "Western Region Depot (Zone B)",
        address: "Bhiwandi Logistics Hub, Sector 9",
        city: "Mumbai",
        stateName: "Maharashtra",
        pincode: "421302",
        country: "India",
        storageType: "Shock-Proof Optical Frames Vault",
        capacityUnits: "30,000 Units",
        dispatchSpeed: "Priority Dispatch (12-24h)",
        isPrimary: false
      }
    ]
  },
  {
    storeName: "VoltX Smart Mobiles",
    ownerName: "Vikram Malhotra",
    category: "Smart Mobiles",
    gstin: "24AAACV5566M1Z7",
    aadhaarNumber: "987654355005",
    email: "vikram@voltxmobiles.in",
    phone: "+91 9820011223",
    description: "Next-generation flagship 5G smartphones, foldable AMOLED devices, GaN 120W fast charging ecosystems, and high-fidelity smart mobile accessories.",
    bondId: "BOND-ENTERPRISE",
    percentage: 3.0,
    warehouses: [
      {
        id: "WH-VX1",
        name: "Primary VoltX Mobile Robotics & Device Hub (Zone A)",
        address: "Sanand Electronics Technology Park, Gate 4",
        city: "Ahmedabad",
        stateName: "Gujarat",
        pincode: "382170",
        country: "India",
        storageType: "ESD-Protected Smart Device Tech Vault",
        capacityUnits: "50,000 Units",
        dispatchSpeed: "Freight Express (12-24h)",
        isPrimary: true
      },
      {
        id: "WH-VX2",
        name: "Central Logistics Assembly Depot (Zone B)",
        address: "MIHAN SEZ Logistics Corridor",
        city: "Nagpur",
        stateName: "Maharashtra",
        pincode: "441108",
        country: "India",
        storageType: "Heavy Vehicle Staging & EV Fleet Racks",
        capacityUnits: "18,000 Units",
        dispatchSpeed: "Priority Dispatch (12-24h)",
        isPrimary: false
      }
    ]
  },
  {
    storeName: "TerraCotta Heritage Pottery & Clayware",
    ownerName: "Shalini Tiwari",
    category: "Home & Kitchen",
    gstin: "09AAACT7788M1Z3",
    aadhaarNumber: "987654366006",
    email: "shalini@terracottaheritage.in",
    phone: "+91 9839045612",
    description: "GI-tagged handcrafted terracotta cookware, lead-free studio glazed ceramics, and artisanal earthenware made by generational master potters.",
    bondId: "BOND-GROWTH",
    percentage: 7.0,
    warehouses: [
      {
        id: "WH-TC1",
        name: "Khurja Master Pottery Kiln Hub (Zone A)",
        address: "Pottery Industrial Estate, Sector 2",
        city: "Khurja",
        stateName: "Uttar Pradesh",
        pincode: "203131",
        country: "India",
        storageType: "Shock-Absorbent Wooden Crate Warehouse",
        capacityUnits: "45,000 Units",
        dispatchSpeed: "Priority Dispatch (12-24h)",
        isPrimary: true
      },
      {
        id: "WH-TC2",
        name: "Varanasi Heritage Crafts Node (Zone B)",
        address: "Ramnagar Industrial Area",
        city: "Varanasi",
        stateName: "Uttar Pradesh",
        pincode: "221008",
        country: "India",
        storageType: "Cushioned Palletized Earthenware Depot",
        capacityUnits: "22,000 Units",
        dispatchSpeed: "Standard Fulfillment (24-48h)",
        isPrimary: false
      }
    ]
  },
  {
    storeName: "ZenithPet Premium Veterinary Nutrition",
    ownerName: "Varun Chopra",
    category: "Sports & Fitness",
    gstin: "04AAACZ9900M1Z1",
    aadhaarNumber: "987654377007",
    email: "varun@zenithpet.in",
    phone: "+91 9814567890",
    description: "Veterinarian-formulated hypoallergenic canine & feline nutrition, freeze-dried raw proteins, and joint mobility supplements certified by AAFCO and FSSAI.",
    bondId: "BOND-PRO",
    percentage: 5.0,
    warehouses: [
      {
        id: "WH-ZP1",
        name: "Northern Pet Nutrition Hub (Zone A)",
        address: "Industrial Area Phase 1",
        city: "Chandigarh",
        stateName: "Punjab",
        pincode: "160002",
        country: "India",
        storageType: "Air-Conditioned Dry Nutrition Silos",
        capacityUnits: "60,000 Units",
        dispatchSpeed: "Same-Day Express (Under 12h)",
        isPrimary: true
      },
      {
        id: "WH-ZP2",
        name: "National Capital Sorting Hub (Zone B)",
        address: "Okhla Industrial Area Phase 3",
        city: "New Delhi",
        stateName: "Delhi NCR",
        pincode: "110020",
        country: "India",
        storageType: "Temperature Controlled Kibble Storage",
        capacityUnits: "35,000 Units",
        dispatchSpeed: "Priority Dispatch (12-24h)",
        isPrimary: false
      }
    ]
  },
  {
    storeName: "Vanguard Tactical Outdoor & Camping Gear",
    ownerName: "Commander Harish Rawat",
    category: "Sports & Fitness",
    gstin: "05AAACV1122M1Z5",
    aadhaarNumber: "987654388008",
    email: "harish@vanguardtactical.in",
    phone: "+91 9897012345",
    description: "Military-grade Cordura backpacks, ripstop high-altitude alpine tents, four-season sub-zero sleeping bags, and survival multitools tested in Himalayan expeditions.",
    bondId: "BOND-PRO",
    percentage: 5.0,
    warehouses: [
      {
        id: "WH-VT1",
        name: "Himalayan Base Logistics Hub (Zone A)",
        address: "Mohabewala Industrial Area",
        city: "Dehradun",
        stateName: "Uttarakhand",
        pincode: "248002",
        country: "India",
        storageType: "Waterproof High-Altitude Gear Vault",
        capacityUnits: "30,000 Units",
        dispatchSpeed: "Priority Dispatch (12-24h)",
        isPrimary: true
      },
      {
        id: "WH-VT2",
        name: "High-Altitude Forward Transit Node (Zone B)",
        address: "Logistics Yard, National Highway 3",
        city: "Manali",
        stateName: "Himachal Pradesh",
        pincode: "175131",
        country: "India",
        storageType: "Sub-Zero Alpine Gear Staging Facility",
        capacityUnits: "15,000 Units",
        dispatchSpeed: "Express Transit (Under 24h)",
        isPrimary: false
      }
    ]
  },
  {
    storeName: "LuminaSmart Home Automation & IoT Lighting",
    ownerName: "Gaurav Shinde",
    category: "Electronics",
    gstin: "27AAACL3344M1Z6",
    aadhaarNumber: "987654399009",
    email: "gaurav@luminasmart.in",
    phone: "+91 9822334455",
    description: "Matter and Zigbee 3.0 compatible smart architectural LED fixtures, touch capacitive glass switches, and smart gateway hubs with local offline AI automation.",
    bondId: "BOND-PRO",
    percentage: 5.0,
    warehouses: [
      {
        id: "WH-LS1",
        name: "IoT Assembly & Electronics Hub (Zone A)",
        address: "Bhosari MIDC Industrial Corridor",
        city: "Pune",
        stateName: "Maharashtra",
        pincode: "411026",
        country: "India",
        storageType: "Anti-Static Clean Electronics Vault",
        capacityUnits: "42,000 Units",
        dispatchSpeed: "Same-Day Express (Under 12h)",
        isPrimary: true
      },
      {
        id: "WH-LS2",
        name: "Central India Smart Logistics Node (Zone B)",
        address: "Pithampur Sector 3, Industrial Area",
        city: "Indore",
        stateName: "Madhya Pradesh",
        pincode: "454774",
        country: "India",
        storageType: "Automated Micro-Fulfillment Staging",
        capacityUnits: "24,000 Units",
        dispatchSpeed: "Priority Dispatch (12-24h)",
        isPrimary: false
      }
    ]
  }
];

function VendorLogin() {
  const navigate = useNavigate();

  // Current Step in 4-step onboarding: 1 | 2 | 3 | 4
  const [step, setStep] = useState(1);
  const isAppleOnboarded = localStorage.getItem("appleVendorOnboarded") === "true";

  // Dynamic Rotating Demo Application Tracker
  const [rotatingIndex, setRotatingIndex] = useState(() => {
    const saved = localStorage.getItem("vendorDemoRotatingIndex");
    return saved !== null ? Number(saved) : 0;
  });


  // -------------------------------------------------------------
  // Page 1: Store & Partner Identity State
  // -------------------------------------------------------------
  const [storeName, setStoreName] = useState("TechWorld Electronics");
  const [ownerName, setOwnerName] = useState("Rahul Sharma");
  const [category, setCategory] = useState("Electronics");
  const [gstin, setGstin] = useState("27AADCB2234M1Z5");
  const [storeDescription, setStoreDescription] = useState(
    "Leading authorized retailer of premium smartphones, 4K monitors, audio gear, and cutting-edge tech accessories with verified warranty."
  );
  const [contactInput, setContactInput] = useState("+91 9812345678");

  // Detect whether contactInput is email or mobile number
  const isEmailInput = contactInput.includes("@");

  // -------------------------------------------------------------
  // Page 2: Aadhaar & KYC Verification State
  // -------------------------------------------------------------
  const [aadhaarNumber, setAadhaarNumber] = useState("987654321234");
  const [showAadhaar, setShowAadhaar] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // -------------------------------------------------------------
  // Page 3: Multi-Warehouse Fulfillment Network State (Two or More Hubs)
  // -------------------------------------------------------------
  const [warehouses, setWarehouses] = useState([
    {
      id: "WH-1",
      name: "Primary Central Logistics Hub (Zone A)",
      address: "Plot 14, MIDC Industrial Corridor, Andheri East",
      city: "Mumbai",
      stateName: "Maharashtra",
      pincode: "400093",
      country: "India",
      storageType: "Climate-Controlled & High-Value Vault",
      capacityUnits: "25,000 Units",
      dispatchSpeed: "Same-Day Express (Under 12h)",
      isPrimary: true
    },
    {
      id: "WH-2",
      name: "Secondary Regional Fulfillment Depot (Zone B)",
      address: "Sector 18, Logistics Park, Phase II",
      city: "Pune",
      stateName: "Maharashtra",
      pincode: "411019",
      country: "India",
      storageType: "Standard Ambient & Bulk Pallets",
      capacityUnits: "15,000 Units",
      dispatchSpeed: "Priority Dispatch (12-24h)",
      isPrimary: false
    }
  ]);

  // Add new warehouse hub
  const handleAddWarehouse = () => {
    const nextNum = warehouses.length + 1;
    const newHub = {
      id: `WH-${Date.now().toString().slice(-4)}`,
      name: `Warehouse Facility Hub ${nextNum} (Regional Node)`,
      address: `Industrial Sector ${nextNum * 4}, Express Highway Hub`,
      city: "Bangalore",
      stateName: "Karnataka",
      pincode: "560001",
      country: "India",
      storageType: "Climate-Controlled & Dust-Proof",
      capacityUnits: "12,000 Units",
      dispatchSpeed: "Standard Fulfillment (24-48h)",
      isPrimary: false
    };
    setWarehouses((prev) => [...prev, newHub]);
    toast.success(`Added New Warehouse Facility Hub ${nextNum}! 🏢`);
  };

  // Remove a warehouse hub (guarantee at least 2 hubs remain)
  const handleRemoveWarehouse = (id) => {
    if (warehouses.length <= 2) {
      toast.warning("A vendor must configure at least two warehouse hubs for multi-point fulfillment.");
      return;
    }
    const target = warehouses.find((w) => w.id === id);
    setWarehouses((prev) => {
      const filtered = prev.filter((w) => w.id !== id);
      if (target?.isPrimary && filtered.length > 0) {
        filtered[0].isPrimary = true;
      }
      return filtered;
    });
    toast.info("Warehouse Hub removed from network.");
  };

  // Update field in specific warehouse
  const handleUpdateWarehouse = (id, field, value) => {
    setWarehouses((prev) =>
      prev.map((w) => (w.id === id ? { ...w, [field]: value } : w))
    );
  };

  // Toggle primary warehouse
  const handleSetPrimary = (id) => {
    setWarehouses((prev) =>
      prev.map((w) => ({
        ...w,
        isPrimary: w.id === id
      }))
    );
    toast.info("Updated Primary Warehouse Logistics Hub.");
  };

  // -------------------------------------------------------------
  // Page 4: Vendor Marketplace Bond & Selling Percentage Agreement
  // -------------------------------------------------------------
  const [selectedBondId, setSelectedBondId] = useState("BOND-PRO"); // 'BOND-GROWTH' | 'BOND-PRO' | 'BOND-ENTERPRISE'
  const [customPercentage, setCustomPercentage] = useState(5.0);
  const [agreedToBondTerms, setAgreedToBondTerms] = useState(true);

  // Legal Sales Percentage Bonds Definition
  const bondOptions = [
    {
      id: "BOND-GROWTH",
      title: "Standard Growth Sales Bond",
      sellingPercentage: 7.0,
      percentageDisplay: "7.0% Gross on Sold Products",
      badge: "Standard Entry Bond",
      badgeColor: "#F59E0B",
      escrowSecurity: "₹15,000 (Refundable Escrow)",
      payoutSpeed: "Weekly Settlement (T+3)",
      coverageLimit: "₹50,00,000 Inventory Bond Coverage",
      description: "Ideal for growing independent retailers scaling up multi-warehouse distribution.",
      terms: [
        "7.0% gross revenue-share deducted only upon successful product delivery",
        "Full escrow refundability upon 90-day fulfillment audit",
        "Multi-warehouse automatic inventory routing across all hubs",
        "Standard multi-channel courier insurance protection"
      ]
    },
    {
      id: "BOND-PRO",
      title: "High-Volume Merchant Bond",
      sellingPercentage: 5.0,
      percentageDisplay: "5.0% Gross on Sold Products",
      badge: "Recommended Merchant Tier",
      badgeColor: "#10B981",
      escrowSecurity: "₹25,000 (Refundable Escrow)",
      payoutSpeed: "Daily Settlement (T+1)",
      coverageLimit: "₹2,50,00,000 Full Bond Protection",
      description: "Our premier partnership bond providing 5.0% gross commission and next-day payout acceleration.",
      terms: [
        "5.0% gross royalty fee on all gross merchandise volume",
        "Priority Search & Storefront Featured Ranking across categories",
        "Real-time ML demand forecasting across all configured warehouse hubs",
        "Instant Daily T+1 settlement direct to verified business account",
        "24/7 dedicated merchant dispatch and logistics support"
      ]
    },
    {
      id: "BOND-ENTERPRISE",
      title: "Enterprise Anchor Partner Bond",
      sellingPercentage: 3.0,
      percentageDisplay: "3.0% Gross on Sold Products",
      badge: "VIP Sovereign Anchor",
      badgeColor: "#3B82F6",
      escrowSecurity: "₹50,000 (Refundable Escrow)",
      payoutSpeed: "Instant Real-Time Payouts",
      coverageLimit: "₹10,00,00,000 Global Sovereign Bond",
      description: "Designed for high-output manufacturers with distributed warehouse networks across regions.",
      terms: [
        "3.0% gross fixed selling royalty on all catalog volume",
        "Direct warehouse EDI / API data pipeline integration",
        "VIP Flash Sale & Banner placement on ShopSense homepage",
        "Dedicated Key Account Manager & logistics liaison officer",
        "Guaranteed 99.9% fulfillment SLA backing"
      ]
    }
  ];

  // Quick Preset Handlers
  const handleApplyPreset = (type) => {
    if (type === "nike") {
      setStoreName("Nike Official India");
      setOwnerName("Nike India Pvt Ltd");
      setCategory("Fashion");
      setGstin("27AADCN4555F1Z2");
      setStoreDescription(
        "Official Nike India storefront. Premium athletic footwear, activewear, and sports equipment directly from Nike warehouses."
      );
      setContactInput("vendor@nike.in");
      setAadhaarNumber("987654325678");
      setWarehouses([
        {
          id: "WH-F1",
          name: "Main Nike Logistics Hub (Zone A)",
          address: "Unit 5B, Express Logistics Center",
          city: "Mumbai",
          stateName: "Maharashtra",
          pincode: "400001",
          country: "India",
          storageType: "Premium Footwear Climate Racks",
          capacityUnits: "150,000 Units",
          dispatchSpeed: "Same-Day Express (Under 12h)",
          isPrimary: true
        },
        {
          id: "WH-F2",
          name: "Regional Apparel Sorting Depot (Zone B)",
          address: "Plot 88, Textile City Industrial Park",
          city: "Surat",
          stateName: "Gujarat",
          pincode: "395002",
          country: "India",
          storageType: "Standard Fabric Warehouse",
          capacityUnits: "50,000 Units",
          dispatchSpeed: "Priority Dispatch (12-24h)",
          isPrimary: false
        }
      ]);
      setSelectedBondId("BOND-PRO");
      setCustomPercentage(5.0);
      toast.info("Loaded Fashion Vendor: Nike Official with 2 Warehouses & 5% Gross Bond 👟");
    } else if (type === "apple") {
      setStoreName("Apple India Official");
      setOwnerName("Apple India Pvt Ltd");
      setCategory("Electronics");
      setGstin("27AADCA1122A1Z1");
      setStoreDescription(
        "Official Apple India storefront. Premium iPhones, MacBooks, iPads, and Apple Watch directly from Apple warehouses."
      );
      setContactInput("vendor@apple.in");
      setAadhaarNumber("987654321111");
      setWarehouses([
        {
          id: "WH-A1",
          name: "Main Apple Logistics Hub (Zone A)",
          address: "Unit 1, Premium Logistics Center",
          city: "Bengaluru",
          stateName: "Karnataka",
          pincode: "560001",
          country: "India",
          storageType: "Climate-Controlled & High-Value Vault",
          capacityUnits: "100,000 Units",
          dispatchSpeed: "Same-Day Express (Under 12h)",
          isPrimary: true
        },
        {
          id: "WH-A2",
          name: "Regional Electronics Sorting Depot (Zone B)",
          address: "Plot 99, Cyber City Industrial Park",
          city: "Hyderabad",
          stateName: "Telangana",
          pincode: "500081",
          country: "India",
          storageType: "High-Value Electronics Vault",
          capacityUnits: "60,000 Units",
          dispatchSpeed: "Priority Dispatch (12-24h)",
          isPrimary: false
        }
      ]);
      setSelectedBondId("BOND-ENTERPRISE");
      setCustomPercentage(3.0);
      toast.info("Loaded Premium Vendor: Apple India with 2 Warehouses & 3% Gross Bond 🍎");
    } else if (type === "sony") {
      setStoreName("Sony India Electronics");
      setOwnerName("Sony India Center");
      setCategory("Electronics");
      setGstin("24AADCS9911K1Z9");
      setStoreDescription(
        "Official Sony India retailer. PlayStation consoles, Bravia TVs, Alpha cameras, and premium audio equipment."
      );
      setContactInput("vendor@sony.co.in");
      setAadhaarNumber("987654329012");
      setWarehouses([
        {
          id: "WH-M1",
          name: "Central Electronics Vault (Zone A)",
          address: "Bay 12, Express Logistics Park, GIDC",
          city: "Ahmedabad",
          stateName: "Gujarat",
          pincode: "380015",
          country: "India",
          storageType: "High-Value Electronics Vault",
          capacityUnits: "30,000 Units",
          dispatchSpeed: "Priority Dispatch (12-24h)",
          isPrimary: true
        },
        {
          id: "WH-M2",
          name: "Audio Visual Distribution Hub (Zone B)",
          address: "Sector 4, Phase 2",
          city: "Vadodara",
          stateName: "Gujarat",
          pincode: "390001",
          country: "India",
          storageType: "Climate-Controlled Electronics Storage",
          capacityUnits: "18,000 Units",
          dispatchSpeed: "Standard Fulfillment (24-48h)",
          isPrimary: false
        }
      ]);
      setSelectedBondId("BOND-GROWTH");
      setCustomPercentage(7.0);
      toast.info("Loaded Electronics Vendor: Sony India with 2 Warehouses & 7% Gross Bond 🎮");
    } else {
      // Default: Samsung
      setStoreName("Samsung India SmartTech");
      setOwnerName("Samsung Electronics");
      setCategory("Electronics");
      setGstin("27AADCB2234M1Z5");
      setStoreDescription(
        "Official Samsung Authorized Dealer. Galaxy smartphones, OLED monitors, tablets, and AI home appliances."
      );
      setContactInput("contact@samsung.in");
      setAadhaarNumber("987654321234");
      setWarehouses([
        {
          id: "WH-1",
          name: "Primary Mobile Fulfillment Hub (Zone A)",
          address: "Plot 14, MIDC Industrial Corridor",
          city: "Mumbai",
          stateName: "Maharashtra",
          pincode: "400093",
          country: "India",
          storageType: "Climate-Controlled & High-Value Vault",
          capacityUnits: "85,000 Units",
          dispatchSpeed: "Same-Day Express (Under 12h)",
          isPrimary: true
        },
        {
          id: "WH-2",
          name: "Secondary Appliances Depot (Zone B)",
          address: "Sector 18, Logistics Park, Phase II",
          city: "Pune",
          stateName: "Maharashtra",
          pincode: "411019",
          country: "India",
          storageType: "Standard Ambient & Bulk Pallets",
          capacityUnits: "45,000 Units",
          dispatchSpeed: "Priority Dispatch (12-24h)",
          isPrimary: false
        }
      ]);
      setSelectedBondId("BOND-PRO");
      setCustomPercentage(5.0);
      toast.info("Loaded Electronics Vendor: Samsung India with 2 Warehouses & 5% Gross Selling Bond 📱");
    }
  };

  // Step 1: Validate Store Details
  const handleProceedToKyc = (e) => {
    e.preventDefault();
    if (!storeName.trim() || !ownerName.trim()) {
      toast.error("Please enter Store Name and Owner Full Name.");
      return;
    }
    if (!contactInput.trim()) {
      toast.error("Please enter business mobile or email.");
      return;
    }
    setStep(2);
    if (!otpSent) {
      triggerOtpSend();
    }
  };

  // Step 2: Trigger OTP
  const triggerOtpSend = () => {
    setIsSendingOtp(true);
    setTimeout(() => {
      setIsSendingOtp(false);
      setOtpSent(true);
      setOtpCode("582910");
      setCountdown(30);
      toast.info(`Partner Verification OTP sent to ${contactInput}: 582910`);
    }, 700);
  };

  // Step 2: Verify KYC OTP
  const handleVerifyKyc = (e) => {
    e.preventDefault();
    if (!otpSent) {
      toast.warning("Please request an OTP first.");
      return;
    }
    if (otpCode !== "582910") {
      toast.error("Invalid verification code. Please enter demo OTP: 582910.");
      return;
    }
    toast.success("Vendor Partner KYC & Aadhaar Verified! 🎉");
    setTimeout(() => {
      setStep(3);
    }, 400);
  };

  // Step 3: Validate Multi-Warehouse Hubs (Must have >= 2 hubs)
  const handleProceedToBond = (e) => {
    e.preventDefault();
    if (warehouses.length < 2) {
      toast.error("Please add two or more warehouse hubs to establish your fulfillment network.");
      return;
    }
    for (let i = 0; i < warehouses.length; i++) {
      const wh = warehouses[i];
      if (!wh.name.trim() || !wh.address.trim() || !wh.city.trim() || !wh.pincode.trim()) {
        toast.error(`Please complete address details for "${wh.name || `Warehouse ${i + 1}`}"`);
        return;
      }
    }
    setStep(4);
    toast.info("Fulfillment Network Configured! Review Vendor Selling Percentage Bond.");
  };

  // Helper to apply any preset object into form state
  const applyPresetData = (preset, showToast = true) => {
    if (!preset) return;
    setStoreName(preset.storeName);
    setOwnerName(preset.ownerName);
    setCategory(preset.category);
    setGstin(preset.gstin);
    setAadhaarNumber(preset.aadhaarNumber);
    setContactInput(preset.email || preset.phone || "+91 9812345678");
    setStoreDescription(preset.description);
    if (Array.isArray(preset.warehouses) && preset.warehouses.length >= 2) {
      setWarehouses(preset.warehouses);
    }
    setSelectedBondId(preset.bondId || "BOND-PRO");
    setCustomPercentage(preset.percentage || 5.0);
    setAgreedToBondTerms(true);
    setOtpSent(true);
    setOtpCode("582910");
    if (showToast) {
      toast.info(`⚡ Loaded Demo Partner: "${preset.storeName}" (${preset.category}) 🚀`);
    }
  };

  // Cycle to next demo preset from ROTATING_DEMO_APPLICATIONS
  const handleCycleNextDemoPreset = () => {
    const nextIdx = (rotatingIndex + 1) % ROTATING_DEMO_APPLICATIONS.length;
    setRotatingIndex(nextIdx);
    localStorage.setItem("vendorDemoRotatingIndex", String(nextIdx));
    applyPresetData(ROTATING_DEMO_APPLICATIONS[nextIdx], true);
  };

  // Central submission handler for both 1-Click Instant Submit & 4-Step Form Flow
  const submitVendorApplicationToExecutor = async (overrideData = null, shouldNavigate = false) => {
    const targetStoreName = overrideData?.storeName || storeName;
    const targetOwnerName = overrideData?.ownerName || ownerName;
    const targetCategory = overrideData?.category || category;
    const targetGstin = overrideData?.gstin || gstin;
    const targetAadhaar = overrideData?.aadhaarNumber || aadhaarNumber;
    const targetDescription = overrideData?.description || storeDescription;
    const targetContact = overrideData?.email || overrideData?.phone || contactInput;
    const targetWarehouses = (overrideData?.warehouses && overrideData.warehouses.length >= 2)
      ? overrideData.warehouses
      : (warehouses.length >= 2 ? warehouses : [
          {
            id: "WH-1",
            name: `${targetStoreName} Primary Central Hub (Zone A)`,
            city: "Bengaluru",
            stateName: "Karnataka",
            pincode: "560001",
            storageType: "Climate-Controlled & High-Value Vault",
            capacityUnits: "100,000 Units",
            dispatchSpeed: "Same-Day Express (Under 12h)",
            incidentStatus: "Clean (0 Violations / Passed ISO Audit)",
            isPrimary: true,
            gpsCoordinates: "12.9716° N, 77.5946° E (Industrial Park)",
            realLocationVerified: true
          },
          {
            id: "WH-2",
            name: `${targetStoreName} Regional Sorting Depot (Zone B)`,
            city: "Hyderabad",
            stateName: "Telangana",
            pincode: "500081",
            storageType: "High-Value Electronics Vault",
            capacityUnits: "60,000 Units",
            dispatchSpeed: "Priority Dispatch (12-24h)",
            incidentStatus: "Clean (0 Cargo Damage Claims)",
            isPrimary: false,
            gpsCoordinates: "17.4401° N, 78.3489° E (Logistics Corridor)",
            realLocationVerified: true
          }
        ]);
    const targetBondId = overrideData?.bondId || selectedBondId;
    const targetPercentage = overrideData?.percentage || customPercentage;

    const isTargetEmail = targetContact.includes("@");
    const resolvedEmail = isTargetEmail
      ? targetContact
      : `${targetOwnerName.toLowerCase().replace(/\s+/g, "")}@${targetStoreName.toLowerCase().replace(/\s+/g, "")}.com`;
    const resolvedPhone = !isTargetEmail ? targetContact : "+91 9812345678";

    const activeBond = bondOptions.find((b) => b.id === targetBondId) || bondOptions[1];

    try {
      let res = null;
      try {
        res = await applyVendorPipeline({
          store_name: targetStoreName,
          owner_name: targetOwnerName,
          category: targetCategory,
          gstin: targetGstin,
          aadhaar_number: targetAadhaar,
          email: resolvedEmail,
          phone: resolvedPhone,
          description: targetDescription
        });
      } catch (apiErr) {
        console.warn("Backend API notice, persisting in live pipeline:", apiErr);
      }

      const generatedId = res?.app_ref || `VAPP-${Math.floor(Math.random() * 800) + 120}`;

      // Build full pipeline record with Stage 1 Executor Pending status
      const newPipelineRecord = {
        id: generatedId,
        app_ref: generatedId,
        storeName: targetStoreName,
        store_name: targetStoreName,
        ownerName: targetOwnerName,
        owner_name: targetOwnerName,
        category: targetCategory,
        gstin: targetGstin,
        aadhaarNumber: targetAadhaar,
        aadhaar_number: targetAadhaar,
        email: resolvedEmail,
        phone: resolvedPhone,
        description: targetDescription,
        warehouses: targetWarehouses,
        bond: {
          id: activeBond.id,
          title: activeBond.title,
          sellingPercentage: `${targetPercentage.toFixed(1)}% Gross on Sold Products`,
          escrowSecurity: "₹25,000 (Refundable Escrow)",
          bondReference: `BND-${generatedId}`,
          payoutSpeed: "Instant Daily Settlement (T+0)"
        },
        dueDiligence: {
          complaintsCheck: {
            status: "CLEAN",
            legalDisputesCount: 0,
            consumerCourtCases: "0 Outstanding Cases (Clean Consumer Record)",
            policeFirs: "Clean Record (No Criminal, Fraud or Cyber-cell FIRs)",
            warehouseViolations: "Clean Record (0 Cargo Theft / 0 Hazmat Violations across Hubs)",
            ipInfringements: "Nil Trademark or Counterfeit Complaints"
          },
          trustability: {
            trustScore: 98,
            trustGrade: "Tier-A+ Enterprise Official",
            financialHealth: "AAA Rated (Financially Sound, 0 Default Risk)",
            fraudRiskLevel: "Ultra-Low Risk (0.01%)",
            bankVerification: "Commercial Corporate Account Verified (10+ Yr Active)",
            isTrustable: true
          },
          partnershipHistory: {
            previousCollabs: [
              { enterprise: `${targetStoreName} Operations`, duration: "Active Direct", role: "Primary Brand Operations India", rating: "5.0/5.0 ★", notes: "Official direct subsidiary store." },
              { enterprise: "ShopSense India Logistics", duration: "New Partner", role: "Priority Express Merchant", rating: "5.0/5.0 ★", notes: "Enterprise SLA tier." }
            ],
            defaultRate: "0.00% Historical Defaults",
            repeatPartnerStatus: "Global Tier-1 Brand Partner"
          },
          companyReviews: {
            averageRating: 4.9,
            totalReviewsCount: 8450,
            positiveSentimentRate: "99.8% Positive",
            marketReputation: "World-leading manufacturer and verified merchant partner.",
            industryCertifications: ["ISO 9001:2015 Quality Standard", "RoHS Compliance Certified", "BIS Importer Clearance"]
          }
        },
        verifierAudit: {
          geolocationCheck: {
            status: "VERIFIED_REAL",
            geotaggedConfidence: "100% Real Physical Facilities (0 Fake / Shell Addresses)",
            physicalVerificationMethod: "Satellite Geocoding & Field Agent Physical Facility Inspection",
            pinCodesValidated: true,
            gpsCoordinates: targetWarehouses[0]?.gpsCoordinates || "12.9716° N, 77.5946° E & 17.4401° N, 78.3489° E"
          },
          catalogConsistency: {
            status: "100% MATCH",
            declaredCategory: targetCategory,
            descriptionProducts: targetDescription,
            actualCatalogProducts: `Verified 100% authentic ${targetCategory} SKUs`,
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
            declaredCount: targetWarehouses.length,
            meetsPolicy: true,
            totalCapacity: "160,000 Storage Units",
            dispatchVelocitySLA: "Same-Day Express (<12h) for 95% Inventory"
          }
        },
        handoverLetterToVerifier: {
          sender: "Mounish Sai (System Operations Executor Admin)",
          timestamp: "Awaiting Clearance",
          subject: `Stage 1 Due-Diligence Clearance & Handover: ${targetStoreName}`,
          content: `To: Ananya Rao (Compliance & KYC Verifier Admin)\nFrom: Mounish Sai (System Operations Executor Admin)\nSubject: Stage 1 Due-Diligence Clearance & Handover: ${targetStoreName}\n\nDear Verifier Admin,\n\nI have investigated "${targetStoreName}". 0 legal disputes, clean records.\n\nRespectfully,\nMounish Sai`,
          status: "PENDING_REVIEW"
        },
        returnLetterToExecutor: null,
        handoverLetterToApprover: {
          sender: "Ananya Rao (Compliance & KYC Verifier Admin)",
          timestamp: "Awaiting Verification",
          subject: `Stage 2 Geolocation, Quality & Workplace Safety Clearance: ${targetStoreName}`,
          content: `To: Rajesh Menon (Cross-Check & Approval Authority)\nFrom: Ananya Rao (Compliance & KYC Verifier Admin)\nSubject: Stage 2 Geolocation, Quality & Workplace Safety Clearance: ${targetStoreName}\n\nDear Approver Authority,\n\nI have accepted the Stage 1 Handover from Executor Admin and audited facilities for "${targetStoreName}". All warehouses verified real.\n\nRespectfully,\nAnanya Rao`,
          status: "PENDING_REVIEW"
        },
        returnLetterToVerifier: null,
        stage1_executor: {
          status: "PENDING",
          by: null,
          timestamp: null,
          notes: "Awaiting Executor due-diligence & legal complaints scan."
        },
        stage1_status: "PENDING",
        stage2_verifier: {
          status: "LOCKED",
          by: null,
          timestamp: null,
          notes: "Locked: Waiting for Stage 1 Executor due-diligence approval."
        },
        stage2_status: "LOCKED",
        stage3_approver: {
          status: "LOCKED",
          by: null,
          timestamp: null,
          seal: null,
          notes: "Locked: Waiting for Stage 2 Verifier compliance clearance."
        },
        stage3_status: "LOCKED",
        overallStatus: "STAGE_1_EXECUTOR",
        overall_status: "STAGE_1_EXECUTOR",
        isLiveSessionIntake: true,
        submissionTimestamp: new Date().toLocaleTimeString()
      };

      // Persist across all pipeline localStorage keys so Executor Admin instantly sees it
      const pipelineStorageKeys = [
        "vendorRegistrationPipeline_v7",
        "vendorRegistrationPipeline_v6",
        "vendorRegistrationPipeline_v5",
        "vendorRegistrationPipeline_v4"
      ];

      pipelineStorageKeys.forEach((key) => {
        let existing = [];
        try {
          const raw = localStorage.getItem(key);
          if (raw) existing = JSON.parse(raw);
        } catch {}
        if (!Array.isArray(existing)) existing = [];
        const filtered = existing.filter(
          (item) => (item.storeName || item.store_name) !== targetStoreName && (item.id || item.app_ref) !== generatedId
        );
        localStorage.setItem(key, JSON.stringify([newPipelineRecord, ...filtered]));
      });

      // Broadcast live event across tabs via BroadcastChannel for real-time live session sync
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        try {
          const liveChannel = new BroadcastChannel("shopsense_live_pipeline");
          liveChannel.postMessage({
            type: "NEW_VENDOR_APPLICATION",
            application: newPipelineRecord,
            timestamp: Date.now()
          });
          setTimeout(() => liveChannel.close(), 100);
        } catch (bcErr) {
          console.warn("BroadcastChannel notice:", bcErr);
        }
      }

      window.dispatchEvent(new CustomEvent("vendorPipelineUpdated", { detail: newPipelineRecord }));
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("roleChanged"));

      toast.success(
        `🎉 Live Dispatched! "${targetStoreName}" sent to Stage 1 Executor Intake Queue! ⚡ Next demo profile staged.`
      );

      // Automatically advance to NEXT rotating demo partner so user can immediately repeat
      const nextIdx = (rotatingIndex + 1) % ROTATING_DEMO_APPLICATIONS.length;
      setRotatingIndex(nextIdx);
      localStorage.setItem("vendorDemoRotatingIndex", String(nextIdx));
      applyPresetData(ROTATING_DEMO_APPLICATIONS[nextIdx], false);
      setStep(1);

      if (shouldNavigate) {
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (error) {
      console.error("Vendor application error:", error);
      toast.error(error.response?.data?.detail || "Failed to submit vendor application.");
    }
  };

  // 1-Click Instant Submit for Live Demonstrations
  const handleInstantSubmitDemo = async () => {
    await submitVendorApplicationToExecutor(null, false);
  };

  // Step 4: Complete Vendor Registration with Bond Agreement
  const handleCompleteRegistration = async () => {
    if (!agreedToBondTerms) {
      toast.error("Please review and accept the Selling Percentage Bond Agreement terms to proceed.");
      return;
    }
    await submitVendorApplicationToExecutor(null, true);
  };

  const currentBond = bondOptions.find((b) => b.id === selectedBondId) || bondOptions[1];


  return (
    <div className="vendor-login-page">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />

      {/* Ambient Visual Glows */}
      <div className="v-bg-glow v-bg-glow-1" />
      <div className="v-bg-glow v-bg-glow-2" />
      <div className="v-bg-glow v-bg-glow-3" />

      <div className="vendor-onboarding-wrapper">
        {/* Brand Header */}
        <header className="vendor-brand-header">
          <div className="vendor-badge">
            <FiShoppingBag /> ShopSense Multi-Warehouse Merchant Network
          </div>
          <h1>New Vendor Partner Registration & Sales Bond</h1>
          <p>
            Configure two or more regional warehouse hubs, set selling percentage bond terms, and launch your storefront.
          </p>

          {/* Quick Demo Presets Bar */}
          <div className="vendor-presets-bar">
            <span className="preset-label">⚡ Fast Demo Presets:</span>
            {!isAppleOnboarded && (
              <button type="button" className="preset-btn" onClick={() => handleApplyPreset("apple")}>
                🍎 Apple India (2 Hubs, 3% Gross Bond)
              </button>
            )}
            <button type="button" className="preset-btn" onClick={() => handleApplyPreset("samsung")}>
              📱 Samsung India (2 Hubs, 5% Gross Bond)
            </button>
            <button type="button" className="preset-btn" onClick={() => handleApplyPreset("nike")}>
              👟 Nike Official (2 Hubs, 5% Gross Bond)
            </button>
            <button type="button" className="preset-btn" onClick={() => handleApplyPreset("sony")}>
              🎮 Sony India (2 Hubs, 7% Gross Bond)
            </button>
          </div>
        </header>

        {/* Live Demo Quick Station */}
        <div className="v-live-demo-hero-bar">
          <div className="v-live-demo-left">
            <div className="v-live-pulse-badge">
              <span className="v-pulse-dot" /> 🔴 LIVE DEMO STATION
            </div>
            <div className="v-live-demo-text">
              <strong>Active Demo Partner:</strong> {storeName} ({category}) • <em>Profile #{((Number(rotatingIndex) || 0) % ROTATING_DEMO_APPLICATIONS.length) + 1} of {ROTATING_DEMO_APPLICATIONS.length}</em>
            </div>
          </div>
          <div className="v-live-demo-btns">
            <button
              type="button"
              className="v-cycle-btn"
              onClick={handleCycleNextDemoPreset}
              title="Cycle to next realistic demo vendor application"
            >
              <FiRefreshCw /> ⚡ Fill Next Demo Partner
            </button>
            <button
              type="button"
              className="v-instant-btn"
              onClick={handleInstantSubmitDemo}
              title="1-Click Dispatch to Executor Admin intake queue without stepping through forms"
            >
              <FiZap /> 🚀 1-Click Instant Submit to Executor
            </button>
          </div>
        </div>

        {/* Stepper Progress Navigation Bar */}
        <div className="v-stepper-container">
          <div className="v-stepper-track">
            <div
              className="v-stepper-progress-fill"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />
          </div>

          <div className="v-stepper-nodes">
            {[
              { num: 1, label: "Store Identity", icon: <FiBriefcase /> },
              { num: 2, label: "Aadhaar & KYC", icon: <FiShield /> },
              { num: 3, label: `Warehouse Hubs (${warehouses.length})`, icon: <FiMapPin /> },
              { num: 4, label: "Sales Bond Agreement", icon: <FiFileText /> }
            ].map((s) => {
              const isCompleted = step > s.num;
              const isActive = step === s.num;

              return (
                <div
                  key={s.num}
                  className={`v-step-node ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
                  onClick={() => {
                    if (isCompleted) setStep(s.num);
                  }}
                >
                  <div className="v-step-icon-circle">
                    {isCompleted ? <FiCheck /> : s.num}
                  </div>
                  <span className="v-step-title">
                    <span className="v-step-badge-text">Step {s.num}</span>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Multi-Step Card */}
        <div className="vendor-card">
          <AnimatePresence mode="wait">
            {/* ========================================================= */}
            {/* STEP 1: STORE & PARTNER IDENTITY                           */}
            {/* ========================================================= */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="v-step-content"
              >
                <div className="v-step-header">
                  <div className="v-step-pill">Page 1 of 4</div>
                  <h2>🏬 Register Your Storefront & Partner Identity</h2>
                  <p>Provide your official business name, primary product category, brand overview, and contact details.</p>
                </div>

                <form onSubmit={handleProceedToKyc} className="vendor-form">
                  {/* Store Name & Owner Full Name */}
                  <div className="v-input-row">
                    <div className="v-input-group">
                      <label><FiBriefcase /> Store / Business Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. TechWorld Electronics"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                      />
                    </div>

                    <div className="v-input-group">
                      <label><FiUser /> Owner / Representative Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Primary Category & GSTIN / Tax ID */}
                  <div className="v-input-row">
                    <div className="v-input-group">
                      <label><FiTag /> Primary Store Category *</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="v-custom-select"
                      >
                        <option value="Electronics">Electronics & Computing</option>
                        <option value="Fashion">Fashion, Apparel & Footwear</option>
                        <option value="Home & Kitchen">Home, Furniture & Living</option>
                        <option value="Sports & Fitness">Sports & Outdoor Fitness</option>
                        <option value="Toys & Robotics">Toys, STEM & Robotics</option>
                        <option value="Beauty & Cosmetics">Beauty, Skincare & Health</option>
                        <option value="Organic Groceries">Organic Groceries & Food</option>
                      </select>
                    </div>

                    <div className="v-input-group">
                      <label><FiFileText /> GSTIN / Business Tax ID *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 27AADCB2234M1Z5"
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      />
                    </div>
                  </div>

                  {/* Business Mobile or Email */}
                  <div className="v-input-group">
                    <label className="v-primary-label">
                      {isEmailInput ? <FiMail /> : <FiPhone />} Business Mobile Number or Email *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter mobile number or email"
                      className="v-unified-input"
                      value={contactInput}
                      onChange={(e) => setContactInput(e.target.value)}
                    />
                    <span className="v-hint-sub">
                      {isEmailInput ? "✓ Verified Business Email" : "✓ Verified Mobile Number"}
                    </span>
                  </div>

                  {/* Storefront Description & Brand Story */}
                  <div className="v-input-group">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <label><FiFileText /> Store Description & Brand Mission *</label>
                      <span style={{ fontSize: "0.72rem", color: "#94A3B8" }}>{storeDescription.length}/300 chars</span>
                    </div>
                    <textarea
                      required
                      rows={3}
                      maxLength={300}
                      placeholder="Describe your store catalog, brand mission, and customer promise..."
                      value={storeDescription}
                      onChange={(e) => setStoreDescription(e.target.value)}
                      className="v-textarea"
                    />
                    <span className="v-hint-sub" style={{ color: "#94A3B8" }}>
                      💡 Displayed on your public storefront and customer product catalog
                    </span>
                  </div>

                  <div className="v-form-actions">
                    <Link to="/login" className="v-back-link">
                      <FiArrowLeft /> Back to Main Login
                    </Link>
                    <button type="submit" className="v-primary-btn">
                      Continue to Aadhaar & KYC <FiArrowRight />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ========================================================= */}
            {/* STEP 2: AADHAAR & KYC VERIFICATION                         */}
            {/* ========================================================= */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="v-step-content"
              >
                <div className="v-step-header">
                  <div className="v-step-pill">Page 2 of 4</div>
                  <h2>🔐 Owner KYC & Aadhaar Verification</h2>
                  <p>Verify owner identity to comply with government marketplace regulations & instant payouts.</p>
                </div>

                <form onSubmit={handleVerifyKyc} className="vendor-form">
                  {/* Aadhaar Number Input */}
                  <div className="v-input-group">
                    <label><FiShield /> 12-Digit Owner Aadhaar Number *</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showAadhaar ? "text" : "password"}
                        required
                        maxLength={12}
                        placeholder="987654321234"
                        value={aadhaarNumber}
                        onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, "").slice(0, 12))}
                        className="v-aadhaar-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAadhaar(!showAadhaar)}
                        className="v-eye-toggle"
                      >
                        {showAadhaar ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  {/* OTP Dispatch Card */}
                  <div className="v-otp-card">
                    <div className="v-otp-header">
                      <div>
                        <span className="v-channel-badge">
                          {isEmailInput ? <FiMail /> : <FiPhone />} {isEmailInput ? "EMAIL OTP" : "MOBILE OTP"}
                        </span>
                        <div className="v-dest-text">{contactInput}</div>
                      </div>

                      <button
                        type="button"
                        className="v-resend-btn"
                        onClick={triggerOtpSend}
                        disabled={isSendingOtp}
                      >
                        <FiRefreshCw className={isSendingOtp ? "spin" : ""} />{" "}
                        {isSendingOtp ? "Sending..." : "Resend OTP"}
                      </button>
                    </div>

                    <div className="v-input-group">
                      <label><FiKey /> Enter 6-Digit OTP Verification Code *</label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        placeholder="5 8 2 9 1 0"
                        className="v-otp-code-input"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                      />
                    </div>

                    <div className="v-demo-helper">
                      <span className="v-demo-tag">DEMO OTP</span>
                      <span>Test verification code is <strong>582910</strong></span>
                      <button
                        type="button"
                        className="v-autofill-btn"
                        onClick={() => {
                          setOtpSent(true);
                          setOtpCode("582910");
                          toast.info("Auto-filled demo OTP: 582910");
                        }}
                      >
                        Auto-Fill OTP
                      </button>
                    </div>
                  </div>

                  <div className="v-form-actions">
                    <button type="button" className="v-secondary-btn" onClick={() => setStep(1)}>
                      <FiArrowLeft /> Back to Store Info
                    </button>
                    <button type="submit" className="v-primary-btn">
                      Verify & Configure Warehouses (2+) <FiArrowRight />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ========================================================= */}
            {/* STEP 3: MULTI-WAREHOUSE FULFILLMENT NETWORK (2+ HUBS)      */}
            {/* ========================================================= */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="v-step-content"
              >
                <div className="v-step-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <div className="v-step-pill">Page 3 of 4</div>
                    <h2>🏢 Multi-Warehouse Logistics Network ({warehouses.length} Active Hubs)</h2>
                    <p>Configure two or more fulfillment facilities for distributed stock and rapid regional shipping.</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddWarehouse}
                    className="v-add-hub-btn"
                  >
                    <FiPlus /> Add Another Warehouse Hub
                  </button>
                </div>

                <form onSubmit={handleProceedToBond} className="vendor-form">
                  {/* Warehouse Cards List */}
                  <div className="v-warehouse-list">
                    {warehouses.map((wh, index) => (
                      <div key={wh.id} className={`v-warehouse-card ${wh.isPrimary ? "is-primary-hub" : ""}`}>
                        <div className="v-wh-header">
                          <div className="v-wh-title-group">
                            <span className="v-wh-index-badge">Hub #{index + 1}</span>
                            <input
                              type="text"
                              required
                              value={wh.name}
                              onChange={(e) => handleUpdateWarehouse(wh.id, "name", e.target.value)}
                              className="v-wh-name-input"
                              placeholder="Facility Name (e.g. West Coast Central Depot)"
                            />
                          </div>

                          <div className="v-wh-controls">
                            {wh.isPrimary ? (
                              <span className="v-primary-hub-badge">
                                <FiCheckCircle /> Primary Logistics Hub
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSetPrimary(wh.id)}
                                className="v-set-primary-btn"
                              >
                                Set as Primary
                              </button>
                            )}

                            {warehouses.length > 2 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveWarehouse(wh.id)}
                                className="v-del-hub-btn"
                                title="Remove this warehouse hub"
                              >
                                <FiTrash2 />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Warehouse Street Address */}
                        <div className="v-input-group" style={{ marginTop: "12px" }}>
                          <label><FiMapPin /> Street Address / Industrial Plot *</label>
                          <input
                            type="text"
                            required
                            placeholder="Plot / Unit Number, Industrial Area, Landmark"
                            value={wh.address}
                            onChange={(e) => handleUpdateWarehouse(wh.id, "address", e.target.value)}
                          />
                        </div>

                        {/* City, State & Pincode */}
                        <div className="v-input-row" style={{ marginTop: "10px" }}>
                          <div className="v-input-group">
                            <label>City *</label>
                            <input
                              type="text"
                              required
                              placeholder="City"
                              value={wh.city}
                              onChange={(e) => handleUpdateWarehouse(wh.id, "city", e.target.value)}
                            />
                          </div>

                          <div className="v-input-group">
                            <label>State / Province *</label>
                            <input
                              type="text"
                              required
                              placeholder="State"
                              value={wh.stateName}
                              onChange={(e) => handleUpdateWarehouse(wh.id, "stateName", e.target.value)}
                            />
                          </div>

                          <div className="v-input-group">
                            <label>Pincode / Postal *</label>
                            <input
                              type="text"
                              required
                              placeholder="Postal Code"
                              value={wh.pincode}
                              onChange={(e) => handleUpdateWarehouse(wh.id, "pincode", e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Storage Type & Dispatch Velocity */}
                        <div className="v-input-row" style={{ marginTop: "10px" }}>
                          <div className="v-input-group">
                            <label><FiBox /> Storage & Climate Facility</label>
                            <select
                              value={wh.storageType}
                              onChange={(e) => handleUpdateWarehouse(wh.id, "storageType", e.target.value)}
                              className="v-custom-select"
                            >
                              <option value="Climate-Controlled & High-Value Vault">Climate-Controlled & High-Value Vault</option>
                              <option value="Standard Ambient & Bulk Pallets">Standard Ambient & Bulk Pallets</option>
                              <option value="Dust-Proof Garment & Cleanroom Racks">Dust-Proof Garment & Cleanroom Racks</option>
                              <option value="Heavy Cargo & Stacking Racks">Heavy Cargo & Stacking Racks</option>
                              <option value="Cold Storage & Perishables">Cold Storage & Perishables</option>
                            </select>
                          </div>

                          <div className="v-input-group">
                            <label><FiTruck /> Dispatch Velocity SLA</label>
                            <select
                              value={wh.dispatchSpeed}
                              onChange={(e) => handleUpdateWarehouse(wh.id, "dispatchSpeed", e.target.value)}
                              className="v-custom-select"
                            >
                              <option value="Same-Day Express (Under 12h)">Same-Day Express (Under 12h)</option>
                              <option value="Priority Dispatch (12-24h)">Priority Dispatch (12-24h)</option>
                              <option value="Standard Fulfillment (24-48h)">Standard Fulfillment (24-48h)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Multi-Warehouse Status Bar */}
                  <div className="v-wh-summary-bar">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <FiTruck style={{ fontSize: "1.5rem", color: "#10B981" }} />
                      <div>
                        <strong>{warehouses.length} Warehouses Configured:</strong>
                        <p style={{ margin: "2px 0 0 0", fontSize: "0.82rem", color: "#94A3B8" }}>
                          Orders will automatically route to the nearest inventory facility to ensure lowest transit cost & fastest delivery.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="v-form-actions">
                    <button type="button" className="v-secondary-btn" onClick={() => setStep(2)}>
                      <FiArrowLeft /> Back to KYC
                    </button>
                    <button type="submit" className="v-primary-btn">
                      Proceed to Selling Bond Agreement <FiArrowRight />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ========================================================= */}
            {/* STEP 4: VENDOR SELLING PERCENTAGE & BOND AGREEMENT         */}
            {/* ========================================================= */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="v-step-content"
              >
                <div className="v-step-header">
                  <div className="v-step-pill">Page 4 of 4 (Final Step)</div>
                  <h2>📜 Legal Vendor Selling Percentage & Performance Bond Agreement</h2>
                  <p>
                    Select your revenue-share bond structure. Zero upfront subscription fees—we only earn when your products sell.
                  </p>
                </div>

                {/* Bond Agreement Tiers Grid */}
                <div className="v-plans-grid">
                  {bondOptions.map((bond) => {
                    const isSelected = selectedBondId === bond.id;

                    return (
                      <div
                        key={bond.id}
                        className={`v-plan-card tier-${bond.id.toLowerCase()} ${isSelected ? "selected" : ""}`}
                        onClick={() => {
                          setSelectedBondId(bond.id);
                          setCustomPercentage(bond.sellingPercentage);
                        }}
                      >
                        {isSelected && (
                          <div className="v-selected-badge">
                            <FiCheckCircle /> Selected Agreement Bond
                          </div>
                        )}

                        <div className="v-plan-header">
                          <span
                            className="v-plan-tag"
                            style={{
                              backgroundColor: `${bond.badgeColor}22`,
                              color: bond.badgeColor,
                              borderColor: `${bond.badgeColor}55`
                            }}
                          >
                            {bond.badge}
                          </span>

                          <h3 className="v-plan-name">{bond.title}</h3>

                          <div className="v-plan-pricing">
                            <span className="v-price-val">{bond.percentageDisplay}</span>
                            <span className="v-price-sub">per product sold</span>
                          </div>
                        </div>

                        {/* Escrow & Payout Details */}
                        <div className="v-bond-metrics">
                          <div className="v-metric-row">
                            <span className="v-m-label">Escrow Bond:</span>
                            <span className="v-m-val" style={{ color: "#34D399" }}>{bond.escrowSecurity}</span>
                          </div>
                          <div className="v-metric-row">
                            <span className="v-m-label">Payout Cycle:</span>
                            <span className="v-m-val" style={{ color: "#60A5FA" }}>{bond.payoutSpeed}</span>
                          </div>
                          <div className="v-metric-row">
                            <span className="v-m-label">Coverage SLA:</span>
                            <span className="v-m-val">{bond.coverageLimit}</span>
                          </div>
                        </div>

                        <div className="v-divider" />

                        <ul className="v-features-list">
                          {bond.terms.map((t, idx) => (
                            <li key={idx}>
                              <FiCheck className="v-check-icon" />
                              <span>{t}</span>
                            </li>
                          ))}
                        </ul>

                        <button
                          type="button"
                          className={`v-select-btn ${isSelected ? "active" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBondId(bond.id);
                            setCustomPercentage(bond.sellingPercentage);
                          }}
                        >
                          {isSelected ? (
                            <>
                              <FiCheckCircle /> Selected {bond.percentageDisplay}
                            </>
                          ) : (
                            `Choose ${bond.title}`
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Custom Percentage Adjuster Box */}
                <div className="v-bond-customizer-box">
                  <div className="v-slider-header">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <FiSliders style={{ fontSize: "1.4rem", color: "#10B981" }} />
                      <div>
                        <strong>Custom Product Selling Royalty Adjustment:</strong>
                        <p style={{ margin: "2px 0 0 0", fontSize: "0.82rem", color: "#94A3B8" }}>
                          Adjust your baseline selling royalty deduction rate per completed order.
                        </p>
                      </div>
                    </div>

                    <div className="v-slider-val-badge">
                      {customPercentage.toFixed(1)}% Royalty Fee
                    </div>
                  </div>

                  <input
                    type="range"
                    min="1.0"
                    max="10.0"
                    step="0.5"
                    value={customPercentage}
                    onChange={(e) => setCustomPercentage(parseFloat(e.target.value))}
                    className="v-bond-slider"
                  />
                  <div className="v-slider-ticks">
                    <span>1.0% (VIP)</span>
                    <span>3.0% (Anchor)</span>
                    <span>5.0% (Gross Standard)</span>
                    <span>7.0% (Growth)</span>
                    <span>10.0% (Max)</span>
                  </div>
                </div>

                {/* Formal Legal Bond Certificate Document Preview */}
                <div className="v-bond-certificate">
                  <div className="v-cert-header">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <FiShield style={{ fontSize: "1.6rem", color: "#F59E0B" }} />
                      <div>
                        <h4 style={{ margin: 0, fontSize: "1rem", color: "#FFFFFF", fontWeight: 800 }}>
                          SHOPSENSE MERCHANT REVENUE-SHARE & PERFORMANCE BOND CONTRACT
                        </h4>
                        <span style={{ fontSize: "0.75rem", color: "#94A3B8" }}>
                          Bond Reference: <strong>BND-2026-SS-8492</strong> • Security Protocol: ISO/IEC 27001 Certified
                        </span>
                      </div>
                    </div>
                    <span className="v-cert-status-badge">LEGAL BOND INSTRUMENT</span>
                  </div>

                  <div className="v-cert-body">
                    <div className="v-cert-grid">
                      <div>
                        <span className="v-cert-lbl">Principal Merchant:</span>
                        <strong className="v-cert-val">{ownerName} ({storeName})</strong>
                      </div>
                      <div>
                        <span className="v-cert-lbl">GSTIN / Tax Entity:</span>
                        <strong className="v-cert-val">{gstin}</strong>
                      </div>
                      <div>
                        <span className="v-cert-lbl">Agreed Selling Percentage:</span>
                        <strong className="v-cert-val" style={{ color: "#34D399" }}>
                          {customPercentage.toFixed(1)}% Gross on Completed Sales
                        </strong>
                      </div>
                      <div>
                        <span className="v-cert-lbl">Fulfillment Hubs Bound:</span>
                        <strong className="v-cert-val" style={{ color: "#60A5FA" }}>
                          {warehouses.length} Active Regional Facilities
                        </strong>
                      </div>
                    </div>

                    <div className="v-cert-legal-text">
                      "By executing this Bond Agreement, the Vendor authorizes ShopSense Inc. to automatically route product shipments across its {warehouses.length} declared warehouse hubs and deduct a performance royalty of {customPercentage.toFixed(1)}% Gross exclusively upon verified customer order delivery. All escrow deposits remain 100% refundable upon fulfillment reconciliation."
                    </div>

                    {/* Legal Checkbox */}
                    <label className="v-cert-checkbox-label">
                      <input
                        type="checkbox"
                        checked={agreedToBondTerms}
                        onChange={(e) => setAgreedToBondTerms(e.target.checked)}
                      />
                      <span>
                        I, <strong>{ownerName}</strong>, hereby sign and legally accept the terms of the Multi-Warehouse Merchant Revenue-Share & Performance Bond.
                      </span>
                    </label>
                  </div>
                </div>

                {/* Onboarding Confirmation Summary Banner */}
                <div className="v-confirmation-bar">
                  <div className="v-conf-left">
                    <FiAward className="v-conf-icon" />
                    <div>
                      <div className="v-conf-title">
                        Ready to Launch: <strong>{storeName}</strong> ({ownerName})
                      </div>
                      <div className="v-conf-sub">
                        Bond: <strong>{currentBond.title} ({customPercentage.toFixed(1)}%)</strong> • Hubs: {warehouses.length} Facilities • Category: {category}
                      </div>
                      <div className="v-conf-desc" style={{ fontSize: "0.78rem", color: "#A7F3D0", marginTop: "4px", fontStyle: "italic" }}>
                        "{storeDescription}"
                      </div>
                    </div>
                  </div>

                  <div className="v-conf-actions">
                    <button type="button" className="v-secondary-btn" onClick={() => setStep(3)}>
                      <FiArrowLeft /> Back to Warehouses
                    </button>
                    <button
                      type="button"
                      className="v-finish-btn"
                      onClick={handleCompleteRegistration}
                    >
                      Execute Bond & Open Store Dashboard <FiArrowRight />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default VendorLogin;
