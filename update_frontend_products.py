import json
import re

with open("real_catalog_data.json", "r", encoding="utf-8") as f:
    real_products = json.load(f)

# Group by vendor
vendor_keys = {
    4: "techworld",
    5: "stylehub",
    6: "modernhome",
    7: "gadgetcentral"
}

grouped = {
    "techworld": [],
    "stylehub": [],
    "modernhome": [],
    "gadgetcentral": []
}

for p in real_products:
    v_key = vendor_keys.get(p["vendor_id"], "techworld")
    grouped[v_key].append({
        "id": len(grouped[v_key]) + 1,
        "name": p["name"],
        "category": p["category"],
        "price": p["price"],
        "vendor_id": p["vendor_id"],
        "stock_quantity": p["stock_quantity"],
        "reorder_threshold": p["reorder_threshold"],
        "stock": p["stock"],
        "image_url": p["image_url"],
        "rating": p["rating"],
        "units_sold": p["units_sold"],
        "source": p["source"]
    })

with open("frontend/src/pages/Products.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace INITIAL_VENDOR_PRODUCTS
pattern = r"const INITIAL_VENDOR_PRODUCTS = \{.*?\n\};\n"
new_init = f"const INITIAL_VENDOR_PRODUCTS = {json.dumps(grouped, indent=2)};\n"

new_content = re.sub(pattern, new_init, content, flags=re.DOTALL)

with open("frontend/src/pages/Products.jsx", "w", encoding="utf-8") as f:
    f.write(new_content)

print("Updated INITIAL_VENDOR_PRODUCTS in frontend/src/pages/Products.jsx")
