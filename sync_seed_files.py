import os
import json

# Read real_catalog_data.json
with open("real_catalog_data.json", "r", encoding="utf-8") as f:
    products = json.load(f)

seed_template = f'''# Auto-generated Authentic Real-World Product Seed with verified Amazon, Flipkart & Google Shopping Images
import sys
import os
from datetime import datetime, timedelta

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

try:
    from database import SessionLocal, engine, Base
    import models
except ImportError:
    from app.database import SessionLocal, engine, Base
    from app import models

REAL_CATALOG = {json.dumps(products, indent=4)}

def seed_database():
    db = SessionLocal()
    try:
        # Check if already populated
        existing = db.query(models.Product).count()
        if existing < len(REAL_CATALOG):
            print(f"Clearing and reseeding with {{len(REAL_CATALOG)}} authentic real-world products...")
            db.query(models.Product).delete()
            for item in REAL_CATALOG:
                prod = models.Product(
                    name=item["name"],
                    category=item["category"],
                    price=item["price"],
                    stock=item["stock"],
                    stock_quantity=item["stock_quantity"],
                    reorder_threshold=item["reorder_threshold"],
                    units_sold=item["units_sold"],
                    rating=item["rating"],
                    description=item["description"],
                    image_url=item["image_url"],
                    vendor_id=item["vendor_id"]
                )
                db.add(prod)
            db.commit()
            print("Real-world product catalog successfully seeded!")
        else:
            print("Catalog already contains authentic products.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding products: {{e}}")
    finally:
        db.close()

seed_all_real_world_products = seed_database

if __name__ == "__main__":
    seed_database()
'''

for target in ["app/seed_100_products.py", "backend/seed_100_products.py", "customer-backend/seed_100_products.py"]:
    with open(target, "w", encoding="utf-8") as f:
        f.write(seed_template)
    print(f"Wrote {target}")
