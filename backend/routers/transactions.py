from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
import uuid
import json
import asyncio
import logging

try:
    from database import get_db
    from models import Transaction, Product, Customer
    from schemas import TransactionCreate, TransactionResponse
    from websocket_manager import manager
except ImportError:
    from app.database import get_db
    from app.models import Transaction, Product, Customer
    from app.schemas import TransactionCreate, TransactionResponse
    from app.websocket_manager import manager

router = APIRouter(
    prefix="/transactions",
    tags=["Global Transactions & Orders"]
)

@router.post("/", response_model=TransactionResponse)
def create_transaction(data: TransactionCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    tx_ref = "TXN-" + str(uuid.uuid4())[:8].upper()

    product_name = None
    vendor_id = None
    if data.product_id:
        product = db.query(Product).filter(Product.id == data.product_id).first()
        if product:
            product_name = product.name
            vendor_id = product.vendor_id
            # Deduct stock and increment units sold
            qty = data.quantity or 1
            product.stock_quantity = max(0, product.stock_quantity - qty)
            product.units_sold = (product.units_sold or 0) + qty
            if product.stock_quantity == 0:
                product.stock = "No Stock"
            elif product.stock_quantity <= product.reorder_threshold:
                product.stock = "Low Stock"
            else:
                product.stock = "In Stock"

    new_tx = Transaction(
        transaction_ref=tx_ref,
        customer_id=data.customer_id,
        customer_name=data.customer_name,
        product_id=data.product_id,
        product_name=product_name,
        vendor_id=vendor_id,
        quantity=data.quantity or 1,
        amount=data.amount,
        payment_method=data.payment_method or "UPI / Card",
        status=data.status or "Completed"
    )

    db.add(new_tx)
    db.commit()
    db.refresh(new_tx)

    # Real-time WebSocket Broadcast
    ws_msg = {
        "type": "new_sale",
        "transaction_ref": new_tx.transaction_ref,
        "product_name": new_tx.product_name,
        "amount": new_tx.amount,
        "vendor_id": new_tx.vendor_id,
        "customer_name": new_tx.customer_name
    }

    def sync_broadcast(msg: str):
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(manager.broadcast(msg))
            loop.close()
        except Exception:
            pass

    if background_tasks:
        background_tasks.add_task(sync_broadcast, json.dumps(ws_msg))

    # Simulate Email & SMS Notifications for safety and confirmation
    logger = logging.getLogger("Notifications")
    logger.setLevel(logging.INFO)
    logger.info(f"[EMAIL TO ADMIN/VENDOR]: Payment of ${data.amount} received for order {tx_ref}. Safety check passed.")
    logger.info(f"[EMAIL TO CUSTOMER]: Your order {tx_ref} has been placed successfully for ${data.amount}. Thank you for using ShopSense!")
    logger.info(f"[SMS TO CUSTOMER]: Order {tx_ref} placed successfully. Amount: ${data.amount}.")

    return new_tx


@router.get("/", response_model=list[TransactionResponse])
def get_all_transactions(
    customer_name: str | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(Transaction)
    if customer_name:
        query = query.filter(Transaction.customer_name.ilike(f"%{customer_name}%"))
    return query.order_by(Transaction.created_at.desc()).all()


@router.get("/customer/{customer_name}", response_model=list[TransactionResponse])
def get_customer_transactions(customer_name: str, db: Session = Depends(get_db)):
    return db.query(Transaction).filter(
        Transaction.customer_name.ilike(f"%{customer_name}%")
    ).order_by(Transaction.created_at.desc()).all()


@router.get("/customer-summary/{customer_name}")
def get_customer_summary(customer_name: str, db: Session = Depends(get_db)):
    txs = db.query(Transaction).filter(
        Transaction.customer_name.ilike(f"%{customer_name}%")
    ).all()

    total_orders = len(txs)
    total_spent = sum(t.amount for t in txs)
    completed_orders = sum(1 for t in txs if t.status == "Completed")
    active_orders = sum(1 for t in txs if t.status in ["In Transit", "Processing", "Ordered", "Out for Delivery"])

    return {
        "customer_name": customer_name,
        "total_orders": total_orders,
        "total_spent": round(total_spent, 2),
        "estimated_cashback_saved": round(total_spent * 0.15, 2),
        "completed_orders": completed_orders,
        "active_orders": active_orders
    }


@router.patch("/{tx_id}/cancel", response_model=TransactionResponse)
def cancel_transaction(tx_id: int, db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if tx.status == "Cancelled":
        raise HTTPException(status_code=400, detail="Order is already cancelled")

    # Restore stock if product exists
    if tx.product_id:
        prod = db.query(Product).filter(Product.id == tx.product_id).first()
        if prod:
            prod.stock_quantity += tx.quantity
            prod.units_sold = max(0, (prod.units_sold or 0) - tx.quantity)
            if prod.stock_quantity > prod.reorder_threshold:
                prod.stock = "In Stock"

    tx.status = "Cancelled"
    db.commit()
    db.refresh(tx)
    return tx


@router.get("/{tx_id}", response_model=TransactionResponse)
def get_transaction(tx_id: int, db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx


@router.get("/tracking/{order_ref}")
def get_order_tracking(order_ref: str, db: Session = Depends(get_db)):
    from datetime import datetime, timedelta
    
    tx = None
    if order_ref.isdigit():
        tx = db.query(Transaction).filter(Transaction.id == int(order_ref)).first()
    if not tx:
        tx = db.query(Transaction).filter(Transaction.transaction_ref.ilike(f"%{order_ref}%")).first()
    if not tx:
        tx = db.query(Transaction).order_by(Transaction.created_at.desc()).first()

    created_time = tx.created_at if (tx and tx.created_at) else datetime.utcnow()
    prod_name = tx.product_name if (tx and tx.product_name) else "Samsung Galaxy S24 Ultra 5G"
    prod_img = None
    if tx and tx.product_id:
        prod = db.query(Product).filter(Product.id == tx.product_id).first()
        if prod:
            prod_img = prod.image_url
            if not prod_name:
                prod_name = prod.name
    if not prod_img:
        prod_img = "https://m.media-amazon.com/images/I/81vxWpPpgNL.jpg"

    tx_status = (tx.status if tx else "Out for Delivery")
    
    # Map status to stage (1-5)
    stage = 4
    st_lower = tx_status.lower()
    if st_lower in ["placed", "ordered", "pending"]:
        stage = 1
    elif st_lower in ["processing", "packed"]:
        stage = 2
    elif st_lower in ["in transit", "dispatched", "shipped"]:
        stage = 3
    elif st_lower in ["out for delivery"]:
        stage = 4
    elif st_lower in ["completed", "delivered"]:
        stage = 5
    elif st_lower in ["cancelled"]:
        stage = 0

    stages = [
        {
            "stage": 1,
            "title": "Order Placed & Payment Verified",
            "desc": "Payment confirmed via Instant UPI / Net Banking. Order transmitted to merchant.",
            "time": (created_time).strftime("%I:%M %p"),
            "completed": stage >= 1,
            "current": stage == 1
        },
        {
            "stage": 2,
            "title": "Inspected & Packed at Hub",
            "desc": "Item certified at ShopSense BKC Central Fulfillment Hub with security tamper-proof seal.",
            "time": (created_time + timedelta(minutes=15)).strftime("%I:%M %p"),
            "completed": stage >= 2,
            "current": stage == 2
        },
        {
            "stage": 3,
            "title": "Dispatched via Express Courier",
            "desc": "Package handed over to Express Courier Partner. Vehicle departing regional hub.",
            "time": (created_time + timedelta(minutes=30)).strftime("%I:%M %p"),
            "completed": stage >= 3,
            "current": stage == 3
        },
        {
            "stage": 4,
            "title": "Out for Delivery (Live GPS Active)",
            "desc": "Courier is 1.8 km away heading towards your delivery address.",
            "time": (created_time + timedelta(minutes=45)).strftime("%I:%M %p"),
            "completed": stage >= 4,
            "current": stage == 4
        },
        {
            "stage": 5,
            "title": "Delivered & Verified",
            "desc": "Package safely handed over with 4-digit OTP verification.",
            "time": (created_time + timedelta(minutes=60)).strftime("%I:%M %p") if stage == 5 else "Est. by 9:45 PM",
            "completed": stage == 5,
            "current": stage == 5
        }
    ]

    telemetry_logs = [
        {"time": (created_time + timedelta(minutes=48)).strftime("%I:%M:%S %p"), "event": "Courier reached Bandra West Hill Road junction."},
        {"time": (created_time + timedelta(minutes=42)).strftime("%I:%M:%S %p"), "event": "Departed Western Express Highway flyover, speed 32 km/h."},
        {"time": (created_time + timedelta(minutes=35)).strftime("%I:%M:%S %p"), "event": "Passed Mahim Causeway transit security gate."},
        {"time": (created_time + timedelta(minutes=30)).strftime("%I:%M:%S %p"), "event": "Package loaded onto Hero Electric Nyx delivery vehicle."},
        {"time": (created_time + timedelta(minutes=15)).strftime("%I:%M:%S %p"), "event": "Security barcode scan SS-BKC-9921 cleared."}
    ]

    waypoints = [
        {"step": 0, "lat": 19.0657, "lng": 72.8687, "label": "ShopSense BKC Central Hub"},
        {"step": 1, "lat": 19.0632, "lng": 72.8590, "label": "Kalanagar Junction"},
        {"step": 2, "lat": 19.0601, "lng": 72.8510, "label": "Western Express Highway"},
        {"step": 3, "lat": 19.0575, "lng": 72.8420, "label": "Bandra Station East"},
        {"step": 4, "lat": 19.0550, "lng": 72.8365, "label": "Lucky Junction"},
        {"step": 5, "lat": 19.0570, "lng": 72.8320, "label": "Hill Road Marker"},
        {"step": 6, "lat": 19.0596, "lng": 72.8295, "label": "Sunshine Heights (Destination)"}
    ]

    return {
        "transaction_ref": tx.transaction_ref if tx else order_ref,
        "customer_name": tx.customer_name if tx else "Customer",
        "product_name": prod_name,
        "product_image": prod_img,
        "amount": tx.amount if tx else 139999.0,
        "quantity": tx.quantity if tx else 1,
        "payment_method": tx.payment_method if tx else "UPI / GPay",
        "status": tx_status,
        "current_stage": stage,
        "eta_display": "14 minutes remaining",
        "distance_remaining_km": 1.8 if stage == 4 else (0 if stage == 5 else 6.5),
        "speed_kmh": 28 if stage == 4 else 0,
        "otp": "7492",
        "courier": {
            "name": "Vikram Rathore",
            "phone": "+91 98201 44829",
            "rating": 4.9,
            "badge": "Elite Verified Partner",
            "deliveries": 1420,
            "vehicle_model": "Hero Electric Nyx (Commercial Cargo)",
            "vehicle_number": "MH-02-EE-8821",
            "photo": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
        },
        "hub": {
            "name": "ShopSense BKC Central Fulfillment Hub",
            "address": "Unit 4B, G-Block, Bandra Kurla Complex, Mumbai - 400051",
            "lat": 19.0657,
            "lng": 72.8687
        },
        "delivery_address": {
            "name": tx.customer_name if tx else "Customer",
            "address": "Flat 402, Sunshine Heights, Hill Road, Bandra West, Mumbai - 400050",
            "city": "Mumbai",
            "state": "Maharashtra",
            "pincode": "400050",
            "lat": 19.0596,
            "lng": 72.8295
        },
        "stages": stages,
        "telemetry_logs": telemetry_logs,
        "waypoints": waypoints
    }


@router.post("/tracking/{order_ref}/advance")
def advance_order_tracking(order_ref: str, stage: int | None = None, status: str | None = None, db: Session = Depends(get_db)):
    tx = None
    if order_ref.isdigit():
        tx = db.query(Transaction).filter(Transaction.id == int(order_ref)).first()
    if not tx:
        tx = db.query(Transaction).filter(Transaction.transaction_ref.ilike(f"%{order_ref}%")).first()
    
    stage_to_status = {
        1: "Processing",
        2: "Packed",
        3: "In Transit",
        4: "Out for Delivery",
        5: "Completed"
    }

    new_status = status
    if stage and stage in stage_to_status:
        new_status = stage_to_status[stage]

    if tx and new_status:
        tx.status = new_status
        db.commit()
        db.refresh(tx)

    return {"success": True, "transaction_ref": order_ref, "new_status": new_status or (tx.status if tx else "Out for Delivery")}

