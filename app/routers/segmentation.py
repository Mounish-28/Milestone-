from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from typing import List, Dict, Any

try:
    from database import get_db
    import models
except ImportError:
    from app.database import get_db
    from app import models

router = APIRouter(prefix="/analytics", tags=["Customer Segmentation & Insights"])


@router.get("/customer-segmentation")
@router.get("/segmentation")
def get_customer_segmentation(db: Session = Depends(get_db)):
    """
    SQL-based customer segmentation grouping customers by total spent.
    Tiers:
      - VIP / High Value (>= $300)
      - Moderate Spender ($100 - $300)
      - Low Spender / New (< $100)
    """
    customers = db.query(models.Customer).all()
    transactions = db.query(models.Transaction).all()

    # Aggregate customer total spent via SQL / Python mapping
    customer_spend_map = {}
    customer_order_count = {}

    for t in transactions:
        c_name = t.customer_name.strip()
        customer_spend_map[c_name] = customer_spend_map.get(c_name, 0.0) + t.amount
        customer_order_count[c_name] = customer_order_count.get(c_name, 0) + 1

    vip_customers = []
    moderate_customers = []
    low_customers = []

    for c in customers:
        total_spent = round(customer_spend_map.get(c.name.strip(), 0.0), 2)
        orders = customer_order_count.get(c.name.strip(), 0)

        if total_spent >= 300.0:
            tier = "VIP / High Value"
            vip_customers.append({
                "id": c.id, "name": c.name, "email": c.email, "city": c.city,
                "total_spent": total_spent, "orders": orders, "tier": tier
            })
        elif total_spent >= 100.0:
            tier = "Moderate Spender"
            moderate_customers.append({
                "id": c.id, "name": c.name, "email": c.email, "city": c.city,
                "total_spent": total_spent, "orders": orders, "tier": tier
            })
        else:
            tier = "Low Spender / New"
            low_customers.append({
                "id": c.id, "name": c.name, "email": c.email, "city": c.city,
                "total_spent": total_spent, "orders": orders, "tier": tier
            })

    total_customers = len(customers)
    total_revenue = round(sum(customer_spend_map.values()), 2)

    return {
        "summary": {
            "total_customers": total_customers,
            "total_revenue": total_revenue,
            "vip_count": len(vip_customers),
            "moderate_count": len(moderate_customers),
            "low_count": len(low_customers),
        },
        "segments": [
            {
                "segment_name": "VIP / High Value",
                "criteria": "Total Spent >= $300",
                "customer_count": len(vip_customers),
                "total_segment_revenue": round(sum(c["total_spent"] for c in vip_customers), 2),
                "customers": vip_customers
            },
            {
                "segment_name": "Moderate Spender",
                "criteria": "$100 <= Total Spent < $300",
                "customer_count": len(moderate_customers),
                "total_segment_revenue": round(sum(c["total_spent"] for c in moderate_customers), 2),
                "customers": moderate_customers
            },
            {
                "segment_name": "Low Spender / New",
                "criteria": "Total Spent < $100",
                "customer_count": len(low_customers),
                "total_segment_revenue": round(sum(c["total_spent"] for c in low_customers), 2),
                "customers": low_customers
            }
        ]
    }


@router.get("/customer-insights/{customer_id}")
def get_customer_insights(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    customer_transactions = (
        db.query(models.Transaction)
        .filter(models.Transaction.customer_name == customer.name)
        .all()
    )

    total_spent = sum(t.amount for t in customer_transactions)
    order_count = len(customer_transactions)
    avg_order_value = round(total_spent / order_count, 2) if order_count > 0 else 0.0

    tier = "VIP / High Value" if total_spent >= 300 else ("Moderate Spender" if total_spent >= 100 else "Low Spender / New")

    return {
        "customer_id": customer.id,
        "name": customer.name,
        "email": customer.email,
        "city": customer.city,
        "country": customer.country,
        "segment_tier": tier,
        "metrics": {
            "total_spent": round(total_spent, 2),
            "order_count": order_count,
            "avg_order_value": avg_order_value
        },
        "recent_transactions": [
            {
                "transaction_ref": t.transaction_ref,
                "amount": t.amount,
                "payment_method": t.payment_method,
                "status": t.status,
                "created_at": t.created_at
            }
            for t in customer_transactions
        ]
    }
