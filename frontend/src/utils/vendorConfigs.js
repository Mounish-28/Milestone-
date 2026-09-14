// Universal Vendor Configurations & Dynamic Profile Builder for ShopSense
// Supports both initial verified partners and newly approved governance vendors

export const DEFAULT_VENDOR_CONFIGS = {
  voltx: {
    key: "voltx",
    dbId: 9,
    legacyId: 9,
    name: "VoltX Smart Mobiles",
    shortName: "VoltX",
    owner: "Vikram Malhotra",
    subtitle: "5G Flagships, Foldables, GaN Chargers & Audio Tech",
    domain: "5G Smart Mobiles, Next-Gen Devices & Accessories",
    icon: "⚡",
    color: "#10B981",
    rating: 4.9,
    categories: ["All", "Smart Mobiles", "5G Flagships", "Mobile Accessories", "Fast Chargers", "Audio & Wearables"],
    defaultCategory: "Smart Mobiles",
    description: "Official authorized flagship storefront for VoltX smart mobiles, foldable smartphones, ultra-fast GaN chargers, and high-performance mobile accessories."
  },
  techworld: {
    key: "techworld",
    dbId: 4,
    legacyId: 1,
    name: "TechWorld Electronics",
    shortName: "TechWorld",
    owner: "Rahul Sharma",
    subtitle: "Laptops, OLED Displays & Studio Audio",
    domain: "Consumer Electronics, Computing & Studio Audio",
    icon: "💻",
    color: "#3B82F6",
    rating: 4.9,
    categories: ["All", "Laptops & Computing", "Electronics", "Audio", "Displays", "Accessories"],
    defaultCategory: "Laptops & Computing",
    description: "Official authorized distributor of premium M3 MacBooks, ANC studio headphones, and high-refresh gaming displays."
  },
  stylehub: {
    key: "stylehub",
    dbId: 5,
    legacyId: 2,
    name: "StyleHub Fashion & Clothes",
    shortName: "StyleHub",
    owner: "Pooja Verma",
    subtitle: "Denim, Runway Gowns, Sneakers & Luxury Apparel",
    domain: "Fashion, Apparel & Luxury Streetwear",
    icon: "👗",
    color: "#EC4899",
    rating: 4.8,
    categories: ["All", "Men's Wear", "Women's Wear", "Footwear & Sneakers", "Outerwear", "Kids Wear", "Fashion", "Accessories"],
    defaultCategory: "Men's Wear",
    description: "Curated premium fashion, authentic non-stretch denim, Italian designer accessories, and active streetwear."
  },
  modernhome: {
    key: "modernhome",
    dbId: 6,
    legacyId: 3,
    name: "ModernHome Furniture & Living",
    shortName: "ModernHome",
    owner: "Amit Patel",
    subtitle: "Ergonomic Chairs, Standing Desks & Smart Lighting",
    domain: "Smart Home, Furniture & Ergonomics",
    icon: "🛋️",
    color: "#10B981",
    rating: 4.9,
    categories: ["All", "Furniture", "Ergonomic Chairs", "Standing Desks", "Living Room", "Dining & Kitchen", "Smart Lighting", "Smart Home Appliances", "Bedding & Decor"],
    defaultCategory: "Furniture",
    description: "High-end ergonomic office workstations, solid oak dining sets, top-grain leather sofas, and smart ambient IoT lighting."
  },
  gadgetcentral: {
    key: "gadgetcentral",
    dbId: 7,
    legacyId: 4,
    name: "GadgetCentral Toys & Robotics",
    shortName: "GadgetCentral",
    owner: "Vikram Malhotra",
    subtitle: "4K Drones, PS5/Xbox Consoles & STEM Robotics",
    domain: "Drones, Gaming Consoles & STEM Robotics",
    icon: "🛸",
    color: "#F59E0B",
    rating: 4.9,
    categories: ["All", "Toys & Games", "Drones & Aerial", "Gaming Consoles", "Gaming & VR", "LEGO & Robotics", "STEM Robotics", "RC Vehicles"],
    defaultCategory: "Toys & Games",
    description: "4K HDR quadcopters, next-gen gaming consoles, VR headsets, programmable STEM educational robots, and LEGO Technic kits."
  },
  greenearth: {
    key: "greenearth",
    dbId: 8,
    legacyId: 5,
    name: "GreenEarth Organic Living & Home",
    shortName: "GreenEarth",
    owner: "Ananya Iyer",
    subtitle: "Organic Wellness, Sustainable Home & Eco Care",
    domain: "Organic Living, Eco Home & Natural Wellness",
    icon: "🌱",
    color: "#059669",
    rating: 4.9,
    categories: ["All", "Organic Living", "Beauty & Health", "Organic & Grocery", "Home & Sustainable", "Wellness"],
    defaultCategory: "Organic Living",
    description: "Cold-pressed organic wellness oils, wild Himalayan honey, and handcrafted sustainable home essentials."
  }
};

const COLOR_PALETTE = [
  "#8B5CF6", "#06B6D4", "#EC4899", "#10B981", "#F59E0B", 
  "#3B82F6", "#EF4444", "#14B8A6", "#6366F1", "#D946EF"
];

export const getCategoryIcon = (text = "") => {
  const s = String(text).toLowerCase();
  if (s.includes("voltx") || s.includes("phone") || s.includes("mobile")) return "⚡";
  if (s.includes("electro") || s.includes("tech") || s.includes("laptop") || s.includes("computer")) return "💻";
  if (s.includes("fashion") || s.includes("cloth") || s.includes("apparel") || s.includes("wear")) return "👗";
  if (s.includes("furniture") || s.includes("home") || s.includes("living") || s.includes("decor")) return "🛋️";
  if (s.includes("drone") || s.includes("toy") || s.includes("robot") || s.includes("game")) return "🛸";
  if (s.includes("organic") || s.includes("green") || s.includes("nature") || s.includes("bio") || s.includes("eco")) return "🌱";
  if (s.includes("beauty") || s.includes("cosmetic") || s.includes("care")) return "✨";
  if (s.includes("sport") || s.includes("fitness") || s.includes("gym")) return "🏃";
  if (s.includes("food") || s.includes("kitchen") || s.includes("cafe") || s.includes("bake")) return "☕";
  if (s.includes("jewel") || s.includes("watch") || s.includes("luxury")) return "💎";
  if (s.includes("book") || s.includes("stationery") || s.includes("art")) return "📚";
  return "🏬";
};

export const getDeterministicColor = (id = 1) => {
  const num = typeof id === "number" ? id : parseInt(String(id).replace(/\D/g, "") || "1", 10);
  return COLOR_PALETTE[Math.abs(num) % COLOR_PALETTE.length];
};

/**
 * Builds a dynamic vendor profile for any newly approved vendor from DB.
 */
export const buildDynamicVendorProfile = (v) => {
  const vId = v.id;
  const name = v.name || `Vendor ${vId}`;
  const icon = getCategoryIcon(name);
  const color = getDeterministicColor(vId);

  return {
    key: `vendor_${vId}`,
    dbId: vId,
    legacyId: vId,
    name: name,
    shortName: name.split(" ")[0] || name,
    owner: v.email ? v.email.split("@")[0] : `${name} Lead`,
    subtitle: "Certified ShopSense Merchant Partner",
    domain: "Retail & Specialized Marketplace Goods",
    icon: icon,
    color: color,
    rating: v.rating || 4.9,
    categories: ["All", "Featured", "New Releases", "Bestsellers"],
    defaultCategory: "Featured",
    description: `Official authorized storefront for ${name} commissioned by ShopSense Supreme Governance.`
  };
};

/**
 * Merges standard presets with all approved live vendors from database.
 */
export const buildVendorMap = (dbVendors = []) => {
  const map = { ...DEFAULT_VENDOR_CONFIGS };

  if (!Array.isArray(dbVendors)) return map;

  dbVendors.forEach((v) => {
    if (!v || !v.id) return;
    const vNameLower = (v.name || "").toLowerCase();
    
    // Check if matches an existing preset
    let matchedKey = null;
    for (const [key, cfg] of Object.entries(DEFAULT_VENDOR_CONFIGS)) {
      if (cfg.dbId === v.id || vNameLower.includes(key) || vNameLower === cfg.name.toLowerCase()) {
        matchedKey = key;
        break;
      }
    }

    if (matchedKey) {
      // Update with exact live dbId
      map[matchedKey] = {
        ...map[matchedKey],
        dbId: v.id,
        name: v.name || map[matchedKey].name,
        rating: v.rating || map[matchedKey].rating
      };
    } else {
      // Newly approved vendor from governance pipeline!
      const dynKey = `vendor_${v.id}`;
      map[dynKey] = buildDynamicVendorProfile(v);
    }
  });

  return map;
};

/**
 * Normalizes any identifier to an active vendor key in the current vendorMap.
 */
export const normalizeVendorKey = (v, vendorMap = DEFAULT_VENDOR_CONFIGS) => {
  if (!v) return "voltx";
  const s = String(v).toLowerCase().trim();

  // 1. Check direct keys
  if (vendorMap[s]) return s;

  // 2. VoltX Smart Mobiles
  if (s === "9" || s === "voltx" || s.includes("voltx") || s.includes("voltxmobiles") || s.includes("vikram")) {
    return "voltx";
  }

  // 3. Match against vendorMap dbIds
  for (const [key, cfg] of Object.entries(vendorMap)) {
    if (String(cfg.dbId) === s) {
      return key;
    }
    if (cfg.name && cfg.name.toLowerCase().trim() === s) {
      return key;
    }
  }

  // 4. Substring matches on vendor names
  for (const [key, cfg] of Object.entries(vendorMap)) {
    if (cfg.name && (s.includes(cfg.name.toLowerCase()) || cfg.name.toLowerCase().includes(s))) {
      return key;
    }
  }

  // 5. Preset legacy matches
  if (s === "4" || s === "1" || s.includes("techworld") || s.includes("rahul")) return "techworld";
  if (s === "5" || s === "2" || s.includes("stylehub") || s.includes("pooja")) return "stylehub";
  if (s === "6" || s === "3" || s.includes("modernhome") || s.includes("amit")) return "modernhome";
  if (s === "7" || s.includes("gadgetcentral") || s.includes("aarav")) return "gadgetcentral";
  if (s === "8" || s.includes("greenearth") || s.includes("ananya")) return "greenearth";

  // 6. Keywords fallback
  if (s.includes("electronics") || s.includes("laptop") || s.includes("audio") || s.includes("display") || s.includes("macbook") || s.includes("dell")) {
    return "techworld";
  }
  if (s.includes("fashion") || s.includes("cloth") || s.includes("wear") || s.includes("sneaker") || s.includes("apparel") || s.includes("outerwear") || s.includes("jean") || s.includes("shirt") || s.includes("hoodie") || s.includes("jacket")) {
    return "stylehub";
  }
  if (s.includes("furniture") || s.includes("living") || s.includes("chair") || s.includes("desk") || s.includes("lighting") || s.includes("bedding") || s.includes("dining") || s.includes("decor") || s.includes("sofa") || s.includes("table")) {
    return "modernhome";
  }
  if (s.includes("toy") || s.includes("robot") || s.includes("drone") || s.includes("console") || s.includes("gaming") || s.includes("lego") || s.includes("vr") || s.includes("playstation") || s.includes("xbox") || s.includes("game")) {
    return "gadgetcentral";
  }
  if (s.includes("organic") || s.includes("green") || s.includes("nature") || s.includes("bio") || s.includes("eco") || s.includes("honey") || s.includes("oil")) {
    return "greenearth";
  }

  return "voltx";
};
