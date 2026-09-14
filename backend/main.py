import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import json

from database import Base, engine, SessionLocal
import models

from routers import auth
from routers import vendors
from routers import products
from routers import customers
from routers import analytics
from routers import transactions
from routers import inventory
from routers import segmentation
from routers import recommendations
from routers import assistant
from routers import admin_governance
from routers import ai_agent
from routers import data_analyst
from routers import rag_assistant
from fastapi import WebSocket, WebSocketDisconnect
from websocket_manager import manager

# Create Database Tables
Base.metadata.create_all(bind=engine)

# Auto-seed database with default items if empty
def seed_initial_database():
    try:
        from seed_100_products import seed_all_real_world_products
        seed_all_real_world_products()
    except Exception as e:
        print(f"Seed error: {e}")

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

        if db.query(models.ProductReview).count() == 0:
            first_prod = db.query(models.Product).first()
            pid = first_prod.id if first_prod else 1
            r1 = models.ProductReview(
                product_id=pid, customer_name="Aarav Sharma", rating=5.0,
                review_text="Outstanding noise cancellation and comfortable ear cushions for long work calls.",
                sentiment_score=0.92, sentiment_label="Positive",
                pros="Crisp audio quality, impressive 40h battery", cons="Carrying case is slightly bulky"
            )
            r2 = models.ProductReview(
                product_id=pid, customer_name="Priya Patel", rating=4.5,
                review_text="Accurate heart rate tracker and bright AMOLED screen even under direct sunlight.",
                sentiment_score=0.88, sentiment_label="Positive",
                pros="Vibrant display, fast GPS lock", cons="App sync takes a few seconds"
            )
            db.add_all([r1, r2])
            db.commit()

        # Seed Admin Applicants if empty
        if db.query(models.AdminApplicant).count() == 0:
            a1 = models.AdminApplicant(
                applicant_ref="ADM-APP-201",
                full_name="Vikramaditya Sen",
                username="vikram_sen",
                email="vikramaditya.sen@shopsense.com",
                phone="+91 9876501122",
                aadhaar_number="987654320011",
                gender="Male",
                requested_role="approver",
                requested_role_title="Type 3: Cross-Check & Commercial Approver Authority",
                experience_summary="8 years evaluating e-commerce vendor trade pacts, 5.0% performance bonds, and risk escrow controls at Amazon India.",
                resume_title="Senior Trade Compliance & Final Approval Director",
                education="MBA in Corporate Finance (IIM Bangalore, 2017) • B.Com Honors (SRCC Delhi, 2014)",
                certifications_json=json.dumps(["Certified Anti-Money Laundering Specialist (CAMS)", "ISO 27001 Lead Auditor"]),
                skills_json=json.dumps(["Merchant Escrow Vaults", "5.0% Performance Bond Execution", "Official ShopSense Seal Commissioning"]),
                attached_file_name="Resume_Vikramaditya_Sen_CAMS.pdf",
                status="PENDING"
            )
            a2 = models.AdminApplicant(
                applicant_ref="ADM-APP-202",
                full_name="Priyanka Deshmukh",
                username="priyanka_deshmukh",
                email="priyanka.deshmukh@shopsense.com",
                phone="+91 9876502233",
                aadhaar_number="987654320022",
                gender="Female",
                requested_role="verifier",
                requested_role_title="Type 2: Compliance & Physical Facility Verifier",
                experience_summary="6 years conducting live warehouse geo-inspections, DGCA drone audits, and ISO packaging certifications at Flipkart Logistics.",
                resume_title="Lead Logistics Compliance & Multi-Hub Quality Inspector",
                education="M.Tech in Industrial Supply Chain (IIT Bombay, 2018) • B.Tech Production Engineering (VJTI, 2016)",
                certifications_json=json.dumps(["Six Sigma Green Belt", "ISO 9001:2015 Lead Quality Assessor"]),
                skills_json=json.dumps(["Drone Telemetry Verification", "Warehouse Humidity Audits", "GSTIN & Geo-location Mapping"]),
                attached_file_name="CV_Priyanka_Deshmukh_MTech.pdf",
                status="PENDING"
            )
            a3 = models.AdminApplicant(
                applicant_ref="ADM-APP-203",
                full_name="Rohan Kulkarni",
                username="rohan_kulkarni",
                email="rohan.kulkarni@shopsense.com",
                phone="+91 9876503344",
                aadhaar_number="987654320033",
                gender="Male",
                requested_role="executor",
                requested_role_title="Type 1: System Operations & Legal Intake Executor",
                experience_summary="5 years analyzing high-volume vendor applications, criminal court records, and MCA legal filings at Paytm Mall.",
                resume_title="Operations Due-Diligence & Complaints Screening Specialist",
                education="LL.M in Corporate Law (Symbiosis Law School, 2019) • B.B.A LL.B (2017)",
                certifications_json=json.dumps(["Certified Fraud Examiner (CFE)", "SEBI Merchant Compliance"]),
                skills_json=json.dumps(["e-Courts Legal Scanning", "Trustability Score Modeling", "Discrepancy Desk Routing"]),
                attached_file_name="Resume_Rohan_Kulkarni_LLM.pdf",
                status="PENDING"
            )
            db.add_all([a1, a2, a3])
            db.commit()

        # Seed Chairman Tasks if empty
        if db.query(models.ChairmanTask).count() == 0:
            t1 = models.ChairmanTask(
                task_ref="TASK-801",
                target_admin="executor",
                target_admin_name="Mounish Sai (Executor Admin)",
                title="Scrutinize High-Volume Electronics Intake Applications",
                description="Conduct thorough 0-complaint background checks on all consumer electronics vendors and audit high-risk GSTINs.",
                priority="CRITICAL",
                status="IN_PROGRESS",
                due_date="2026-08-20 18:00"
            )
            t2 = models.ChairmanTask(
                task_ref="TASK-802",
                target_admin="verifier",
                target_admin_name="Ananya Rao (Verifier Admin)",
                title="Verify Cold-Storage & Multi-Hub Warehouse Facility in Pune Hub",
                description="Cross-examine physical geotagged imagery and satellite coordinates for multi-facility warehouse chains.",
                priority="HIGH",
                status="PENDING",
                due_date="2026-08-22 17:00"
            )
            t3 = models.ChairmanTask(
                task_ref="TASK-803",
                target_admin="approver",
                target_admin_name="Rajesh Menon (Approver Admin)",
                title="Execute 5.0% Escrow Bond Agreements for Fashion & Apparel Vendors",
                description="Ensure all newly cleared Stage 2 merchants sign the official 5.0% performance bond deed before seal release.",
                priority="HIGH",
                status="PENDING",
                due_date="2026-08-24 16:00"
            )
            db.add_all([t1, t2, t3])
            db.commit()

        # Seed Chairman Inquiries if empty
        if db.query(models.ChairmanInquiry).count() == 0:
            iq1 = models.ChairmanInquiry(
                inquiry_ref="INQ-501",
                target_admin="executor",
                target_admin_name="Mounish Sai (Executor Desk)",
                subject="Due-Diligence Checklist Verification",
                question="Have all e-Court records and consumer dispute databases been verified for the current 5 intake vendors?",
                status="ANSWERED",
                reply="Yes Chairman Mounish, full legal background checks and zero-complaint verification are complete across all 5 applicants.",
                reply_timestamp="2026-08-16 11:30"
            )
            iq2 = models.ChairmanInquiry(
                inquiry_ref="INQ-502",
                target_admin="verifier",
                target_admin_name="Ananya Rao (Verifier Desk)",
                subject="Warehouse Physical Geolocation Audits",
                question="Are all geo-tagged GPS coordinates matching the registered tax addresses for the Electronics and Furniture categories?",
                status="PENDING_REPLY"
            )
            iq3 = models.ChairmanInquiry(
                inquiry_ref="INQ-503",
                target_admin="approver",
                target_admin_name="Rajesh Menon (Approver Desk)",
                subject="Official Seal Release Protocols",
                question="Are merchant contracts strictly retaining the 5.0% gross selling escrow rate before issuing official ShopSense seals?",
                status="PENDING_REPLY"
            )
            db.add_all([iq1, iq2, iq3])
            db.commit()

        # Vendor Pipeline starts clean (0 pending applications).
        # Applications only appear when a new vendor applies via /vendor/register
    finally:
        db.close()

seed_initial_database()

# Swagger UI OpenAPI Metadata
tags_metadata = [
    {
        "name": "Autonomous AI Shopping & Business Agent",
        "description": "Milestone 5: LangGraph autonomous multi-step store auditor, weekly strategic discount directives (e.g., discounting high inventory with dropping demand), proactive executive email dispatch, cart optimizer, voice parser, and vendor/admin copilots.",
    },
    {
        "name": "Admin Governance & 3-Tier Clearance Desk",
        "description": "Supreme Chairman governance, Admin applicant resumes, role assignments, directives/tasks, inquiries, and 3-Tier clearance desks (Executor, Verifier, Approver).",
    },
    {
        "name": "Authentication & Aadhaar KYC",
        "description": "User login, Google Sign-In, Aadhaar OTP verification, Security Key delivery, and vendor online status.",
    },
    {
        "name": "Inventory Intelligence",
        "description": "Milestone 2: Quantitative stock levels, low-stock warnings, restock management, warehouse zones, and ML demand forecasting.",
    },
    {
        "name": "Customer Segmentation & Insights",
        "description": "Milestone 2: SQL-based customer grouping into VIP, Moderate, and Low Spender tiers with spending analytics.",
    },
    {
        "name": "Recommendations & Reviews",
        "description": "Milestone 2: Top-selling products, category recommendation engine, LLM review sentiment analysis, and video review search.",
    },
    {
        "name": "RAG Shopping Assistant",
        "description": "Milestone 3: Retrieval-Augmented Generation chatbot querying real-time catalog to recommend products tailored to user queries.",
    },
    {
        "name": "AI Natural Language Data Analyst",
        "description": "Milestone 3: Text-to-SQL conversational business intelligence allowing vendors to query sales data in natural language.",
    },
    {
        "name": "Analytics & Dashboard Stats",
        "description": "Milestone 3: Benchmark metrics vs marketplace average, sales charts formatting, revenue summaries, and PDF/Excel/CSV exports.",
    },
    {
        "name": "Global Transactions & Orders",
        "description": "Customer order history, transaction creation, live tracking stages, and payment logs.",
    },
    {
        "name": "Vendors",
        "description": "Milestone 1: Operations with marketplace vendors, registration, profile management, sales/revenue aggregation, and partner ratings.",
    },
    {
        "name": "Products",
        "description": "Milestone 1: Product catalog management, pricing, stock states, and vendor assignments.",
    },
    {
        "name": "Customers",
        "description": "Milestone 1: Customer directory, user profiles, address book, and city lookups.",
    },
]

app = FastAPI(
    title="ShopSense Multi-Vendor E-Commerce Analytics Platform API",
    description="""
    # 🛍️ ShopSense Multi-Vendor Analytics & Autonomous AI Platform
    
    Welcome to the interactive OpenAPI documentation for **ShopSense**, a complete enterprise-grade multi-vendor e-commerce platform.
    
    ## 📋 Milestone Architecture & Capabilities
    * **Milestone 1 (Marketplace Foundation)**: Database schema, Vendor Registration & Profile Management, Sales & Revenue Aggregation, Data Validation.
    * **Milestone 2 (Inventory Intelligence & Analytics)**: Stock tracking, low-stock alerts, SQL customer segmentation, rule-based recommendations, and LLM review sentiment.
    * **Milestone 3 (Advanced APIs & Reporting)**: Analytics charts formatting, marketplace benchmarking, CSV/PDF data exports, WebSockets real-time sales feed, RAG AI Shopping Assistant, Text-to-SQL Data Analyst.
    * **Milestone 4 (Optimization, Testing & Deployment)**: Multi-container Dockerization, Comprehensive OpenAPI/Swagger documentation, Pytest unit/integration test suites, and GitHub Actions CI/CD automation.
    * **Milestone 5 (Autonomous AI Agent & Cloud Deployment)**: LangGraph autonomous weekly vendor store auditing, proactive strategic discount directives for stagnant inventory, automated executive email dispatch, PostgreSQL cloud compatibility, and Render/AWS deployment blueprints.
    """,
    version="5.0.0",
    openapi_tags=tags_metadata,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include All Routers
app.include_router(admin_governance.router)
app.include_router(auth.router)
app.include_router(inventory.router)
app.include_router(segmentation.router)
app.include_router(recommendations.router)
app.include_router(recommendations.rec_router)
app.include_router(assistant.router)
app.include_router(analytics.router)
app.include_router(transactions.router)
app.include_router(vendors.router)
app.include_router(products.router)
app.include_router(customers.router)
app.include_router(ai_agent.router)
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

# Health Check Route
@app.get(
    "/health",
    summary="System Health & Milestone Status",
    description="Returns platform operational health, active version, completed milestone achievements, and enabled engine subsystems."
)
def health_check():
    return {
        "status": "online",
        "service": "ShopSense Multi-Vendor API",
        "version": "5.0.0",
        "milestone": "Milestone 4 & Milestone 5 Completed",
        "subsystems": {
            "milestone_1_marketplace": "ACTIVE",
            "milestone_2_inventory_intelligence": "ACTIVE",
            "milestone_3_advanced_bi_reporting": "ACTIVE",
            "milestone_4_optimization_testing_docker": "ACTIVE",
            "milestone_5_autonomous_ai_agent_langgraph": "ACTIVE"
        },
        "features": [
            "LangGraph Weekly Store Autonomous Auditor",
            "Proactive Strategic Advice & 1-Click Discounting",
            "Automated HTML Executive Advisory Email Dispatch",
            "Docker & Docker Compose Multi-Container Orchestration",
            "Pytest Automated Test Suites",
            "PostgreSQL & SQLite Dual Compatibility",
            "GitHub Actions CI/CD Pipeline"
        ]
    }

# Home Route
@app.get("/", summary="API Root Status")
def root():
    return {
        "message": "ShopSense Multi-Vendor API (Milestone 4 & 5 Complete) is running smoothly",
        "status": "online",
        "version": "5.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }