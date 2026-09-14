import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiAlertTriangle,
  FiBox,
  FiTrendingUp,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiCpu,
  FiSearch,
  FiMapPin,
  FiUserCheck,
  FiActivity,
  FiTruck,
  FiClock,
  FiThermometer,
  FiSliders,
  FiZap,
  FiFileText,
  FiX,
  FiRadio,
  FiLogOut
} from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getProducts,
  updateProductStock,
  getInventoryForecast,
  getInventoryTrackingLogs,
  simulateInventoryAction,
  getVendors
} from "../services/api";
import { DEFAULT_VENDOR_CONFIGS, buildVendorMap, normalizeVendorKey } from "../utils/vendorConfigs";
import "./Inventory.css";

const STORAGE_KEY = "shopsense_vendor_products_v4";

// Backward-compatible reference
const VENDOR_PROFILES = DEFAULT_VENDOR_CONFIGS;

// Initial rich baseline items strictly per vendor
const BASELINE_VENDOR_ITEMS = {
  techworld: [
    { id: 1, name: "Samsung Galaxy S24 Ultra 5G (Titanium Gray, 512GB)", category: "Mobiles", price: 1299.99, stock_quantity: 45, reorder_threshold: 10, stock: "In Stock" },
    { id: 2, name: "Apple iPhone 16 Pro Max (Desert Titanium, 256GB)", category: "Mobiles", price: 1199.00, stock_quantity: 60, reorder_threshold: 10, stock: "In Stock" },
    { id: 3, name: "Apple iPhone 16 (Ultramarine Blue, 128GB)", category: "Mobiles", price: 799.00, stock_quantity: 50, reorder_threshold: 10, stock: "In Stock" },
    { id: 4, name: "Google Pixel 9 Pro XL AI (Obsidian, 128GB)", category: "Mobiles", price: 1099.00, stock_quantity: 28, reorder_threshold: 10, stock: "In Stock" },
    { id: 5, name: "OnePlus 12 5G (Flowy Emerald, 256GB)", category: "Mobiles", price: 799.99, stock_quantity: 40, reorder_threshold: 10, stock: "In Stock" },
    { id: 6, name: "Apple MacBook Pro M3 Max 16-inch (Space Black, 36GB RAM)", category: "Laptops & Computing", price: 2499.00, stock_quantity: 15, reorder_threshold: 5, stock: "In Stock" },
    { id: 7, name: "Apple MacBook Air M3 13-inch (Midnight, 16GB RAM)", category: "Laptops & Computing", price: 1099.00, stock_quantity: 40, reorder_threshold: 10, stock: "In Stock" },
    { id: 8, name: "Dell XPS 15 OLED Touchscreen (Intel Core i9, 32GB RAM, RTX 4070)", category: "Laptops & Computing", price: 2199.00, stock_quantity: 4, reorder_threshold: 10, stock: "Low Stock" },
    { id: 9, name: "Asus ROG Zephyrus G16 OLED Gaming Laptop (RTX 4080)", category: "Laptops & Computing", price: 1999.00, stock_quantity: 14, reorder_threshold: 5, stock: "In Stock" },
    { id: 10, name: "Sony WH-1000XM5 Wireless Noise Canceling Headphones", category: "Audio", price: 399.99, stock_quantity: 45, reorder_threshold: 10, stock: "In Stock" },
    { id: 11, name: "Apple AirPods Pro 2 with USB-C MagSafe Case", category: "Audio", price: 249.00, stock_quantity: 55, reorder_threshold: 10, stock: "In Stock" },
    { id: 12, name: "Bose QuietComfort Ultra Spatial Audio Headphones", category: "Audio", price: 429.00, stock_quantity: 25, reorder_threshold: 5, stock: "In Stock" },
    { id: 13, name: "Samsung Odyssey OLED G9 49-inch Curved Gaming Monitor", category: "Displays", price: 1599.99, stock_quantity: 8, reorder_threshold: 3, stock: "In Stock" },
    { id: 14, name: "LG C3 55-inch OLED evo 4K Smart Cinema TV", category: "Displays", price: 1299.99, stock_quantity: 12, reorder_threshold: 4, stock: "In Stock" },
    { id: 15, name: "Anker Prime 27650mAh Power Bank (250W Multi-Port)", category: "Accessories", price: 179.99, stock_quantity: 70, reorder_threshold: 15, stock: "In Stock" },
    { id: 16, name: "Apple Magic Keyboard with Touch ID and Numeric Keypad", category: "Accessories", price: 199.00, stock_quantity: 35, reorder_threshold: 8, stock: "In Stock" },
    { id: 17, name: "Logitech MX Master 3S Wireless Performance Mouse", category: "Accessories", price: 99.99, stock_quantity: 80, reorder_threshold: 15, stock: "In Stock" }
  ],
  stylehub: [
    { id: 1, name: "Levi's 501 Original Fit Straight Leg Denim Jeans", category: "Men's Wear", price: 69.50, stock_quantity: 80, reorder_threshold: 20, stock: "In Stock" },
    { id: 2, name: "Zara Mulberry Silk High-Slit Runway Evening Gown", category: "Women's Wear", price: 189.00, stock_quantity: 30, reorder_threshold: 10, stock: "In Stock" },
    { id: 3, name: "Nike Air Jordan 1 Retro High OG 'Chicago' Sneakers", category: "Footwear & Sneakers", price: 180.00, stock_quantity: 4, reorder_threshold: 15, stock: "Low Stock" },
    { id: 4, name: "Nike Air Force 1 '07 Triple White Classic Sneakers", category: "Footwear & Sneakers", price: 115.00, stock_quantity: 75, reorder_threshold: 15, stock: "In Stock" },
    { id: 5, name: "Ralph Lauren Oxford Cotton Long-Sleeve Button-Down Shirt", category: "Men's Wear", price: 125.00, stock_quantity: 45, reorder_threshold: 10, stock: "In Stock" },
    { id: 6, name: "Tommy Hilfiger Classic Water-Resistant Nautical Windbreaker", category: "Men's Wear", price: 149.99, stock_quantity: 35, reorder_threshold: 10, stock: "In Stock" },
    { id: 7, name: "Adidas Originals Trefoil Heavyweight Fleece Pullover Hoodie", category: "Men's Wear", price: 75.00, stock_quantity: 60, reorder_threshold: 15, stock: "In Stock" },
    { id: 8, name: "The North Face 1996 Retro Nuptse 700-Fill Down Puffer Jacket", category: "Outerwear", price: 330.00, stock_quantity: 25, reorder_threshold: 8, stock: "In Stock" },
    { id: 9, name: "Ray-Ban Classic Polarized Aviator Sunglasses (Gold Frame)", category: "Accessories", price: 163.00, stock_quantity: 40, reorder_threshold: 10, stock: "In Stock" },
    { id: 10, name: "Gucci GG Supreme Canvas Monogram Italian Leather Belt", category: "Accessories", price: 450.00, stock_quantity: 2, reorder_threshold: 8, stock: "Low Stock" },
    { id: 11, name: "Calvin Klein Modern Cotton Bralette & Lounge Bottoms Set", category: "Women's Wear", price: 58.00, stock_quantity: 50, reorder_threshold: 15, stock: "In Stock" },
    { id: 12, name: "H&M Premium Selection 100% Cashmere Knit Crewneck Sweater", category: "Women's Wear", price: 149.00, stock_quantity: 28, reorder_threshold: 10, stock: "In Stock" },
    { id: 13, name: "Lululemon Align High-Rise Yoga Pants (Butter-Soft Nulu)", category: "Women's Wear", price: 98.00, stock_quantity: 65, reorder_threshold: 15, stock: "In Stock" },
    { id: 14, name: "Under Armour Tech 2.0 Short-Sleeve Moisture-Wicking T-Shirt", category: "Men's Wear", price: 25.00, stock_quantity: 110, reorder_threshold: 25, stock: "In Stock" },
    { id: 15, name: "Puma Iconic T7 Vintage Track Jacket (Black & White Stripe)", category: "Men's Wear", price: 65.00, stock_quantity: 40, reorder_threshold: 10, stock: "In Stock" },
    { id: 16, name: "Patagonia Better Sweater Fleece Quarter-Zip Pullover", category: "Outerwear", price: 139.00, stock_quantity: 35, reorder_threshold: 10, stock: "In Stock" },
    { id: 17, name: "Zara Structured Double-Breasted Tailored Wool Blazer", category: "Women's Wear", price: 129.00, stock_quantity: 22, reorder_threshold: 8, stock: "In Stock" },
    { id: 18, name: "Carter's 4-Piece Organic Cotton Baby Pajama Set", category: "Kids Wear", price: 28.00, stock_quantity: 70, reorder_threshold: 20, stock: "In Stock" },
    { id: 19, name: "Gap Kids 100% Organic Denim Utility Trucker Jacket", category: "Kids Wear", price: 49.95, stock_quantity: 45, reorder_threshold: 10, stock: "In Stock" },
    { id: 20, name: "Timberland 6-Inch Premium Waterproof Nubuck Leather Boots", category: "Footwear & Sneakers", price: 198.00, stock_quantity: 30, reorder_threshold: 10, stock: "In Stock" }
  ],
  modernhome: [
    { id: 1, name: "Herman Miller Aeron Ergonomic Mesh Executive Chair (Size B)", category: "Ergonomic Chairs", price: 1495.00, stock_quantity: 2, reorder_threshold: 6, stock: "Low Stock" },
    { id: 2, name: "Steelcase Gesture Ergonomic 360-Arm Lumbar Office Chair", category: "Ergonomic Chairs", price: 1349.00, stock_quantity: 18, reorder_threshold: 5, stock: "In Stock" },
    { id: 3, name: "Autonomous SmartDesk Pro Dual-Motor Motorized Standing Desk", category: "Standing Desks", price: 699.00, stock_quantity: 25, reorder_threshold: 8, stock: "In Stock" },
    { id: 4, name: "Uplift V2 Commercial Solid Walnut Executive Standing Desk", category: "Standing Desks", price: 960.00, stock_quantity: 15, reorder_threshold: 5, stock: "In Stock" },
    { id: 5, name: "West Elm Andes Top-Grain Leather Sectional Sofa (Cast Slate)", category: "Living Room", price: 2899.00, stock_quantity: 8, reorder_threshold: 3, stock: "In Stock" },
    { id: 6, name: "Castlery Solid Oak 8-Seater Extendable Dining Room Table", category: "Dining & Kitchen", price: 1250.00, stock_quantity: 10, reorder_threshold: 3, stock: "In Stock" },
    { id: 7, name: "Philips Hue White & Color Smart LED Lightstrip (Gradient 2m)", category: "Smart Lighting", price: 179.99, stock_quantity: 50, reorder_threshold: 15, stock: "In Stock" },
    { id: 8, name: "Philips Hue Play Light Bar Starter Kit (2-Pack + Hue Bridge)", category: "Smart Lighting", price: 159.99, stock_quantity: 40, reorder_threshold: 10, stock: "In Stock" },
    { id: 9, name: "Dyson Purifier Hot+Cool Formaldehyde HP09 Air Purifier & Heater", category: "Smart Home Appliances", price: 769.99, stock_quantity: 16, reorder_threshold: 5, stock: "In Stock" },
    { id: 10, name: "Dyson V15 Detect Absolute Cordless HEPA Vacuum Cleaner", category: "Smart Home Appliances", price: 749.99, stock_quantity: 20, reorder_threshold: 5, stock: "In Stock" },
    { id: 11, name: "Brooklinen Luxe Sateen 480-Thread Egyptian Bed Sheet Bundle", category: "Bedding & Decor", price: 189.00, stock_quantity: 45, reorder_threshold: 10, stock: "In Stock" },
    { id: 12, name: "Casper Wave Hybrid Snow Cooling Mattress (Queen Size)", category: "Bedding & Decor", price: 2395.00, stock_quantity: 12, reorder_threshold: 4, stock: "In Stock" },
    { id: 13, name: "Sonos Arc Premium Dolby Atmos Wireless Smart Soundbar", category: "Living Room", price: 899.00, stock_quantity: 3, reorder_threshold: 8, stock: "Low Stock" },
    { id: 14, name: "Article Sven Charme Tan Leather Mid-Century Accent Armchair", category: "Living Room", price: 999.00, stock_quantity: 14, reorder_threshold: 4, stock: "In Stock" },
    { id: 15, name: "IKEA Poäng Classic Birch Veneer Rocking Armchair & Cushion", category: "Living Room", price: 169.00, stock_quantity: 35, reorder_threshold: 10, stock: "In Stock" },
    { id: 16, name: "Nest Learning Smart Thermostat (4th Gen, Polished Steel)", category: "Smart Home Appliances", price: 279.99, stock_quantity: 30, reorder_threshold: 10, stock: "In Stock" },
    { id: 17, name: "KitchenAid Artisan Series 5-Quart Stand Mixer (Empire Red)", category: "Dining & Kitchen", price: 449.99, stock_quantity: 22, reorder_threshold: 6, stock: "In Stock" },
    { id: 18, name: "Breville Barista Touch Espresso Machine with Auto Frothing", category: "Dining & Kitchen", price: 999.95, stock_quantity: 15, reorder_threshold: 5, stock: "In Stock" }
  ],
  gadgetcentral: [
    { id: 1, name: "DJI Mini 4 Pro 4K HDR Camera Drone with Fly More Combo Plus", category: "Drones & Aerial", price: 759.00, stock_quantity: 25, reorder_threshold: 8, stock: "In Stock" },
    { id: 2, name: "DJI Avata 2 FPV Drone with Goggles 3 & RC Motion 3 Controller", category: "Drones & Aerial", price: 999.00, stock_quantity: 18, reorder_threshold: 5, stock: "In Stock" },
    { id: 3, name: "Holy Stone HS720G 4K EIS 2-Axis Gimbal GPS Quadcopter Drone", category: "Drones & Aerial", price: 289.99, stock_quantity: 35, reorder_threshold: 10, stock: "In Stock" },
    { id: 4, name: "Sony PlayStation 5 Slim 1TB Gaming Console (Disc Edition)", category: "Gaming Consoles", price: 499.99, stock_quantity: 40, reorder_threshold: 10, stock: "In Stock" },
    { id: 5, name: "Sony PlayStation VR2 Horizon Call of the Mountain VR Bundle", category: "Gaming & VR", price: 599.99, stock_quantity: 20, reorder_threshold: 6, stock: "In Stock" },
    { id: 6, name: "Microsoft Xbox Series X 1TB High-Performance Console", category: "Gaming Consoles", price: 499.00, stock_quantity: 35, reorder_threshold: 10, stock: "In Stock" },
    { id: 7, name: "Nintendo Switch OLED Edition (Neon Red & Neon Blue Joy-Cons)", category: "Gaming Consoles", price: 349.99, stock_quantity: 50, reorder_threshold: 15, stock: "In Stock" },
    { id: 8, name: "Valve Steam Deck OLED 512GB Handheld Gaming PC", category: "Gaming Consoles", price: 549.00, stock_quantity: 22, reorder_threshold: 6, stock: "In Stock" },
    { id: 9, name: "Meta Quest 3 512GB Breakthrough Mixed Reality 3D Headset", category: "Gaming & VR", price: 649.99, stock_quantity: 3, reorder_threshold: 10, stock: "Low Stock" },
    { id: 10, name: "LEGO Technic NASA Mars Rover Perseverance Autonomous Rover", category: "LEGO & Robotics", price: 99.99, stock_quantity: 30, reorder_threshold: 8, stock: "In Stock" },
    { id: 11, name: "LEGO Star Wars Millennium Falcon Ultimate Collector Series", category: "LEGO & Robotics", price: 849.99, stock_quantity: 10, reorder_threshold: 3, stock: "In Stock" },
    { id: 12, name: "Anki Vector 2.0 AI Companion Autonomous Desktop Robot", category: "STEM Robotics", price: 349.99, stock_quantity: 20, reorder_threshold: 5, stock: "In Stock" },
    { id: 13, name: "Sphero BOLT App-Enabled Programmable STEM Robotic Ball", category: "STEM Robotics", price: 179.99, stock_quantity: 25, reorder_threshold: 8, stock: "In Stock" },
    { id: 14, name: "Makeblock mBot2 STEM Educational Coding Robot Kit for Kids", category: "STEM Robotics", price: 139.99, stock_quantity: 30, reorder_threshold: 8, stock: "In Stock" },
    { id: 15, name: "Traxxas Slash 4X4 VXL 1/10 Scale Brushless Short Course RC Truck", category: "RC Vehicles", price: 429.95, stock_quantity: 15, reorder_threshold: 5, stock: "In Stock" },
    { id: 16, name: "Axial SCX24 1967 Chevrolet C10 1/24 4WD Micro RC Rock Crawler", category: "RC Vehicles", price: 124.99, stock_quantity: 20, reorder_threshold: 5, stock: "In Stock" },
    { id: 17, name: "Nerf Pro Gelfire Mythic Full Auto Blaster with 10000 Rounds", category: "Toys & Games", price: 79.99, stock_quantity: 60, reorder_threshold: 15, stock: "In Stock" },
    { id: 18, name: "Tamagotchi Uni Interactive Virtual Pet with Wi-Fi Connectivity", category: "Toys & Games", price: 59.99, stock_quantity: 45, reorder_threshold: 12, stock: "In Stock" }
  ],
  voltx: [
    { id: 1, name: "Titan 5G Ultra (Snapdragon 8 Gen 3, 512GB)", category: "Smart Mobiles", price: 79999.0, stock_quantity: 45, reorder_threshold: 10, stock: "In Stock" },
    { id: 2, name: "Neo Flip 5G (Foldable AMOLED 120Hz, 256GB)", category: "Smart Mobiles", price: 64999.0, stock_quantity: 35, reorder_threshold: 8, stock: "In Stock" },
    { id: 3, name: "Edge Pro 5G (Dimensity 9300+, 144Hz Curved OLED)", category: "Smart Mobiles", price: 49999.0, stock_quantity: 50, reorder_threshold: 10, stock: "In Stock" },
    { id: 4, name: "Air 5G Slim Edition (Ultra-Thin 6.8mm, 128GB)", category: "Smart Mobiles", price: 29999.0, stock_quantity: 60, reorder_threshold: 12, stock: "In Stock" },
    { id: 5, name: "Play Max Gaming Mobile (Liquid Cooled, 6000mAh)", category: "Smart Mobiles", price: 38999.0, stock_quantity: 40, reorder_threshold: 10, stock: "In Stock" },
    { id: 6, name: "SonicPods Pro ANC Wireless Earbuds (45dB ANC)", category: "Mobile Accessories", price: 4999.0, stock_quantity: 85, reorder_threshold: 15, stock: "In Stock" },
    { id: 7, name: "HyperCharge 120W GaN Fast Charger (Dual USB-C)", category: "Mobile Accessories", price: 2999.0, stock_quantity: 110, reorder_threshold: 20, stock: "In Stock" },
    { id: 8, name: "MagShield Armor Case & Kickstand", category: "Mobile Accessories", price: 1499.0, stock_quantity: 140, reorder_threshold: 25, stock: "In Stock" },
    { id: 9, name: "Wireless Qi2 15W Magnetic Power Bank (10,000mAh)", category: "Mobile Accessories", price: 3499.0, stock_quantity: 70, reorder_threshold: 15, stock: "In Stock" },
    { id: 10, name: "Smart Stylus Pen (Palm Rejection, 4096 Levels)", category: "Mobile Accessories", price: 2499.0, stock_quantity: 65, reorder_threshold: 15, stock: "In Stock" },
    { id: 11, name: "Dual-Driver Hi-Res Type-C Earphones (DAC Built-in)", category: "Mobile Accessories", price: 1299.0, stock_quantity: 120, reorder_threshold: 20, stock: "In Stock" },
    { id: 12, name: "Ultra-Clear 9H Tempered Glass Screen Guard", category: "Mobile Accessories", price: 799.0, stock_quantity: 200, reorder_threshold: 30, stock: "In Stock" }
  ]
};

// Generator for Live Tracking Logs strictly for the active vendor
const generateVendorTrackingLogs = (products, vConfig) => {
  const carriers = [
    { name: "DHL Express Global", prefix: "DHL-EXP", transit: "Air Cargo Flight DXB-502" },
    { name: "FedEx Priority Logistics", prefix: "FDX-PRI", transit: "Express Freight Truck FT-88" },
    { name: "BlueDart Aviation", prefix: "BLU-AIR", transit: "Domestic Air Waybill" },
    { name: "ShopSense Direct Fleet", prefix: "SSD-VAN", transit: "Intra-City EV Van 14" }
  ];
  const eventTemplates = [
    { type: "Inbound Supplier Restock", qty: "+50 Units", status: "Dock Receiving Cleared", color: "green", qc: "QC Seal: PASSED (Grade A)" },
    { type: "Customer Order Fulfilled", qty: "-2 Units", status: "Packed & Manifest Signed", color: "blue", qc: "Barcode Scan: VERIFIED" },
    { type: "Warehouse Bin Transfer", qty: "0 Units (Relocated)", status: "Moved to Fast-Pick Rack", color: "purple", qc: "Location Sensor: SYNCED" },
    { type: "Quality & Thermal Audit", qty: "0 Units (Audited)", status: "Thermal Sensor Calibrated", color: "teal", qc: "ISO-9001 Audit: COMPLIANT" },
    { type: "Priority Express Dispatch Ready", qty: "-5 Units", status: "Out for 2-Hour Delivery", color: "amber", qc: "Courier Handover: SIGNED" }
  ];
  const operators = [
    { name: "Mounish Sai", role: "Lead Operations Director" },
    { name: "Aarav Sharma", role: "Fulfillment Specialist" },
    { name: "Pooja Verma", role: "Quality Assurance Lead" },
    { name: "Vikram Malhotra", role: "Warehouse Bay Controller" }
  ];

  return products.map((p, idx) => {
    const template = eventTemplates[idx % eventTemplates.length];
    const carrier = carriers[idx % carriers.length];
    const op = operators[idx % operators.length];
    const skuCode = `SKU-${vConfig.shortName.toUpperCase()}-${String(idx + 1).padStart(4, "0")}-REV${(idx % 3) + 1}`;
    const awbNo = `AWB-${carrier.prefix}-${984000 + (idx * 37) % 9000}`;
    const batchNo = `BATCH-2026-AUG-${((idx * 23) % 800) + 100}`;

    return {
      tracking_id: `INV-TRK-${98240 + (p.id || idx + 1)}`,
      sku_code: skuCode,
      product_id: p.id || idx + 1,
      product_name: p.name,
      category: p.category,
      vendor_id: vConfig.dbId,
      vendor_name: vConfig.name,
      event_type: template.type,
      quantity_change: template.qty,
      current_stock: p.stock_quantity !== undefined ? p.stock_quantity : (p.stock === "No Stock" ? 0 : 45),
      reorder_threshold: p.reorder_threshold || 10,
      warehouse_location: `Zone ${String.fromCharCode(65 + (idx % 4))} - Bay ${String((idx % 12) + 1).padStart(2, "0")}`,
      storage_temp: "21.0°C | 42% Humidity",
      batch_number: batchNo,
      carrier: carrier.name,
      awb_number: awbNo,
      transit_details: carrier.transit,
      qc_status: template.qc,
      logistics_status: template.status,
      timestamp: `2026-08-18 ${String(20 - (idx % 12)).padStart(2, "0")}:${String((idx * 7) % 60).padStart(2, "0")} UTC`,
      operator: `${op.name} (${op.role})`,
      status_color: template.color
    };
  });
};

function Inventory() {
  const navigate = useNavigate();

  // Read authenticated session
  const rawVendorId = localStorage.getItem("vendorId") || "";
  const vendorStoreName = localStorage.getItem("vendorStoreName") || "";
  const userEmail = localStorage.getItem("userEmail") || "";
  const displayName = localStorage.getItem("displayName") || "";

  const [vendorProfiles, setVendorProfiles] = useState(DEFAULT_VENDOR_CONFIGS);

  // Canonical active vendor key
  const [selectedVendorKey, setSelectedVendorKey] = useState(() => {
    return normalizeVendorKey(vendorStoreName || userEmail || displayName || rawVendorId, DEFAULT_VENDOR_CONFIGS) || "voltx";
  });

  const activeVendorKey = selectedVendorKey;
  const activeVendor = vendorProfiles[activeVendorKey] || vendorProfiles.voltx || DEFAULT_VENDOR_CONFIGS.voltx;

  const [vendorProducts, setVendorProducts] = useState(BASELINE_VENDOR_ITEMS[activeVendorKey] || []);
  const [trackingLogs, setTrackingLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(new Date().toLocaleTimeString());
  const [restockModal, setRestockModal] = useState(null);
  const [restockQty, setRestockQty] = useState(50);
  const [forecastModal, setForecastModal] = useState(null);
  const [waybillModal, setWaybillModal] = useState(null);

  // Filters for Tracking Logs
  const [trackingSearch, setTrackingSearch] = useState("");
  const [selectedEventType, setSelectedEventType] = useState("All");

  const fetchVendorInventory = useCallback(async (silent = false) => {
    try {
      const [allProductsRes, trackingRes, dbVendors] = await Promise.all([
        getProducts(),
        getInventoryTrackingLogs({ vendor_id: activeVendor.dbId }),
        getVendors().catch(() => [])
      ]);

      let currentProfiles = vendorProfiles;
      if (Array.isArray(dbVendors) && dbVendors.length > 0) {
        currentProfiles = buildVendorMap(dbVendors);
        setVendorProfiles(currentProfiles);
      }

      // Load local overrides if any
      let localProducts = null;
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && Array.isArray(parsed[activeVendorKey]) && parsed[activeVendorKey].length > 0) {
            localProducts = parsed[activeVendorKey];
          }
        }
      } catch {
        // ignore
      }

      let resolvedProducts = localProducts || BASELINE_VENDOR_ITEMS[activeVendorKey] || [];
      if (Array.isArray(allProductsRes) && allProductsRes.length > 0) {
        const filtered = allProductsRes.filter((p) => {
          const vKey = normalizeVendorKey(p.vendor_id || (p.vendor && p.vendor.name) || p.category, currentProfiles);
          return vKey === activeVendorKey;
        });
        if (filtered.length > 0) {
          resolvedProducts = filtered.map((p) => {
            const matchLocal = localProducts
              ? localProducts.find((x) => String(x.id) === String(p.id) || x.name === p.name)
              : null;
            if (matchLocal) {
              const isNoStock = matchLocal.stock === "No Stock" || matchLocal.stock === "Out of Stock";
              return {
                ...p,
                stock: matchLocal.stock || p.stock,
                stock_quantity: isNoStock
                  ? 0
                  : matchLocal.stock_quantity !== undefined
                  ? matchLocal.stock_quantity
                  : p.stock_quantity
              };
            }
            return p;
          });
        }
      }

      if (localProducts && localProducts.length > 0) {
        resolvedProducts = resolvedProducts.map((p) => {
          const matchLocal = localProducts.find((x) => String(x.id) === String(p.id) || x.name === p.name);
          if (matchLocal) {
            const isNoStock = matchLocal.stock === "No Stock" || matchLocal.stock === "Out of Stock";
            return {
              ...p,
              stock: matchLocal.stock || p.stock,
              stock_quantity: isNoStock
                ? 0
                : matchLocal.stock_quantity !== undefined
                ? matchLocal.stock_quantity
                : p.stock_quantity
            };
          }
          return p;
        });
      }

      setVendorProducts(resolvedProducts);

      if (trackingRes && Array.isArray(trackingRes.tracking_logs) && trackingRes.tracking_logs.length > 0) {
        const filteredLogs = trackingRes.tracking_logs.filter((log) => {
          const vKey = normalizeVendorKey(log.vendor_id || log.vendor_name || log.category);
          return vKey === activeVendorKey;
        });
        if (filteredLogs.length > 0) {
          setTrackingLogs(filteredLogs);
        } else {
          setTrackingLogs(generateVendorTrackingLogs(resolvedProducts, activeVendor));
        }
      } else {
        setTrackingLogs(generateVendorTrackingLogs(resolvedProducts, activeVendor));
      }

      setLastSyncTime(new Date().toLocaleTimeString());
    } catch {
      const baseline = BASELINE_VENDOR_ITEMS[activeVendorKey] || [];
      setVendorProducts(baseline);
      setTrackingLogs(generateVendorTrackingLogs(baseline, activeVendor));
    } finally {
      if (!silent) setLoading(false);
    }
  }, [activeVendorKey, activeVendor]);

  useEffect(() => {
    fetchVendorInventory();

    // Auto-polling every 2 seconds for guaranteed live sync
    const liveInterval = setInterval(() => {
      fetchVendorInventory(true);
    }, 2000);

    const handleDataChanged = () => {
      fetchVendorInventory(true);
    };

    window.addEventListener("storage", handleDataChanged);
    window.addEventListener("productUpdated", handleDataChanged);
    window.addEventListener("inventoryUpdated", handleDataChanged);

    return () => {
      clearInterval(liveInterval);
      window.removeEventListener("storage", handleDataChanged);
      window.removeEventListener("productUpdated", handleDataChanged);
      window.removeEventListener("inventoryUpdated", handleDataChanged);
    };
  }, [fetchVendorInventory]);

  // Derived 4 KPI values strictly for this vendor
  const listedItemsCount = vendorProducts.length;
  const inStockUnitsCount = vendorProducts.reduce(
    (acc, p) => acc + (p.stock === "No Stock" || p.stock === "Out of Stock" || p.stock_quantity === 0 ? 0 : (parseInt(p.stock_quantity, 10) || 40)),
    0
  );

  // Exact Out of Stock calculation (stock === "No Stock" or stock_quantity === 0)
  const outOfStockItems = useMemo(() => {
    return vendorProducts.filter(
      (p) => p.stock === "No Stock" || p.stock === "Out of Stock" || p.stock_quantity === 0
    );
  }, [vendorProducts]);

  // Exact Low Stock calculation (stock === "Low Stock" and not depleted)
  const lowStockItems = useMemo(() => {
    return vendorProducts.filter(
      (p) =>
        (p.stock === "Low Stock" ||
          (p.stock_quantity !== undefined &&
            p.stock_quantity <= (p.reorder_threshold || 10) &&
            p.stock_quantity > 0)) &&
        p.stock !== "No Stock" &&
        p.stock !== "Out of Stock" &&
        p.stock_quantity !== 0
    );
  }, [vendorProducts]);

  // Active Low-Stock / Depletion Alerts for this vendor
  const activeAlerts = useMemo(() => {
    const list = [...outOfStockItems, ...lowStockItems];
    return list.map((p, index) => {
      const isDepleted = p.stock === "No Stock" || p.stock === "Out of Stock" || p.stock_quantity === 0;
      return {
        seq: index + 1,
        product_id: p.id,
        product_name: p.name,
        category: p.category,
        vendor_name: activeVendor.name,
        stock_quantity: isDepleted ? 0 : (p.stock_quantity !== undefined ? p.stock_quantity : 3),
        reorder_threshold: p.reorder_threshold || 10,
        price: p.price,
        severity: isDepleted ? "Critical" : "Warning",
        recommended_restock_amount: isDepleted ? 60 : 50
      };
    });
  }, [outOfStockItems, lowStockItems, activeVendor]);

  // Live simulation execution
  const handleSimulateAction = async (actionType) => {
    setIsSimulating(true);
    try {
      // Local immediate preview for blazing speed
      if (actionType === "simulate_out_of_stock") {
        setVendorProducts((prev) => {
          const updated = prev.map((p, idx) =>
            idx < 2 ? { ...p, stock_quantity: 0, stock: "No Stock" } : p
          );
          try {
            const saved = localStorage.getItem(STORAGE_KEY);
            let parsedMap = saved ? JSON.parse(saved) : {};
            parsedMap[activeVendorKey] = updated;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedMap));
          } catch {
            // ignore
          }
          return updated;
        });
      } else if (actionType === "simulate_low_stock") {
        setVendorProducts((prev) => {
          const updated = prev.map((p, idx) =>
            idx < 3 ? { ...p, stock_quantity: 3, stock: "Low Stock" } : p
          );
          try {
            const saved = localStorage.getItem(STORAGE_KEY);
            let parsedMap = saved ? JSON.parse(saved) : {};
            parsedMap[activeVendorKey] = updated;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedMap));
          } catch {
            // ignore
          }
          return updated;
        });
      } else if (actionType === "simulate_customer_purchase") {
        setVendorProducts((prev) => {
          const updated = prev.map((p) => {
            const sold = Math.floor(Math.random() * 12) + 8;
            const newQty = Math.max((p.stock_quantity || 20) - sold, 0);
            return {
              ...p,
              stock_quantity: newQty,
              stock: newQty === 0 ? "No Stock" : newQty <= (p.reorder_threshold || 10) ? "Low Stock" : "In Stock"
            };
          });
          try {
            const saved = localStorage.getItem(STORAGE_KEY);
            let parsedMap = saved ? JSON.parse(saved) : {};
            parsedMap[activeVendorKey] = updated;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedMap));
          } catch {}
          return updated;
        });
      } else if (actionType === "quick_restock_all" || actionType === "simulate_restock_cycle") {
        setVendorProducts((prev) => {
          const updated = prev.map((p) => ({
            ...p,
            stock_quantity: Math.max((p.stock_quantity || 0) + 60, 65),
            stock: "In Stock"
          }));
          try {
            const saved = localStorage.getItem(STORAGE_KEY);
            let parsedMap = saved ? JSON.parse(saved) : {};
            parsedMap[activeVendorKey] = updated;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedMap));
          } catch {
            // ignore
          }
          return updated;
        });
      } else if (actionType === "log_inbound_shipment") {
        setVendorProducts((prev) => {
          const updated = prev.map((p, idx) =>
            idx === 0
              ? { ...p, stock_quantity: (p.stock_quantity || 0) + 100, stock: "In Stock" }
              : p
          );
          try {
            const saved = localStorage.getItem(STORAGE_KEY);
            let parsedMap = saved ? JSON.parse(saved) : {};
            parsedMap[activeVendorKey] = updated;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedMap));
          } catch {
            // ignore
          }
          return updated;
        });
      } else if (actionType === "log_express_dispatch") {
        setVendorProducts((prev) => {
          const updated = prev.map((p, idx) => {
            if (idx === 0) {
              const newQty = Math.max((p.stock_quantity || 10) - 5, 0);
              return {
                ...p,
                stock_quantity: newQty,
                stock: newQty === 0 ? "No Stock" : newQty <= (p.reorder_threshold || 10) ? "Low Stock" : "In Stock"
              };
            }
            return p;
          });
          try {
            const saved = localStorage.getItem(STORAGE_KEY);
            let parsedMap = saved ? JSON.parse(saved) : {};
            parsedMap[activeVendorKey] = updated;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedMap));
          } catch {
            // ignore
          }
          return updated;
        });
      } else if (actionType === "reset_optimal") {
        const baseline = BASELINE_VENDOR_ITEMS[activeVendorKey] || [];
        setVendorProducts(baseline);
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          let parsedMap = saved ? JSON.parse(saved) : {};
          parsedMap[activeVendorKey] = baseline;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedMap));
        } catch {
          // ignore
        }
      }

      // Send to backend
      const res = await simulateInventoryAction(actionType, activeVendor.dbId);
      toast.success(res.message || "Live simulation completed!");
      try {
        const syncChannel = new BroadcastChannel("shopsense_live_sync");
        syncChannel.postMessage({
          type: actionType === "simulate_new_product_release" ? "PRODUCT_ADDED" : "STOCK_UPDATED",
          product: res?.product || null,
          action: actionType,
          timestamp: Date.now()
        });
        syncChannel.close();
      } catch {}
      localStorage.setItem("shopsense_last_product_update", Date.now().toString());
      window.dispatchEvent(new Event("inventoryUpdated"));
      window.dispatchEvent(new Event("productUpdated"));
      window.dispatchEvent(new Event("storage"));
      fetchVendorInventory(true);
    } catch {
      toast.info("Simulation executed locally.");
    } finally {
      setIsSimulating(false);
    }
  };

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    if (!restockModal) return;

    const addedQty = parseInt(restockQty, 10);
    const newQty = (parseInt(restockModal.stock_quantity, 10) || 0) + addedQty;

    // Persist into localStorage so Products.jsx updates instantly
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      let parsedMap = saved ? JSON.parse(saved) : {};
      if (!parsedMap[activeVendorKey]) {
        parsedMap[activeVendorKey] = vendorProducts;
      }
      parsedMap[activeVendorKey] = parsedMap[activeVendorKey].map((p) =>
        p.id === restockModal.product_id || p.name === restockModal.product_name
          ? { ...p, stock_quantity: newQty, stock: "In Stock" }
          : p
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedMap));
    } catch {
      // ignore
    }

    try {
      await updateProductStock(restockModal.product_id, {
        stock_quantity: newQty,
        stock: "In Stock",
        reorder_threshold: restockModal.reorder_threshold
      });
    } catch {
      // ignore
    }

    setVendorProducts((prev) =>
      prev.map((p) =>
        p.id === restockModal.product_id || p.name === restockModal.product_name
          ? { ...p, stock_quantity: newQty, stock: "In Stock" }
          : p
      )
    );

    // Prepend a live tracking log
    const newLog = {
      tracking_id: `INV-TRK-${Date.now().toString().slice(-5)}`,
      sku_code: `SKU-${activeVendor.shortName.toUpperCase()}-RESTOCK-${Date.now().toString().slice(-3)}`,
      product_id: restockModal.product_id,
      product_name: restockModal.product_name,
      category: restockModal.category,
      vendor_id: activeVendor.dbId,
      vendor_name: activeVendor.name,
      event_type: "Inbound Supplier Restock",
      quantity_change: `+${addedQty} Units`,
      current_stock: newQty,
      reorder_threshold: restockModal.reorder_threshold || 10,
      warehouse_location: "Zone A - Fast Dock 01",
      storage_temp: "21.0°C | 42% Humidity",
      batch_number: `BATCH-2026-AUG-${Date.now().toString().slice(-4)}`,
      carrier: "DHL Express Global",
      awb_number: `AWB-DHL-${Date.now().toString().slice(-6)}`,
      transit_details: "Priority Direct Restock",
      qc_status: "QC Seal: PASSED (Grade A)",
      logistics_status: "Dock Clearance Complete",
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC",
      operator: "Mounish Sai (Lead Operations Director)",
      status_color: "green"
    };

    setTrackingLogs((prev) => [newLog, ...prev]);

    toast.success(`Restocked ${restockModal.product_name} with +${addedQty} units! (Now: ${newQty} units)`);
    setRestockModal(null);
    window.dispatchEvent(new Event("inventoryUpdated"));
    window.dispatchEvent(new Event("productUpdated"));
    window.dispatchEvent(new Event("storage"));
  };

  const handleFetchForecast = async (productId) => {
    try {
      const data = await getInventoryForecast(productId);
      setForecastModal(data);
    } catch {
      // Fallback forecast modal data
      const target = vendorProducts.find((p) => p.id === productId) || vendorProducts[0];
      setForecastModal({
        product_id: productId,
        product_name: target.name,
        current_stock: target.stock_quantity || 3,
        avg_daily_sales: 2.8,
        days_until_depleted: 2,
        risk_level: "High",
        forecasts: {
          "7_days_needed": 22,
          "14_days_needed": 48,
          "30_days_needed": 110
        },
        recommended_order_qty: 60
      });
    }
  };

  // Filtered Tracking Logs strictly for this vendor
  const filteredTrackingLogs = useMemo(() => {
    const list = trackingLogs.length > 0 ? trackingLogs : generateVendorTrackingLogs(vendorProducts, activeVendor);
    return list.filter((log) => {
      const matchSearch =
        log.product_name?.toLowerCase().includes(trackingSearch.toLowerCase()) ||
        log.tracking_id?.toLowerCase().includes(trackingSearch.toLowerCase()) ||
        log.sku_code?.toLowerCase().includes(trackingSearch.toLowerCase()) ||
        log.carrier?.toLowerCase().includes(trackingSearch.toLowerCase()) ||
        log.warehouse_location?.toLowerCase().includes(trackingSearch.toLowerCase()) ||
        log.operator?.toLowerCase().includes(trackingSearch.toLowerCase());

      const matchEvent =
        selectedEventType === "All" || log.event_type === selectedEventType;

      return matchSearch && matchEvent;
    });
  }, [trackingLogs, vendorProducts, activeVendor, trackingSearch, selectedEventType]);


  if (loading) {
    return (
      <div className="inventory-page" style={{ textAlign: "center", padding: "60px" }}>
        <p style={{ fontSize: "1.2rem", fontWeight: 600 }}>Loading Real-Time Inventory Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="inventory-page">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />


      {/* ========================================================================= */}
      {/* VENDOR-TAILORED INVENTORY IDENTITY & STREAMING HEADER                     */}
      {/* ========================================================================= */}
      <div className="inventory-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "2rem" }}>{activeVendor.icon}</span>
            <h1 style={{ margin: 0 }}>{activeVendor.name} — Live Inventory Tracking</h1>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 12px",
                borderRadius: "20px",
                background: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.4)",
                color: "#10B981",
                fontSize: "0.76rem",
                fontWeight: 800
              }}
            >
              <FiRadio className="animate-pulse" /> LIVE STREAMING • SYNCED ({lastSyncTime})
            </span>
          </div>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.85rem" }}>
            <strong>Proprietor:</strong> {activeVendor.owner} • <strong>Domain:</strong> {activeVendor.domain} (★ {activeVendor.rating} Rating)
          </p>
        </div>

        {/* Live Simulation Controls */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <button
            className="sim-btn info"
            onClick={() => handleSimulateAction("simulate_new_product_release")}
            disabled={isSimulating}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(147, 51, 234, 0.18)",
              color: "#C084FC",
              border: "1px solid rgba(147, 51, 234, 0.4)",
              padding: "8px 12px",
              borderRadius: "8px",
              fontSize: "0.8rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
            title="Simulate weekly new product release into vendor & customer market"
          >
            <FiBox /> 🚀 Launch New Product
          </button>

          <button
            className="sim-btn warning"
            onClick={() => handleSimulateAction("simulate_customer_purchase")}
            disabled={isSimulating}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(245, 158, 11, 0.15)",
              color: "#FBBF24",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              padding: "8px 12px",
              borderRadius: "8px",
              fontSize: "0.8rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
            title="Simulate customer sales surge depleting items to low stock / out of stock"
          >
            <FiAlertTriangle /> 📉 Sales Wave (Deplete Stock)
          </button>

          <button
            className="sim-btn success"
            onClick={() => handleSimulateAction("simulate_restock_cycle")}
            disabled={isSimulating}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(16, 185, 129, 0.15)",
              color: "#34D399",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              padding: "8px 12px",
              borderRadius: "8px",
              fontSize: "0.8rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
            title="Simulate automated replenishment back to In Stock (+60 units)"
          >
            <FiCheckCircle /> 🔄 Auto-Restock Cycle (+60)
          </button>

          <button
            className="sim-btn primary"
            onClick={() => handleSimulateAction("simulate_full_lifecycle")}
            disabled={isSimulating}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(79, 70, 229, 0.2))",
              color: "#93C5FD",
              border: "1px solid rgba(59, 130, 246, 0.4)",
              padding: "8px 12px",
              borderRadius: "8px",
              fontSize: "0.8rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
            title="Simulate full real-world market cycle: Launch -> Deplete -> Restock"
          >
            <FiRefreshCw /> 🔁 Full Lifecycle
          </button>

          <button
            className="sim-btn neutral"
            onClick={() => handleSimulateAction("reset_optimal")}
            disabled={isSimulating}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(99, 102, 241, 0.15)",
              color: "#A5B4FC",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              padding: "8px 12px",
              borderRadius: "8px",
              fontSize: "0.8rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
            title="Reset to default optimal catalog baseline"
          >
            <FiSliders /> Reset Baseline
          </button>

          <button className="refresh-btn" onClick={() => fetchVendorInventory()}>
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4 EXACT REPLACED KPI CARDS (FOR ALL VENDORS DYNAMICALLY)                  */}
      {/* 1: {Vendor} Listed Items | 2: In Stock Units | 3: Low Stock Warnings | 4: Out of Stock */}
      {/* ========================================================================= */}
      <div className="inventory-metrics-grid">
        {/* Card 1: {Vendor} Listed Items */}
        <div className="metric-card" style={{ borderLeft: `4px solid ${activeVendor.color}` }}>
          <div className="metric-icon blue" style={{ background: `${activeVendor.color}22`, color: activeVendor.color }}>
            <FiBox />
          </div>
          <div>
            <h3>{activeVendor.shortName} Listed Items</h3>
            <p className="metric-value" style={{ color: activeVendor.color }}>{listedItemsCount} Items</p>
            <span className="metric-sub">Active in {activeVendor.name} Catalog</span>
          </div>
        </div>

        {/* Card 2: In Stock Units */}
        <div className="metric-card" style={{ borderLeft: "4px solid #10B981" }}>
          <div className="metric-icon green" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10B981" }}>
            <FiCheckCircle />
          </div>
          <div>
            <h3>In Stock Units</h3>
            <p className="metric-value" style={{ color: "#10B981" }}>{inStockUnitsCount} Units</p>
            <span className="metric-sub">Available for Instant Dispatch</span>
          </div>
        </div>

        {/* Card 3: Low Stock Warnings */}
        <div className="metric-card" style={{ borderLeft: "4px solid #F59E0B" }}>
          <div className="metric-icon red" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#F59E0B" }}>
            <FiAlertTriangle />
          </div>
          <div>
            <h3>Low Stock Warnings</h3>
            <p className="metric-value" style={{ color: "#F59E0B" }}>{lowStockItems.length}</p>
            <span className="metric-sub">Items Below Reorder Threshold</span>
          </div>
        </div>

        {/* Card 4: Out of Stock */}
        <div className="metric-card" style={{ borderLeft: "4px solid #EF4444" }}>
          <div className="metric-icon gray" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#EF4444" }}>
            <FiXCircle />
          </div>
          <div>
            <h3>Out of Stock</h3>
            <p className="metric-value" style={{ color: "#EF4444" }}>{outOfStockItems.length}</p>
            <span className="metric-sub">Zero Available Units in Warehouse</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* REWORKED SECTION 1: ACTIVE LOW-STOCK ALERTS (FOR ALL VENDORS)             */}
      {/* ========================================================================= */}
      <div className="inventory-alerts-section" style={{ marginBottom: "28px" }}>
        <div className="section-title-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <FiAlertTriangle style={{ color: "#F59E0B" }} /> Active Low-Stock Alerts for {activeVendor.shortName} ({activeAlerts.length})
          </h2>
          <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
            Automatically triggered when inventory drops below safety threshold
          </span>
        </div>

        {activeAlerts.length === 0 ? (
          <div className="no-alerts-card" style={{ padding: "32px 20px" }}>
            <FiCheckCircle style={{ fontSize: "2.8rem", color: "#10B981", marginBottom: "8px" }} />
            <h3 style={{ margin: "0 0 6px 0", fontSize: "1.15rem" }}>All {activeVendor.shortName} Stock Levels Are Healthy!</h3>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>
              All {listedItemsCount} catalog items are currently above their reorder thresholds. Click <strong>&quot;Out of Stock Spike&quot;</strong> or <strong>&quot;Low Stock Spike&quot;</strong> above to simulate live alerts.
            </p>
          </div>
        ) : (
          <div className="alerts-table-container">
            <table className="alerts-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product Name</th>
                  <th>Product Category</th>
                  <th>Vendor Store</th>
                  <th>Current Stock</th>
                  <th>Threshold</th>
                  <th>Severity Level</th>
                  <th>ML Recommended Restock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeAlerts.map((a, idx) => (
                  <tr key={a.product_id || idx}>
                    <td style={{ fontWeight: 800, color: "var(--primary-blue)" }}>#{idx + 1}</td>
                    <td className="font-semibold">{a.product_name}</td>
                    <td>
                      <span className="badge badge-info">{a.category}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: activeVendor.color }}>
                        {activeVendor.icon} {activeVendor.name}
                      </span>
                    </td>
                    <td className="font-bold" style={{ color: a.stock_quantity === 0 ? "#EF4444" : "#F59E0B" }}>
                      {a.stock_quantity} Units
                    </td>
                    <td>{a.reorder_threshold} Units</td>
                    <td>
                      <span className={`severity-badge ${a.severity.toLowerCase()}`}>
                        {a.severity}
                      </span>
                    </td>
                    <td className="font-semibold text-emerald-500">+{a.recommended_restock_amount} Units</td>
                    <td>
                      <div className="action-buttons">
                        <button className="restock-btn" onClick={() => setRestockModal(a)}>
                          <FiRefreshCw /> Restock
                        </button>
                        <button className="forecast-btn" onClick={() => handleFetchForecast(a.product_id)}>
                          <FiCpu /> ML Forecast
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* REWORKED SECTION 2: LIVE INVENTORY MOVEMENT & AIR WAYBILL TRACKING LOGS   */}
      {/* ========================================================================= */}
      <div
        className="inventory-tracking-section"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-color)",
          borderRadius: "18px",
          padding: "24px",
          marginBottom: "28px",
          boxShadow: "var(--shadow-md)"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "20px"
          }}
        >
          <div>
            <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-main)", margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: "8px" }}>
              <FiActivity style={{ color: activeVendor.color }} /> Live Inventory Movement & Air Waybill Tracking Logs ({filteredTrackingLogs.length})
            </h2>
            <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", margin: 0 }}>
              Live audit trail detailing carrier freight manifests (DHL/FedEx), SKU serials, climate telemetry, and quality stamps for {activeVendor.name}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <div style={{ position: "relative", width: "260px" }}>
              <FiSearch style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="text"
                placeholder={`Search inside ${activeVendor.shortName} tracking...`}
                value={trackingSearch}
                onChange={(e) => setTrackingSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px 8px 32px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-primary)",
                  color: "var(--text-main)",
                  fontSize: "0.82rem",
                  outline: "none"
                }}
              />
            </div>

            <select
              value={selectedEventType}
              onChange={(e) => setSelectedEventType(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                background: "var(--bg-primary)",
                color: "var(--text-main)",
                fontSize: "0.82rem",
                outline: "none",
                fontWeight: 600
              }}
            >
              <option value="All">All Event Types</option>
              <option value="Inbound Supplier Restock">Inbound Supplier Restock</option>
              <option value="Customer Order Fulfilled">Customer Order Fulfilled</option>
              <option value="Warehouse Bin Transfer">Warehouse Bin Transfer</option>
              <option value="Quality & Thermal Audit">Quality & Thermal Audit</option>
              <option value="Priority Express Dispatch Ready">Express Dispatch Ready</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="alerts-table" style={{ width: "100%", fontSize: "0.84rem" }}>
            <thead>
              <tr style={{ background: "var(--bg-primary)", color: "var(--text-muted)", textAlign: "left" }}>
                <th style={{ padding: "12px 14px" }}>#</th>
                <th style={{ padding: "12px 14px" }}>Tracking Ref & SKU</th>
                <th style={{ padding: "12px 14px" }}>Product & Vendor</th>
                <th style={{ padding: "12px 14px" }}>Movement Type</th>
                <th style={{ padding: "12px 14px" }}>Qty Delta</th>
                <th style={{ padding: "12px 14px" }}>Carrier & Waybill</th>
                <th style={{ padding: "12px 14px" }}>Warehouse Bin & Temp</th>
                <th style={{ padding: "12px 14px" }}>QC & Batch #</th>
                <th style={{ padding: "12px 14px" }}>Timestamp & Operator</th>
                <th style={{ padding: "12px 14px" }}>Manifest</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrackingLogs.map((log, idx) => (
                <tr key={log.tracking_id || idx} style={{ borderBottom: "1px solid var(--border-color)" }}>
                  {/* # */}
                  <td style={{ padding: "12px 14px", fontWeight: 800, color: "var(--primary-blue)" }}>
                    #{idx + 1}
                  </td>

                  {/* Tracking Ref & SKU */}
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ fontFamily: "monospace", color: activeVendor.color, fontWeight: 800, fontSize: "0.88rem" }}>
                      {log.tracking_id}
                    </div>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
                      {log.sku_code || `SKU-${activeVendor.shortName.toUpperCase()}-${idx + 1}`}
                    </span>
                  </td>

                  {/* Product & Vendor */}
                  <td style={{ padding: "12px 14px" }}>
                    <strong style={{ display: "block", color: "var(--text-main)", fontSize: "0.88rem" }}>
                      {log.product_name}
                    </strong>
                    <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                      {activeVendor.name} • <span style={{ color: activeVendor.color }}>{log.category}</span>
                    </span>
                  </td>

                  {/* Movement Event Type */}
                  <td style={{ padding: "12px 14px" }}>
                    <span
                      style={{
                        padding: "4px 9px",
                        borderRadius: "6px",
                        fontSize: "0.74rem",
                        fontWeight: 700,
                        background:
                          log.status_color === "green"
                            ? "rgba(16, 185, 129, 0.15)"
                            : log.status_color === "blue"
                            ? "rgba(59, 130, 246, 0.15)"
                            : log.status_color === "purple"
                            ? "rgba(139, 92, 246, 0.15)"
                            : "rgba(245, 158, 11, 0.15)",
                        color:
                          log.status_color === "green"
                            ? "#10B981"
                            : log.status_color === "blue"
                            ? "#3B82F6"
                            : log.status_color === "purple"
                            ? "#8B5CF6"
                            : "#D97706"
                      }}
                    >
                      {log.event_type}
                    </span>
                    <span style={{ display: "block", fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>
                      {log.logistics_status || "In Facility"}
                    </span>
                  </td>

                  {/* Quantity Delta */}
                  <td
                    style={{
                      padding: "12px 14px",
                      fontWeight: 800,
                      fontSize: "0.95rem",
                      color: String(log.quantity_change).startsWith("+")
                        ? "#10B981"
                        : String(log.quantity_change).startsWith("-")
                        ? "#EF4444"
                        : "var(--text-muted)"
                    }}
                  >
                    {log.quantity_change}
                  </td>

                  {/* Carrier & Air Waybill */}
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <FiTruck style={{ color: activeVendor.color }} />
                      <strong style={{ fontSize: "0.82rem", color: "var(--text-main)" }}>
                        {log.carrier || "DHL Express"}
                      </strong>
                    </div>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "monospace", display: "block" }}>
                      {log.awb_number || "AWB-984021"}
                    </span>
                  </td>

                  {/* Warehouse Bin & Temperature */}
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ color: "var(--text-main)", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "4px" }}>
                      <FiMapPin style={{ color: activeVendor.color }} />
                      {log.warehouse_location}
                    </div>
                    <span style={{ fontSize: "0.72rem", color: "#10B981", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                      <FiThermometer /> {log.storage_temp || "21°C Climate Safe"}
                    </span>
                  </td>

                  {/* QC & Batch # */}
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ fontSize: "0.76rem", color: "#10B981", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                      <FiCheckCircle /> {log.qc_status || "QC: PASSED"}
                    </div>
                    <span style={{ fontSize: "0.72rem", fontFamily: "monospace", color: "var(--text-muted)" }}>
                      {log.batch_number}
                    </span>
                  </td>

                  {/* Timestamp & Operator */}
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                      <FiClock style={{ marginRight: "3px" }} />
                      {log.timestamp}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-main)", fontWeight: 600, marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <FiUserCheck style={{ color: activeVendor.color }} />
                      {log.operator}
                    </div>
                  </td>

                  {/* View Waybill Sheet */}
                  <td style={{ padding: "12px 14px" }}>
                    <button
                      onClick={() => setWaybillModal(log)}
                      style={{
                        background: "rgba(37, 99, 235, 0.1)",
                        color: activeVendor.color,
                        border: `1px solid ${activeVendor.color}40`,
                        padding: "5px 9px",
                        borderRadius: "6px",
                        fontSize: "0.76rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                      title="Inspect full air waybill & thermal certification"
                    >
                      <FiFileText /> Waybill
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* OFFICIAL AIR WAYBILL & QUALITY INSPECTION MODAL                            */}
      {/* ========================================================================= */}
      {waybillModal && (
        <div className="modal-overlay" onClick={() => setWaybillModal(null)}>
          <div
            className="modal-card"
            style={{ maxWidth: "560px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FiTruck style={{ fontSize: "1.3rem", color: activeVendor.color }} />
                <div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0, color: "var(--text-main)" }}>
                    Air Waybill & Quality Inspection Certificate
                  </h3>
                  <span style={{ fontSize: "0.76rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
                    {waybillModal.awb_number || "AWB-DHL-994821"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setWaybillModal(null)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "1.2rem", cursor: "pointer" }}
              >
                <FiX />
              </button>
            </div>

            {/* Waybill Content Box */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Barcode Mockup */}
              <div style={{ background: "#0F172A", padding: "12px", borderRadius: "8px", textAlign: "center", border: "1px solid #334155" }}>
                <div style={{ fontFamily: "monospace", fontSize: "1.5rem", letterSpacing: "6px", color: "#FFFFFF" }}>
                  ||| | |||| || ||| | || |||||
                </div>
                <span style={{ fontSize: "0.72rem", color: "#94A3B8", letterSpacing: "2px", fontFamily: "monospace" }}>
                  *{waybillModal.tracking_id}*
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", background: "var(--bg-primary)", padding: "14px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                <div>
                  <small style={{ color: "var(--text-muted)", fontSize: "0.72rem", display: "block" }}>CARRIER FREIGHT FLEET</small>
                  <strong style={{ color: "var(--text-main)", fontSize: "0.88rem" }}>{waybillModal.carrier || "DHL Express Global"}</strong>
                </div>
                <div>
                  <small style={{ color: "var(--text-muted)", fontSize: "0.72rem", display: "block" }}>TRANSIT ROUTING</small>
                  <strong style={{ color: "var(--text-main)", fontSize: "0.88rem" }}>{waybillModal.transit_details || "Air Cargo Direct"}</strong>
                </div>
                <div>
                  <small style={{ color: "var(--text-muted)", fontSize: "0.72rem", display: "block" }}>PRODUCT & SKU</small>
                  <strong style={{ color: "var(--text-main)", fontSize: "0.88rem" }}>{waybillModal.product_name}</strong>
                  <span style={{ display: "block", fontSize: "0.72rem", color: activeVendor.color, fontFamily: "monospace" }}>
                    {waybillModal.sku_code}
                  </span>
                </div>
                <div>
                  <small style={{ color: "var(--text-muted)", fontSize: "0.72rem", display: "block" }}>VENDOR STORE</small>
                  <strong style={{ color: "var(--text-main)", fontSize: "0.88rem" }}>{activeVendor.name}</strong>
                </div>
              </div>

              {/* Warehouse Environmental Conditions */}
              <div style={{ background: "var(--bg-primary)", padding: "14px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", fontWeight: 700 }}>STORAGE TELEMETRY & LOCATION:</span>
                  <span style={{ fontSize: "0.74rem", color: "#10B981", fontWeight: 700 }}>{waybillModal.warehouse_location}</span>
                </div>
                <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-main)" }}>
                  🌡️ Ambient Condition: <strong>{waybillModal.storage_temp || "21°C | 42% Humidity"}</strong>
                </p>
                <p style={{ margin: "4px 0 0 0", fontSize: "0.82rem", color: "#10B981" }}>
                  ✅ Quality Control Audit: <strong>{waybillModal.qc_status || "QC Seal: PASSED (Grade A)"}</strong>
                </p>
              </div>

              {/* Verified Handler Stamp */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                <div>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block" }}>INSPECTED & SEALED BY:</span>
                  <strong style={{ color: "#10B981", fontSize: "0.85rem" }}>{waybillModal.operator}</strong>
                </div>
                <span style={{ padding: "4px 10px", borderRadius: "6px", background: "#10B981", color: "#FFFFFF", fontSize: "0.74rem", fontWeight: 800 }}>
                  ISO-9001 VERIFIED
                </span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  toast.success(`Exported official Air Waybill PDF for ${waybillModal.awb_number}!`);
                  setWaybillModal(null);
                }}
              >
                Download Official Waybill PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {restockModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>📦 Restock Inventory: {restockModal.product_name}</h2>
            <p className="modal-sub">Current Stock: <strong>{restockModal.stock_quantity} Units</strong> | Threshold: {restockModal.reorder_threshold}</p>
            <form onSubmit={handleRestockSubmit}>
              <div className="form-group">
                <label>Add Restock Quantity (Units):</label>
                <input
                  type="number"
                  min="1"
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value)}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setRestockModal(null)}>Cancel</button>
                <button type="submit" className="confirm-btn">Confirm Restock</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ML Forecast Modal */}
      {forecastModal && (
        <div className="modal-overlay">
          <div className="modal-card forecast-modal">
            <h2>🤖 Time-Series ML Demand Forecast</h2>
            <p className="modal-sub">Product: <strong>{forecastModal.product_name}</strong></p>

            <div className="forecast-stats-grid">
              <div className="f-stat">
                <span>Avg Daily Sales Rate</span>
                <h4>{forecastModal.avg_daily_sales} Units/day</h4>
              </div>
              <div className="f-stat">
                <span>Days Until Depleted</span>
                <h4 style={{ color: forecastModal.days_until_depleted < 7 ? "#EF4444" : "#10B981" }}>
                  {forecastModal.days_until_depleted} Days
                </h4>
              </div>
              <div className="f-stat">
                <span>Depletion Risk Level</span>
                <h4 className={`risk-${forecastModal.risk_level.toLowerCase()}`}>
                  {forecastModal.risk_level} Risk
                </h4>
              </div>
            </div>

            <div className="forecast-periods">
              <h3>Demand Requirements Prediction:</h3>
              <ul>
                <li>📅 Next 7 Days Needed: <strong>{forecastModal.forecasts["7_days_needed"]} Units</strong></li>
                <li>📅 Next 14 Days Needed: <strong>{forecastModal.forecasts["14_days_needed"]} Units</strong></li>
                <li>📅 Next 30 Days Needed: <strong>{forecastModal.forecasts["30_days_needed"]} Units</strong></li>
              </ul>
              <div className="recommended-callout">
                <FiTrendingUp /> Recommended Purchase Order: <strong>+{forecastModal.recommended_order_qty} Units</strong>
              </div>
            </div>

            <button className="close-btn" onClick={() => setForecastModal(null)}>Close Forecast</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;
