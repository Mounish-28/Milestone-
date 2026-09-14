import sqlite3

def seed_voltx():
    conn = sqlite3.connect('shopsense.db')
    c = conn.cursor()

    # 1. Update vendor 9 name and email
    c.execute("""
    UPDATE vendors 
    SET name = 'VoltX Smart Mobiles', email = 'support@voltxmobiles.in' 
    WHERE id = 9
    """)

    # 2. Remove old scooter products for vendor 9
    c.execute("DELETE FROM products WHERE vendor_id = 9")

    # 3. Seed 12 authentic VoltX Smart Mobiles products
    voltx_products = [
        (
            'Titan 5G Ultra (Snapdragon 8 Gen 3, 16GB RAM, 512GB Storage, 200MP OIS Camera)',
            'Smart Mobiles',
            79999.0,
            'In Stock',
            45,
            10,
            310,
            4.9,
            'Flagship smartphone with 6.8-inch 144Hz Dynamic AMOLED 2X, Snapdragon 8 Gen 3, 200MP Quad OIS Camera, titanium frame, and 5500mAh silicon-carbon battery.',
            'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
            9
        ),
        (
            'Neo Flip 5G (Foldable AMOLED 120Hz, 12GB RAM, 256GB Storage)',
            'Smart Mobiles',
            64999.0,
            'In Stock',
            35,
            8,
            195,
            4.8,
            'Compact foldable smartphone with zero-crease teardrop hinge, 4.0-inch external cover screen, 50MP Sony dual cameras, and IPX8 water resistance.',
            'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800',
            9
        ),
        (
            'Edge Pro 5G (Dimensity 9300+, 144Hz Curved OLED, 12GB RAM, 256GB Storage)',
            'Smart Mobiles',
            49999.0,
            'In Stock',
            50,
            10,
            420,
            4.9,
            'Ultra-smooth curved 144Hz 1.5K OLED smartphone with MediaTek Dimensity 9300+, 100W GaN SuperFlash charge, and studio-grade periscope portrait camera.',
            'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800',
            9
        ),
        (
            'Air 5G Slim Edition (Ultra-Thin 6.8mm, 50MP Sony IMX, 8GB RAM, 128GB Storage)',
            'Smart Mobiles',
            29999.0,
            'In Stock',
            60,
            12,
            580,
            4.7,
            'Featherlight 165g profile with aviation-grade aluminum frame, 6.7-inch FHD+ 120Hz AMOLED, clean OS interface, and 50W wireless charging.',
            'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800',
            9
        ),
        (
            'Play Max Gaming Mobile (Liquid Cooled Snapdragon 8s, 144Hz, 6000mAh Battery)',
            'Smart Mobiles',
            38999.0,
            'In Stock',
            40,
            10,
            290,
            4.8,
            'Dedicated high-refresh gaming phone with dual ultrasonic shoulder triggers, 10,000mm² vapor chamber cooling, dual front stereo speakers, and 6000mAh battery.',
            'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800',
            9
        ),
        (
            'SonicPods Pro ANC Wireless Earbuds (45dB Hybrid ANC, 40h Playtime)',
            'Mobile Accessories',
            4999.0,
            'In Stock',
            85,
            15,
            740,
            4.9,
            'Hi-Res Audio certified wireless earbuds with LHDC 5.0, 11mm titanium dual drivers, 45dB smart adaptive noise cancellation, and spatial audio with head tracking.',
            'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800',
            9
        ),
        (
            'HyperCharge 120W GaN Fast Charger (Dual USB-C PD 3.1 + USB-A)',
            'Mobile Accessories',
            2999.0,
            'In Stock',
            110,
            20,
            1120,
            4.9,
            'Next-generation Gallium Nitride (GaN III) fast charging brick capable of charging phones 0 to 100% in 19 minutes. Multi-port universal voltage protection.',
            'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800',
            9
        ),
        (
            'MagShield Armor Case & Kickstand (Mil-Grade Drop Protection)',
            'Mobile Accessories',
            1499.0,
            'In Stock',
            140,
            25,
            960,
            4.8,
            'Rugged Kevlar hybrid phone case with N52 strong neodymium magnetic ring for MagSafe accessories, 360-degree zinc alloy rotatable kickstand, and 12ft drop rating.',
            'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800',
            9
        ),
        (
            'Wireless Qi2 15W Magnetic Power Bank (10,000mAh Slim Pack)',
            'Mobile Accessories',
            3499.0,
            'In Stock',
            70,
            15,
            640,
            4.8,
            'Certified Qi2 wireless charging power bank with digital percentage LED display, 20W bidirectional USB-C PD fast charge, and ultra-compact pocket format.',
            'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=800',
            9
        ),
        (
            'Smart Stylus Pen (Palm Rejection & 4096 Pressure Levels)',
            'Mobile Accessories',
            2499.0,
            'In Stock',
            65,
            15,
            380,
            4.7,
            'Active bluetooth stylus with pixel-perfect precision, tilt sensitivity, magnetic wireless charging attachment, and 14-hour continuous creative battery life.',
            'https://images.unsplash.com/photo-1585336261024-64945a0b771e?w=800',
            9
        ),
        (
            'Dual-Driver Hi-Res Type-C Earphones (DAC Chip Built-in)',
            'Mobile Accessories',
            1299.0,
            'In Stock',
            120,
            20,
            850,
            4.7,
            'Tangle-free braided Type-C wired earphones with integrated 32-bit/384kHz DAC audio chip, HD MEMS microphone, and aircraft-grade aluminum sound chamber.',
            'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800',
            9
        ),
        (
            'Ultra-Clear 9H Tempered Glass Screen Guard (Auto-Alignment Kit)',
            'Mobile Accessories',
            799.0,
            'In Stock',
            200,
            30,
            1430,
            4.9,
            'Military-grade 9H hardness tempered glass with oleophobic anti-fingerprint coating, shatter-proof edges, and dust-free electrostatic auto-alignment installation frame.',
            'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=800',
            9
        )
    ]

    for p in voltx_products:
        c.execute("""
        INSERT INTO products (name, category, price, stock, stock_quantity, reorder_threshold, units_sold, rating, description, image_url, vendor_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, p)

    conn.commit()

    c.execute("SELECT id, name, email FROM vendors WHERE id = 9")
    print("Updated Vendor 9:", c.fetchone())

    c.execute("SELECT id, name, category, price, stock_quantity FROM products WHERE vendor_id = 9")
    rows = c.fetchall()
    print(f"VoltX Products Count: {len(rows)}")
    for r in rows:
        print(f" - [{r[0]}] {r[1]} ({r[2]}) - Rs.{r[3]} [Qty: {r[4]}]")

    conn.close()

if __name__ == "__main__":
    seed_voltx()
