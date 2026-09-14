import sqlite3
import urllib.request
import urllib.parse
import re
import json
import os

# Real-world product master catalog with categories, vendors, INR prices, real specs, and verified retail images from Amazon, Flipkart, and Google
REAL_PRODUCTS = [
    # -------------------------------------------------------------
    # 1. TechWorld Electronics (vendor_id = 4)
    # -------------------------------------------------------------
    {
        "name": "Samsung Galaxy S24 Ultra 5G (Titanium Gray, 12GB RAM, 512GB Storage)",
        "category": "Mobiles",
        "vendor_id": 4,
        "price": 139999.00,
        "stock_quantity": 45,
        "reorder_threshold": 10,
        "stock": "In Stock",
        "units_sold": 342,
        "rating": 4.9,
        "search_query": "Samsung Galaxy S24 Ultra Titanium Gray amazon",
        "source": "Amazon",
        "description": "Snapdragon 8 Gen 3 for Galaxy, Galaxy AI with Live Translate & Circle to Search, 200MP Quad Telephoto Camera with 100x Space Zoom. | Specs: 6.8-inch Dynamic AMOLED 2X 120Hz display (2600 nits), 12GB LPDDR5X RAM, 512GB UFS 4.0 storage, 5000mAh battery with 45W charging, Titanium frame, Corning Gorilla Armor, S-Pen included, IP68 water resistance, Dual Physical SIM + eSIM."
    },
    {
        "name": "Apple iPhone 16 Pro Max (Desert Titanium, 256GB)",
        "category": "Mobiles",
        "vendor_id": 4,
        "price": 144900.00,
        "stock_quantity": 38,
        "reorder_threshold": 8,
        "stock": "In Stock",
        "units_sold": 520,
        "rating": 4.9,
        "search_query": "Apple iPhone 16 Pro Max Desert Titanium amazon",
        "source": "Flipkart",
        "description": "A18 Pro chip with 6-core GPU, Apple Intelligence ready, Grade 5 Titanium design with Camera Control touch button, 48MP Fusion Camera with 5x Telephoto zoom. | Specs: 6.9-inch Super Retina XDR OLED 120Hz ProMotion display, 256GB NVMe storage, 4K 120 fps Dolby Vision video, Ceramic Shield front, USB-C 3 with 10Gbps speeds, Action button, MagSafe wireless charging."
    },
    {
        "name": "Apple iPhone 16 (Ultramarine Blue, 128GB)",
        "category": "Mobiles",
        "vendor_id": 4,
        "price": 79900.00,
        "stock_quantity": 55,
        "reorder_threshold": 12,
        "stock": "In Stock",
        "units_sold": 410,
        "rating": 4.8,
        "search_query": "Apple iPhone 16 Ultramarine Blue amazon",
        "source": "Amazon",
        "description": "A18 Bionic chip, Camera Control button, 48MP 2-in-1 Fusion camera system with macro photography, customizable Action button. | Specs: 6.1-inch Super Retina XDR OLED display, 128GB storage, aerospace-grade aluminum enclosure with color-infused glass back, IP68 water resistance, Dynamic Island, USB-C."
    },
    {
        "name": "Google Pixel 9 Pro XL AI (Obsidian, 16GB RAM, 128GB)",
        "category": "Mobiles",
        "vendor_id": 4,
        "price": 124999.00,
        "stock_quantity": 28,
        "reorder_threshold": 8,
        "stock": "In Stock",
        "units_sold": 185,
        "rating": 4.8,
        "search_query": "Google Pixel 9 Pro XL Obsidian amazon",
        "source": "Google Shopping",
        "description": "Google Tensor G4 processor with Gemini Live AI assistant, pro-tier triple camera with Super Res Zoom up to 30x, Video Boost with Night Sight. | Specs: 6.8-inch Super Actua LTPO OLED 120Hz (3000 nits peak), 16GB RAM, 128GB storage, 5060mAh battery with 37W fast charging, IP68 water resistance, 7 years of OS updates."
    },
    {
        "name": "OnePlus 12 5G (Flowy Emerald, 16GB RAM, 512GB)",
        "category": "Mobiles",
        "vendor_id": 4,
        "price": 69999.00,
        "stock_quantity": 42,
        "reorder_threshold": 10,
        "stock": "In Stock",
        "units_sold": 290,
        "rating": 4.8,
        "search_query": "OnePlus 12 Flowy Emerald amazon",
        "source": "Amazon",
        "description": "4th Gen Hasselblad Camera for Mobile with 64MP periscope telephoto, Snapdragon 8 Gen 3, 100W SUPERVOOC charging + 50W AIRVOOC. | Specs: 6.82-inch 2K ProXDR LTPO AMOLED 120Hz (4500 nits), 16GB LPDDR5X RAM, 512GB UFS 4.0, 5400mAh battery, Dual VC cooling system, Alert Slider, Dolby Vision."
    },
    {
        "name": "Samsung Galaxy Z Fold6 AI 5G (Phantom Silver, 256GB)",
        "category": "Mobiles",
        "vendor_id": 4,
        "price": 164999.00,
        "stock_quantity": 18,
        "reorder_threshold": 5,
        "stock": "In Stock",
        "units_sold": 115,
        "rating": 4.8,
        "search_query": "Samsung Galaxy Z Fold6 Silver amazon",
        "source": "Flipkart",
        "description": "Dual Dynamic AMOLED 2X screens with ultra-thin Armor Aluminum hinge, real-time AI interpreter, S-Pen support. | Specs: 7.6-inch inner QXGA+ foldable display (2600 nits), 6.3-inch cover display, Snapdragon 8 Gen 3 for Galaxy, 12GB RAM, 256GB storage, 4400mAh dual battery, 50MP triple camera, IP48 water resistance."
    },
    {
        "name": "Apple MacBook Pro M3 Max 16-inch (Space Black, 36GB RAM, 1TB SSD)",
        "category": "Laptops & Computing",
        "vendor_id": 4,
        "price": 319900.00,
        "stock_quantity": 15,
        "reorder_threshold": 4,
        "stock": "In Stock",
        "units_sold": 94,
        "rating": 4.9,
        "search_query": "Apple MacBook Pro M3 Max 16 Space Black amazon",
        "source": "Amazon",
        "description": "16-core CPU, 40-core GPU, Hardware-accelerated ray tracing, 128GB/s memory bandwidth, up to 22 hours battery life. | Specs: 16.2-inch Liquid Retina XDR display (1600 nits peak, 120Hz ProMotion), 36GB Unified Memory, 1TB NVMe SSD, 3x Thunderbolt 4 ports, HDMI, SDXC card slot, MagSafe 3 charging, 6-speaker sound system with Spatial Audio."
    },
    {
        "name": "Apple MacBook Air M3 13-inch (Midnight Blue, 16GB RAM, 512GB SSD)",
        "category": "Laptops & Computing",
        "vendor_id": 4,
        "price": 114900.00,
        "stock_quantity": 40,
        "reorder_threshold": 10,
        "stock": "In Stock",
        "units_sold": 380,
        "rating": 4.9,
        "search_query": "Apple MacBook Air M3 Midnight amazon",
        "source": "Flipkart",
        "description": "Strikingly thin aluminum design, dual external display support, 18-hour battery endurance, fanless silent operation. | Specs: 13.6-inch Liquid Retina display with True Tone, Apple M3 chip (8-core CPU, 10-core GPU, 16-core Neural Engine), 16GB Unified RAM, 512GB SSD, 1080p FaceTime HD camera, MagSafe 3, backlit Magic Keyboard with Touch ID."
    },
    {
        "name": "Dell XPS 15 9530 OLED Touchscreen (Core i9, 32GB RAM, 1TB SSD, RTX 4070)",
        "category": "Laptops & Computing",
        "vendor_id": 4,
        "price": 284990.00,
        "stock_quantity": 12,
        "reorder_threshold": 4,
        "stock": "In Stock",
        "units_sold": 68,
        "rating": 4.8,
        "search_query": "Dell XPS 15 9530 OLED amazon",
        "source": "Amazon",
        "description": "3.5K OLED InfinityEdge touchscreen with 100% DCI-P3 color, CNC machined aluminum and carbon fiber palm rest, NVIDIA Studio drivers. | Specs: 15.6-inch 3.5K OLED Touch (3456 x 2160), Intel Core i9-13900H (14 cores, up to 5.4GHz), 32GB DDR5 4800MHz RAM, 1TB M.2 PCIe NVMe SSD, NVIDIA GeForce RTX 4070 8GB GDDR6, Quad-speaker Waves Nx audio, 86Wh battery."
    },
    {
        "name": "Asus ROG Zephyrus G16 OLED Gaming Laptop (Intel Core Ultra 9, RTX 4080)",
        "category": "Laptops & Computing",
        "vendor_id": 4,
        "price": 249990.00,
        "stock_quantity": 14,
        "reorder_threshold": 5,
        "stock": "In Stock",
        "units_sold": 112,
        "rating": 4.8,
        "search_query": "Asus ROG Zephyrus G16 OLED amazon",
        "source": "Amazon",
        "description": "2.5K 240Hz ROG Nebula OLED display with 0.2ms response, Slash Lighting array lid, ROG Intelligent Cooling with vapor chamber. | Specs: 16-inch 2.5K OLED 240Hz G-SYNC, Intel Core Ultra 9 185H with dedicated AI NPU, 32GB LPDDR5X RAM, 1TB PCIe 4.0 SSD, NVIDIA RTX 4080 12GB GDDR6 (115W TGP), CNC aluminum chassis, Wi-Fi 7."
    },
    {
        "name": "Sony WH-1000XM5 Wireless Active Noise Canceling Headphones",
        "category": "Audio",
        "vendor_id": 4,
        "price": 29990.00,
        "stock_quantity": 55,
        "reorder_threshold": 12,
        "stock": "In Stock",
        "units_sold": 620,
        "rating": 4.9,
        "search_query": "Sony WH-1000XM5 wireless headphones amazon",
        "source": "Amazon",
        "description": "Industry-leading dual processor ANC with 8 microphones, Auto NC Optimizer, 30-hour battery life with 3-minute quick charge for 3 hours playback. | Specs: 30mm precision-engineered carbon fiber drivers, LDAC high-res wireless audio, Speak-to-Chat, multipoint connection for 2 devices, ultra-comfortable soft fit leather, capacitive touch controls."
    },
    {
        "name": "Apple AirPods Pro 2 with MagSafe Case (USB-C)",
        "category": "Audio",
        "vendor_id": 4,
        "price": 24900.00,
        "stock_quantity": 80,
        "reorder_threshold": 20,
        "stock": "In Stock",
        "units_sold": 980,
        "rating": 4.9,
        "search_query": "Apple AirPods Pro 2 USB-C amazon",
        "source": "Flipkart",
        "description": "Apple H2 headphone chip, 2x more Active Noise Cancellation, Adaptive Audio that dynamically blends Transparency and ANC, Conversation Awareness. | Specs: Personalized Spatial Audio with dynamic head tracking, IP54 dust/sweat/water resistance, up to 6 hours listening (30 hours with case), Precision Finding with U1 chip in case, Touch volume swipe controls."
    },
    {
        "name": "Bose QuietComfort Ultra Spatial Audio Headphones",
        "category": "Audio",
        "vendor_id": 4,
        "price": 35900.00,
        "stock_quantity": 30,
        "reorder_threshold": 8,
        "stock": "In Stock",
        "units_sold": 240,
        "rating": 4.8,
        "search_query": "Bose QuietComfort Ultra headphones amazon",
        "source": "Amazon",
        "description": "Revolutionary Bose Immersive Audio spatial sound, CustomTune acoustic calibration, world-class Quiet Mode and Aware Mode with ActiveSense. | Specs: Over-ear plush protein leather earcups, 24 hours battery life, Snapdragon Sound certification, aptX Adaptive codec, 12-microphone beamforming array for crystal-clear calls."
    },
    {
        "name": "Samsung Odyssey OLED G9 49-inch Curved Gaming Monitor (240Hz, 0.03ms)",
        "category": "Displays",
        "vendor_id": 4,
        "price": 129999.00,
        "stock_quantity": 10,
        "reorder_threshold": 3,
        "stock": "Low Stock",
        "units_sold": 45,
        "rating": 4.9,
        "search_query": "Samsung Odyssey OLED G9 49 inch amazon",
        "source": "Amazon",
        "description": "Dual QHD (5120 x 1440) 32:9 ultra-wide curved screen with 1800R curve, Neo Quantum Processor Pro, DisplayHDR True Black 400. | Specs: 49-inch OLED panel, 240Hz refresh rate, 0.03ms response time, AMD FreeSync Premium Pro, CoreSync ambient RGB lighting, HDMI 2.1, DisplayPort 1.4, USB hub, built-in 5W stereo speakers, Samsung Gaming Hub."
    },
    {
        "name": "LG C3 55-inch OLED evo 4K Smart Cinema TV (120Hz, Dolby Vision)",
        "category": "Displays",
        "vendor_id": 4,
        "price": 119990.00,
        "stock_quantity": 15,
        "reorder_threshold": 4,
        "stock": "In Stock",
        "units_sold": 130,
        "rating": 4.9,
        "search_query": "LG C3 55 inch OLED 4K TV amazon",
        "source": "Flipkart",
        "description": "Self-lit OLED evo pixels with Brightness Booster, α9 AI Processor Gen6, Dolby Vision IQ & Dolby Atmos, ultra-slim wall gallery design. | Specs: 55-inch 4K UHD (3840 x 2160) 120Hz native panel, 4x HDMI 2.1 ports (4K@120Hz, VRR, ALLM, eARC), NVIDIA G-SYNC & AMD FreeSync Premium compatible, webOS 23 with Magic Remote, Apple AirPlay 2."
    },
    {
        "name": "Apple Watch Ultra 2 Titanium GPS + Cellular 49mm",
        "category": "Accessories",
        "vendor_id": 4,
        "price": 89900.00,
        "stock_quantity": 22,
        "reorder_threshold": 6,
        "stock": "In Stock",
        "units_sold": 210,
        "rating": 4.9,
        "search_query": "Apple Watch Ultra 2 Titanium amazon",
        "source": "Amazon",
        "description": "49mm corrosion-resistant aerospace titanium case, brightest Apple display ever at 3000 nits, precision dual-frequency GPS (L1 and L5), Action button. | Specs: S9 SiP with Double Tap gesture control, 100m water resistance, certified for recreational scuba diving to 40m (EN13319), Depth gauge with water temperature sensor, up to 72 hours battery life in Low Power Mode, ECG, Blood Oxygen sensor."
    },
    {
        "name": "Samsung Galaxy Watch 6 Classic 47mm LTE (Rotating Bezel)",
        "category": "Accessories",
        "vendor_id": 4,
        "price": 42999.00,
        "stock_quantity": 35,
        "reorder_threshold": 10,
        "stock": "In Stock",
        "units_sold": 275,
        "rating": 4.8,
        "search_query": "Samsung Galaxy Watch 6 Classic 47mm amazon",
        "source": "Amazon",
        "description": "Iconic rotating physical bezel, Sapphire Crystal Super AMOLED display, Samsung BioActive 3-in-1 health sensor. | Specs: 47mm stainless steel case, Exynos W930 dual-core processor, 2GB RAM, 16GB storage, 4G LTE standalone connectivity, BIA body composition analysis, ECG heart rhythm monitoring, advanced sleep coaching, 5ATM + IP68."
    },

    # -------------------------------------------------------------
    # 2. StyleHub Fashion & Clothes (vendor_id = 5)
    # -------------------------------------------------------------
    {
        "name": "Nike Air Jordan 1 Retro High OG 'Chicago Lost & Found'",
        "category": "Footwear & Sneakers",
        "vendor_id": 5,
        "price": 18995.00,
        "stock_quantity": 14,
        "reorder_threshold": 5,
        "stock": "Low Stock",
        "units_sold": 380,
        "rating": 4.9,
        "search_query": "Nike Air Jordan 1 Retro High OG Chicago amazon",
        "source": "Google Shopping",
        "description": "Vintage-aesthetic premium cracked leather uppers, iconic Varsity Red, Black and Sail colorway, encapsulated Air-Sole cushioning. | Specs: Genuine full-grain leather, high-top padded collar, durable solid rubber cupsole with pivot circle traction, original retro 1985 silhouette box, Nike Air woven tongue label."
    },
    {
        "name": "Nike Air Force 1 '07 Triple White Classic Sneakers",
        "category": "Footwear & Sneakers",
        "vendor_id": 5,
        "price": 8195.00,
        "stock_quantity": 65,
        "reorder_threshold": 15,
        "stock": "In Stock",
        "units_sold": 890,
        "rating": 4.8,
        "search_query": "Nike Air Force 1 07 Triple White amazon",
        "source": "Flipkart",
        "description": "Crisp stitched leather overlays on upper, legendary Nike Air cushioning, low-cut padded collar for streamlined comfort. | Specs: Stitched leather upper, perforations on toe box for breathability, foam midsole, non-marking rubber outsole, metal 'AF-1 '82' dubrae lace jewel, Made in Vietnam."
    },
    {
        "name": "Adidas Ultraboost Light Running Shoes (Core Black)",
        "category": "Footwear & Sneakers",
        "vendor_id": 5,
        "price": 14999.00,
        "stock_quantity": 40,
        "reorder_threshold": 10,
        "stock": "In Stock",
        "units_sold": 415,
        "rating": 4.8,
        "search_query": "Adidas Ultraboost Light Core Black amazon",
        "source": "Amazon",
        "description": "Lightest-ever Light BOOST foam cushioning with 30% lighter material, Linear Energy Push (LEP) system, Continental Better Rubber outsole. | Specs: PRIMEKNIT+ breathable adaptive textile upper containing at least 50% Parley Ocean Plastic, 10mm midsole drop (heel: 22mm / forefoot: 12mm), molded heel counter for optimal Achilles fit."
    },
    {
        "name": "Levi's 501 Original Fit Straight Leg Denim Jeans (Dark Stonewash)",
        "category": "Men's Wear",
        "vendor_id": 5,
        "price": 3999.00,
        "stock_quantity": 80,
        "reorder_threshold": 20,
        "stock": "In Stock",
        "units_sold": 650,
        "rating": 4.8,
        "search_query": "Levis 501 Original Fit Jeans Dark Stonewash amazon",
        "source": "Amazon",
        "description": "The archetype of blue jeans since 1873, iconic straight leg with signature button fly, heavyweight non-stretch denim. | Specs: 100% premium cotton denim (14 oz), sits at natural waist, regular fit through thigh, 16.5-inch leg opening, genuine leather patch at back waistband, copper rivets."
    },
    {
        "name": "The North Face 1996 Retro Nuptse 700-Fill Down Puffer Jacket (TNF Black)",
        "category": "Outerwear",
        "vendor_id": 5,
        "price": 27999.00,
        "stock_quantity": 25,
        "reorder_threshold": 6,
        "stock": "In Stock",
        "units_sold": 190,
        "rating": 4.9,
        "search_query": "The North Face 1996 Retro Nuptse Jacket Black amazon",
        "source": "Google Shopping",
        "description": "Iconic boxy retro silhouette with oversized baffles, 700-fill Responsible Down Standard (RDS) goose down insulation. | Specs: 100% recycled nylon ripstop shell with non-PFC durable water-repellent (DWR) finish, stowable hood packs into collar, jacket stows into right hand pocket, VISLON front zipper."
    },
    {
        "name": "Ray-Ban Classic Polarized Aviator Sunglasses (Gold Frame / Green G-15 Lens)",
        "category": "Accessories",
        "vendor_id": 5,
        "price": 11590.00,
        "stock_query": "In Stock",
        "stock_quantity": 50,
        "reorder_threshold": 12,
        "stock": "In Stock",
        "units_sold": 540,
        "rating": 4.9,
        "search_query": "Ray-Ban Aviator Polarized Gold Frame Green Lens amazon",
        "source": "Amazon",
        "description": "Originally designed for U.S. aviators in 1937, timeless teardrop frame with high optical clarity crystal G-15 polarized lenses. | Specs: 58mm lens width (standard), lightweight metal gold-tone frame, 100% UV400 protection, polarized filter blocking 99% of reflected glare, includes original leather case and microfiber cloth, Made in Italy."
    },
    {
        "name": "Casio G-Shock GA-2100 Octagonal 'CasiOak' Carbon Core Guard (All Black)",
        "category": "Accessories",
        "vendor_id": 5,
        "price": 8995.00,
        "stock_quantity": 60,
        "reorder_threshold": 15,
        "stock": "In Stock",
        "units_sold": 720,
        "rating": 4.8,
        "search_query": "Casio G-Shock GA-2100 1A1DR CasiOak Black amazon",
        "source": "Flipkart",
        "description": "Ultra-slim 11.8mm shock-resistant carbon fiber reinforced resin case, stealth all-black octagonal bezel, analog-digital dual display. | Specs: 200m water resistance (20 Bar), Double LED Super Illuminator light, world time for 31 time zones (48 cities), 1/100-sec stopwatch, 5 daily alarms, mineral glass, battery life up to 3 years."
    },
    {
        "name": "Ralph Lauren Oxford Cotton Long-Sleeve Button-Down Shirt (Classic White)",
        "category": "Men's Wear",
        "vendor_id": 5,
        "price": 9990.00,
        "stock_quantity": 45,
        "reorder_threshold": 10,
        "stock": "In Stock",
        "units_sold": 310,
        "rating": 4.8,
        "search_query": "Polo Ralph Lauren Oxford Shirt White amazon",
        "source": "Amazon",
        "description": "A pillar of Polo style since 1971, woven from durable long-staple cotton with signature multicolored embroidered Pony logo. | Specs: 100% premium Oxford cotton, button-down point collar, buttoned placket, split back yoke with box pleat, barrel cuffs, tailored regular fit, machine washable."
    },

    # -------------------------------------------------------------
    # 3. ModernHome Furniture & Living (vendor_id = 6)
    # -------------------------------------------------------------
    {
        "name": "Herman Miller Aeron Ergonomic Mesh Executive Chair (Graphite, Size B)",
        "category": "Ergonomic Chairs",
        "vendor_id": 6,
        "price": 124990.00,
        "stock_quantity": 8,
        "reorder_threshold": 3,
        "stock": "Low Stock",
        "units_sold": 95,
        "rating": 4.9,
        "search_query": "Herman Miller Aeron Chair Graphite amazon",
        "source": "Amazon",
        "description": "The gold standard of ergonomic seating, breathable Pellicle suspension mesh, PostureFit SL adjustable sacral/lumbar support pads. | Specs: Fully adjustable armrests (height, depth, pivot angle), harmonic tilt mechanism with tilt limiter and forward seat angle, 12-year manufacturer warranty, 91% recyclable material, supports up to 159 kg."
    },
    {
        "name": "Autonomous SmartDesk Pro Dual-Motor Motorized Standing Desk (Walnut Top, Black Frame)",
        "category": "Standing Desks",
        "vendor_id": 6,
        "price": 54990.00,
        "stock_quantity": 20,
        "reorder_threshold": 5,
        "stock": "In Stock",
        "units_sold": 160,
        "rating": 4.8,
        "search_query": "Autonomous SmartDesk Pro Walnut amazon",
        "source": "Flipkart",
        "description": "Quiet electric dual-motor lift system (<45 dB sound level), 4 programmable digital height memory presets, heavy-duty solid steel frame. | Specs: 53 x 29 inch scratch-resistant warp-proof MDF desktop, height adjustable range from 26.2 to 52 inches, max load capacity 140 kg, anti-collision safety sensor, 7-year warranty."
    },
    {
        "name": "Dyson V15 Detect Absolute Cordless HEPA Vacuum Cleaner (Laser Slim Fluffy)",
        "category": "Smart Home Appliances",
        "vendor_id": 6,
        "price": 62900.00,
        "stock_quantity": 25,
        "reorder_threshold": 6,
        "stock": "In Stock",
        "units_sold": 280,
        "rating": 4.9,
        "search_query": "Dyson V15 Detect Absolute vacuum cleaner amazon",
        "source": "Amazon",
        "description": "Piezo sensor automatically counts and sizes dust particles, revealing microscopic dust with precisely angled green laser illumination. | Specs: Dyson Hyperdymium motor spinning at 125,000 RPM (240 AW suction), whole-machine HEPA filtration capturing 99.99% of particles down to 0.1 microns, LCD screen displaying scientific proof of a deep clean, up to 60 minutes run time."
    },
    {
        "name": "Dyson Purifier Hot+Cool Formaldehyde HP09 Air Purifier & Heater",
        "category": "Smart Home Appliances",
        "vendor_id": 6,
        "price": 66900.00,
        "stock_quantity": 18,
        "reorder_threshold": 4,
        "stock": "In Stock",
        "units_sold": 195,
        "rating": 4.8,
        "search_query": "Dyson HP09 Hot+Cool Formaldehyde air purifier amazon",
        "source": "Amazon",
        "description": "Cryptomic catalytic filter permanently destroys formaldehyde molecules, fully sealed to HEPA H13 standard, warms room in winter and cools in summer. | Specs: Air Multiplier technology circulating 290 liters of air per second, 350-degree oscillation, solid-state formaldehyde sensor, Dyson Link app + voice control (Alexa, Google Assistant, Siri), quiet night mode."
    },
    {
        "name": "Philips Hue Play Light Bar Starter Kit (2-Pack + Hue Bridge)",
        "category": "Smart Lighting",
        "vendor_id": 6,
        "price": 14999.00,
        "stock_quantity": 40,
        "reorder_threshold": 10,
        "stock": "In Stock",
        "units_sold": 340,
        "rating": 4.8,
        "search_query": "Philips Hue Play Light Bar 2-Pack Starter Kit amazon",
        "source": "Amazon",
        "description": "16 million colors and 50,000 shades of warm-to-cool white light, syncs with TV screen, movies, and video games via Hue Sync PC app. | Specs: Includes 2 light bars with table stands and TV mounting clips, Philips Hue Smart Bridge, power supply, Zigbee protocol compatible with Apple HomeKit, Amazon Alexa, and Google Assistant."
    },
    {
        "name": "Breville Barista Touch Espresso Machine (Brushed Stainless Steel)",
        "category": "Kitchen & Dining",
        "vendor_id": 6,
        "price": 89990.00,
        "stock_quantity": 12,
        "reorder_threshold": 3,
        "stock": "In Stock",
        "units_sold": 85,
        "rating": 4.9,
        "search_query": "Breville Barista Touch Espresso Machine amazon",
        "source": "Google Shopping",
        "description": "Automated touchscreen with pre-programmed cafe drinks, ThermoJet heating system reaching optimal temperature in 3 seconds, automatic microfoam milk texturing. | Specs: Integrated precision conical burr grinder with dose control, digital temperature control (PID) at 93°C, 15-bar Italian pump, 2-liter water tank, 250g bean hopper."
    },

    # -------------------------------------------------------------
    # 4. GadgetCentral Toys & Robotics (vendor_id = 7)
    # -------------------------------------------------------------
    {
        "name": "Sony PlayStation 5 Slim Disc Edition Gaming Console (1TB)",
        "category": "Gaming Consoles",
        "vendor_id": 7,
        "price": 54990.00,
        "stock_quantity": 30,
        "reorder_threshold": 8,
        "stock": "In Stock",
        "units_sold": 780,
        "rating": 4.9,
        "search_query": "PlayStation 5 Slim disc edition console amazon",
        "source": "Amazon",
        "description": "Ultra-high speed 1TB custom NVMe SSD, Ray Tracing, 4K-TV 120Hz gaming with Tempest 3D AudioTech, includes DualSense wireless controller. | Specs: Custom AMD Ryzen Zen 2 8-core CPU (3.5GHz), AMD Radeon RDNA 2 GPU (10.3 TFLOPS), 16GB GDDR6 RAM, Ultra HD Blu-ray optical disc drive, HDR support, DualSense with haptic feedback and adaptive triggers."
    },
    {
        "name": "Microsoft Xbox Series X 1TB High-Performance Gaming Console",
        "category": "Gaming Consoles",
        "vendor_id": 7,
        "price": 54990.00,
        "stock_quantity": 22,
        "reorder_threshold": 6,
        "stock": "In Stock",
        "units_sold": 490,
        "rating": 4.8,
        "search_query": "Xbox Series X 1TB console amazon",
        "source": "Amazon",
        "description": "Fastest, most powerful Xbox ever, 12 teraflops raw graphical processing power, 4K gaming at up to 120 frames per second, Quick Resume. | Specs: 1TB Custom NVMe SSD, Custom 8-core AMD Zen 2 CPU, 12 TFLOPS RDNA 2 GPU, 16GB GDDR6 RAM, 4K UHD Blu-ray disc player, Dolby Vision & Dolby Atmos gaming support, backwards compatible with 4 generations of Xbox games."
    },
    {
        "name": "Nintendo Switch OLED Model with White Joy-Con",
        "category": "Gaming Consoles",
        "vendor_id": 7,
        "price": 31990.00,
        "stock_quantity": 35,
        "reorder_threshold": 8,
        "stock": "In Stock",
        "units_sold": 640,
        "rating": 4.8,
        "search_query": "Nintendo Switch OLED White Joy-Con amazon",
        "source": "Flipkart",
        "description": "Vibrant 7-inch OLED screen with vivid colors and crisp contrast, wide adjustable tabletop kickstand, enhanced onboard speakers. | Specs: 64GB internal storage, wired LAN port on dock, 3 gameplay modes (TV, Tabletop, Handheld), up to 9 hours battery life, HD rumble and IR motion camera in Joy-Con controllers."
    },
    {
        "name": "DJI Mini 4 Pro 4K HDR Camera Drone (DJI RC 2 Screen Remote)",
        "category": "Drones & Aerial",
        "vendor_id": 7,
        "price": 89990.00,
        "stock_quantity": 16,
        "reorder_threshold": 4,
        "stock": "In Stock",
        "units_sold": 175,
        "rating": 4.9,
        "search_query": "DJI Mini 4 Pro drone RC 2 amazon",
        "source": "Amazon",
        "description": "Under 249g ultra-light foldable drone, Omnidirectional obstacle sensing, 4K/60fps HDR True Vertical Shooting for social media. | Specs: 1/1.3-inch CMOS 48MP sensor with Dual Native ISO Fusion (f/1.7 aperture), 34 minutes flight time (up to 45 mins with Plus battery), DJI O4 FHD video transmission up to 20 km, ActiveTrack 360° subject tracking."
    },
    {
        "name": "Sony DualSense Wireless Controller (Midnight Black, PS5 & PC)",
        "category": "Gaming Accessories",
        "vendor_id": 7,
        "price": 5990.00,
        "stock_quantity": 50,
        "reorder_threshold": 12,
        "stock": "In Stock",
        "units_sold": 590,
        "rating": 4.9,
        "search_query": "Sony DualSense wireless controller Midnight Black amazon",
        "source": "Amazon",
        "description": "Immersive haptic feedback, dynamic adaptive triggers simulating realistic resistance, built-in microphone and headset jack. | Specs: USB Type-C charging, Bluetooth 5.1 wireless connection compatible with PS5, Windows PC, iOS, and Android, Create button for recording gameplay, integrated motion sensor accelerometer and gyroscope."
    },
    {
        "name": "Logitech G502 HERO High Performance RGB Gaming Mouse (25K DPI)",
        "category": "Gaming Accessories",
        "vendor_id": 7,
        "price": 4195.00,
        "stock_quantity": 75,
        "reorder_threshold": 15,
        "stock": "In Stock",
        "units_sold": 880,
        "rating": 4.8,
        "search_query": "Logitech G502 HERO gaming mouse amazon",
        "source": "Flipkart",
        "description": "HERO 25K optical sensor with sub-micron accuracy and zero smoothing, 11 programmable buttons with dual-mode hyper-fast scroll wheel. | Specs: 25,600 max DPI, 400+ IPS tracking speed, 5x adjustable 3.6g weights for custom balance, LIGHTSYNC RGB lighting with 16.8M colors, mechanical switch button tensioning rated for 50M clicks."
    }
]

# Fetch verified image using Bing image search for amazon/flipkart
def resolve_image(prod):
    query = prod.get("search_query", prod["name"] + " amazon")
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    }
    url = f"https://www.bing.com/images/search?q={urllib.parse.quote(query)}&form=HDRSC2&first=1"
    req = urllib.request.Request(url, headers=headers)
    try:
        html = urllib.request.urlopen(req, timeout=7).read().decode('utf-8', errors='ignore')
        murls = re.findall(r'&quot;murl&quot;:&quot;(https?://[^&]+)&quot;', html)
        # Check for media-amazon or flixcart first
        for u in murls:
            if 'm.media-amazon.com' in u or 'rukminim' in u:
                if verify(u):
                    return u
        # Fallback to any high-res retail product image
        for u in murls[:10]:
            if not any(x in u.lower() for x in ['logo', 'icon', 'wallpaper', 'vector', 'drawing']):
                if verify(u):
                    return u
    except Exception as e:
        print(f"Error fetching {query}: {e}")
    # Default fallback
    return "https://m.media-amazon.com/images/I/81vxWpPpgNL.jpg"

def verify(u):
    try:
        req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req, timeout=4)
        return res.status == 200
    except:
        return False

def run():
    print(f"Resolving real-world photos for {len(REAL_PRODUCTS)} products...")
    resolved_catalog = []
    for idx, p in enumerate(REAL_PRODUCTS):
        img_url = resolve_image(p)
        p_copy = dict(p)
        p_copy["image_url"] = img_url
        resolved_catalog.append(p_copy)
        print(f"[{idx+1}/{len(REAL_PRODUCTS)}] {p['name'][:35]}... -> {img_url}")
    
    # Save to JSON for reference
    with open("real_catalog_data.json", "w", encoding="utf-8") as f:
        json.dump(resolved_catalog, f, indent=2)
    
    # Now update SQLite shopsense.db
    db_path = "shopsense.db"
    if os.path.exists(db_path):
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        
        # Clear old products and seed clean real-world products
        cur.execute("DELETE FROM products")
        
        for item in resolved_catalog:
            cur.execute("""
                INSERT INTO products (name, category, price, stock, stock_quantity, reorder_threshold, units_sold, rating, description, image_url, vendor_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                item["name"],
                item["category"],
                item["price"],
                item["stock"],
                item["stock_quantity"],
                item["reorder_threshold"],
                item["units_sold"],
                item["rating"],
                item["description"],
                item["image_url"],
                item["vendor_id"]
            ))
        conn.commit()
        cur.execute("SELECT COUNT(*) FROM products")
        count = cur.fetchone()[0]
        print(f"Successfully seeded {count} real-world products in {db_path}!")
        conn.close()

if __name__ == "__main__":
    run()
