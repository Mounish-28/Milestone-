import sys
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

# Ensure local imports work regardless of cwd
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import Base, engine, SessionLocal
import models

from routers import auth
from routers import products
from routers import transactions
from routers import customers
from routers import recommendations
from routers import assistant
from routers import ai_agent
from routers import vendors
from routers import analytics
from routers import segmentation
from routers import inventory
from routers import admin_governance
from routers import data_analyst
from routers import rag_assistant
from fastapi import WebSocket, WebSocketDisconnect
from websocket_manager import manager

# Create Database Tables if not exists
Base.metadata.create_all(bind=engine)

def seed_initial_database():
    try:
        from seed_100_products import seed_all_real_world_products
        seed_all_real_world_products()
    except Exception:
        pass

    db: Session = SessionLocal()
    try:
        if db.query(models.Customer).count() == 0:
            c1 = models.Customer(name="Aarav Sharma", email="aarav@gmail.com", phone="+91 9876543210", city="Mumbai", country="India")
            c2 = models.Customer(name="Priya Patel", email="priya@gmail.com", phone="+91 9876543211", city="Bangalore", country="India")
            c3 = models.Customer(name="Vikram Singh", email="vikram@gmail.com", phone="+91 9876543212", city="Delhi", country="India")
            c4 = models.Customer(name="Ananya Roy", email="ananya@gmail.com", phone="+91 9876543213", city="Kolkata", country="India")
            db.add_all([c1, c2, c3, c4])
            db.commit()

        if db.query(models.Transaction).count() == 0:
            p1 = db.query(models.Product).first()
            p1_name = p1.name if p1 else "Samsung Galaxy S24 Ultra 5G"
            p1_id = p1.id if p1 else 1
            t1 = models.Transaction(transaction_ref="TXN-984210", customer_id=1, customer_name="Aarav Sharma", product_id=p1_id, product_name=p1_name, quantity=1, amount=1299.99, payment_method="UPI", status="Completed", created_at=datetime.utcnow() - timedelta(days=2))
            t2 = models.Transaction(transaction_ref="TXN-881240", customer_id=2, customer_name="Priya Patel", product_id=p1_id, product_name="Nike Air Jordan 1 Retro High OG", quantity=1, amount=180.00, payment_method="Credit Card", status="Completed", created_at=datetime.utcnow() - timedelta(days=5))
            t3 = models.Transaction(transaction_ref="TXN-771920", customer_id=1, customer_name="Aarav Sharma", product_id=p1_id, product_name="Herman Miller Aeron Chair", quantity=1, amount=1395.00, payment_method="Net Banking", status="Completed", created_at=datetime.utcnow() - timedelta(days=1))
            t4 = models.Transaction(transaction_ref="TXN-661200", customer_id=3, customer_name="Vikram Singh", product_id=p1_id, product_name="DJI Mini 4 Pro Drone", quantity=1, amount=959.00, payment_method="UPI", status="Completed", created_at=datetime.utcnow() - timedelta(days=10))
            db.add_all([t1, t2, t3, t4])
            db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()

seed_initial_database()

app = FastAPI(
    title="ShopSense AI — Customer Marketplace Backend API",
    description="Dedicated Customer-Facing Microservice for E-Commerce Catalog, AI Shopping Assistant, Order Tracking & Multilingual Voice Search.",
    version="2.0.0"
)

# Configure CORS for Customer Frontend (port 5174) & Admin Portal (port 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include All Routers
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(vendors.router)
app.include_router(transactions.router)
app.include_router(customers.router)
app.include_router(recommendations.router)
app.include_router(recommendations.rec_router)
app.include_router(assistant.router)
app.include_router(ai_agent.router)
app.include_router(analytics.router)
app.include_router(segmentation.router)
app.include_router(inventory.router)
app.include_router(admin_governance.router)
app.include_router(data_analyst.router)
app.include_router(rag_assistant.router)

@app.websocket('/ws/sales')
async def websocket_sales(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)


@app.get("/")
def read_root():
    return {
        "service": "ShopSense AI Customer Marketplace Backend",
        "status": "online",
        "version": "2.0.0",
        "docs_url": "/docs",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/health")
def health_check():
    return {
        "status": "online",
        "service": "customer-backend",
        "version": "5.0.0",
        "milestone": "Milestone 4 & Milestone 5 Completed",
        "environment": "production",
        "timestamp": datetime.utcnow().isoformat()
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)