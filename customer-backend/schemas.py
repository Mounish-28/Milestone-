from pydantic import BaseModel, Field
from datetime import datetime
from typing import Any

# ----------------------------
# Auth & User Schemas
# ----------------------------


class UserLoginRequest(BaseModel):
    role: str = "admin"  # admin / vendor / customer
    display_name: str | None = None
    username: str | None = None
    gender: str | None = "Male"
    aadhaar_number: str | None = None
    email: str
    phone: str | None = None
    password: str
    security_key: str | None = None


class GoogleSignInRequest(BaseModel):
    email: str
    display_name: str | None = None
    name: str | None = None
    role: str = "vendor"


class RequestAadhaarOtpRequest(BaseModel):
    aadhaar_number: str
    channel: str = "mobile"  # 'mobile' | 'email' | 'both'
    destination: str | None = None


class AadhaarOtpRequest(BaseModel):
    aadhaar_number: str
    otp_code: str | None = None
    otp: str | None = None


class ForgotSecurityKeyRequest(BaseModel):
    identifier: str | None = None  # email or phone
    email: str | None = None
    phone: str | None = None


class VendorStatusUpdateRequest(BaseModel):
    is_online: bool | None = None
    status: str | None = None
    vendor_id: int | None = None


class UserResponse(BaseModel):
    id: int
    display_name: str
    username: str
    gender: str
    aadhaar_number: str
    email: str
    phone: str | None = None
    role: str
    security_key: str
    is_aadhaar_verified: bool
    is_online: bool

    class Config:
        from_attributes = True


# ----------------------------
# Vendor Schemas
# ----------------------------


class VendorCreate(BaseModel):
    name: str
    email: str
    rating: float | None = 4.8
    status: str | None = "Active"
    category: str | None = None
    owner: str | None = None
    compliance_status: str | None = None


class VendorUpdate(BaseModel):
    name: str
    email: str
    rating: float | None = 4.8
    status: str | None = "Active"
    category: str | None = None
    owner: str | None = None
    compliance_status: str | None = None


class VendorResponse(BaseModel):
    id: int
    name: str
    email: str
    rating: float
    status: str

    class Config:
        from_attributes = True


# ----------------------------
# Product Schemas
# ----------------------------


class ProductCreate(BaseModel):
    name: str
    category: str | None = None
    price: float
    vendor_id: int
    stock: str | None = "In Stock"
    stock_quantity: int | None = 25
    reorder_threshold: int | None = 10
    description: str | None = None
    image_url: str | None = None


class ProductUpdate(BaseModel):
    name: str
    category: str | None = None
    price: float
    stock: str | None = "In Stock"
    stock_quantity: int | None = 25
    reorder_threshold: int | None = 10
    description: str | None = None
    image_url: str | None = None


class ProductResponse(BaseModel):
    id: int
    name: str
    category: str | None = None
    price: float
    vendor_id: int
    vendor_name: str | None = None
    stock: str
    stock_quantity: int
    reorder_threshold: int
    units_sold: int
    rating: float
    description: str | None = None
    image_url: str | None = None

    class Config:
        from_attributes = True


class StockUpdateRequest(BaseModel):
    stock_quantity: int
    stock: str | None = None
    reorder_threshold: int | None = 10


# ----------------------------
# Customer Schemas
# ----------------------------


class CustomerCreate(BaseModel):
    name: str
    email: str
    phone: str
    city: str
    country: str | None = "India"


class CustomerUpdate(BaseModel):
    name: str
    email: str
    phone: str
    city: str
    country: str | None = "India"


class CustomerResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    city: str
    country: str
    membership_tier: str | None = "Diamond"

    class Config:
        from_attributes = True


class CustomerAddressCreate(BaseModel):
    name: str
    phone: str
    address_line: str
    locality: str | None = None
    city: str
    state: str
    pincode: str
    address_type: str | None = "Home"
    is_default: bool | None = False


class CustomerAddressResponse(BaseModel):
    id: int
    customer_id: int
    name: str
    phone: str
    address_line: str
    locality: str | None = None
    city: str
    state: str
    pincode: str
    address_type: str
    is_default: bool
    created_at: datetime

    class Config:
        from_attributes = True


class CustomerOtpRequest(BaseModel):
    contact: str | None = None
    phone: str | None = None
    mobile: str | None = None
    mobile_number: str | None = None
    email: str | None = None
    channel: str | None = "auto"  # 'email' | 'phone' | 'auto'


class CustomerOtpVerifyRequest(BaseModel):
    contact: str | None = None
    phone: str | None = None
    mobile: str | None = None
    mobile_number: str | None = None
    email: str | None = None
    otp_code: str | None = None
    otp: str | None = None
    name: str | None = None


class CustomerRegisterRequest(BaseModel):
    name: str
    email: str
    phone: str
    password: str | None = None
    address_line: str | None = None
    locality: str | None = None
    city: str | None = "Mumbai"
    state: str | None = "Maharashtra"
    pincode: str | None = "400050"
    country: str | None = "India"
    address_type: str | None = "Home"
    membership_tier: str | None = "Diamond"


# ----------------------------
# Transaction Schemas
# ----------------------------


class TransactionCreate(BaseModel):
    customer_name: str
    amount: float
    payment_method: str | None = "UPI / Card"
    status: str | None = "Completed"
    customer_id: int | None = None
    product_id: int | None = None
    product_name: str | None = None
    vendor_id: int | None = None
    quantity: int | None = 1


class TransactionResponse(BaseModel):
    id: int
    transaction_ref: str
    customer_name: str
    amount: float
    payment_method: str
    status: str
    created_at: datetime
    customer_id: int | None = None
    product_id: int | None = None
    product_name: str | None = None
    vendor_id: int | None = None
    quantity: int | None = 1

    class Config:
        from_attributes = True


# ----------------------------
# Inventory & Stock Schemas
# ----------------------------


# ----------------------------
# Review & Sentiment Schemas
# ----------------------------


class ReviewCreate(BaseModel):
    product_id: int
    customer_name: str
    rating: float
    review_text: str | None = None
    comment: str | None = None


class ReviewResponse(BaseModel):
    id: int
    product_id: int
    customer_name: str
    rating: float
    review_text: str
    sentiment_score: float
    sentiment_label: str
    pros: str | None = None
    cons: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


# ----------------------------
# AI Assistant Schemas
# ----------------------------


class AIAssistantRequest(BaseModel):
    query: str
    page_context: str | None = "customer"  # 'customer' | 'vendor' | 'admin'
    target_language: str | None = None
    user_country: str | None = "India"


class VideoReviewRequest(BaseModel):
    product_name: str | None = None
    product_id: int | None = None
    query: str | None = None
    target_language: str | None = None
    user_country: str | None = "India"


# ----------------------------
# Admin Governance Schemas
# ----------------------------


class AdminApplicantCreate(BaseModel):
    full_name: str
    username: str
    email: str
    phone: str | None = None
    aadhaar_number: str
    gender: str = "Male"
    requested_role: str = "executor"
    requested_role_title: str | None = None
    experience_summary: str | None = None
    headline: str | None = None
    education: str | None = None
    certifications: list[str] | str | None = None
    skills: list[str] | str | None = None
    resume_file_name: str | None = "Resume_Applicant_CV.pdf"


class AdminApplicantApprove(BaseModel):
    assigned_role: str  # executor / verifier / approver
    assigned_role_title: str | None = None
    chairman_notes: str | None = None


class AdminApplicantReject(BaseModel):
    rejection_reason: str


class AdminApplicantResponse(BaseModel):
    id: int
    applicant_ref: str
    full_name: str
    username: str
    email: str
    phone: str | None = None
    aadhaar_number: str
    gender: str
    requested_role: str
    requested_role_title: str | None = None
    experience_summary: str | None = None
    resume_title: str | None = None
    education: str | None = None
    certifications_json: str | None = None
    skills_json: str | None = None
    attached_file_name: str | None = None
    status: str
    assigned_role: str | None = None
    assigned_role_title: str | None = None
    approved_date: str | None = None
    chairman_notes: str | None = None
    applied_date: datetime

    class Config:
        from_attributes = True


class ChairmanTaskCreate(BaseModel):
    target_admin: str  # executor / verifier / approver
    target_admin_name: str | None = None
    title: str
    description: str
    priority: str = "HIGH"
    due_date: str | None = None


class ChairmanTaskUpdate(BaseModel):
    status: str  # PENDING / IN_PROGRESS / COMPLETED
    completion_notes: str | None = None


class ChairmanTaskResponse(BaseModel):
    id: int
    task_ref: str
    target_admin: str
    target_admin_name: str
    title: str
    description: str
    priority: str
    status: str
    assigned_date: datetime
    due_date: str | None = None
    completion_notes: str | None = None

    class Config:
        from_attributes = True


class ChairmanInquiryCreate(BaseModel):
    target_admin: str  # executor / verifier / approver
    target_admin_name: str | None = None
    subject: str
    question: str


class ChairmanInquiryReply(BaseModel):
    reply: str


class ChairmanInquiryResponse(BaseModel):
    id: int
    inquiry_ref: str
    target_admin: str
    target_admin_name: str
    subject: str
    question: str
    timestamp: datetime
    status: str
    reply: str | None = None
    reply_timestamp: str | None = None

    class Config:
        from_attributes = True


class Stage1ExecutorApprovalRequest(BaseModel):
    due_diligence_notes: str | None = None
    notes: str | None = None
    explanation_subject: str | None = None
    handover_subject: str | None = None
    explanation_body: str | None = None
    handover_content: str | None = None


class Stage1ExecutorCancelRequest(BaseModel):
    cancellation_reason: str = "Discrepancy in due-diligence"
    reason: str | None = None
    cancellation_letter: str = "Application cancelled during Stage 1 Executor due-diligence"
    letter: str | None = None


class Stage2VerifierApprovalRequest(BaseModel):
    verifier_notes: str | None = None
    notes: str | None = None
    explanation_subject: str | None = None
    explanation_body: str | None = None


class Stage2VerifierReturnRequest(BaseModel):
    rejection_reason: str = "Quality or location check failed"
    reason: str | None = None
    rejection_letter: str = "Returned to executor for re-audit"
    letter: str | None = None


class Stage2VerifierCancelRequest(BaseModel):
    cancellation_reason: str = "Failed verification"
    reason: str | None = None
    cancellation_letter: str = "Application cancelled by Verifier"
    letter: str | None = None


class Stage3ApproverSealRequest(BaseModel):
    approver_notes: str | None = None
    notes: str | None = None
    escrow_bond_amount: float = 500.0
    explanation_letter_to_chairman: str | None = (
        "All vendor credentials, escrow bonds, and compliance requirements "
        "have been verified."
    )


class Stage3ApproverReturnRequest(BaseModel):
    rejection_reason: str = "Bond or cross-check discrepancy"
    reason: str | None = None
    rejection_letter: str = "Returned to verifier for re-audit"
    letter: str | None = None


class Stage3ApproverCancelRequest(BaseModel):
    cancellation_reason: str = "Vetoed by approver"
    reason: str | None = None
    cancellation_letter: str = "Application cancelled by Approver"
    letter: str | None = None


class Stage4ChairmanApprovalRequest(BaseModel):
    chairman_notes: str | None = None
    notes: str | None = None


class Stage4ChairmanRejectRequest(BaseModel):
    rejection_reason: str = "Rejected by Supreme Chairman"
    reason: str | None = None


class VendorPipelineApplicationCreate(BaseModel):
    store_name: str
    owner_name: str
    category: str
    gstin: str
    aadhaar_number: str
    email: str
    phone: str | None = None
    description: str | None = None


class VendorPipelineApplicationResponse(BaseModel):
    id: int
    app_ref: str
    store_name: str
    owner_name: str
    category: str
    gstin: str
    aadhaar_number: str
    email: str
    phone: str | None = None
    description: str | None = None
    warehouses_json: str | None = None
    due_diligence_json: str | None = None
    overall_status: str
    stage1_status: str
    stage1_by: str | None = None
    stage1_timestamp: str | None = None
    stage1_notes: str | None = None
    handover_to_verifier_json: str | None = None
    stage2_status: str
    stage2_by: str | None = None
    stage2_timestamp: str | None = None
    stage2_notes: str | None = None
    handover_to_approver_json: str | None = None
    stage3_status: str
    stage3_by: str | None = None
    stage3_timestamp: str | None = None
    stage3_notes: str | None = None
    seal_details_json: str | None = None
    handover_to_chairman_json: str | None = None
    stage4_status: str | None = None
    stage4_by: str | None = None
    stage4_timestamp: str | None = None
    stage4_notes: str | None = None
    cancellation_json: str | None = None
    return_letter_json: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class GovernanceSummaryResponse(BaseModel):
    pending_admin_applicants: int = 0
    approved_admins: int = 0
    rejected_admin_applicants: int = 0
    total_pipeline_applications: int = 0
    stage1_pending_intake: int = 0
    stage1_cleared: int = 0
    stage2_pending_verifier: int = 0
    stage2_cleared: int = 0
    stage3_pending_approver: int = 0
    stage3_cleared: int = 0
    stage3_live_sealed: int = 0
    stage4_pending_chairman: int = 0
    stage4_live_approved: int = 0
    total_active_tasks: int = 0
    total_pending_inquiries: int = 0


# ==========================================
# AI AUTONOMOUS SHOPPING & BUSINESS AGENT
# ==========================================


class AgentShoppingTaskRequest(BaseModel):
    prompt: str = ""
    task: str | None = None
    params: dict[str, Any] | None = None
    customer_id: int | None = None
    budget: float | None = None
    category: str | None = None
    membership_tier: str | None = "Diamond"
    user_location: str | None = "Mumbai, India"


class AgentCartOptimizationRequest(BaseModel):
    cart_items: list[dict[str, Any]] | None = None
    items: list[dict[str, Any]] | None = None
    membership_tier: str | None = "Diamond"


class AgentProductComparisonRequest(BaseModel):
    product_ids: list[int]


class AgentVoiceCommandRequest(BaseModel):
    transcript: str = ""
    command: str | None = None
    customer_id: int | None = None


class VendorCopilotRequest(BaseModel):
    vendor_id: int
    focus_area: str | None = "all"


class AdminCopilotRequest(BaseModel):
    focus_area: str | None = "all"


# =========================================================================
# MILESTONE 5: AUTONOMOUS AI AGENT WEEKLY VENDOR STORE ANALYSIS SCHEMAS
# =========================================================================


class WeeklyVendorAnalysisRequest(BaseModel):
    vendor_id: int = Field(
        default=1,
        description="Unique identifier of the vendor store to analyze",
    )
    simulate_email: bool = Field(
        default=True,
        description="Whether to generate and dispatch executive email",
    )
    lookback_days: int = Field(
        default=7,
        description="Number of days of telemetry to evaluate velocity shifts",
    )


class ApplyStrategicDiscountRequest(BaseModel):
    product_id: int = Field(
        ...,
        description="ID of stagnant product to apply strategic discount to",
    )
    discount_percentage: float = Field(
        ...,
        description="Percentage discount recommended by autonomous agent",
    )
    reason: str | None = Field(
        default="Autonomous AI Agent Weekly Store Optimization",
    )


class SendAdvisoryEmailRequest(BaseModel):
    report_ref: str = Field(
        ...,
        description="Reference ID of the weekly report to email",
    )
    vendor_id: int = Field(..., description="Target vendor ID")
    custom_recipient: str | None = Field(
        default=None,
        description="Optional custom override email address",
    )


class WeeklyVendorReportResponse(BaseModel):
    status: str
    report_ref: str
    vendor_id: int
    vendor_name: str
    period: str
    executive_summary: str
    execution_trace: list[dict[str, Any]]
    inventory_health: dict[str, Any]
    strategic_actions: list[dict[str, Any]]
    financial_projections: dict[str, Any]
    email_dispatch: dict[str, Any]
