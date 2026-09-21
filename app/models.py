from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

try:
    from database import Base
except ImportError:
    from app.database import Base


# -----------------------------
# User / Auth Model (Admin & Vendor)
# -----------------------------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    display_name = Column(String, nullable=False)
    username = Column(String, unique=True, nullable=False)
    gender = Column(String, nullable=False, default="Male")  # Male (Mr.) / Female (Mrs.)
    aadhaar_number = Column(String, nullable=False)  # 12-digit Aadhaar
    email = Column(String, unique=True, nullable=False)
    phone = Column(String, nullable=True, default="+91 9876543210")
    role = Column(String, nullable=False, default="vendor")  # admin / vendor
    security_key = Column(String, nullable=False)  # Mandatory 24-hour rotating security key
    security_key_updated_at = Column(DateTime, default=datetime.utcnow)
    security_key_expires_at = Column(DateTime, nullable=True)
    is_aadhaar_verified = Column(Boolean, default=False)
    is_online = Column(Boolean, default=True)  # Vendor online status


# -----------------------------
# Vendor Model
# -----------------------------
class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    rating = Column(Float, default=4.8)
    status = Column(String, default="Active")

    products = relationship("Product", back_populates="vendor")


# -----------------------------
# Product Model
# -----------------------------
class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=True)
    price = Column(Float, nullable=False)
    stock = Column(String, nullable=False, default="In Stock")  # In Stock / Low Stock / No Stock
    stock_quantity = Column(Integer, default=25)  # Quantitative stock count
    reorder_threshold = Column(Integer, default=10)  # Low-stock alert trigger level
    units_sold = Column(Integer, default=0)
    rating = Column(Float, default=4.7)
    description = Column(String, nullable=True)
    image_url = Column(String, nullable=True)

    vendor_id = Column(Integer, ForeignKey("vendors.id"))

    vendor = relationship("Vendor", back_populates="products")
    reviews = relationship("ProductReview", back_populates="product", cascade="all, delete-orphan")

    @property
    def vendor_name(self):
        return self.vendor.name if self.vendor else "Authorized Merchant"


# -----------------------------
# Customer Model & Saved Delivery Addresses
# -----------------------------
class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone = Column(String, nullable=False)
    city = Column(String, nullable=False)
    country = Column(String, default="India")
    password_hash = Column(String, nullable=True)
    membership_tier = Column(String, default="Diamond")

    addresses = relationship("CustomerAddress", back_populates="customer", cascade="all, delete-orphan")


class CustomerAddress(Base):
    __tablename__ = "customer_addresses"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    address_line = Column(String, nullable=False)
    locality = Column(String, nullable=True)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    pincode = Column(String, nullable=False)
    address_type = Column(String, default="Home")  # Home / Work
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    customer = relationship("Customer", back_populates="addresses")


# -----------------------------
# Transaction / Order Model
# -----------------------------
class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    transaction_ref = Column(String, unique=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    customer_name = Column(String, nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    product_name = Column(String, nullable=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=True)
    quantity = Column(Integer, default=1)
    amount = Column(Float, nullable=False)
    payment_method = Column(String, default="UPI / Card")
    status = Column(String, default="Completed")  # Completed / Pending / Refunded
    created_at = Column(DateTime, default=datetime.utcnow)


# -----------------------------
# Product Review Model (LLM Sentiment Analysis)
# -----------------------------
class ProductReview(Base):
    __tablename__ = "product_reviews"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    customer_name = Column(String, nullable=False)
    rating = Column(Float, default=5.0)
    review_text = Column(String, nullable=False)
    sentiment_score = Column(Float, default=0.85)  # 0.0 to 1.0
    sentiment_label = Column(String, default="Positive")  # Positive / Neutral / Negative
    pros = Column(String, nullable=True)
    cons = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="reviews")


# -----------------------------
# Cart Item Model (Autonomous Buying Workflow)
# -----------------------------
class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True, default=1)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, default=1)
    unit_price = Column(Float, nullable=False)
    added_at = Column(DateTime, default=datetime.utcnow)


# -------------------------------------------------------------
# Admin Applicant Model (Resumes & Chairman Role Assignment)
# -------------------------------------------------------------
class AdminApplicant(Base):
    __tablename__ = "admin_applicants"

    id = Column(Integer, primary_key=True, index=True)
    applicant_ref = Column(String, unique=True, nullable=False)  # e.g. ADM-APP-201
    full_name = Column(String, nullable=False)
    username = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    aadhaar_number = Column(String, nullable=False)
    gender = Column(String, default="Male")
    requested_role = Column(String, default="executor")  # executor / verifier / approver
    requested_role_title = Column(String, nullable=True)
    experience_summary = Column(String, nullable=True)
    
    # Structured Resume Metadata
    resume_title = Column(String, nullable=True)
    education = Column(String, nullable=True)
    certifications_json = Column(String, nullable=True)  # JSON array string
    skills_json = Column(String, nullable=True)          # JSON array string
    attached_file_name = Column(String, nullable=True)
    
    # Chairman Governance Status
    status = Column(String, default="PENDING")  # PENDING / APPROVED / REJECTED
    assigned_role = Column(String, nullable=True)
    assigned_role_title = Column(String, nullable=True)
    approved_date = Column(String, nullable=True)
    chairman_notes = Column(String, nullable=True)
    applied_date = Column(DateTime, default=datetime.utcnow)


# -------------------------------------------------------------
# Chairman Directive / Task Model
# -------------------------------------------------------------
class ChairmanTask(Base):
    __tablename__ = "chairman_tasks"

    id = Column(Integer, primary_key=True, index=True)
    task_ref = Column(String, unique=True, nullable=False)  # e.g. TASK-801
    target_admin = Column(String, nullable=False)            # executor / verifier / approver
    target_admin_name = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    priority = Column(String, default="HIGH")               # CRITICAL / HIGH / MEDIUM / LOW
    status = Column(String, default="PENDING")              # PENDING / IN_PROGRESS / COMPLETED
    assigned_date = Column(DateTime, default=datetime.utcnow)
    due_date = Column(String, nullable=True)
    completion_notes = Column(String, nullable=True)


# -------------------------------------------------------------
# Chairman Direct Inquiries Model
# -------------------------------------------------------------
class ChairmanInquiry(Base):
    __tablename__ = "chairman_inquiries"

    id = Column(Integer, primary_key=True, index=True)
    inquiry_ref = Column(String, unique=True, nullable=False)  # e.g. INQ-501
    target_admin = Column(String, nullable=False)              # executor / verifier / approver
    target_admin_name = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    question = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="PENDING_REPLY")           # PENDING_REPLY / ANSWERED
    reply = Column(String, nullable=True)
    reply_timestamp = Column(String, nullable=True)


# -------------------------------------------------------------
# 3-Tier Vendor Pipeline Application Model (Sequential Desks)
# -------------------------------------------------------------
class VendorPipelineApplication(Base):
    __tablename__ = "vendor_pipeline_applications"

    id = Column(Integer, primary_key=True, index=True)
    app_ref = Column(String, unique=True, nullable=False)      # e.g. VAPP-101
    store_name = Column(String, nullable=False)
    owner_name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    gstin = Column(String, nullable=False)
    aadhaar_number = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    description = Column(String, nullable=True)
    warehouses_json = Column(String, nullable=True)            # Multi-warehouse JSON
    due_diligence_json = Column(String, nullable=True)         # Legal & trust scores JSON

    # Overall Status: STAGE_1_EXECUTOR / STAGE_2_VERIFIER / AWAITING_APPROVAL / APPROVED_LIVE / CANCELLED_BY_...
    overall_status = Column(String, default="STAGE_1_EXECUTOR")

    # Stage 1: Executor Admin Due-Diligence
    stage1_status = Column(String, default="PENDING")          # PENDING / COMPLETED / CANCELLED / RETURNED
    stage1_by = Column(String, nullable=True)
    stage1_timestamp = Column(String, nullable=True)
    stage1_notes = Column(String, nullable=True)
    handover_to_verifier_json = Column(String, nullable=True)  # Official clearance letter JSON

    # Stage 2: Verifier Admin Geolocation & Safety Audit
    stage2_status = Column(String, default="LOCKED")           # LOCKED / PENDING / COMPLETED / CANCELLED / RETURNED
    stage2_by = Column(String, nullable=True)
    stage2_timestamp = Column(String, nullable=True)
    stage2_notes = Column(String, nullable=True)
    handover_to_approver_json = Column(String, nullable=True)  # Official audit clearance letter JSON

    # Stage 3: Approver Admin Bond & Final Seal Authority
    stage3_status = Column(String, default="LOCKED")           # LOCKED / PENDING / COMPLETED / CANCELLED / RETURNED
    stage3_by = Column(String, nullable=True)
    stage3_timestamp = Column(String, nullable=True)
    stage3_notes = Column(String, nullable=True)
    seal_details_json = Column(String, nullable=True)          # Official merchant seal & 5.0% bond agreement JSON
    handover_to_chairman_json = Column(String, nullable=True)  # Explanation letter from Approver Admin to Chairman

    # Stage 4: Supreme Chairman Final Approval
    stage4_status = Column(String, default="LOCKED")           # LOCKED / PENDING / APPROVED / CANCELLED / RETURNED
    stage4_by = Column(String, nullable=True)
    stage4_timestamp = Column(String, nullable=True)
    stage4_notes = Column(String, nullable=True)

    # Cancellation & Return Logs
    cancellation_json = Column(String, nullable=True)
    return_letter_json = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# -------------------------------------------------------------
# Milestone 5: Autonomous AI Agent Vendor Weekly Report & Strategic Advice
# -------------------------------------------------------------
class VendorWeeklyReport(Base):
    __tablename__ = "vendor_weekly_reports"

    id = Column(Integer, primary_key=True, index=True)
    report_ref = Column(String, unique=True, nullable=False)   # e.g. AGENT-REP-2026-W37
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    vendor_name = Column(String, nullable=False)
    period_start = Column(String, nullable=True)
    period_end = Column(String, nullable=True)
    executive_summary = Column(String, nullable=False)
    
    # JSON Fields for Deep Agent Telemetry & Reasoning
    inventory_health_json = Column(String, nullable=True)       # Dead stock, stockout hazards, reorder urgencies
    strategic_actions_json = Column(String, nullable=True)      # Concrete recommendations (e.g. discount product X, restock Y)
    financial_projections_json = Column(String, nullable=True)  # Projected GMV lift, freed capital, margin preservation
    execution_trace_json = Column(String, nullable=True)        # LangGraph node execution steps & thoughts
    
    # Proactive Strategic Email Dispatch
    email_recipient = Column(String, nullable=False)
    email_subject = Column(String, nullable=False)
    email_html_content = Column(String, nullable=False)
    email_text_content = Column(String, nullable=True)
    email_status = Column(String, default="DISPATCHED_SIMULATED") # SENT / DISPATCHED_SIMULATED / FAILED
    email_sent_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    vendor = relationship("Vendor")