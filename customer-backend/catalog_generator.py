import random
from typing import Dict, Any, List
from sqlalchemy.orm import Session
try:
    import models
except ImportError:
    try:
        from app import models
    except ImportError:
        from . import models

DOMAIN_CATALOG_TEMPLATES: Dict[str, List[Dict[str, Any]]] = {
    "voltx": [
        {
            "name": "Quantum Fold 5G AI Ultra (Dual 165Hz AMOLED, Snapdragon 8 Gen 3)",
            "category": "Smart Mobiles",
            "price": 89999.0,
            "stock_quantity": 40,
            "reorder_threshold": 10,
            "description": "Revolutionary zero-gap titanium fold with integrated generative AI copilot, 200MP periscope zoom, and stylus dock.",
            "image_url": "https://m.media-amazon.com/images/I/61QrXjeSooL._AC_SL1500_.jpg"
        },
        {
            "name": "CyberBand 2 Pro (AMOLED Always-On, ECG, 14-Day Battery)",
            "category": "Mobile Accessories",
            "price": 5999.0,
            "stock_quantity": 75,
            "reorder_threshold": 15,
            "description": "Next-gen smart health companion with sapphire crystal display, dual-frequency GPS, and seamless smartphone synchronization.",
            "image_url": "https://m.media-amazon.com/images/I/61SUj2aKoEL._AC_SL1500_.jpg"
        },
        {
            "name": "MagPod 3-in-1 Qi2 Fast Wireless Charging Stand (15W Magnetic)",
            "category": "Mobile Accessories",
            "price": 3999.0,
            "stock_quantity": 90,
            "reorder_threshold": 20,
            "description": "Aircraft-grade aluminum multi-device charging stand. Simultaneously fast-charges mobile, earbuds, and smartwatch.",
            "image_url": "https://m.media-amazon.com/images/I/61jbc6Bv6aL._AC_SL1500_.jpg"
        },
        {
            "name": "SoundWave 360 Spatial ANC Bluetooth Speaker",
            "category": "Mobile Accessories",
            "price": 3499.0,
            "stock_quantity": 65,
            "reorder_threshold": 12,
            "description": "360-degree room-filling acoustic audio with dual passive bass radiators, IP67 waterproof armor, and 24-hour battery life.",
            "image_url": "https://m.media-amazon.com/images/I/71bhWgQK-CL._AC_SL1500_.jpg"
        },
        {
            "name": "Apex Pro Camera Gimbal Stabilizer with AI Object Tracking",
            "category": "Mobile Accessories",
            "price": 7499.0,
            "stock_quantity": 45,
            "reorder_threshold": 10,
            "description": "Professional 3-axis motorized smartphone gimbal with magnetic clamp, wireless focus dial, and AI gesture face tracking.",
            "image_url": "https://m.media-amazon.com/images/I/51qZq-d2hWL._AC_SL1500_.jpg"
        }
    ],
    "techworld": [
        {
            "name": "StudioVision 8K Quantum Dot OLED Monitor (32-inch 240Hz 0.03ms)",
            "category": "Displays",
            "price": 129999.0,
            "stock_quantity": 25,
            "reorder_threshold": 6,
            "description": "True 10-bit color reference display with 99.5% DCI-P3 gamut, Thunderbolt 4 96W PD, and ambient anti-glare coating.",
            "image_url": "https://m.media-amazon.com/images/I/71I2fkoBRCL._AC_SL1500_.jpg"
        },
        {
            "name": "AI UltraBook 16 (Snapdragon X Elite, 32GB RAM, 1TB SSD, 24h Battery)",
            "category": "Laptops & Computing",
            "price": 114999.0,
            "stock_quantity": 30,
            "reorder_threshold": 8,
            "description": "45 TOPS Neural Processing Unit laptop featuring CNC magnesium body, 3.2K 120Hz OLED screen, and Copilot+ AI accelerators.",
            "image_url": "https://m.media-amazon.com/images/I/614apPMGmLL._AC_SL1500_.jpg"
        },
        {
            "name": "ProStudio Spatial ANC Hi-Res Monitoring Headphones",
            "category": "Audio",
            "price": 24999.0,
            "stock_quantity": 55,
            "reorder_threshold": 12,
            "description": "Custom 50mm beryllium drivers, LDAC lossless codec, adaptive real-time acoustic calibration, and 60-hour playtime.",
            "image_url": "https://m.media-amazon.com/images/I/61ICqyoI2NL._AC_SL1500_.jpg"
        },
        {
            "name": "ThunderSpeed 4TB PCIe Gen5 NVMe M.2 Extreme Gaming SSD",
            "category": "Accessories",
            "price": 28999.0,
            "stock_quantity": 70,
            "reorder_threshold": 15,
            "description": "Blistering 14,500 MB/s sequential read speed with active graphene heatsink and thermal throttling defense.",
            "image_url": "https://m.media-amazon.com/images/I/51qZq-d2hWL._AC_SL1500_.jpg"
        },
        {
            "name": "MeshStream Wi-Fi 7 Tri-Band 19Gbps Whole-Home Router System",
            "category": "Accessories",
            "price": 32999.0,
            "stock_quantity": 40,
            "reorder_threshold": 10,
            "description": "Multi-Link Operation (MLO) 320MHz bandwidth router capable of simultaneous 200+ IoT 8K streaming devices.",
            "image_url": "https://m.media-amazon.com/images/I/61jbc6Bv6aL._AC_SL1500_.jpg"
        }
    ],
    "stylehub": [
        {
            "name": "Signature Italian Merino Wool Double-Breasted Winter Overcoat",
            "category": "Men's Wear",
            "price": 16999.0,
            "stock_quantity": 40,
            "reorder_threshold": 10,
            "description": "Hand-stitched 100% fine Italian Merino wool coat with cupro satin lining and genuine horn buttons.",
            "image_url": "https://m.media-amazon.com/images/I/71bhWgQK-CL._AC_SL1500_.jpg"
        },
        {
            "name": "Runway Mulberry Silk Bias-Cut Evening Gown (Midnight Emerald)",
            "category": "Women's Wear",
            "price": 14999.0,
            "stock_quantity": 35,
            "reorder_threshold": 8,
            "description": "Grade 6A 22-Momme pure mulberry silk dress draped with high side slit and adjustable criss-cross back.",
            "image_url": "https://m.media-amazon.com/images/I/71RVuBs3q9L._AC_.jpg"
        },
        {
            "name": "Heritage Goodyear-Welted Full-Grain Leather Chelsea Boots",
            "category": "Footwear & Sneakers",
            "price": 12999.0,
            "stock_quantity": 50,
            "reorder_threshold": 12,
            "description": "Artisanal hand-burnished calfskin leather upper, cork-filled midsole, and Vibram lug outsoles.",
            "image_url": "https://m.media-amazon.com/images/I/61bMJdgeryL._AC_SL1500_.jpg"
        },
        {
            "name": "Tokyo Streetwear 450GSM Heavyweight Fleece Oversized Hoodie",
            "category": "Men's Wear",
            "price": 4499.0,
            "stock_quantity": 80,
            "reorder_threshold": 20,
            "description": "Pre-shrunk combed organic cotton fleece featuring drop-shoulder relaxed silhouette and double-layered hood.",
            "image_url": "https://m.media-amazon.com/images/I/717Qo4MH97L.jpg"
        },
        {
            "name": "Vintage Distressed Full-Grain Cafe Racer Leather Biker Jacket",
            "category": "Outerwear",
            "price": 18999.0,
            "stock_quantity": 25,
            "reorder_threshold": 6,
            "description": "Top-grain cowhide leather treated with natural vegetable wax oils, brass YKK hardware, and quilted shoulder panels.",
            "image_url": "https://m.media-amazon.com/images/I/61+R6Q6xZRL._AC_SL1500_.jpg"
        }
    ],
    "modernhome": [
        {
            "name": "Zero-Gravity Dual-Motor Ergonomic Executive Workstation Desk",
            "category": "Standing Desks",
            "price": 64999.0,
            "stock_quantity": 20,
            "reorder_threshold": 5,
            "description": "Solid American Walnut desktop with integrated anti-collision gyroscope sensors, wireless charging pad, and cable management tray.",
            "image_url": "https://cdn.autonomous.ai/production/ecm/260109/thumb.webp"
        },
        {
            "name": "AirPure Max Dual-HEPA Formaldehyde Smart Air Purifier",
            "category": "Smart Home Appliances",
            "price": 38999.0,
            "stock_quantity": 30,
            "reorder_threshold": 8,
            "description": "Medical-grade H13 HEPA & catalytic honeycomb filters removing 99.97% of airborne PM0.1 particles and VOCs in real time.",
            "image_url": "https://m.media-amazon.com/images/I/61SJY5Gz5oL._AC_.jpg"
        },
        {
            "name": "CloudHaven Modular Italian Boucle 5-Seater Sectional Sofa",
            "category": "Living Room",
            "price": 89999.0,
            "stock_quantity": 12,
            "reorder_threshold": 3,
            "description": "High-resilience foam core encased in feather-down cushioning and stain-resistant textured boucle upholstery.",
            "image_url": "https://m.media-amazon.com/images/I/71VVk7m8aIL._AC_SL1500_.jpg"
        },
        {
            "name": "LuminaSmart Dynamic Circadian Rhythm Floor Lamp (App & Voice)",
            "category": "Smart Lighting",
            "price": 12999.0,
            "stock_quantity": 45,
            "reorder_threshold": 10,
            "description": "Biologically tuned lighting mimicking natural sunrise and sunset with 16 million colors and Matter smart home protocol.",
            "image_url": "https://m.media-amazon.com/images/I/51vfJ-ReYvL._AC_SL1001_.jpg"
        },
        {
            "name": "Solid Nordic White Oak 6-Seater Expandable Dining Table",
            "category": "Kitchen & Dining",
            "price": 45999.0,
            "stock_quantity": 18,
            "reorder_threshold": 4,
            "description": "FSC-certified European oak with effortless butterfly extension mechanism and durable matte polyurethane seal.",
            "image_url": "https://m.media-amazon.com/images/I/71zWmCnDvBL._AC_SL1500_.jpg"
        }
    ],
    "gadgetcentral": [
        {
            "name": "SkyScout 6K Dual-Camera Autonomous GPS Obstacle Avoidance Drone",
            "category": "Drones & Aerial",
            "price": 49999.0,
            "stock_quantity": 25,
            "reorder_threshold": 6,
            "description": "Omnidirectional binocular vision sensors, 1-inch CMOS sensor with 4K/120fps HDR video, and 45-minute flight time per battery.",
            "image_url": "https://m.media-amazon.com/images/I/61fh21u3DJL._AC_.jpg"
        },
        {
            "name": "ApexVR Mixed Reality 4K Micro-OLED Spatial Headset & Haptic Controllers",
            "category": "Gaming & VR",
            "price": 59999.0,
            "stock_quantity": 20,
            "reorder_threshold": 5,
            "description": "Dual 4K displays with pancake optics, eye-tracking foveated rendering, and sub-millimeter full-body spatial tracking.",
            "image_url": "https://m.media-amazon.com/images/I/51ZqjuoQFWL._AC_SY355_.jpg"
        },
        {
            "name": "CyberPup 3.0 AI Bionic Autonomous Quadruped Robot Pet",
            "category": "STEM Robotics",
            "price": 34999.0,
            "stock_quantity": 28,
            "reorder_threshold": 8,
            "description": "Equipped with 12 high-torque coreless motors, depth-sensing LiDAR, voice interaction, and Python SDK programmability.",
            "image_url": "https://m.media-amazon.com/images/I/61bMJdgeryL._AC_SL1500_.jpg"
        },
        {
            "name": "HyperSpeed 1/8 Scale Brushless 4WD 80km/h Stadium RC Truggy",
            "category": "RC Vehicles",
            "price": 27999.0,
            "stock_quantity": 35,
            "reorder_threshold": 8,
            "description": "Waterproof 2200KV brushless motor, aluminum chassis, steel CVD driveshafts, and 2.4GHz 4-channel telemetry transmitter.",
            "image_url": "https://m.media-amazon.com/images/I/717Qo4MH97L.jpg"
        },
        {
            "name": "MechMaster 6-DOF Programmable Metal Robotic Arm with Vision AI",
            "category": "STEM Robotics",
            "price": 18999.0,
            "stock_quantity": 40,
            "reorder_threshold": 10,
            "description": "Industrial-style aluminum alloy construction with robotic gripper, color-sorting camera, and ROS (Robot Operating System) support.",
            "image_url": "https://m.media-amazon.com/images/I/81vxWpPpgNL.jpg"
        }
    ],
    "greenearth": [
        {
            "name": "Cold-Pressed Virgin Organic Moringa Beauty & Wellness Oil (100ml)",
            "category": "Beauty & Health",
            "price": 1499.0,
            "stock_quantity": 90,
            "reorder_threshold": 20,
            "description": "100% pure organic moringa seed oil rich in vitamins A, C, and E for deep cellular hydration and skin barrier restoration.",
            "image_url": "https://images.unsplash.com/photo-1608248597359-07b13a375498?w=800"
        },
        {
            "name": "Pure Raw Wild Himalayan Forest Honey (Ceramic Jar 500g)",
            "category": "Organic & Grocery",
            "price": 1299.0,
            "stock_quantity": 80,
            "reorder_threshold": 15,
            "description": "Unpasteurized, unfiltered honey ethically harvested from high-altitude Himalayan flora, packed with natural bee enzymes.",
            "image_url": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800"
        },
        {
            "name": "Handcrafted Sustainable Bamboo Zero-Waste Kitchen & Dining Set",
            "category": "Eco Decor & Living",
            "price": 3499.0,
            "stock_quantity": 60,
            "reorder_threshold": 12,
            "description": "Natural organically grown moso bamboo cutting boards, cutlery, and salad bowls treated with food-grade plant oils.",
            "image_url": "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800"
        },
        {
            "name": "100% Handwoven Natural Organic Jute Fiber Living Room Rug (5x7 ft)",
            "category": "Eco Decor & Living",
            "price": 4999.0,
            "stock_quantity": 45,
            "reorder_threshold": 10,
            "description": "Artisan hand-loomed rustic floor covering crafted with biodegradable golden jute yarn for earthy sustainable interiors.",
            "image_url": "https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?w=800"
        },
        {
            "name": "Aromatherapy Ultrasonic Ceramic Mist Diffuser with 6 Essential Oils",
            "category": "Beauty & Health",
            "price": 2899.0,
            "stock_quantity": 70,
            "reorder_threshold": 15,
            "description": "Handmade stoneware ceramic essential oil diffuser with ambient warm LED glow and whisper-quiet ultrasonic atomization.",
            "image_url": "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800"
        }
    ]
}

def detect_vendor_domain(vendor_name: str, category: str = "", description: str = "") -> str:
    """Classifies a vendor into a primary product domain."""
    s = f"{vendor_name} {category} {description}".lower()
    if "voltx" in s or "mobile" in s or "phone" in s or "smartphone" in s:
        return "voltx"
    if "tech" in s or "electronic" in s or "laptop" in s or "computing" in s:
        return "techworld"
    if "fashion" in s or "cloth" in s or "wear" in s or "dress" in s or "style" in s or "shoe" in s or "sneaker" in s:
        return "stylehub"
    if "furniture" in s or "home" in s or "chair" in s or "desk" in s or "decor" in s or "living" in s:
        return "modernhome"
    if "toy" in s or "gadget" in s or "robot" in s or "drone" in s or "gaming" in s or "console" in s:
        return "gadgetcentral"
    if "organic" in s or "green" in s or "earth" in s or "eco" in s or "bio" in s or "grocery" in s or "nature" in s:
        return "greenearth"
    return "general"

def generate_simulated_product_for_vendor(vendor_obj: models.Vendor, db: Session) -> models.Product:
    """Generates a realistic new product release tailored to the vendor's actual domain without prepending display name."""
    domain = detect_vendor_domain(vendor_obj.name, getattr(vendor_obj, "category", "") or "")
    templates = DOMAIN_CATALOG_TEMPLATES.get(domain)

    if not templates:
        # Custom generated release for newly approved or general vendors (only product name, NO display name prepended)
        cat = getattr(vendor_obj, "category", "General Marketplace") or "Premium Goods"
        price = round(random.uniform(1499.0, 19999.0), 2)
        templates = [
            {
                "name": f"Signature Artisan Collection (Series {random.randint(2026, 2028)})",
                "category": cat,
                "price": price,
                "stock_quantity": random.randint(35, 60),
                "reorder_threshold": 10,
                "description": f"Certified official market product launch. Premium engineering, rigorous quality testing, and instant customer delivery.",
                "image_url": "https://m.media-amazon.com/images/I/81vxWpPpgNL.jpg"
            },
            {
                "name": "Pro Elite Edition (Certified Grade A)",
                "category": cat,
                "price": round(price * 1.35, 2),
                "stock_quantity": random.randint(40, 80),
                "reorder_threshold": 12,
                "description": f"Flagship premium merchandise certified by ShopSense Governance and distributed officially.",
                "image_url": "https://m.media-amazon.com/images/I/61bMJdgeryL._AC_SL1500_.jpg"
            }
        ]

    chosen = random.choice(templates)
    # Avoid exact duplicate names by adding series/batch if name already exists
    existing = db.query(models.Product).filter(models.Product.name == chosen["name"]).first()
    final_name = chosen["name"]
    if existing:
        final_name = f"{chosen['name']} (Series {random.randint(2, 9)})"

    new_prod = models.Product(
        name=final_name,
        category=chosen["category"],
        price=chosen["price"],
        stock="In Stock",
        stock_quantity=chosen["stock_quantity"],
        reorder_threshold=chosen["reorder_threshold"],
        units_sold=random.randint(15, 65),
        rating=round(random.uniform(4.7, 5.0), 1),
        description=f"{chosen['description']} - Official market release.",
        image_url=chosen["image_url"],
        vendor_id=vendor_obj.id
    )
    db.add(new_prod)
    db.commit()
    db.refresh(new_prod)
    return new_prod

def seed_starter_catalog_for_new_vendor(vendor_id: int, store_name: str, category: str, description: str, db: Session) -> List[models.Product]:
    """When a new vendor is approved by Chairman, seed an initial 4-product certified starter catalog without prepending display name."""
    domain = detect_vendor_domain(store_name, category, description)
    templates = DOMAIN_CATALOG_TEMPLATES.get(domain)
    
    if not templates:
        # Generate starter set based on applicant category (pure product names without store/display name)
        cat_clean = category if category and category != "string" else "General Store"
        templates = [
            {
                "name": "Essential Core Collection Item 1",
                "category": cat_clean,
                "price": 2499.0,
                "stock_quantity": 50,
                "reorder_threshold": 10,
                "description": "High-grade verified merchandise. Certified quality standard.",
                "image_url": "https://m.media-amazon.com/images/I/81vxWpPpgNL.jpg"
            },
            {
                "name": "Deluxe Pro Selection Item 2",
                "category": cat_clean,
                "price": 4999.0,
                "stock_quantity": 45,
                "reorder_threshold": 10,
                "description": "Premium edition release with manufacturer warranty and fast express fulfillment.",
                "image_url": "https://m.media-amazon.com/images/I/61bMJdgeryL._AC_SL1500_.jpg"
            },
            {
                "name": "Ultra Series Flagship Edition 3",
                "category": cat_clean,
                "price": 8999.0,
                "stock_quantity": 30,
                "reorder_threshold": 8,
                "description": "Top-tier certified release authorized by ShopSense Chairman Desk.",
                "image_url": "https://m.media-amazon.com/images/I/717Qo4MH97L.jpg"
            },
            {
                "name": "Signature Accessory Pack 4",
                "category": cat_clean,
                "price": 1499.0,
                "stock_quantity": 80,
                "reorder_threshold": 15,
                "description": "Official accessory bundle companion designed for performance.",
                "image_url": "https://m.media-amazon.com/images/I/51qZq-d2hWL._AC_SL1500_.jpg"
            }
        ]

    created_products = []
    for item in templates[:4]:
        existing = db.query(models.Product).filter(
            models.Product.name == item["name"],
            models.Product.vendor_id == vendor_id
        ).first()
        if not existing:
            p = models.Product(
                name=item["name"],
                category=item["category"],
                price=item["price"],
                stock="In Stock",
                stock_quantity=item["stock_quantity"],
                reorder_threshold=item["reorder_threshold"],
                units_sold=random.randint(10, 45),
                rating=round(random.uniform(4.7, 5.0), 1),
                description=f"{item['description']} - Certified inventory for {store_name}.",
                image_url=item["image_url"],
                vendor_id=vendor_id
            )
            db.add(p)
            created_products.append(p)
    
    db.commit()
    for p in created_products:
        db.refresh(p)
    return created_products
