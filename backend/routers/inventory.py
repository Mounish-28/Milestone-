from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import math

try:
    from database import get_db
    import models, schemas
except ImportError:
    from app.database import get_db
    from app import models, schemas

try:
    from catalog_generator import generate_simulated_product_for_vendor
except ImportError:
    from app.catalog_generator import generate_simulated_product_for_vendor

router = APIRouter(prefix="/inventory", tags=["Inventory Intelligence"])


@router.get("/")
@router.get("/summary")
@router.get("/analytics")
def get_inventory_summary(db: Session = Depends(get_db)):
    products = db.query(models.Product).all()
    
    total_products = len(products)
    total_units_in_stock = sum(p.stock_quantity for p in products)
    low_stock_count = sum(1 for p in products if (p.stock_quantity <= p.reorder_threshold or p.stock == "Low Stock") and p.stock_quantity > 0)
    out_of_stock_count = sum(1 for p in products if p.stock_quantity == 0 or p.stock == "No Stock")
    total_valuation = round(sum(float(p.price) * int(p.stock_quantity) for p in products), 2)
    total_units_sold = sum(p.units_sold for p in products)

    # Calculate vendor-wise catalog item breakdowns
    vendors = db.query(models.Vendor).all()
    vendor_breakdown = []
    for v in vendors:
        v_products = [p for p in products if p.vendor_id == v.id]
        v_items = len(v_products)
        v_units = sum(p.stock_quantity for p in v_products)
        v_val = round(sum(float(p.price) * int(p.stock_quantity) for p in v_products), 2)
        vendor_breakdown.append({
            "vendor_id": v.id,
            "vendor_name": v.name,
            "catalog_items": v_items,
            "units_in_stock": v_units,
            "valuation": v_val
        })

    return {
        "total_products": total_products,
        "total_units_in_stock": total_units_in_stock,
        "low_stock_count": low_stock_count,
        "out_of_stock_count": out_of_stock_count,
        "total_valuation": total_valuation,
        "total_units_sold": total_units_sold,
        "vendor_breakdown": vendor_breakdown
    }


@router.get("/low-stock-alerts")
@router.get("/reorder-recommendations")
def get_low_stock_alerts(db: Session = Depends(get_db)):
    products = db.query(models.Product).all()
    low_stock_products = [
        p for p in products 
        if p.stock_quantity <= p.reorder_threshold or p.stock == "Low Stock" or p.stock == "No Stock"
    ]
    
    alerts = []
    for p in low_stock_products:
        severity = "Critical" if p.stock_quantity == 0 or p.stock == "No Stock" else "Warning"
        alerts.append({
            "product_id": p.id,
            "product_name": p.name,
            "category": p.category,
            "vendor_id": p.vendor_id,
            "vendor_name": p.vendor.name if p.vendor else f"Vendor #{p.vendor_id}",
            "stock_quantity": p.stock_quantity,
            "reorder_threshold": p.reorder_threshold,
            "price": p.price,
            "severity": severity,
            "recommended_restock_amount": max(50 - p.stock_quantity, 25)
        })
        
    return {
        "alert_count": len(alerts),
        "alerts": alerts
    }


@router.put("/stock/{product_id}")
def update_product_stock(
    product_id: int, 
    payload: schemas.StockUpdateRequest, 
    db: Session = Depends(get_db)
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.stock_quantity = payload.stock_quantity
    if payload.reorder_threshold is not None:
        product.reorder_threshold = payload.reorder_threshold

    # Auto update textual stock status
    if product.stock_quantity == 0:
        product.stock = "No Stock"
    elif product.stock_quantity <= product.reorder_threshold:
        product.stock = "Low Stock"
    else:
        product.stock = "In Stock"

    db.commit()
    db.refresh(product)

    return {
        "message": "Stock updated successfully",
        "product_id": product.id,
        "new_stock_quantity": product.stock_quantity,
        "stock_status": product.stock,
        "reorder_threshold": product.reorder_threshold
    }


@router.get("/forecast")
def get_aggregate_inventory_forecast(db: Session = Depends(get_db)):
    products = db.query(models.Product).limit(10).all()
    forecasts = []
    for product in products:
        historical_daily_sales = max(round((product.units_sold or 10) / 30.0, 2), 1.0)
        days_until_out = math.floor(product.stock_quantity / historical_daily_sales) if historical_daily_sales > 0 else 999
        forecasts.append({
            "product_id": product.id,
            "product_name": product.name,
            "category": product.category,
            "current_stock": product.stock_quantity,
            "estimated_daily_demand": historical_daily_sales,
            "days_until_out_of_stock": days_until_out,
            "reorder_needed": days_until_out <= 7
        })
    return {
        "status": "success",
        "total_analyzed": len(forecasts),
        "forecasts": forecasts
    }


@router.get("/forecast/{product_id}")
def get_inventory_forecast(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    historical_daily_sales = max(round(product.units_sold / 30.0, 2), 1.2)
    growth_rate = 1.08  # 8% growth trend

    forecast_7_days = round(historical_daily_sales * 7 * growth_rate)
    forecast_14_days = round(historical_daily_sales * 14 * (growth_rate ** 1.5))
    forecast_30_days = round(historical_daily_sales * 30 * (growth_rate ** 2))

    days_until_out_of_stock = math.floor(product.stock_quantity / historical_daily_sales) if historical_daily_sales > 0 else 999
    risk_level = "High" if days_until_out_of_stock < 7 else ("Medium" if days_until_out_of_stock < 15 else "Low")

    chart_series = []
    current_stock = product.stock_quantity
    for day in range(1, 15):
        projected_demand = round(historical_daily_sales * (1 + (day * 0.02)))
        current_stock = max(current_stock - projected_demand, 0)
        chart_series.append({
            "day": f"Day {day}",
            "projected_demand": projected_demand,
            "remaining_stock": current_stock
        })

    return {
        "product_id": product.id,
        "product_name": product.name,
        "current_stock": product.stock_quantity,
        "avg_daily_sales": historical_daily_sales,
        "days_until_depleted": days_until_out_of_stock,
        "risk_level": risk_level,
        "forecasts": {
            "7_days_needed": forecast_7_days,
            "14_days_needed": forecast_14_days,
            "30_days_needed": forecast_30_days
        },
        "recommended_order_qty": max(forecast_30_days - product.stock_quantity, 0),
        "daily_projection_chart": chart_series
    }


@router.get("/tracking-logs")
def get_inventory_tracking_logs(
    vendor_id: int = None,
    db: Session = Depends(get_db)
):
    if vendor_id:
        products = db.query(models.Product).filter(models.Product.vendor_id == vendor_id).order_by(models.Product.id.desc()).all()
    else:
        products = db.query(models.Product).order_by(models.Product.id.desc()).all()

    logs = []
    warehouse_bins = [
        {"bin": "Zone A - Bay 04 (Electronics)", "zone": "Zone A", "temp": "21.0°C | 42% Humidity"},
        {"bin": "Zone B - Shelf 12 (Fashion)", "zone": "Zone B", "temp": "23.5°C | 48% Humidity"},
        {"bin": "Zone C - Floor Bay 02 (Furniture)", "zone": "Zone C", "temp": "22.0°C Ambient"},
        {"bin": "Zone D - Heavy Rack 09 (Robotics)", "zone": "Zone D", "temp": "21.5°C Ambient"},
        {"bin": "Vault 01 - Biometric Locker A3 (Flagship)", "zone": "Vault 01", "temp": "19.0°C Nitrogen Protected"}
    ]
    
    carriers = [
        {"name": "DHL Express Global", "prefix": "DHL-EXP", "transit": "Air Cargo Flight DXB-502"},
        {"name": "FedEx Priority Logistics", "prefix": "FDX-PRI", "transit": "Express Freight Truck FT-88"},
        {"name": "BlueDart Aviation", "prefix": "BLU-AIR", "transit": "Domestic Air Waybill"},
        {"name": "ShopSense Direct Fleet", "prefix": "SSD-VAN", "transit": "Intra-City EV Van 14"}
    ]
    
    event_templates = [
        {"type": "Inbound Supplier Restock", "qty": "+50 Units", "status": "Dock Receiving Cleared", "color": "green", "qc": "QC Seal: PASSED (Grade A)"},
        {"type": "Customer Order Fulfilled", "qty": "-2 Units", "status": "Packed & Manifest Signed", "color": "blue", "qc": "Barcode Scan: VERIFIED"},
        {"type": "Warehouse Bin Transfer", "qty": "0 Units (Relocated)", "status": "Moved to Fast-Pick Rack", "color": "purple", "qc": "Location Sensor: SYNCED"},
        {"type": "Quality & Thermal Audit", "qty": "0 Units (Audited)", "status": "Thermal Sensor Calibrated", "color": "teal", "qc": "ISO-9001 Audit: COMPLIANT"},
        {"type": "Priority Express Dispatch Ready", "qty": "-5 Units", "status": "Out for 2-Hour Delivery", "color": "amber", "qc": "Courier Handover: SIGNED"}
    ]
    
    operators = [
        {"name": "Mounish Sai", "role": "Lead Operations Director", "badge": "OP-001"},
        {"name": "Aarav Sharma", "role": "Fulfillment Specialist", "badge": "FL-042"},
        {"name": "Pooja Verma", "role": "Quality Assurance Lead", "badge": "QA-109"},
        {"name": "Vikram Malhotra", "role": "Warehouse Bay Controller", "badge": "WB-023"},
        {"name": "AI Auto-Robotics System", "role": "Autonomous AGV Fleet", "badge": "BOT-SYNC"}
    ]

    vendors = db.query(models.Vendor).all()
    vendor_dict = {v.id: v.name for v in vendors}

    base_time = datetime.utcnow()

    for idx, p in enumerate(products):
        template = event_templates[idx % len(event_templates)]
        bin_info = warehouse_bins[idx % len(warehouse_bins)]
        carrier_info = carriers[idx % len(carriers)]
        op_info = operators[idx % len(operators)]
        
        # Generate domain-specific SKU
        cat_prefix = "ELEC" if "Electronics" in p.category or "Mobile" in p.category else ("FASH" if "Fashion" in p.category or "Wear" in p.category else ("FURN" if "Furniture" in p.category else "ROBT"))
        sku_code = f"SKU-{cat_prefix}-{p.id:04d}-REV{(idx % 3) + 1}"
        awb_no = f"AWB-{carrier_info['prefix']}-{984000 + (idx * 37) % 9000}"
        batch_no = f"BATCH-2026-AUG-{((idx * 23) % 800) + 100}"
        v_name = vendor_dict.get(p.vendor_id, "TechWorld Electronics")

        logs.append({
            "tracking_id": f"INV-TRK-{98240 + p.id}",
            "sku_code": sku_code,
            "product_id": p.id,
            "product_name": p.name,
            "category": p.category,
            "vendor_id": p.vendor_id,
            "vendor_name": v_name,
            "event_type": template["type"],
            "quantity_change": template["qty"],
            "current_stock": p.stock_quantity,
            "reorder_threshold": p.reorder_threshold,
            "warehouse_location": bin_info["bin"],
            "warehouse_zone": bin_info["zone"],
            "storage_temp": bin_info["temp"],
            "batch_number": batch_no,
            "carrier": carrier_info["name"],
            "awb_number": awb_no,
            "transit_details": carrier_info["transit"],
            "qc_status": template["qc"],
            "logistics_status": template["status"],
            "timestamp": (base_time - timedelta(hours=idx * 2 + 1, minutes=(idx * 17) % 60)).strftime("%Y-%m-%d %H:%M UTC"),
            "operator": f"{op_info['name']} ({op_info['role']})",
            "operator_badge": op_info["badge"],
            "status_color": template["color"]
        })

    return {
        "total_records": len(logs),
        "tracking_logs": logs
    }


@router.get("/warehouse-zones")
def get_warehouse_zones(db: Session = Depends(get_db)):
    return {
        "facility_name": "ShopSense Central Fulfillment Hub - Unit 04",
        "total_facility_capacity": 5000,
        "current_occupancy": 3640,
        "overall_occupancy_rate": 72.8,
        "zones": [
            {
                "zone_id": "ZONE-A",
                "name": "Zone A: Consumer Electronics & Computing",
                "category": "Electronics",
                "occupancy_rate": 88,
                "units_stored": 1240,
                "max_capacity": 1400,
                "rack_count": "18 Racks (Bays 01-18)",
                "environmental": "21°C | 42% Humidity (Climate Controlled)",
                "status": "Optimal",
                "color": "#3B82F6"
            },
            {
                "zone_id": "ZONE-B",
                "name": "Zone B: Apparel, Fashion & Footwear",
                "category": "Fashion",
                "occupancy_rate": 64,
                "units_stored": 890,
                "max_capacity": 1400,
                "rack_count": "14 Racks (Hanger Bins 01-14)",
                "environmental": "24°C | 48% Humidity (Dust Proofed)",
                "status": "Healthy",
                "color": "#8B5CF6"
            },
            {
                "zone_id": "ZONE-C",
                "name": "Zone C: Home, Living & Ergonomics",
                "category": "Home & Kitchen",
                "occupancy_rate": 45,
                "units_stored": 620,
                "max_capacity": 1300,
                "rack_count": "12 Pallet Bins (Floor Bays 01-12)",
                "environmental": "Standard Ambient (23°C)",
                "status": "High Availability",
                "color": "#10B981"
            },
            {
                "zone_id": "ZONE-D",
                "name": "Zone D: Sports, Fitness & Outdoor Gear",
                "category": "Sports",
                "occupancy_rate": 72,
                "units_stored": 510,
                "max_capacity": 700,
                "rack_count": "8 Heavy Duty Racks",
                "environmental": "Standard Ambient (22°C)",
                "status": "Healthy",
                "color": "#F59E0B"
            },
            {
                "zone_id": "VAULT-01",
                "name": "Secure High-Value Vault",
                "category": "Flagship Smart Devices",
                "occupancy_rate": 91,
                "units_stored": 380,
                "max_capacity": 420,
                "rack_count": "Biometric Lock Vault A1-A4",
                "environmental": "19°C | Nitrogen Protected",
                "status": "Near Capacity",
                "color": "#EC4899"
            }
        ],
        "kpis": {
            "avg_dispatch_time": "1.4 Hours",
            "audit_accuracy": "99.85%",
            "supplier_lead_time": "2.2 Days",
            "stockout_prevention_rate": "99.2%"
        }
    }


@router.post("/simulate-stock")
def simulate_inventory_action(payload: Dict[str, Any], db: Session = Depends(get_db)):
    action = payload.get("action", "simulate_low_stock")
    vendor_id = payload.get("vendor_id")
    
    if vendor_id:
        try:
            v_id_int = int(vendor_id)
            products = db.query(models.Product).filter(models.Product.vendor_id == v_id_int).all()
        except:
            products = db.query(models.Product).all()
    else:
        products = db.query(models.Product).all()

    if not products:
        products = db.query(models.Product).all()

    if action == "simulate_out_of_stock":
        count = 0
        for p in products[:2]:
            p.stock_quantity = 0
            p.stock = "No Stock"
            count += 1
        db.commit()
        return {
            "status": "success",
            "action": action,
            "message": f"Simulated Out of Stock (0 units) for {count} products. Critical alarms activated!"
        }

    elif action == "simulate_low_stock":
        count = 0
        for p in products[:3]:
            p.stock_quantity = 3
            p.stock = "Low Stock"
            count += 1
        db.commit()
        return {
            "status": "success",
            "action": action,
            "message": f"Simulated low-stock condition (3 units) for {count} products. Low-stock warnings triggered!"
        }

    elif action == "quick_restock_all":
        count = 0
        for p in products:
            if p.stock_quantity <= p.reorder_threshold or p.stock == "Low Stock" or p.stock == "No Stock":
                p.stock_quantity = max(p.stock_quantity + 50, 65)
                p.stock = "In Stock"
                count += 1
        db.commit()
        return {
            "status": "success",
            "action": action,
            "message": f"Successfully restocked {count} low-stock/depleted items with +50 units each!"
        }

    elif action == "log_inbound_shipment":
        target = products[0] if products else None
        if target:
            target.stock_quantity += 100
            target.stock = "In Stock"
            db.commit()
            return {
                "status": "success",
                "action": action,
                "message": f"Recorded new Inbound Air Cargo Restock (+100 Units) for {target.name} via DHL Express AWB-DHL-994821!"
            }
        return {"status": "success", "message": "Inbound cargo shipment logged successfully!"}

    elif action == "log_express_dispatch":
        target = products[1] if len(products) > 1 else (products[0] if products else None)
        if target:
            target.stock_quantity = max(target.stock_quantity - 5, 0)
            if target.stock_quantity == 0:
                target.stock = "No Stock"
            elif target.stock_quantity <= target.reorder_threshold:
                target.stock = "Low Stock"
            db.commit()
            return {
                "status": "success",
                "action": action,
                "message": f"Recorded Priority Express Dispatch (-5 Units) for {target.name} (Remaining: {target.stock_quantity} units)!"
            }
        return {"status": "success", "message": "Express dispatch logged successfully!"}

    elif action in ["simulate_all_vendors", "simulate_all_vendors_product_release", "simulate_all_vendors_new_products"] or (action == "simulate_new_product_release" and str(vendor_id).lower() in ["all", "*"]):
        vendors = db.query(models.Vendor).all()
        if not vendors:
            # Fallback to create initial vendor if none exist
            v_default = models.Vendor(name="ShopSense Flagship Store", email="flagship@shopsense.com", rating=4.9, status="Active")
            db.add(v_default)
            db.commit()
            db.refresh(v_default)
            vendors = [v_default]

        released = []
        for v in vendors:
            p = generate_simulated_product_for_vendor(v, db)
            released.append({
                "id": p.id,
                "name": p.name,
                "category": p.category,
                "price": p.price,
                "stock": p.stock,
                "stock_quantity": p.stock_quantity,
                "vendor_id": p.vendor_id,
                "vendor_name": v.name,
                "image_url": p.image_url
            })

        return {
            "status": "success",
            "action": action,
            "message": f"🚀 Successfully launched {len(released)} new market releases across ALL {len(vendors)} vendors (including newly approved stores)! Immediately synced with Customer Platform.",
            "products": released,
            "product": released[0] if released else None
        }

    elif action == "simulate_new_product_release":
        # Realistic new market releases tailored for the target vendor (any existing or newly approved vendor)
        v_target_id = None
        if vendor_id:
            try:
                v_target_id = int(vendor_id)
            except:
                pass

        vendor_obj = None
        if v_target_id:
            vendor_obj = db.query(models.Vendor).filter(models.Vendor.id == v_target_id).first()

        if not vendor_obj:
            vendor_obj = db.query(models.Vendor).first()

        if not vendor_obj:
            vendor_obj = models.Vendor(name="ShopSense Flagship Store", email="flagship.store@shopsense.com", rating=4.9, status="Active")
            db.add(vendor_obj)
            db.commit()
            db.refresh(vendor_obj)

        v_name = vendor_obj.name
        new_prod = generate_simulated_product_for_vendor(vendor_obj, db)

        return {
            "status": "success",
            "action": action,
            "message": f"🚀 Launched new market release '{new_prod.name}' into {v_name}! Immediately synced with Customer Platform.",
            "product": {
                "id": new_prod.id,
                "name": new_prod.name,
                "category": new_prod.category,
                "price": new_prod.price,
                "stock": new_prod.stock,
                "stock_quantity": new_prod.stock_quantity,
                "vendor_id": new_prod.vendor_id,
                "vendor_name": v_name,
                "image_url": new_prod.image_url
            }
        }

    elif action == "simulate_customer_purchase":
        # Target specific vendor catalog if vendor_id is given
        target_prods = products
        v_name = "Marketplace"
        if vendor_id and str(vendor_id).lower() not in ["all", "*"]:
            try:
                v_obj = db.query(models.Vendor).filter(models.Vendor.id == int(vendor_id)).first()
                if v_obj:
                    v_name = v_obj.name
                    v_prods = db.query(models.Product).filter(models.Product.vendor_id == v_obj.id).all()
                    if v_prods:
                        target_prods = v_prods
            except:
                pass

        depleted = []
        import random
        for p in target_prods:
            sold_units = random.randint(8, 22)
            p.units_sold = (p.units_sold or 0) + sold_units
            p.stock_quantity = max(p.stock_quantity - sold_units, 0)
            if p.stock_quantity == 0:
                p.stock = "No Stock"
            elif p.stock_quantity <= p.reorder_threshold:
                p.stock = "Low Stock"
            else:
                p.stock = "In Stock"
            depleted.append({
                "id": p.id,
                "name": p.name,
                "stock_quantity": p.stock_quantity,
                "stock": p.stock,
                "units_sold": p.units_sold
            })
        db.commit()

        low_count = sum(1 for p in target_prods if p.stock == "Low Stock")
        out_count = sum(1 for p in target_prods if p.stock == "No Stock")
        return {
            "status": "success",
            "action": action,
            "message": f"📉 Customer Purchase Wave simulated for {v_name}: {len(target_prods)} products updated. Alerts: {low_count} Low Stock, {out_count} Out of Stock!",
            "products": depleted
        }

    elif action == "simulate_restock_cycle":
        # Restock target vendor warehouse inventory
        target_prods = products
        v_name = "Vendor Warehouse"
        if vendor_id and str(vendor_id).lower() not in ["all", "*"]:
            try:
                v_obj = db.query(models.Vendor).filter(models.Vendor.id == int(vendor_id)).first()
                if v_obj:
                    v_name = v_obj.name
                    v_prods = db.query(models.Product).filter(models.Product.vendor_id == v_obj.id).all()
                    if v_prods:
                        target_prods = v_prods
            except:
                pass

        restocked_count = 0
        restocked_items = []
        for p in target_prods:
            if p.stock_quantity <= p.reorder_threshold or p.stock in ["Low Stock", "No Stock"]:
                p.stock_quantity = max(p.stock_quantity + 60, 75)
                p.stock = "In Stock"
                restocked_count += 1
                restocked_items.append({"id": p.id, "name": p.name, "stock_quantity": p.stock_quantity})
        db.commit()

        return {
            "status": "success",
            "action": action,
            "message": f"🔄 Vendor Warehouse Replenishment for {v_name}: Restocked {restocked_count} low/depleted products with +60 units each. All items back In Stock!",
            "restocked_count": restocked_count,
            "items": restocked_items
        }

    elif action == "simulate_full_lifecycle":
        # Full end-to-end simulation cycle for the target vendor (or all vendors):
        v_target_id = None
        if vendor_id and str(vendor_id).lower() not in ["all", "*"]:
            try:
                v_target_id = int(vendor_id)
            except:
                pass

        vendor_obj = None
        if v_target_id:
            vendor_obj = db.query(models.Vendor).filter(models.Vendor.id == v_target_id).first()

        if not vendor_obj:
            vendor_obj = db.query(models.Vendor).first()

        if not vendor_obj:
            vendor_obj = models.Vendor(name="ShopSense Flagship Store", email="flagship.store@shopsense.com", rating=4.9, status="Active")
            db.add(vendor_obj)
            db.commit()
            db.refresh(vendor_obj)

        v_name = vendor_obj.name

        # Step 1: Launch new product
        new_prod = generate_simulated_product_for_vendor(vendor_obj, db)

        # Step 2: Customer purchase surge
        active_prods = db.query(models.Product).filter(models.Product.vendor_id == vendor_obj.id).all() if vendor_obj else products
        import random
        for p in active_prods[:4]:
            p.stock_quantity = max(p.stock_quantity - random.randint(15, 30), 0)
            if p.stock_quantity == 0:
                p.stock = "No Stock"
            elif p.stock_quantity <= p.reorder_threshold:
                p.stock = "Low Stock"

        # Step 3: Auto-reorder for depleted items
        restocked = 0
        for p in active_prods:
            if p.stock in ["Low Stock", "No Stock"]:
                p.stock_quantity = max(p.stock_quantity + 50, 65)
                p.stock = "In Stock"
                restocked += 1
        db.commit()

        return {
            "status": "success",
            "action": action,
            "message": f"⚡ Full Market Lifecycle Cycle Completed for {v_name}: New release '{new_prod.name}' launched, customer order surges registered, inventory depleted, and {restocked} products restocked to optimal health!",
            "product": {
                "id": new_prod.id,
                "name": new_prod.name,
                "category": new_prod.category,
                "price": new_prod.price,
                "stock": new_prod.stock,
                "stock_quantity": new_prod.stock_quantity,
                "vendor_id": new_prod.vendor_id,
                "vendor_name": v_name
            }
        }

    elif action == "reset_optimal":
        for idx, p in enumerate(products):
            p.stock_quantity = 40 + ((idx * 7) % 35)
            p.stock = "In Stock"
        db.commit()
        return {
            "status": "success",
            "action": action,
            "message": f"All {len(products)} vendor catalog stocks reset to optimal baseline (40-75 units)!"
        }

    return {"status": "error", "message": "Unknown simulation action"}
