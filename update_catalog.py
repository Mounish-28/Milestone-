import ast
import json

new_catalog_data = [
    {"name": "Samsung Galaxy S24 Ultra 5G (Titanium Gray, 512GB) - Made in India", "cat": "Mobiles", "price": 139999.00, "qty": 45, "sold": 184, "rating": 4.9, "vid": 'tv_id', "desc": "Snapdragon 8 Gen 3 for Galaxy, AI suite, 200MP Quad Telephoto OIS camera. | Specs: 6.8-inch Dynamic AMOLED 2X 120Hz display, 12GB RAM, 512GB UFS 4.0 storage, 5000mAh battery with 45W fast charging, IP68 water/dust resistant, Titanium frame, Dual Physical SIM support (India), ISRO NavIC GPS, S-Pen included.", "fetched_image": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Samsung_Galaxy_S24%2C_Sperrbildschirm.JPG/800px-Samsung_Galaxy_S24%2C_Sperrbildschirm.JPG"},
    {"name": "Samsung Galaxy Z Fold6 AI 5G (Phantom Black, 256GB)", "cat": "Mobiles", "price": 164999.00, "qty": 20, "sold": 96, "rating": 4.8, "vid": 'tv_id', "desc": "Dual Dynamic AMOLED 2X 120Hz screens, titanium hinge, real-time AI interpreter. | Specs: 7.6-inch inner display, 6.3-inch cover display, Snapdragon 8 Gen 3, 12GB RAM, 256GB storage, 4400mAh battery, 50MP main camera, NavIC support.", "fetched_image": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Samsung_Galaxy_Z_Fold_5.jpg/800px-Samsung_Galaxy_Z_Fold_5.jpg"},
    {"name": "Samsung Galaxy Z Flip6 5G (Mint, 256GB)", "cat": "Mobiles", "price": 109999.00, "qty": 30, "sold": 142, "rating": 4.8, "vid": 'tv_id', "desc": "Compact pocket foldable with FlexWindow AI camera, 50MP ProVisual Engine. | Specs: 6.7-inch inner display, 3.4-inch Flex Window, Snapdragon 8 Gen 3, 8GB RAM, 256GB storage, 4000mAh battery, Make in India.", "fetched_image": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Samsung_Galaxy_Z_Flip_4_Bora_Purple.jpg/800px-Samsung_Galaxy_Z_Flip_4_Bora_Purple.jpg"},
    {"name": "Apple iPhone 16 Pro Max (Desert Titanium, 256GB) - Indian Edition", "cat": "Mobiles", "price": 144900.00, "qty": 60, "sold": 310, "rating": 4.9, "vid": 'tv_id', "desc": "A18 Pro Bionic, Camera Control button, 48MP Fusion Camera, Apple Intelligence ready. | Specs: 6.9-inch Super Retina XDR OLED, 120Hz ProMotion, 8GB RAM, 256GB NVMe storage, Grade 5 Titanium frame, 5x Optical Zoom, Dual SIM (nano-SIM and eSIM).", "fetched_image": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/IPhone_15_Pro_Max_Natural_Titanium.jpg/800px-IPhone_15_Pro_Max_Natural_Titanium.jpg"},
    {"name": "Apple iPhone 16 (Ultramarine, 128GB)", "cat": "Mobiles", "price": 79900.00, "qty": 50, "sold": 225, "rating": 4.8, "vid": 'tv_id', "desc": "Customizable Action button, 48MP 2-in-1 camera with macro, Super Retina XDR OLED. | Specs: 6.1-inch OLED display, A18 Bionic chip, 8GB RAM, 128GB storage, USB-C, IP68 water resistant, Assembled in India.", "fetched_image": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/IPhone_15_Pink.jpg/800px-IPhone_15_Pink.jpg"},
    {"name": "Google Pixel 9 Pro XL AI (Obsidian, 128GB)", "cat": "Mobiles", "price": 124999.00, "qty": 28, "sold": 89, "rating": 4.8, "vid": 'tv_id', "desc": "Tensor G4, Gemini Live assistant, 50MP Triple Camera with Super Res Zoom 30x. | Specs: 6.8-inch LTPO OLED 120Hz, Google Tensor G4, 16GB RAM, 128GB storage, 5060mAh battery, 50MP main + 48MP UW + 48MP Tele, NavIC GPS.", "fetched_image": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Pixel_8_Pro_in_Porcelain_color.jpg/800px-Pixel_8_Pro_in_Porcelain_color.jpg"},
    {"name": "OnePlus 12 5G (Flowy Emerald, 256GB)", "cat": "Mobiles", "price": 64999.00, "qty": 40, "sold": 165, "rating": 4.8, "vid": 'tv_id', "desc": "4th Gen Hasselblad Camera, Snapdragon 8 Gen 3, 100W SUPERVOOC fast charge. | Specs: 6.82-inch LTPO AMOLED 120Hz, 12GB RAM, 256GB UFS 4.0, 5400mAh battery, 50W wireless charging, Indian bands support.", "fetched_image": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Oneplus_11.jpg/800px-Oneplus_11.jpg"},
    {"name": "Xiaomi 14 Ultra Leica Summilux (Black, 512GB)", "cat": "Mobiles", "price": 99999.00, "qty": 18, "sold": 54, "rating": 4.7, "vid": 'tv_id', "desc": "1-inch LYT-900 sensor with stepless variable aperture, quad 50MP Leica lenses. | Specs: 6.73-inch LTPO AMOLED, Snapdragon 8 Gen 3, 16GB RAM, 512GB storage, 5000mAh battery, 90W fast charging.", "fetched_image": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Xiaomi_13_Ultra.jpg/800px-Xiaomi_13_Ultra.jpg"},
    {"name": "Nothing Phone (2) Glyph Edition (Dark Grey, 256GB)", "cat": "Mobiles", "price": 39999.00, "qty": 35, "sold": 118, "rating": 4.7, "vid": 'tv_id', "desc": "Iconic customizable Glyph LED interface, Nothing OS 2.5, Snapdragon 8+ Gen 1. | Specs: 6.7-inch LTPO OLED, 12GB RAM, 256GB storage, 4700mAh battery, Dual 50MP cameras, transparent back.", "fetched_image": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Nothing_Phone_1_front.jpg/800px-Nothing_Phone_1_front.jpg"},
    {"name": "Realme GT 6 AI Flagship Killer (Silver, 256GB)", "cat": "Mobiles", "price": 40999.00, "qty": 55, "sold": 190, "rating": 4.6, "vid": 'tv_id', "desc": "6000-nit ultra-bright display, Snapdragon 8s Gen 3, 120W Ultra Charge. | Specs: 6.78-inch LTPO AMOLED 120Hz, 12GB RAM, 256GB storage, 5500mAh battery, 50MP Sony LYT-808 sensor.", "fetched_image": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80"},

    {"name": "Apple MacBook Pro M3 Max 16-inch (Space Black, 36GB RAM)", "cat": "Electronics", "price": 319900.00, "qty": 15, "sold": 62, "rating": 4.9, "vid": 'tv_id', "desc": "16-core CPU, 40-core GPU, Liquid Retina XDR screen, 22-hour battery life. | Specs: 16.2-inch Liquid Retina XDR, M3 Max chip, 36GB Unified Memory, 1TB SSD, 3x Thunderbolt 4, SDXC, HDMI, BIS certified.", "fetched_image": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/MacBook_Pro_14_inch_2021_Silver.jpg/800px-MacBook_Pro_14_inch_2021_Silver.jpg"},
    {"name": "Apple MacBook Air M3 13-inch (Midnight, 16GB RAM)", "cat": "Electronics", "price": 114900.00, "qty": 40, "sold": 210, "rating": 4.9, "vid": 'tv_id', "desc": "Ultra-thin aluminum chassis, dual external display support, MagSafe 3 charging. | Specs: 13.6-inch Liquid Retina display, M3 chip (8-core CPU, 10-core GPU), 16GB Unified Memory, 512GB SSD.", "fetched_image": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/MacBook_Air_M2_Starlight.jpg/800px-MacBook_Air_M2_Starlight.jpg"},
    {"name": "Dell XPS 15 OLED Touchscreen (Core i9, 32GB RAM, RTX 4070)", "cat": "Electronics", "price": 285990.00, "qty": 12, "sold": 45, "rating": 4.8, "vid": 'tv_id', "desc": "3.5K OLED InfinityEdge display, CNC machined aluminum, quad speaker design. | Specs: 15.6-inch 3.5K OLED Touch, Intel Core i9-13900H, 32GB DDR5 RAM, 1TB PCIe NVMe SSD, NVIDIA RTX 4070 8GB GDDR6.", "fetched_image": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80"},
    {"name": "Asus ROG Zephyrus G16 OLED Gaming Laptop (RTX 4080)", "cat": "Electronics", "price": 249990.00, "qty": 14, "sold": 78, "rating": 4.8, "vid": 'tv_id', "desc": "2.5K 240Hz ROG Nebula OLED, Intel Core Ultra 9, Slash Lighting array lid. | Specs: 16-inch 2.5K OLED 240Hz, Intel Core Ultra 9 185H, 32GB LPDDR5X, 1TB SSD, NVIDIA RTX 4080 12GB.", "fetched_image": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80"},
    {"name": "Lenovo ThinkPad X1 Carbon Gen 12 Ultrabook", "cat": "Electronics", "price": 184990.00, "qty": 20, "sold": 55, "rating": 4.8, "vid": 'tv_id', "desc": "Military-grade carbon fiber durable build, TrackPoint, 14-inch OLED anti-glare screen. | Specs: 14-inch 2.8K OLED, Intel Core Ultra 7 155H, 32GB RAM, 1TB SSD, Wi-Fi 7, 57Wh battery.", "fetched_image": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/ThinkPad_X1_Carbon.jpg/800px-ThinkPad_X1_Carbon.jpg"},
    {"name": "HP Spectre x360 2-in-1 Convertible Laptop (14-inch OLED)", "cat": "Electronics", "price": 154990.00, "qty": 22, "sold": 64, "rating": 4.7, "vid": 'tv_id', "desc": "9MP AI auto-framing webcam, Poly Audio tuning, tilt rechargeable MPP stylus pen. | Specs: 14-inch 2.8K OLED Touchscreen, Intel Core Ultra 7 155H, 16GB RAM, 1TB SSD, Intel Arc Graphics.", "fetched_image": "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80"},

    {"name": "Sony WH-1000XM5 Wireless Active Noise Canceling Headphones", "cat": "Accessories", "price": 29990.00, "qty": 50, "sold": 380, "rating": 4.9, "vid": 'tv_id', "desc": "Industry-leading dual processor ANC, 8 microphones, 30-hour battery, LDAC audio. | Specs: Auto NC Optimizer, Multipoint connection, Fast Pair, Speak-to-Chat, 30mm carbon fiber driver.", "fetched_image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"},
    {"name": "Apple AirPods Pro 2 with USB-C MagSafe Case", "cat": "Accessories", "price": 24900.00, "qty": 80, "sold": 540, "rating": 4.9, "vid": 'tv_id', "desc": "H2 chip, 2x more Active Noise Cancellation, Adaptive Audio, Personalized Spatial Sound. | Specs: Bluetooth 5.3, U1 chip for Precision Finding, IP54 dust/water resistance, up to 6 hours listening time.", "fetched_image": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/AirPods_Pro.jpg/800px-AirPods_Pro.jpg"},
    {"name": "Bose QuietComfort Ultra Spatial Audio Headphones", "cat": "Accessories", "price": 35900.00, "qty": 30, "sold": 195, "rating": 4.8, "vid": 'tv_id', "desc": "CustomTune audio technology, Bose Immersive Audio, world-class quiet and aware modes. | Specs: Over-ear, 24-hour battery life, Snapdragon Sound, aptX Adaptive, advanced mic system.", "fetched_image": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80"},
    {"name": "Sennheiser Momentum 4 Wireless Audiophile Headphones", "cat": "Accessories", "price": 24990.00, "qty": 25, "sold": 110, "rating": 4.8, "vid": 'tv_id', "desc": "60-hour massive battery life, 42mm audiophile-grade transducer drivers, customizable EQ. | Specs: Adaptive ANC, aptX Adaptive, 60h playtime, Transparency mode, Sound Personalization.", "fetched_image": "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80"},
    {"name": "Apple Watch Ultra 2 Titanium GPS + Cellular 49mm", "cat": "Accessories", "price": 89900.00, "qty": 20, "sold": 145, "rating": 4.9, "vid": 'tv_id', "desc": "3000 nits brightest display, precision dual-frequency GPS, 36h endurance for athletics. | Specs: 49mm aerospace-grade titanium, S9 SiP, Double Tap gesture, 100m water resistant, EN13319 certified.", "fetched_image": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Apple_Watch_Ultra.jpg/800px-Apple_Watch_Ultra.jpg"},
    {"name": "Samsung Galaxy Watch 6 Classic 47mm LTE with Rotating Bezel", "cat": "Accessories", "price": 42999.00, "qty": 35, "sold": 178, "rating": 4.8, "vid": 'tv_id', "desc": "Sapphire crystal glass, BIA body composition sensor, ECG, advanced sleep coaching. | Specs: 47mm Stainless Steel case, Exynos W930, 2GB RAM, 16GB storage, Wear OS 4, LTE connectivity.", "fetched_image": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Samsung_Galaxy_Watch_4_Classic.jpg/800px-Samsung_Galaxy_Watch_4_Classic.jpg"},
    {"name": "Garmin Fenix 7 Pro Sapphire Solar Multisport Smartwatch", "cat": "Accessories", "price": 93990.00, "qty": 15, "sold": 52, "rating": 4.9, "vid": 'tv_id', "desc": "Power Sapphire solar charging lens, built-in LED flashlight, TopoActive mapping. | Specs: 47mm Titanium bezel, Advanced Training metrics, Multi-band GPS, 22 days battery in smartwatch mode.", "fetched_image": "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80"},
    {"name": "Sony PlayStation 5 Slim Disc Edition Gaming Console (1TB) - India Edition", "cat": "Toys & Games", "price": 54990.00, "qty": 30, "sold": 380, "rating": 4.9, "vid": 'gv_id', "desc": "Ultra-high speed SSD, ray tracing, 4K-TV gaming, Tempest 3D AudioTech. | Specs: 1TB Custom NVMe SSD, AMD Ryzen Zen 2 CPU, AMD Radeon RDNA 2 GPU, 16GB GDDR6 RAM, 4K@120Hz support, BIS Certified for India.", "fetched_image": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/PlayStation_5_and_DualSense_with_base.jpg/800px-PlayStation_5_and_DualSense_with_base.jpg"},
    {"name": "Microsoft Xbox Series X 1TB High-Performance Console", "cat": "Toys & Games", "price": 54990.00, "qty": 22, "sold": 210, "rating": 4.8, "vid": 'gv_id', "desc": "12 teraflops raw graphical processing power, 4K gaming up to 120 FPS, Quick Resume. | Specs: 1TB Custom NVMe SSD, Custom Zen 2 CPU, 12 TFLOPS RDNA 2 GPU, 16GB GDDR6 RAM, 4K UHD Blu-ray.", "fetched_image": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Xbox_Series_X_Console.jpg/800px-Xbox_Series_X_Console.jpg"}
]

# Write out the logic to rebuild seed_100_products
def regenerate_seed():
    with open("app/seed_100_products.py", "r", encoding="utf-8") as f:
        content = f.read()

    # Find where the catalog starts and ends
    start_idx = content.find("catalog = [")
    if start_idx == -1: return
        
    bracket_count = 0
    end_idx = -1
    for i in range(start_idx + 10, len(content)):
        if content[i] == '[': bracket_count += 1
        elif content[i] == ']':
            bracket_count -= 1
            if bracket_count == 0:
                end_idx = i + 1
                break

    if end_idx == -1: return

    catalog_str = content[start_idx+10:end_idx]
    temp_str = catalog_str.replace("tv_id", "'tv_id'").replace("fv_id", "'fv_id'").replace("mv_id", "'mv_id'").replace("gv_id", "'gv_id'")
    old_catalog = ast.literal_eval(temp_str)
    
    detailed_names = {item["name"].split(" - ")[0]: item for item in new_catalog_data}
    
    final_catalog = []
    
    for item in old_catalog:
        matched = False
        for d_name, d_item in detailed_names.items():
            if item["name"].startswith(d_name):
                final_catalog.append(d_item)
                matched = True
                break
                
        if not matched:
            # We automatically enrich the remaining items and convert prices to INR!
            # If the price is under 5000, it's likely already converted. Otherwise we convert it.
            if item["price"] < 3000:
                item["price"] = round(item["price"] * 83, -1) # convert USD to INR and round to nearest 10
            
            # Ensure it has India-specific generic specs
            if " | Specs:" not in item["desc"]:
                cat = item.get("cat", "")
                if cat == "Mobiles":
                    specs = "6.5-inch AMOLED display, Octa-core processor, 8GB RAM, 128GB Storage, 50MP Camera, 4500mAh Battery, Dual SIM, NavIC."
                elif cat == "Electronics":
                    specs = "Advanced processing unit, 4K UHD support, Wi-Fi 6 compatible, durable premium build, BIS Certified, 220V."
                elif cat == "Men's Wear" or cat == "Fashion":
                    specs = "Premium breathable fabric, tailored modern fit, machine washable, durable stitching, Made in India."
                elif cat == "Furniture":
                    specs = "Solid kiln-dried wood frame, high-density foam cushions, premium upholstery, max load capacity 150 kg, 5-year warranty."
                elif cat == "Toys & Games":
                    specs = "Non-toxic ABS plastic, ISI marked, educational STEM features, recommended age 8+, battery operated."
                elif cat == "Accessories":
                    specs = "Universal compatibility, premium scratch-resistant finish, fast-charging support, 2-year warranty, BIS certified."
                else:
                    specs = "High-quality build, industry-leading design, rigorously tested for durability and performance in Indian conditions."
                    
                item["desc"] = f"{item['desc'].split(' | Specs:')[0]} | Specs: {specs}"
                
            final_catalog.append(item)

    # Now we rebuild the catalog string
    new_catalog_str = "[\n"
    for item in final_catalog:
        item_str = json.dumps(item)
        item_str = item_str.replace('"tv_id"', "tv_id").replace('"fv_id"', "fv_id").replace('"mv_id"', "mv_id").replace('"gv_id"', "gv_id")
        new_catalog_str += f"            {item_str},\n"
    new_catalog_str += "        ]"

    new_content = content[:start_idx + 10] + new_catalog_str + content[end_idx:]
    
    with open("app/seed_100_products.py", "w", encoding="utf-8") as f:
        f.write(new_content)
        
    print(f"Successfully generated INR pricing and Indian specs for catalog.")

if __name__ == "__main__":
    regenerate_seed()
