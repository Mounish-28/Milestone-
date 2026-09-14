import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus,
  FiSearch,
  FiTrash2,
  FiCheckCircle,
  FiX,
  FiMaximize2,
  FiCamera,
  FiLogOut,
  FiZap,
  FiRefreshCw,
  FiTrendingDown,
  FiPlay,
  FiPackage,
  FiActivity
} from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../components/Header";
import { getProducts, createProduct, deleteProduct, updateProductStock, simulateInventoryAction, getVendors } from "../services/api";
import { DEFAULT_VENDOR_CONFIGS, buildVendorMap, normalizeVendorKey } from "../utils/vendorConfigs";

// Backward-compatible reference
const VENDOR_CONFIGS = DEFAULT_VENDOR_CONFIGS;

// 76+ Rich authentic baseline products strictly separated per vendor (numbered starting from 1, 2, 3...)
const INITIAL_VENDOR_PRODUCTS = {
  "techworld": [
    {
      "id": 1,
      "name": "Samsung Galaxy S24 Ultra 5G (Titanium Gray, 12GB RAM, 512GB Storage)",
      "category": "Mobiles",
      "price": 139999.0,
      "vendor_id": 4,
      "stock_quantity": 45,
      "reorder_threshold": 10,
      "stock": "In Stock",
      "image_url": "https://m.media-amazon.com/images/I/81vxWpPpgNL.jpg",
      "rating": 4.9,
      "units_sold": 342,
      "source": "Amazon"
    },
    {
      "id": 2,
      "name": "Apple iPhone 16 Pro Max (Desert Titanium, 256GB)",
      "category": "Mobiles",
      "price": 144900.0,
      "vendor_id": 4,
      "stock_quantity": 38,
      "reorder_threshold": 8,
      "stock": "In Stock",
      "image_url": "https://m.media-amazon.com/images/I/61bMJdgeryL._AC_SL1500_.jpg",
      "rating": 4.9,
      "units_sold": 520,
      "source": "Flipkart"
    },
    {
      "id": 3,
      "name": "Apple iPhone 16 (Ultramarine Blue, 128GB)",
      "category": "Mobiles",
      "price": 79900.0,
      "vendor_id": 4,
      "stock_quantity": 55,
      "reorder_threshold": 12,
      "stock": "In Stock",
      "image_url": "https://m.media-amazon.com/images/I/71Ecl1RS5jL._AC_.jpg",
      "rating": 4.8,
      "units_sold": 410,
      "source": "Amazon"
    },
    {
      "id": 4,
      "name": "Google Pixel 9 Pro XL AI (Obsidian, 16GB RAM, 128GB)",
      "category": "Mobiles",
      "price": 124999.0,
      "vendor_id": 4,
      "stock_quantity": 28,
      "reorder_threshold": 8,
      "stock": "In Stock",
      "image_url": "https://m.media-amazon.com/images/I/61fh21u3DJL._AC_.jpg",
      "rating": 4.8,
      "units_sold": 185,
      "source": "Google Shopping"
    },
    {
      "id": 5,
      "name": "OnePlus 12 5G (Flowy Emerald, 16GB RAM, 512GB)",
      "category": "Mobiles",
      "price": 69999.0,
      "vendor_id": 4,
      "stock_quantity": 42,
      "reorder_threshold": 10,
      "stock": "In Stock",
      "image_url": "https://m.media-amazon.com/images/I/717Qo4MH97L.jpg",
      "rating": 4.8,
      "units_sold": 290,
      "source": "Amazon"
    },
    {
      "id": 6,
      "name": "Samsung Galaxy Z Fold6 AI 5G (Phantom Silver, 256GB)",
      "category": "Mobiles",
      "price": 164999.0,
      "vendor_id": 4,
      "stock_quantity": 18,
      "reorder_threshold": 5,
      "stock": "In Stock",
      "image_url": "https://m.media-amazon.com/images/I/61QrXjeSooL._AC_SL1500_.jpg",
      "rating": 4.8,
      "units_sold": 115,
      "source": "Flipkart"
    },
    {
      "id": 7,
      "name": "Apple MacBook Pro M3 Max 16-inch (Space Black, 36GB RAM, 1TB SSD)",
      "category": "Laptops & Computing",
      "price": 319900.0,
      "vendor_id": 4,
      "stock_quantity": 15,
      "reorder_threshold": 4,
      "stock": "In Stock",
      "image_url": "https://m.media-amazon.com/images/I/51ZqjuoQFWL._AC_SY355_.jpg",
      "rating": 4.9,
      "units_sold": 94,
      "source": "Amazon"
    },
    {
      "id": 8,
      "name": "Apple MacBook Air M3 13-inch (Midnight Blue, 16GB RAM, 512GB SSD)",
      "category": "Laptops & Computing",
      "price": 114900.0,
      "vendor_id": 4,
      "stock_quantity": 40,
      "reorder_threshold": 10,
      "stock": "In Stock",
      "image_url": "https://m.media-amazon.com/images/I/614apPMGmLL._AC_SL1500_.jpg",
      "rating": 4.9,
      "units_sold": 380,
      "source": "Flipkart"
    },
    {
      "id": 9,
      "name": "Dell XPS 15 9530 OLED Touchscreen (Core i9, 32GB RAM, 1TB SSD, RTX 4070)",
      "category": "Laptops & Computing",
      "price": 284990.0,
      "vendor_id": 4,
      "stock_quantity": 12,
      "reorder_threshold": 4,
      "stock": "In Stock",
      "image_url": "https://m.media-amazon.com/images/I/71I2fkoBRCL._AC_SL1500_.jpg",
      "rating": 4.8,
      "units_sold": 68,
      "source": "Amazon"
    },
    {
      "id": 10,
      "name": "Asus ROG Zephyrus G16 OLED Gaming Laptop (Intel Core Ultra 9, RTX 4080)",
      "category": "Laptops & Computing",
      "price": 249990.0,
      "vendor_id": 4,
      "stock_quantity": 14,
      "reorder_threshold": 5,
      "stock": "In Stock",
      "image_url": "https://m.media-amazon.com/images/I/613Rnscw4YL._AC_SL1500_.jpg",
      "rating": 4.8,
      "units_sold": 112,
      "source": "Amazon"
    },
    {
      "id": 11,
      "name": "Sony WH-1000XM5 Wireless Active Noise Canceling Headphones",
      "category": "Audio",
      "price": 29990.0,
      "vendor_id": 4,
      "stock_quantity": 55,
      "reorder_threshold": 12,
      "stock": "In Stock",
      "image_url": "https://m.media-amazon.com/images/I/61ICqyoI2NL._AC_SL1500_.jpg",
      "rating": 4.9,
      "units_sold": 620,
      "source": "Amazon"
    },
    {
      "id": 12,
      "name": "Apple AirPods Pro 2 with MagSafe Case (USB-C)",
      "category": "Audio",
      "price": 24900.0,
      "vendor_id": 4,
      "stock_quantity": 80,
      "reorder_threshold": 20,
      "stock": "In Stock",
      "image_url": "https://m.media-amazon.com/images/I/419yjKznzbL._AC_.jpg",
      "rating": 4.9,
      "units_sold": 980,
      "source": "Flipkart"
    },
    {
      "id": 13,
      "name": "Bose QuietComfort Ultra Spatial Audio Headphones",
      "category": "Audio",
      "price": 35900.0,
      "vendor_id": 4,
      "stock_quantity": 30,
      "reorder_threshold": 8,
      "stock": "In Stock",
      "image_url": "https://m.media-amazon.com/images/I/61fJZu8p1FL._AC_.jpg",
      "rating": 4.8,
      "units_sold": 240,
      "source": "Amazon"
    },
    {
      "id": 14,
      "name": "Samsung Odyssey OLED G9 49-inch Curved Gaming Monitor (240Hz, 0.03ms)",
      "category": "Displays",
      "price": 129999.0,
      "vendor_id": 4,
      "stock_quantity": 10,
      "reorder_threshold": 3,
      "stock": "Low Stock",
      "image_url": "https://m.media-amazon.com/images/I/61A7+iThMZL._AC_.jpg",
      "rating": 4.9,
      "units_sold": 45,
      "source": "Amazon"
    },
    {
      "id": 15,
      "name": "LG C3 55-inch OLED evo 4K Smart Cinema TV (120Hz, Dolby Vision)",
      "category": "Displays",
      "price": 119990.0,
      "vendor_id": 4,
      "stock_quantity": 15,
      "reorder_threshold": 4,
      "stock": "In Stock",
      "image_url": "https://m.media-amazon.com/images/I/71O7wgely5L.jpg",
      "rating": 4.9,
      "units_sold": 130,
      "source": "Flipkart"
    },
    {
      "id": 16,
      "name": "Apple Watch Ultra 2 Titanium GPS + Cellular 49mm",
      "category": "Accessories",
      "price": 89900.0,
      "vendor_id": 4,
      "stock_quantity": 22,
      "reorder_threshold": 6,
      "stock": "In Stock",
      "image_url": "https://m.media-amazon.com/images/I/71m9wxT-HKL._AC_SL1500_.jpg",
      "rating": 4.9,
      "units_sold": 210,
      "source": "Amazon"
    },
    {
      "id": 17,
      "name": "Samsung Galaxy Watch 6 Classic 47mm LTE (Rotating Bezel)",
      "category": "Accessories",
      "price": 42999.0,
      "vendor_id": 4,
      "stock_quantity": 35,
      "reorder_threshold": 10,
      "stock": "In Stock",
      "image_url": "https://m.media-amazon.com/images/I/71hg6m6m50L._AC_.jpg",
      "rating": 4.8,
      "units_sold": 275,
      "source": "Amazon"
    }
  ],
  "stylehub": [
    {
      "id": 1,
      "name": "Nike Air Jordan 1 Retro High OG 'Chicago Lost & Found'",
      "category": "Footwear & Sneakers",
      "price": 18995.0,
      "vendor_id": 5,
      "stock_quantity": 14,
      "reorder_threshold": 5,
      "stock": "Low Stock",
      "image_url": "https://m.media-amazon.com/images/I/71mkj++CUTL._AC_SL1500_.jpg",
      "rating": 4.9,
      "units_sold": 380,
      "source": "Google Shopping"
    },
    {
      "id": 2,
      "name": "Nike Air Force 1 '07 Triple White Classic Sneakers",
      "category": "Footwear & Sneakers",
      "price": 8195.0,
      "vendor_id": 5,
      "stock_quantity": 65,
      "reorder_threshold": 15,
      "stock": "In Stock",
      "image_url": "https://m.media-amazon.com/images/I/81uiWMk9dnL._AC_SL1500_.jpg",
      "rating": 4.8,
      "units_sold": 890,
      "source": "Flipkart"
    },
    {
      "id": 3,
      "name": "Adidas Ultraboost Light Running Shoes (Core Black)",
      "category": "Footwear & Sneakers",
      "price": 14999.0,
      "vendor_id": 5,
      "stock_quantity": 40,
      "reorder_threshold": 10,
      "stock": "In Stock",
      "image_url": "https://m.media-amazon.com/images/I/71DDN+0b+5L._AC_SL1500_.jpg",
      "rating": 4.8,
      "units_sold": 415,
      "source": "Amazon"
    },
    {
      "id": 4,
      "name": "Levi's 501 Original Fit Straight Leg Denim Jeans (Dark Stonewash)",
      "category": "Men's Wear",
      "price": 3999.0,
      "vendor_id": 5,
      "stock_quantity": 80,
      "reorder_threshold": 20,
      "stock": "In Stock",
      "image_url": "https://m.media-amazon.com/images/I/71X4AZCVGuL._AC_SL1500_.jpg",
      "rating": 4.8,
      "units_sold": 650,
      "source": "Amazon"
    },
    {
      "id": 5,
      "name": "The North Face 1996 Retro Nuptse 700-Fill Down Puffer Jacket (TNF Black)",
      "category": "Outerwear",
      "price": 27999.0,
      "vendor_id": 5,
      "stock_quantity": 25,
      "reorder_threshold": 6,
      "stock": "In Stock",
      "image_url": "https://m.media-amazon.com/images/I/81D6tH6m56L._AC_UL1500_.jpg",
      "rating": 4.9,
      "units_sold": 190,
      "source": "Google Shopping"
    },
    {
      "id": 6,
      "name": "Ray-Ban Classic Polarized Aviator Sunglasses (Gold Frame / Green G-15 Lens)",
      "category": "Accessories",
      "price": 11590.0,
      "vendor_id": 5,
      "stock_quantity": 50,
      "reorder_threshold": 12,
      "stock": "In Stock",
      "image_url": "https://m.media-amazon.com/images/I/51AuXCMcURL._AC_SL1500_.jpg",
      "rating": 4.9,
      "units_sold": 540,
      "source": "Amazon"
    },
    {
      "id": 7,
      "name": "Casio G-Shock GA-2100 Octagonal 'CasiOak' Carbon Core Guard (All Black)",
      "category": "Accessories",
      "price": 8995.0,
      "vendor_id": 5,
      "stock_quantity": 60,
      "reorder_threshold": 15,
      "stock": "In Stock",
      "image_url": "https://m.media-amazon.com/images/I/61E+kMgwUVL._AC_.jpg",
      "rating": 4.8,
      "units_sold": 720,
      "source": "Flipkart"
    },
    {
      "id": 8,
      "name": "Ralph Lauren Oxford Cotton Long-Sleeve Button-Down Shirt (Classic White)",
      "category": "Men's Wear",
      "price": 9990.0,
      "vendor_id": 5,
      "stock_quantity": 45,
      "reorder_threshold": 10,
      "stock": "In Stock",
      "image_url": "https://m.media-amazon.com/images/I/61Kzh2K7teL._AC_SL1320_.jpg",
      "rating": 4.8,
      "units_sold": 310,
      "source": "Amazon"
    }
  ],
  "modernhome": [
    {
      "id": 1,
      "name": "Herman Miller Aeron Ergonomic Mesh Executive Chair (Graphite, Size B)",
      "category": "Ergonomic Chairs",
      "price": 124990.0,
      "vendor_id": 6,
      "stock_quantity": 8,
      "reorder_threshold": 3,
      "stock": "Low Stock",
      "image_url": "https://m.media-amazon.com/images/I/71VVk7m8aIL._AC_SL1500_.jpg",
      "rating": 4.9,
      "units_sold": 95,
      "source": "Amazon"
    },
    {
      "id": 2,
      "name": "Autonomous SmartDesk Pro Dual-Motor Motorized Standing Desk (Walnut Top, Black Frame)",
      "category": "Standing Desks",
      "price": 54990.0,
      "vendor_id": 6,
      "stock_quantity": 20,
      "reorder_threshold": 5,
      "stock": "In Stock",
      "image_url": "https://cdn.autonomous.ai/production/ecm/260109/thumb.webp",
      "rating": 4.8,
      "units_sold": 160,
      "source": "Flipkart"
    },
    {
      "id": 3,
      "name": "Dyson V15 Detect Absolute Cordless HEPA Vacuum Cleaner (Laser Slim Fluffy)",
      "category": "Smart Home Appliances",
      "price": 62900.0,
      "vendor_id": 6,
      "stock_quantity": 25,
      "reorder_threshold": 6,
      "stock": "In Stock",
      "image_url": "https://m.media-amazon.com/images/I/41WhHDAH9SL._AC_SY879_.jpg",
      "rating": 4.9,
      "units_sold": 280,
      "source": "Amazon"
    },
    {
      "id": 4,
      "name": "Dyson Purifier Hot+Cool Formaldehyde HP09 Air Purifier & Heater",
      "category": "Smart Home Appliances",
      "price": 66900.0,
      "vendor_id": 6,
      "stock_quantity": 18,
      "reorder_threshold": 4,
      "stock": "In Stock",
      "image_url": "https://m.media-amazon.com/images/I/61SJY5Gz5oL._AC_.jpg",
      "rating": 4.8,
      "units_sold": 195,
      "source": "Amazon"
    },
    {
      "id": 5,
      "name": "Philips Hue Play Light Bar Starter Kit (2-Pack + Hue Bridge)",
      "category": "Smart Lighting",
      "price": 14999.0,
      "vendor_id": 6,
      "stock_quantity": 40,
      "reorder_threshold": 10,
      "stock": "In Stock",
      "image_url": "https://m.media-amazon.com/images/I/51vfJ-ReYvL._AC_SL1001_.jpg",
      "rating": 4.8,
      "units_sold": 340,
      "source": "Amazon"
    },
    {
      "id": 6,
      "name": "Breville Barista Touch Espresso Machine (Brushed Stainless Steel)",
      "category": "Kitchen & Dining",
      "price": 89990.0,
      "vendor_id": 6,
      "stock_quantity": 12,
      "reorder_threshold": 3,
      "stock": "In Stock",
      "image_url": "https://m.media-amazon.com/images/I/71zWmCnDvBL._AC_SL1500_.jpg",
      "rating": 4.9,
      "units_sold": 85,
      "source": "Google Shopping"
    }
  ],
  "gadgetcentral": [
    {
      "id": 1,
      "name": "Sony PlayStation 5 Slim Disc Edition Gaming Console (1TB)",
      "category": "Gaming Consoles",
      "price": 54990.0,
      "vendor_id": 7,
      "stock_quantity": 30,
      "reorder_threshold": 8,
      "stock": "In Stock",
      "image_url": "https://m.media-amazon.com/images/I/51CXJ8Rl7UL.jpg",
      "rating": 4.9,
      "units_sold": 780,
      "source": "Amazon"
    },
    {
      "id": 2,
      "name": "Microsoft Xbox Series X 1TB High-Performance Gaming Console",
      "category": "Gaming Consoles",
      "price": 54990.0,
      "vendor_id": 7,
      "stock_quantity": 22,
      "reorder_threshold": 6,
      "stock": "In Stock",
      "image_url": "https://m.media-amazon.com/images/I/71aBXvHYUpL._AC_SL1500_.jpg",
      "rating": 4.8,
      "units_sold": 490,
      "source": "Amazon"
    },
    {
      "id": 3,
      "name": "Nintendo Switch OLED Model with White Joy-Con",
      "category": "Gaming Consoles",
      "price": 31990.0,
      "vendor_id": 7,
      "stock_quantity": 35,
      "reorder_threshold": 8,
      "stock": "In Stock",
      "image_url": "https://m.media-amazon.com/images/I/61nqNujSF2L.jpg",
      "rating": 4.8,
      "units_sold": 640,
      "source": "Flipkart"
    },
    {
      "id": 4,
      "name": "DJI Mini 4 Pro 4K HDR Camera Drone (DJI RC 2 Screen Remote)",
      "category": "Drones & Aerial",
      "price": 89990.0,
      "vendor_id": 7,
      "stock_quantity": 16,
      "reorder_threshold": 4,
      "stock": "In Stock",
      "image_url": "https://m.media-amazon.com/images/I/71J-z2aMg7L._AC_.jpg",
      "rating": 4.9,
      "units_sold": 175,
      "source": "Amazon"
    },
    {
      "id": 5,
      "name": "Sony DualSense Wireless Controller (Midnight Black, PS5 & PC)",
      "category": "Gaming Accessories",
      "price": 5990.0,
      "vendor_id": 7,
      "stock_quantity": 50,
      "reorder_threshold": 12,
      "stock": "In Stock",
      "image_url": "https://m.media-amazon.com/images/I/61dsEJl7yNL._AC_SL1500_.jpg",
      "rating": 4.9,
      "units_sold": 590,
      "source": "Amazon"
    },
    {
      "id": 6,
      "name": "Logitech G502 HERO High Performance RGB Gaming Mouse (25K DPI)",
      "category": "Gaming Accessories",
      "price": 4195.0,
      "vendor_id": 7,
      "stock_quantity": 75,
      "reorder_threshold": 15,
      "stock": "In Stock",
      "image_url": "https://m.media-amazon.com/images/I/51PNyeVCKZL._AC_.jpg",
      "rating": 4.8,
      "units_sold": 880,
      "source": "Flipkart"
    }
  ],
  "voltx": [
    {
      "id": 1,
      "name": "Titan 5G Ultra (Snapdragon 8 Gen 3, 16GB RAM, 512GB Storage, 200MP OIS Camera)",
      "category": "Smart Mobiles",
      "price": 79999.0,
      "vendor_id": 9,
      "stock_quantity": 45,
      "reorder_threshold": 10,
      "stock": "In Stock",
      "image_url": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
      "rating": 4.9,
      "units_sold": 310,
      "source": "VoltX Direct"
    },
    {
      "id": 2,
      "name": "Neo Flip 5G (Foldable AMOLED 120Hz, 12GB RAM, 256GB Storage)",
      "category": "Smart Mobiles",
      "price": 64999.0,
      "vendor_id": 9,
      "stock_quantity": 35,
      "reorder_threshold": 8,
      "stock": "In Stock",
      "image_url": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800",
      "rating": 4.8,
      "units_sold": 195,
      "source": "VoltX Direct"
    },
    {
      "id": 3,
      "name": "Edge Pro 5G (Dimensity 9300+, 144Hz Curved OLED, 12GB RAM, 256GB Storage)",
      "category": "Smart Mobiles",
      "price": 49999.0,
      "vendor_id": 9,
      "stock_quantity": 50,
      "reorder_threshold": 10,
      "stock": "In Stock",
      "image_url": "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800",
      "rating": 4.9,
      "units_sold": 420,
      "source": "VoltX Direct"
    },
    {
      "id": 4,
      "name": "Air 5G Slim Edition (Ultra-Thin 6.8mm, 50MP Sony IMX, 8GB RAM, 128GB Storage)",
      "category": "Smart Mobiles",
      "price": 29999.0,
      "vendor_id": 9,
      "stock_quantity": 60,
      "reorder_threshold": 12,
      "stock": "In Stock",
      "image_url": "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800",
      "rating": 4.7,
      "units_sold": 580,
      "source": "VoltX Direct"
    },
    {
      "id": 5,
      "name": "Play Max Gaming Mobile (Liquid Cooled Snapdragon 8s, 144Hz, 6000mAh Battery)",
      "category": "Smart Mobiles",
      "price": 38999.0,
      "vendor_id": 9,
      "stock_quantity": 40,
      "reorder_threshold": 10,
      "stock": "In Stock",
      "image_url": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800",
      "rating": 4.8,
      "units_sold": 290,
      "source": "VoltX Direct"
    },
    {
      "id": 6,
      "name": "SonicPods Pro ANC Wireless Earbuds (45dB Hybrid ANC, 40h Playtime)",
      "category": "Mobile Accessories",
      "price": 4999.0,
      "vendor_id": 9,
      "stock_quantity": 85,
      "reorder_threshold": 15,
      "stock": "In Stock",
      "image_url": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
      "rating": 4.9,
      "units_sold": 740,
      "source": "VoltX Direct"
    },
    {
      "id": 7,
      "name": "HyperCharge 120W GaN Fast Charger (Dual USB-C PD 3.1 + USB-A)",
      "category": "Mobile Accessories",
      "price": 2999.0,
      "vendor_id": 9,
      "stock_quantity": 110,
      "reorder_threshold": 20,
      "stock": "In Stock",
      "image_url": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800",
      "rating": 4.9,
      "units_sold": 1120,
      "source": "VoltX Direct"
    },
    {
      "id": 8,
      "name": "MagShield Armor Case & Kickstand (Mil-Grade Drop Protection)",
      "category": "Mobile Accessories",
      "price": 1499.0,
      "vendor_id": 9,
      "stock_quantity": 140,
      "reorder_threshold": 25,
      "stock": "In Stock",
      "image_url": "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800",
      "rating": 4.8,
      "units_sold": 960,
      "source": "VoltX Direct"
    },
    {
      "id": 9,
      "name": "Wireless Qi2 15W Magnetic Power Bank (10,000mAh Slim Pack)",
      "category": "Mobile Accessories",
      "price": 3499.0,
      "vendor_id": 9,
      "stock_quantity": 70,
      "reorder_threshold": 15,
      "stock": "In Stock",
      "image_url": "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=800",
      "rating": 4.8,
      "units_sold": 640,
      "source": "VoltX Direct"
    },
    {
      "id": 10,
      "name": "Smart Stylus Pen (Palm Rejection & 4096 Pressure Levels)",
      "category": "Mobile Accessories",
      "price": 2499.0,
      "vendor_id": 9,
      "stock_quantity": 65,
      "reorder_threshold": 15,
      "stock": "In Stock",
      "image_url": "https://images.unsplash.com/photo-1585336261024-64945a0b771e?w=800",
      "rating": 4.7,
      "units_sold": 380,
      "source": "VoltX Direct"
    },
    {
      "id": 11,
      "name": "Dual-Driver Hi-Res Type-C Earphones (DAC Chip Built-in)",
      "category": "Mobile Accessories",
      "price": 1299.0,
      "vendor_id": 9,
      "stock_quantity": 120,
      "reorder_threshold": 20,
      "stock": "In Stock",
      "image_url": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800",
      "rating": 4.7,
      "units_sold": 850,
      "source": "VoltX Direct"
    },
    {
      "id": 12,
      "name": "Ultra-Clear 9H Tempered Glass Screen Guard (Auto-Alignment Kit)",
      "category": "Mobile Accessories",
      "price": 799.0,
      "vendor_id": 9,
      "stock_quantity": 200,
      "reorder_threshold": 30,
      "stock": "In Stock",
      "image_url": "https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=800",
      "rating": 4.9,
      "units_sold": 1430,
      "source": "VoltX Direct"
    }
  ]
};

const STORAGE_KEY = "shopsense_vendor_products_v5";

function Products() {
  const navigate = useNavigate();

  // Read authenticated session from localStorage
  const rawVendorId = localStorage.getItem("vendorId") || "";
  const vendorStoreName = localStorage.getItem("vendorStoreName") || "";
  const userEmail = localStorage.getItem("userEmail") || "";
  const displayName = localStorage.getItem("displayName") || "";

  const [vendorConfigs, setVendorConfigs] = useState(DEFAULT_VENDOR_CONFIGS);

  // Canonical active vendor key
  const [selectedVendorKey, setSelectedVendorKey] = useState(() => {
    return normalizeVendorKey(vendorStoreName || userEmail || displayName || rawVendorId, DEFAULT_VENDOR_CONFIGS) || "voltx";
  });

  const activeVendorKey = selectedVendorKey;
  const activeVendor = vendorConfigs[activeVendorKey] || vendorConfigs.voltx || DEFAULT_VENDOR_CONFIGS.voltx;

  // Initialize state from localStorage or initial baseline
  const [productsMap, setProductsMap] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          voltx: parsed.voltx || INITIAL_VENDOR_PRODUCTS.voltx,
          techworld: parsed.techworld || INITIAL_VENDOR_PRODUCTS.techworld,
          stylehub: parsed.stylehub || INITIAL_VENDOR_PRODUCTS.stylehub,
          modernhome: parsed.modernhome || INITIAL_VENDOR_PRODUCTS.modernhome,
          gadgetcentral: parsed.gadgetcentral || INITIAL_VENDOR_PRODUCTS.gadgetcentral,
          greenearth: parsed.greenearth || [],
          ...parsed
        };
      }
    } catch {
      // Fallback
    }
    return INITIAL_VENDOR_PRODUCTS;
  });

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [autoSimActive, setAutoSimActive] = useState(false);
  const [simulationLog, setSimulationLog] = useState("");


  const [newProduct, setNewProduct] = useState({
    name: "",
    category: activeVendor.defaultCategory,
    price: "",
    stock: "In Stock",
    stock_quantity: 45,
    reorder_threshold: 10,
    description: "",
    image_url: ""
  });

  // Fetch backend products and merge cleanly
  const fetchProductsList = async () => {
    try {
      const [data, dbVendors] = await Promise.all([
        getProducts(),
        getVendors().catch(() => [])
      ]);

      let currentConfigs = vendorConfigs;
      if (Array.isArray(dbVendors) && dbVendors.length > 0) {
        currentConfigs = buildVendorMap(dbVendors);
        setVendorConfigs(currentConfigs);
      }

      if (Array.isArray(data) && data.length > 0) {
        setProductsMap((prev) => {
          const updated = {
            voltx: [...(prev?.voltx || INITIAL_VENDOR_PRODUCTS.voltx || [])],
            techworld: [...(prev?.techworld || INITIAL_VENDOR_PRODUCTS.techworld || [])],
            stylehub: [...(prev?.stylehub || INITIAL_VENDOR_PRODUCTS.stylehub || [])],
            modernhome: [...(prev?.modernhome || INITIAL_VENDOR_PRODUCTS.modernhome || [])],
            gadgetcentral: [...(prev?.gadgetcentral || INITIAL_VENDOR_PRODUCTS.gadgetcentral || [])],
            greenearth: [...(prev?.greenearth || [])],
            ...(prev || {})
          };

          data.forEach((p) => {
            const vKey = normalizeVendorKey(p.vendor_id || (p.vendor && p.vendor.name) || p.name || p.category, currentConfigs) || "voltx";
            if (!Array.isArray(updated[vKey])) {
              updated[vKey] = [];
            }
            const existingIdx = updated[vKey].findIndex((x) => x && (x.id === p.id || x.name === p.name));
            if (existingIdx >= 0) {
              updated[vKey][existingIdx] = {
                ...updated[vKey][existingIdx],
                ...p,
                stock: p.stock || "In Stock",
                stock_quantity: p.stock_quantity !== undefined ? p.stock_quantity : updated[vKey][existingIdx]?.stock_quantity
              };
            } else {
              updated[vKey] = [p, ...updated[vKey]];
            }
          });

          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
      }
    } catch {
      // Fallback to initial products
    }
  };

  // Simulation handler with real-time broadcasting to Customer Platform
  const handleSimulate = async (actionType) => {
    setIsSimulating(true);
    try {
      const res = await simulateInventoryAction(actionType, activeVendor.dbId);
      if (res && res.status === "success") {
        setSimulationLog(res.message);
        toast.success(res.message);

        // Fetch fresh backend data to update state
        await fetchProductsList();

        // Broadcast to customer platform & other tabs
        try {
          const syncChannel = new BroadcastChannel("shopsense_live_sync");
          syncChannel.postMessage({
            type: actionType === "simulate_new_product_release" ? "PRODUCT_ADDED" : "STOCK_UPDATED",
            product: res.product || null,
            action: actionType,
            timestamp: Date.now()
          });
          syncChannel.close();
        } catch {}
        localStorage.setItem("shopsense_last_product_update", Date.now().toString());
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new Event("productUpdated"));
      } else {
        toast.error(res?.message || "Simulation failed");
      }
    } catch {
      toast.error("Simulation error occurred");
    } finally {
      setIsSimulating(false);
    }
  };

  // Auto-simulation ticker effect
  useEffect(() => {
    if (!autoSimActive) return;
    const actions = ["simulate_customer_purchase", "simulate_restock_cycle", "simulate_new_product_release"];
    let step = 0;
    const ticker = setInterval(async () => {
      const act = actions[step % actions.length];
      step++;
      await handleSimulate(act);
    }, 20000);
    return () => clearInterval(ticker);
  }, [autoSimActive, activeVendor]);

  useEffect(() => {
    fetchProductsList();

    const handleDataChanged = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          setProductsMap(JSON.parse(saved));
        }
      } catch {
        // Fallback
      }
    };

    window.addEventListener("storage", handleDataChanged);
    window.addEventListener("inventoryUpdated", handleDataChanged);

    return () => {
      window.removeEventListener("storage", handleDataChanged);
      window.removeEventListener("inventoryUpdated", handleDataChanged);
    };
  }, []);

  // Products belonging STRICTLY AND ONLY to the logged in vendor
  const vendorProducts = useMemo(() => {
    const rawList = productsMap[activeVendorKey] || INITIAL_VENDOR_PRODUCTS[activeVendorKey] || [];
    return rawList.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [productsMap, activeVendorKey, search, selectedCategory]);

  // Category-based authentic real-world photography fallback
  const getProductCategoryFallback = (cat = "") => {
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

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) {
      toast.error("Please enter valid product name and price");
      return;
    }

    const calculatedQty =
      newProduct.stock === "No Stock"
        ? 0
        : newProduct.stock === "Low Stock"
        ? 3
        : parseInt(newProduct.stock_quantity, 10) || 45;

    const finalImageUrl = (newProduct.image_url && newProduct.image_url.trim()) || getProductCategoryFallback(newProduct.category);

    let createdProduct = {
      id: Date.now(),
      name: newProduct.name,
      category: newProduct.category || activeVendor.defaultCategory,
      price: parseFloat(newProduct.price),
      vendor_id: activeVendor.dbId,
      stock: newProduct.stock,
      stock_quantity: calculatedQty,
      reorder_threshold: parseInt(newProduct.reorder_threshold, 10) || 10,
      description: newProduct.description || `${newProduct.name} - Official listing from ${activeVendor.name}`,
      image_url: finalImageUrl
    };

    try {
      const apiRes = await createProduct(createdProduct);
      if (apiRes && apiRes.id) {
        createdProduct = { ...apiRes, stock: newProduct.stock, stock_quantity: calculatedQty, image_url: finalImageUrl };
      }
    } catch {
      // Offline fallback
    }

    setProductsMap((prev) => {
      const updated = {
        ...prev,
        [activeVendorKey]: [createdProduct, ...(prev[activeVendorKey] || [])]
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    // Broadcast real-time live sync signal across tabs and windows
    localStorage.setItem("shopsense_last_product_update", Date.now().toString());
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("inventoryUpdated"));
    window.dispatchEvent(new Event("productUpdated"));
    try {
      const syncChannel = new BroadcastChannel("shopsense_live_sync");
      syncChannel.postMessage({ type: "PRODUCT_ADDED", product: createdProduct });
      syncChannel.close();
    } catch {}

    toast.success(`🎉 Product added to ${activeVendor.name}!`);
    setShowModal(false);
    setNewProduct({
      name: "",
      category: activeVendor.defaultCategory,
      price: "",
      stock: "In Stock",
      stock_quantity: 45,
      reorder_threshold: 10,
      description: "",
      image_url: ""
    });
  };

  const handleScanQrPreset = (preset) => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setNewProduct({
        name: preset.name,
        category: preset.category,
        price: preset.price.toString(),
        stock: preset.stock,
        stock_quantity: preset.stock === "No Stock" ? 0 : preset.stock === "Low Stock" ? 3 : 50,
        reorder_threshold: 10
      });
      setShowQrModal(false);
      setShowModal(true);
      toast.success(`QR Code Scanned! Loaded details for ${preset.name}`);
    }, 1000);
  };

  // LIVE SYNCHRONIZATION: Change stock status & compute live quantity
  const updateStockStatus = async (productId, newStockStatus) => {
    const newQty =
      newStockStatus === "No Stock"
        ? 0
        : newStockStatus === "Low Stock"
        ? 3
        : 45;

    setProductsMap((prev) => {
      const updatedList = (prev[activeVendorKey] || []).map((p) =>
        p.id === productId
          ? {
              ...p,
              stock: newStockStatus,
              stock_quantity: newQty
            }
          : p
      );
      const updatedMap = {
        ...prev,
        [activeVendorKey]: updatedList
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMap));
      return updatedMap;
    });

    try {
      await updateProductStock(productId, {
        stock_quantity: newQty,
        stock: newStockStatus
      });
    } catch {
      // Fallback
    }

    toast.info(`Updated stock status to '${newStockStatus}' (${newQty} units)`);
    window.dispatchEvent(new Event("inventoryUpdated"));
    window.dispatchEvent(new Event("productUpdated"));
    window.dispatchEvent(new Event("storage"));
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      toast.info("Product removed from vendor catalog");
    } catch {
      toast.info("Product removed locally");
    }

    setProductsMap((prev) => {
      const updatedList = (prev[activeVendorKey] || []).filter(p => p.id !== id);
      const updatedMap = {
        ...prev,
        [activeVendorKey]: updatedList
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMap));
      return updatedMap;
    });

    localStorage.setItem("shopsense_last_product_update", Date.now().toString());
    window.dispatchEvent(new Event("inventoryUpdated"));
    window.dispatchEvent(new Event("productUpdated"));
    window.dispatchEvent(new Event("storage"));
    try {
      const syncChannel = new BroadcastChannel("shopsense_live_sync");
      syncChannel.postMessage({ type: "PRODUCT_DELETED", productId: id });
      syncChannel.close();
    } catch {}
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
      <Header
        title={`${activeVendor.name} — Product Inventory`}
        subtitle={`Strictly isolated catalog for ${activeVendor.name} (Proprietor: ${activeVendor.owner})`}
      />


      {/* ========================================================================= */}
      {/* LOGGED-IN VENDOR STORE IDENTITY BANNER                                    */}
      {/* ========================================================================= */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: `1.5px solid ${activeVendor.color}60`,
          borderRadius: "18px",
          padding: "22px 26px",
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          boxShadow: `0 8px 25px ${activeVendor.color}22`
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "16px",
              background: `${activeVendor.color}22`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2.2rem"
            }}
          >
            {activeVendor.icon}
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-main)", margin: 0 }}>
                {activeVendor.name} Storefront
              </h2>
              <span
                style={{
                  background: "rgba(16, 185, 129, 0.15)",
                  color: "#10B981",
                  fontSize: "0.76rem",
                  fontWeight: 800,
                  padding: "4px 10px",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <FiCheckCircle /> Verified Merchant Partner
              </span>
              <span style={{ fontSize: "0.82rem", color: "#F59E0B", fontWeight: 700 }}>
                ★ {activeVendor.rating} Rating
              </span>
            </div>

            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
              <strong>Proprietor:</strong> {activeVendor.owner} • <strong>Exclusive Selling Domain:</strong> {activeVendor.domain}
            </p>
          </div>
        </div>

        {/* Action Controls: Add Product & Store Promotion */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <button
            className="btn btn-secondary"
            onClick={() => {
              const isLive = localStorage.getItem("flashSaleLive") === "true";
              if (isLive) {
                localStorage.removeItem("flashSaleLive");
                localStorage.removeItem("flashSaleExpiry");
                toast.info("Live 24h Flash Sales disabled for your store");
              } else {
                localStorage.setItem("flashSaleLive", "true");
                localStorage.setItem("flashSaleExpiry", Date.now() + 24 * 60 * 60 * 1000);
                toast.success("🔥 24h Flash Sales is now LIVE!");
              }
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 16px",
              borderRadius: "10px",
              border: "1px solid #F59E0B",
              background: "rgba(245, 158, 11, 0.1)",
              color: "#F59E0B",
              fontSize: "0.84rem",
              fontWeight: 800,
              cursor: "pointer"
            }}
            title="Enable global 24h flash sale discount"
          >
            🔥 Toggle 24h Flash Sale
          </button>

          <button
            className="btn btn-primary"
            onClick={() => {
              setNewProduct({
                name: "",
                category: activeVendor.defaultCategory,
                price: "",
                stock: "In Stock",
                stock_quantity: 45,
                reorder_threshold: 10
              });
              setShowModal(true);
            }}
            style={{ background: activeVendor.color, fontWeight: 800, padding: "10px 18px" }}
          >
            <FiPlus /> Add {activeVendor.name.split(" ")[0]} Product
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. REAL-WORLD MARKET & PRODUCT LIFECYCLE SIMULATION CONTROL CENTER         */}
      {/* ========================================================================= */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)",
          border: "1px solid #3B82F6",
          borderRadius: "18px",
          padding: "20px 24px",
          marginBottom: "26px",
          boxShadow: "0 8px 30px rgba(59, 130, 246, 0.15)"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "14px",
            marginBottom: "16px",
            borderBottom: "1px solid #334155",
            paddingBottom: "14px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                background: "rgba(59, 130, 246, 0.2)",
                color: "#60A5FA",
                padding: "10px",
                borderRadius: "12px",
                fontSize: "1.4rem"
              }}
            >
              <FiActivity />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#FFFFFF" }}>
                  Real-World Market & Product Lifecycle Simulation
                </h3>
                <span
                  style={{
                    background: autoSimActive ? "#10B981" : "#475569",
                    color: "#FFF",
                    fontSize: "0.68rem",
                    fontWeight: 800,
                    padding: "2px 8px",
                    borderRadius: "6px"
                  }}
                >
                  {autoSimActive ? "LIVE TICKER ACTIVE (20s)" : "MANUAL MODE"}
                </span>
              </div>
              <p style={{ margin: "3px 0 0 0", fontSize: "0.8rem", color: "#94A3B8" }}>
                Simulate weekly new product releases, fast customer purchases (low/no stock), and automated vendor replenishment synced live to Customer Platform.
              </p>
            </div>
          </div>

          {/* Auto-Simulation Ticker Toggle */}
          <button
            type="button"
            onClick={() => {
              setAutoSimActive(!autoSimActive);
              toast.info(
                autoSimActive
                  ? "⏸️ Auto-simulation ticker paused."
                  : "▶️ Auto-simulation ticker active: Live market releases and stock changes running every 20s!"
              );
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              borderRadius: "8px",
              border: autoSimActive ? "1px solid #10B981" : "1px solid #475569",
              background: autoSimActive ? "rgba(16, 185, 129, 0.15)" : "#1E293B",
              color: autoSimActive ? "#34D399" : "#94A3B8",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            <FiPlay /> {autoSimActive ? "Pause Auto-Simulation" : "Start Auto-Simulation Ticker"}
          </button>
        </div>

        {/* 1-Click Simulation Triggers */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <button
            type="button"
            disabled={isSimulating}
            onClick={() => handleSimulate("simulate_new_product_release")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 16px",
              borderRadius: "8px",
              border: "1px solid #10B981",
              background: "rgba(16, 185, 129, 0.15)",
              color: "#34D399",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: isSimulating ? "not-allowed" : "pointer"
            }}
          >
            <FiZap /> 🚀 Release New Market Product
          </button>

          <button
            type="button"
            disabled={isSimulating}
            onClick={() => handleSimulate("simulate_customer_purchase")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 16px",
              borderRadius: "8px",
              border: "1px solid #EF4444",
              background: "rgba(239, 68, 68, 0.15)",
              color: "#F87171",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: isSimulating ? "not-allowed" : "pointer"
            }}
          >
            <FiTrendingDown /> 📉 Customer Sales Wave (Deplete Stock)
          </button>

          <button
            type="button"
            disabled={isSimulating}
            onClick={() => handleSimulate("simulate_restock_cycle")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 16px",
              borderRadius: "8px",
              border: "1px solid #3B82F6",
              background: "rgba(59, 130, 246, 0.15)",
              color: "#60A5FA",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: isSimulating ? "not-allowed" : "pointer"
            }}
          >
            <FiRefreshCw className={isSimulating ? "loading-spin" : ""} /> 🔄 Vendor Reorder & Restock All
          </button>

          <button
            type="button"
            disabled={isSimulating}
            onClick={() => handleSimulate("simulate_full_lifecycle")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 16px",
              borderRadius: "8px",
              border: "1px solid #F59E0B",
              background: "rgba(245, 158, 11, 0.15)",
              color: "#FBBF24",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: isSimulating ? "not-allowed" : "pointer"
            }}
          >
            ⚡ Run Full Lifecycle Market Cycle
          </button>
        </div>

        {simulationLog && (
          <div
            style={{
              marginTop: "14px",
              padding: "9px 14px",
              background: "rgba(0, 0, 0, 0.4)",
              borderRadius: "8px",
              fontSize: "0.8rem",
              color: "#38BDF8",
              border: "1px solid #1E293B"
            }}
          >
            📡 <strong>Live Market Broadcast:</strong> {simulationLog}
          </div>
        )}
      </div>

      {/* Toolbar & Filters within Active Vendor's Exclusive Domain */}
      <div className="chart-card" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "12px", flex: 1, minWidth: "280px" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <FiSearch
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)"
                }}
              />
              <input
                type="text"
                placeholder={`Search ${activeVendor.name} items or categories...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "11px 14px 11px 40px",
                  borderRadius: "10px",
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-primary)",
                  color: "var(--text-main)",
                  fontSize: "0.9rem",
                  outline: "none"
                }}
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: "11px 16px",
                borderRadius: "10px",
                border: "1px solid var(--border-color)",
                background: "var(--bg-primary)",
                color: "var(--text-main)",
                fontSize: "0.85rem",
                fontWeight: 600,
                outline: "none",
                cursor: "pointer"
              }}
            >
              {activeVendor.categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "All" ? `All ${activeVendor.name.split(" ")[0]} Categories` : cat}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            {/* Scan QR Button */}
            <button
              className="btn btn-secondary"
              onClick={() => setShowQrModal(true)}
              style={{
                background: "rgba(16, 185, 129, 0.1)",
                color: "#10B981",
                border: "1px solid rgba(16, 185, 129, 0.3)"
              }}
            >
              <FiCamera /> Scan QR Code
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
              style={{ background: activeVendor.color }}
            >
              <FiPlus /> Add Product
            </button>
          </div>
        </div>
      </div>

      {/* Products Table (Strictly showing only active vendor's items) */}
      <div className="chart-card">
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product Name</th>
                <th>Product Category</th>
                <th>Vendor Store</th>
                <th>Price ($)</th>
                <th>Stock Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendorProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "36px", color: "var(--text-muted)" }}>
                    No products found in {activeVendor.name}&apos;s catalog matching the filter.
                  </td>
                </tr>
              ) : (
                vendorProducts.map((product, index) => (
                  <tr key={product.id || index}>
                    <td style={{ fontWeight: 800, color: "var(--primary-blue)" }}>#{index + 1}</td>
                    <td style={{ fontWeight: 700, color: "var(--text-main)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            style={{
                              width: "38px",
                              height: "38px",
                              borderRadius: "8px",
                              objectFit: "contain",
                              background: "var(--bg-primary)",
                              border: "1px solid var(--border-color)",
                              padding: "2px",
                              flexShrink: 0
                            }}
                          />
                        )}
                        <div>
                          <div>{product.name}</div>
                          {product.source && (
                            <span style={{ fontSize: "0.68rem", fontWeight: "700", color: "var(--accent-cyan)", opacity: 0.85 }}>
                              {product.source === "Amazon" ? "📦 Amazon Sourced" : product.source === "Flipkart" ? "⚡ Flipkart Sourced" : "🌐 Google Sourced"}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info">{product.category}</span>
                    </td>

                    {/* Dedicated Vendor Tag */}
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "1.1rem" }}>{activeVendor.icon}</span>
                        <div>
                          <strong style={{ display: "block", color: "var(--text-main)", fontSize: "0.85rem" }}>
                            {activeVendor.name}
                          </strong>
                          <span style={{ fontSize: "0.72rem", color: activeVendor.color, fontWeight: 700 }}>
                            {activeVendor.domain.split(",")[0]}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td style={{ fontWeight: 800, color: activeVendor.color, fontSize: "0.95rem" }}>
                      ₹{parseFloat(product.price).toLocaleString("en-IN")}
                    </td>

                    <td>
                      {/* Interactive Stock Status Dropdown */}
                      <select
                        value={product.stock || "In Stock"}
                        onChange={(e) => updateStockStatus(product.id, e.target.value)}
                        style={{
                          padding: "6px 10px",
                          borderRadius: "6px",
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          border: "none",
                          cursor: "pointer",
                          background:
                            product.stock === "In Stock" || !product.stock
                              ? "rgba(16, 185, 129, 0.15)"
                              : product.stock === "Low Stock"
                              ? "rgba(245, 158, 11, 0.15)"
                              : "rgba(239, 68, 68, 0.15)",
                          color:
                            product.stock === "In Stock" || !product.stock
                              ? "#10B981"
                              : product.stock === "Low Stock"
                              ? "#F59E0B"
                              : "#EF4444",
                          outline: "none"
                        }}
                      >
                        <option value="In Stock">In Stock</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="No Stock">No Stock</option>
                      </select>
                    </td>

                    <td>
                      <button
                        className="btn btn-danger"
                        style={{ padding: "6px 10px", fontSize: "0.8rem" }}
                        onClick={() => handleDelete(product.id)}
                        title="Delete product"
                      >
                        <FiTrash2 /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Code Scanner Modal */}
      <AnimatePresence>
        {showQrModal && (
          <div className="modal-overlay">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="modal-card"
              style={{ maxWidth: "540px", textAlign: "center" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
                  <FiCamera style={{ color: "#10B981" }} /> Scan {activeVendor.name} QR Code
                </h3>
                <button
                  onClick={() => setShowQrModal(false)}
                  style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "1.2rem", cursor: "pointer" }}
                >
                  <FiX />
                </button>
              </div>

              {/* Viewfinder simulation */}
              <div
                style={{
                  height: "180px",
                  background: "#0F172A",
                  borderRadius: "12px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  border: "2px dashed #10B981",
                  overflow: "hidden",
                  marginBottom: "16px"
                }}
              >
                {isScanning ? (
                  <div style={{ color: "#10B981", fontWeight: 700 }}>
                    <FiMaximize2 className="animate-spin" style={{ fontSize: "2rem", marginBottom: "8px" }} />
                    <p style={{ margin: 0 }}>Decoding Barcode Telemetry...</p>
                  </div>
                ) : (
                  <div style={{ color: "#94A3B8" }}>
                    <FiCamera style={{ fontSize: "2.5rem", marginBottom: "8px", color: "#64748B" }} />
                    <p style={{ margin: 0, fontSize: "0.85rem" }}>Align physical barcode or choose sample below</p>
                  </div>
                )}
              </div>

              {/* Sample QR presets */}
              <div style={{ textAlign: "left" }}>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "8px", fontWeight: 600 }}>
                  Quick Demonstration Barcodes:
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {INITIAL_VENDOR_PRODUCTS[activeVendorKey].slice(0, 3).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleScanQrPreset(item)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "8px",
                        background: "var(--bg-primary)",
                        border: "1px solid var(--border-color)",
                        color: "var(--text-main)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                        textAlign: "left"
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{item.name.substring(0, 45)}...</span>
                      <span style={{ color: activeVendor.color, fontWeight: 700 }}>₹{item.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="modal-card"
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>
                  Add Product to {activeVendor.name}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "1.2rem", cursor: "pointer" }}
                >
                  <FiX />
                </button>
              </div>

              <form onSubmit={handleAddProduct} className="auth-form" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div className="form-group">
                  <label>Product Name (Enter only the product name, do not add display name)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Quantum Fold 5G Ultra, Wireless Earbuds, Silk Blazer..."
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Category (Strictly within {activeVendor.name})</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                      background: "var(--bg-primary)",
                      color: "var(--text-main)"
                    }}
                  >
                    {activeVendor.categories
                      .filter((c) => c !== "All")
                      .map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="29.99"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Initial Stock Status</label>
                  <select
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                      background: "var(--bg-primary)",
                      color: "var(--text-main)"
                    }}
                  >
                    <option value="In Stock">In Stock (45 Units)</option>
                    <option value="Low Stock">Low Stock (3 Units)</option>
                    <option value="No Stock">No Stock (0 Units)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Product Image URL (Optional - Real-World Photography)</label>
                  <input
                    type="url"
                    placeholder="https://... (Amazon, Flipkart or Google Shopping image URL)"
                    value={newProduct.image_url}
                    onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                  />
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center", marginTop: "4px" }}>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>⚡ Presets:</span>
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
                          background: newProduct.image_url === preset.url ? activeVendor.color : "rgba(255, 255, 255, 0.08)",
                          border: "1px solid var(--border-color)",
                          color: "var(--text-main)",
                          padding: "2px 7px",
                          borderRadius: "6px",
                          fontSize: "0.7rem",
                          cursor: "pointer"
                        }}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "3px" }}>
                    💡 If empty, an authentic real-world photo will automatically be assigned based on the category.
                  </div>
                </div>

                <div className="form-group">
                  <label>Product Description</label>
                  <textarea
                    rows={2}
                    placeholder="Key specifications, fabric details, or tech features..."
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                      background: "var(--bg-primary)",
                      color: "var(--text-main)"
                    }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ background: activeVendor.color }}
                  >
                    Save Product
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default Products;