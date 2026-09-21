import json
import random
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

try:
    from database import get_db
    import models, schemas
except ImportError:
    from app.database import get_db
    from app import models, schemas

router = APIRouter(
    prefix="/admin",
    tags=["Admin Governance & 3-Tier Clearance Desk"]
)

# Procedural Pool for Auto-Replenishing Admin Applicants
ADDITIONAL_ADMIN_APPLICANT_POOL = [
    {
        "applicant_ref": "ADM-APP-204",
        "full_name": "Meera Krishnan",
        "username": "meera_krishnan",
        "email": "meera.krishnan@shopsense.com",
        "phone": "+91 9876503344",
        "aadhaar_number": "987654320033",
        "gender": "Female",
        "requested_role": "approver",
        "requested_role_title": "Type 3: Commercial Performance Bond & Final Approver Authority",
        "experience_summary": "6 years directing commercial trade compliance and performance bond escrow accounts at Tata Digital.",
        "resume_title": "Commercial Escrow & Merchant Induction Director",
        "education": "Chartered Financial Analyst (CFA Institute, 2018) • M.Com in Corporate Finance (Delhi School of Economics)",
        "certifications_json": json.dumps(["Certified Anti-Money Laundering Specialist (CAMS)", "SEBI Merchant Banker Certification"]),
        "skills_json": json.dumps(["Escrow Vault Verification", "5.0% Gross Performance Contracts", "Merchant Seal Authorization"]),
        "attached_file_name": "CV_Meera_Krishnan_CFA.pdf"
    },
    {
        "applicant_ref": "ADM-APP-205",
        "full_name": "Karthik Nambiar",
        "username": "karthik_nambiar",
        "email": "karthik.nambiar@shopsense.com",
        "phone": "+91 9876504455",
        "aadhaar_number": "987654320044",
        "gender": "Male",
        "requested_role": "executor",
        "requested_role_title": "Type 1: System Operations & Legal Intake Executor",
        "experience_summary": "5 years conducting corporate risk analysis, consumer disputes screening, and supplier verification at Reliance Retail.",
        "resume_title": "Corporate Intake & Trade Due-Diligence Lead",
        "education": "LL.B in Corporate Law (NLSIU Bangalore, 2019) • B.Com (Loyola College, 2016)",
        "certifications_json": json.dumps(["Certified Fraud Examiner (CFE)", "ISO 37001 Anti-Bribery Lead Auditor"]),
        "skills_json": json.dumps(["e-Courts Scanning", "MCA Regulatory Checks", "Trustability Score Modeling"]),
        "attached_file_name": "Resume_Karthik_Nambiar_LLB.pdf"
    },
    {
        "applicant_ref": "ADM-APP-206",
        "full_name": "Dr. Sandeep Vardhan",
        "username": "sandeep_vardhan",
        "email": "sandeep.vardhan@shopsense.com",
        "phone": "+91 9876505566",
        "aadhaar_number": "987654320055",
        "gender": "Male",
        "requested_role": "verifier",
        "requested_role_title": "Type 2: Compliance & Physical Geolocation Verifier",
        "experience_summary": "7 years auditing industrial warehouse safety, cold-chain humidity compliance, and GSTIN tax records at DHL Supply Chain.",
        "resume_title": "Senior Logistics Compliance & Drone Telemetry Lead",
        "education": "Ph.D in Supply Chain Safety (IIT Kharagpur) • B.Tech Mechanical Engineering",
        "certifications_json": json.dumps(["ISO 9001:2015 Lead Auditor", "Six Sigma Black Belt", "DGCA Drone Operator Certificate"]),
        "skills_json": json.dumps(["Satellite Geocoding Verification", "Cleanroom Humidity Auditing", "Multi-Warehouse Inspection"]),
        "attached_file_name": "CV_Dr_Sandeep_Vardhan_PhD.pdf"
    }
]

# Procedural Pool for Auto-Replenishing Vendor Applications
ADDITIONAL_VENDOR_APP_POOL = [
    {
        "app_ref": "VAPP-106",
        "store_name": "WoodCraft Artisans & Solid Sheesham Furniture",
        "owner_name": "Amit Patel",
        "category": "Handcrafted Solid Wood & Living Furniture",
        "gstin": "24AAACP9012M1Z5",
        "aadhaar_number": "987654329012",
        "email": "contact@woodcraftartisans.com",
        "phone": "+91 9833445566",
        "description": "Artisan manufacturer of solid Sheesham wood dining sets, ergonomic recliners, and modular workstations."
    },
    {
        "app_ref": "VAPP-107",
        "store_name": "AromaBliss Ayurvedic Essentials & Pure Oils",
        "owner_name": "Sneha Reddy",
        "category": "Ayurvedic Wellness & Organic Essential Oils",
        "gstin": "36AAACS7890M1Z2",
        "aadhaar_number": "987654327890",
        "email": "orders@aromablisswellness.com",
        "phone": "+91 9844556677",
        "description": "Certified organic extraction plant for pure lavender, eucalyptus, tea tree oils and cold-pressed skincare."
    },
    {
        "app_ref": "VAPP-108",
        "store_name": "ProChef Commercial Kitchenware & Cutlery",
        "owner_name": "Chef Sanjeev Anand",
        "category": "Commercial Kitchen Appliances & Steelware",
        "gstin": "27AAACS4567M1Z4",
        "aadhaar_number": "987654324567",
        "email": "sales@prochefappliances.com",
        "phone": "+91 9855667788",
        "description": "Grade-316 stainless steel induction cooktops, precision Damascus chef knives, and heavy-duty planetary mixers."
    }
]


# =========================================================================
# 1. CHAIRMAN GOVERNANCE: HIGH-LEVEL SUMMARY
# =========================================================================
@router.get("/governance/summary", response_model=schemas.GovernanceSummaryResponse)
def get_governance_summary(db: Session = Depends(get_db)):
    pending_applicants = db.query(models.AdminApplicant).filter(models.AdminApplicant.status == "PENDING").count()
    approved_applicants = db.query(models.AdminApplicant).filter(models.AdminApplicant.status == "APPROVED").count() + 3  # +3 predefined
    rejected_applicants = db.query(models.AdminApplicant).filter(models.AdminApplicant.status == "REJECTED").count()

    total_pipeline = db.query(models.VendorPipelineApplication).count()
    stage1_pending = db.query(models.VendorPipelineApplication).filter(models.VendorPipelineApplication.stage1_status == "PENDING").count()
    stage1_cleared = db.query(models.VendorPipelineApplication).filter(models.VendorPipelineApplication.stage1_status == "COMPLETED").count()
    stage2_pending = db.query(models.VendorPipelineApplication).filter(
        models.VendorPipelineApplication.stage1_status == "COMPLETED",
        models.VendorPipelineApplication.stage2_status == "PENDING"
    ).count()
    stage2_cleared = db.query(models.VendorPipelineApplication).filter(models.VendorPipelineApplication.stage2_status == "COMPLETED").count()
    stage3_pending = db.query(models.VendorPipelineApplication).filter(
        models.VendorPipelineApplication.stage1_status == "COMPLETED",
        models.VendorPipelineApplication.stage2_status == "COMPLETED",
        models.VendorPipelineApplication.stage3_status == "PENDING"
    ).count()
    stage3_cleared = db.query(models.VendorPipelineApplication).filter(models.VendorPipelineApplication.stage3_status == "COMPLETED").count()
    stage4_pending = db.query(models.VendorPipelineApplication).filter(
        models.VendorPipelineApplication.stage3_status == "COMPLETED",
        models.VendorPipelineApplication.stage4_status == "PENDING"
    ).count()
    stage4_approved_live = db.query(models.VendorPipelineApplication).filter(models.VendorPipelineApplication.stage4_status == "APPROVED").count()

    active_tasks = db.query(models.ChairmanTask).filter(models.ChairmanTask.status != "COMPLETED").count()
    pending_inquiries = db.query(models.ChairmanInquiry).filter(models.ChairmanInquiry.status == "PENDING_REPLY").count()

    return {
        "pending_admin_applicants": pending_applicants,
        "approved_admins": approved_applicants,
        "rejected_admin_applicants": rejected_applicants,
        "total_pipeline_applications": total_pipeline,
        "stage1_pending_intake": stage1_pending,
        "stage1_cleared": stage1_cleared,
        "stage2_pending_verifier": stage2_pending,
        "stage2_cleared": stage2_cleared,
        "stage3_pending_approver": stage3_pending,
        "stage3_cleared": stage3_cleared,
        "stage3_live_sealed": stage4_approved_live,
        "stage4_pending_chairman": stage4_pending,
        "stage4_live_approved": stage4_approved_live,
        "total_active_tasks": active_tasks,
        "total_pending_inquiries": pending_inquiries
    }


# =========================================================================
# 2. ADMIN APPLICANTS & RESUMES ONBOARDING
# =========================================================================
@router.get("/applicants", response_model=list[schemas.AdminApplicantResponse])
def list_admin_applicants(status: str | None = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.AdminApplicant)
    if status and status.upper() != "ALL":
        query = query.filter(models.AdminApplicant.status == status.upper())
    return query.order_by(models.AdminApplicant.id.desc()).all()


@router.post("/applicants/register", response_model=schemas.AdminApplicantResponse)
def register_admin_applicant(data: schemas.AdminApplicantCreate, db: Session = Depends(get_db)):
    new_id_num = db.query(models.AdminApplicant).count() + 201
    applicant_ref = f"ADM-APP-{new_id_num}"

    cert_json = json.dumps(data.certifications) if isinstance(data.certifications, list) else (data.certifications or "[]")
    skills_json = json.dumps(data.skills) if isinstance(data.skills, list) else (data.skills or "[]")

    new_app = models.AdminApplicant(
        applicant_ref=applicant_ref,
        full_name=data.full_name,
        username=data.username,
        email=data.email,
        phone=data.phone,
        aadhaar_number=data.aadhaar_number,
        gender=data.gender,
        requested_role=data.requested_role,
        requested_role_title=data.requested_role_title or f"Type {1 if data.requested_role == 'executor' else (2 if data.requested_role == 'verifier' else 3)}: {data.requested_role.title()} Admin",
        experience_summary=data.experience_summary,
        resume_title=data.headline or f"Specialist in {data.requested_role.title()} Governance",
        education=data.education,
        certifications_json=cert_json,
        skills_json=skills_json,
        attached_file_name=data.resume_file_name,
        status="PENDING"
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    return new_app


@router.post("/applicants/{applicant_ref}/approve", response_model=schemas.AdminApplicantResponse)
def approve_admin_applicant(applicant_ref: str, data: schemas.AdminApplicantApprove, db: Session = Depends(get_db)):
    app_record = db.query(models.AdminApplicant).filter(models.AdminApplicant.applicant_ref == applicant_ref).first()
    if not app_record:
        raise HTTPException(status_code=404, detail="Admin applicant not found")

    role_title = data.assigned_role_title or (
        "Type 3: Cross-Check & Vendor Approver Authority" if data.assigned_role == "approver"
        else ("Type 2: Compliance & KYC Verifier Admin" if data.assigned_role == "verifier"
        else "Type 1: System Operations Executor Admin")
    )

    app_record.status = "APPROVED"
    app_record.assigned_role = data.assigned_role
    app_record.assigned_role_title = role_title
    app_record.approved_date = datetime.utcnow().strftime("%Y-%m-%d %H:%M")
    app_record.chairman_notes = data.chairman_notes or "Commissioned and authorized by Supreme Chairman Mounish Sai."

    # Auto-replenish next unique candidate into PENDING queue
    _replenish_next_admin_applicant(db)

    db.commit()
    db.refresh(app_record)
    return app_record


@router.post("/applicants/{applicant_ref}/reject", response_model=schemas.AdminApplicantResponse)
def reject_admin_applicant(applicant_ref: str, data: schemas.AdminApplicantReject, db: Session = Depends(get_db)):
    app_record = db.query(models.AdminApplicant).filter(models.AdminApplicant.applicant_ref == applicant_ref).first()
    if not app_record:
        raise HTTPException(status_code=404, detail="Admin applicant not found")

    app_record.status = "REJECTED"
    app_record.approved_date = datetime.utcnow().strftime("%Y-%m-%d %H:%M")
    app_record.chairman_notes = f"Disqualified by Chairman Mounish: {data.rejection_reason}"

    # Auto-replenish next unique candidate into PENDING queue
    _replenish_next_admin_applicant(db)

    db.commit()
    db.refresh(app_record)
    return app_record


def _replenish_next_admin_applicant(db: Session):
    existing_refs = {a.applicant_ref for a in db.query(models.AdminApplicant.applicant_ref).all()}
    for candidate in ADDITIONAL_ADMIN_APPLICANT_POOL:
        if candidate["applicant_ref"] not in existing_refs:
            new_app = models.AdminApplicant(
                applicant_ref=candidate["applicant_ref"],
                full_name=candidate["full_name"],
                username=candidate["username"],
                email=candidate["email"],
                phone=candidate["phone"],
                aadhaar_number=candidate["aadhaar_number"],
                gender=candidate["gender"],
                requested_role=candidate["requested_role"],
                requested_role_title=candidate["requested_role_title"],
                experience_summary=candidate["experience_summary"],
                resume_title=candidate["resume_title"],
                education=candidate["education"],
                certifications_json=candidate["certifications_json"],
                skills_json=candidate["skills_json"],
                attached_file_name=candidate["attached_file_name"],
                status="PENDING"
            )
            db.add(new_app)
            return

    # Fallback Procedural Generator
    next_num = len(existing_refs) + 201
    ref = f"ADM-APP-{next_num}"
    roles = ["executor", "verifier", "approver"]
    r = roles[(next_num - 201) % 3]
    r_title = "Type 1: System Operations & Legal Intake Executor" if r == "executor" else (
        "Type 2: Compliance & Physical Geolocation Verifier" if r == "verifier" else
        "Type 3: Commercial Performance Bond & Final Approver Authority"
    )

    new_app = models.AdminApplicant(
        applicant_ref=ref,
        full_name=f"Executive Candidate {next_num}",
        username=f"candidate_{next_num}",
        email=f"candidate{next_num}@shopsense.com",
        phone=f"+91 98765{random.randint(10000, 99999)}",
        aadhaar_number=f"9876543{random.randint(10000, 99999)}",
        gender="Male",
        requested_role=r,
        requested_role_title=r_title,
        experience_summary=f"Over 6+ years specializing in {r} operational workflows at enterprise retail portals.",
        resume_title=f"Certified {r.title()} Operations Specialist",
        education="MBA in Enterprise Management • B.Tech",
        certifications_json=json.dumps(["ISO 9001 Lead Auditor", "Certified Compliance Officer"]),
        skills_json=json.dumps(["Multi-facility Auditing", "Risk Scoring", "Regulatory KYC"]),
        attached_file_name=f"CV_Candidate_{next_num}.pdf",
        status="PENDING"
    )
    db.add(new_app)


# =========================================================================
# 3. CHAIRMAN DIRECTIVES & TASKS MANAGEMENT
# =========================================================================
@router.get("/tasks", response_model=list[schemas.ChairmanTaskResponse])
@router.get("/directives/tasks", response_model=list[schemas.ChairmanTaskResponse])
def list_chairman_tasks(target_admin: str | None = None, db: Session = Depends(get_db)):
    query = db.query(models.ChairmanTask)
    if target_admin:
        query = query.filter(models.ChairmanTask.target_admin == target_admin)
    return query.order_by(models.ChairmanTask.id.desc()).all()


@router.post("/tasks", response_model=schemas.ChairmanTaskResponse)
def create_chairman_task(data: schemas.ChairmanTaskCreate, db: Session = Depends(get_db)):
    task_num = db.query(models.ChairmanTask).count() + 801
    task_ref = f"TASK-{task_num}"

    target_name = data.target_admin_name or (
        "Approver Admin (Seal Authority)" if data.target_admin == "approver"
        else ("Verifier Admin (Compliance & KYC)" if data.target_admin == "verifier"
        else "Executor Admin (System Operations)")
    )

    new_task = models.ChairmanTask(
        task_ref=task_ref,
        target_admin=data.target_admin,
        target_admin_name=target_name,
        title=data.title,
        description=data.description,
        priority=data.priority,
        status="PENDING",
        due_date=data.due_date or (datetime.utcnow().strftime("%Y-%m-%d 18:00"))
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task


@router.patch("/tasks/{task_ref}", response_model=schemas.ChairmanTaskResponse)
def update_chairman_task(task_ref: str, data: schemas.ChairmanTaskUpdate, db: Session = Depends(get_db)):
    task = db.query(models.ChairmanTask).filter(models.ChairmanTask.task_ref == task_ref).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.status = data.status
    if data.completion_notes:
        task.completion_notes = data.completion_notes
    db.commit()
    db.refresh(task)
    return task


# =========================================================================
# 4. CHAIRMAN DIRECT INQUIRIES & ADM-REPLIES
# =========================================================================
@router.get("/inquiries", response_model=list[schemas.ChairmanInquiryResponse])
@router.get("/directives/inquiries", response_model=list[schemas.ChairmanInquiryResponse])
def list_chairman_inquiries(target_admin: str | None = None, db: Session = Depends(get_db)):
    query = db.query(models.ChairmanInquiry)
    if target_admin:
        query = query.filter(models.ChairmanInquiry.target_admin == target_admin)
    return query.order_by(models.ChairmanInquiry.id.desc()).all()


@router.post("/inquiries", response_model=schemas.ChairmanInquiryResponse)
def create_chairman_inquiry(data: schemas.ChairmanInquiryCreate, db: Session = Depends(get_db)):
    inq_num = db.query(models.ChairmanInquiry).count() + 501
    inq_ref = f"INQ-{inq_num}"

    target_name = data.target_admin_name or (
        "Rajesh Menon (Approver Admin)" if data.target_admin == "approver"
        else ("Ananya Rao (Verifier Admin)" if data.target_admin == "verifier"
        else "Mounish Sai (Executor Desk)")
    )

    new_inq = models.ChairmanInquiry(
        inquiry_ref=inq_ref,
        target_admin=data.target_admin,
        target_admin_name=target_name,
        subject=data.subject,
        question=data.question,
        status="PENDING_REPLY"
    )
    db.add(new_inq)
    db.commit()
    db.refresh(new_inq)
    return new_inq


@router.post("/inquiries/{inquiry_ref}/reply", response_model=schemas.ChairmanInquiryResponse)
def reply_to_chairman_inquiry(inquiry_ref: str, data: schemas.ChairmanInquiryReply, db: Session = Depends(get_db)):
    inq = db.query(models.ChairmanInquiry).filter(models.ChairmanInquiry.inquiry_ref == inquiry_ref).first()
    if not inq:
        raise HTTPException(status_code=404, detail="Inquiry not found")

    inq.reply = data.reply
    inq.reply_timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M")
    inq.status = "ANSWERED"
    db.commit()
    db.refresh(inq)
    return inq


# =========================================================================
# 5. STAGE 1: EXECUTOR ADMIN INTAKE & DUE-DILIGENCE
# =========================================================================
@router.post("/executor/approve/{app_ref}", response_model=schemas.VendorPipelineApplicationResponse)
def executor_approve_stage1(app_ref: str, data: schemas.Stage1ExecutorApprovalRequest, db: Session = Depends(get_db)):
    app_record = db.query(models.VendorPipelineApplication).filter(models.VendorPipelineApplication.app_ref == app_ref).first()
    if not app_record and app_ref.isdigit():
        app_record = db.query(models.VendorPipelineApplication).filter(models.VendorPipelineApplication.id == int(app_ref)).first()
    if not app_record:
        raise HTTPException(status_code=404, detail="Vendor application not found")

    ts = datetime.utcnow().strftime("%Y-%m-%d %H:%M")
    app_record.stage1_status = "COMPLETED"
    app_record.stage1_by = "Mounish Sai (System Operations Executor)"
    app_record.stage1_timestamp = ts
    app_record.stage1_notes = data.due_diligence_notes or data.notes or "Due-diligence cleared: 0 complaints, trust score validated, clean partnership history."

    handover_letter = {
        "sender": "Mounish Sai (System Operations Executor)",
        "timestamp": ts,
        "subject": data.explanation_subject or data.handover_subject or f"Stage 1 Clearance & Handover: {app_record.store_name}",
        "content": data.explanation_body or data.handover_content or "Stage 1 due-diligence passed. Handing over for geolocation and quality checks."
    }
    app_record.handover_to_verifier_json = json.dumps(handover_letter)
    app_record.stage2_status = "PENDING"  # UNLOCKED FOR VERIFIER ADMIN
    app_record.overall_status = "STAGE_2_VERIFIER"

    db.commit()
    db.refresh(app_record)
    return app_record


@router.post("/executor/cancel/{app_ref}", response_model=schemas.VendorPipelineApplicationResponse)
def executor_cancel_stage1(app_ref: str, data: schemas.Stage1ExecutorCancelRequest, db: Session = Depends(get_db)):
    app_record = db.query(models.VendorPipelineApplication).filter(models.VendorPipelineApplication.app_ref == app_ref).first()
    if not app_record and app_ref.isdigit():
        app_record = db.query(models.VendorPipelineApplication).filter(models.VendorPipelineApplication.id == int(app_ref)).first()
    if not app_record:
        raise HTTPException(status_code=404, detail="Vendor application not found")

    ts = datetime.utcnow().strftime("%Y-%m-%d %H:%M")
    app_record.stage1_status = "CANCELLED"
    app_record.overall_status = "CANCELLED_BY_EXECUTOR"
    reason = data.cancellation_reason or data.reason or "Discrepancy in due-diligence"
    letter = data.cancellation_letter or data.letter or "Application cancelled during Stage 1 Executor due-diligence"
    app_record.cancellation_json = json.dumps({
        "by": "Mounish Sai (System Operations Executor Admin)",
        "role": "Executor Admin (Stage 1)",
        "reason": reason,
        "letter": letter,
        "timestamp": ts
    })

    db.commit()
    db.refresh(app_record)
    return app_record


# =========================================================================
# 6. STAGE 2: VERIFIER ADMIN GEOLOCATION & QUALITY AUDITS
# =========================================================================
@router.post("/verifier/approve/{app_ref}", response_model=schemas.VendorPipelineApplicationResponse)
def verifier_approve_stage2(app_ref: str, data: schemas.Stage2VerifierApprovalRequest, db: Session = Depends(get_db)):
    app_record = db.query(models.VendorPipelineApplication).filter(models.VendorPipelineApplication.app_ref == app_ref).first()
    if not app_record and app_ref.isdigit():
        app_record = db.query(models.VendorPipelineApplication).filter(models.VendorPipelineApplication.id == int(app_ref)).first()
    if not app_record:
        raise HTTPException(status_code=404, detail="Vendor application not found")

    ts = datetime.utcnow().strftime("%Y-%m-%d %H:%M")
    app_record.stage2_status = "COMPLETED"
    app_record.stage2_by = "Ananya Rao (Compliance & KYC Verifier)"
    app_record.stage2_timestamp = ts
    app_record.stage2_notes = data.verifier_notes or data.notes or "Real locations verified, catalog description matches, Grade-A quality passed."

    handover_letter = {
        "sender": "Ananya Rao (Compliance & KYC Verifier)",
        "timestamp": ts,
        "subject": data.explanation_subject or f"Stage 2 Geolocation Clearance: {app_record.store_name}",
        "content": data.explanation_body or "Stage 2 physical audits passed. Handing over for 5.0% bond agreement execution."
    }
    app_record.handover_to_approver_json = json.dumps(handover_letter)
    app_record.stage3_status = "PENDING"  # UNLOCKED FOR APPROVER ADMIN
    app_record.overall_status = "STAGE_3_APPROVER"

    db.commit()
    db.refresh(app_record)
    return app_record


@router.post("/verifier/return/{app_ref}", response_model=schemas.VendorPipelineApplicationResponse)
def verifier_return_to_executor(app_ref: str, data: schemas.Stage2VerifierReturnRequest, db: Session = Depends(get_db)):
    app_record = db.query(models.VendorPipelineApplication).filter(models.VendorPipelineApplication.app_ref == app_ref).first()
    if not app_record and app_ref.isdigit():
        app_record = db.query(models.VendorPipelineApplication).filter(models.VendorPipelineApplication.id == int(app_ref)).first()
    if not app_record:
        raise HTTPException(status_code=404, detail="Vendor application not found")

    ts = datetime.utcnow().strftime("%Y-%m-%d %H:%M")
    app_record.stage2_status = "RETURNED"
    app_record.stage1_status = "RETURNED"
    app_record.overall_status = "RETURNED_TO_EXECUTOR"
    reason = data.rejection_reason or data.reason or "Quality or location check failed"
    letter = data.rejection_letter or data.letter or "Returned to executor for re-audit"
    app_record.return_letter_json = json.dumps({
        "sender": "Ananya Rao (Compliance & KYC Verifier)",
        "target": "Executor Admin",
        "reason": reason,
        "letter": letter,
        "timestamp": ts
    })

    db.commit()
    db.refresh(app_record)
    return app_record


@router.post("/verifier/cancel/{app_ref}", response_model=schemas.VendorPipelineApplicationResponse)
def verifier_cancel(app_ref: str, data: schemas.Stage2VerifierCancelRequest, db: Session = Depends(get_db)):
    app_record = db.query(models.VendorPipelineApplication).filter(models.VendorPipelineApplication.app_ref == app_ref).first()
    if not app_record and app_ref.isdigit():
        app_record = db.query(models.VendorPipelineApplication).filter(models.VendorPipelineApplication.id == int(app_ref)).first()
    if not app_record:
        raise HTTPException(status_code=404, detail="Vendor application not found")

    ts = datetime.utcnow().strftime("%Y-%m-%d %H:%M")
    app_record.stage2_status = "CANCELLED"
    app_record.stage1_status = "RETURNED"
    app_record.overall_status = "CANCELLED_BY_VERIFIER"
    reason = data.cancellation_reason or data.reason or "Verification check failed"
    letter = data.cancellation_letter or data.letter or "Application cancelled by Verifier"
    cancel_info = {
        "by": "Ananya Rao (Compliance & KYC Verifier)",
        "role": "Verifier Admin (Stage 2)",
        "reason": reason,
        "letter": letter,
        "timestamp": ts
    }
    app_record.cancellation_json = json.dumps(cancel_info)
    app_record.return_letter_json = json.dumps({
        "sender": "Ananya Rao (Compliance & KYC Verifier)",
        "target": "Executor Admin",
        "reason": reason,
        "letter": letter,
        "timestamp": ts
    })
    db.commit()
    db.refresh(app_record)
    return app_record


# =========================================================================
# 7. STAGE 3: APPROVER ADMIN OFFICIAL SEAL & BOND AUTHORITY
# =========================================================================
@router.post("/approver/approve/{app_ref}", response_model=schemas.VendorPipelineApplicationResponse)
def approver_seal_and_induct(app_ref: str, data: schemas.Stage3ApproverSealRequest, db: Session = Depends(get_db)):
    app_record = db.query(models.VendorPipelineApplication).filter(models.VendorPipelineApplication.app_ref == app_ref).first()
    if not app_record and app_ref.isdigit():
        app_record = db.query(models.VendorPipelineApplication).filter(models.VendorPipelineApplication.id == int(app_ref)).first()
    if not app_record:
        raise HTTPException(status_code=404, detail="Vendor application not found")

    ts = datetime.utcnow().strftime("%Y-%m-%d %H:%M")
    app_record.stage3_status = "COMPLETED"
    app_record.stage3_by = "Rajesh Menon (Cross-Check & Approver Authority)"
    app_record.stage3_timestamp = ts
    app_record.stage3_notes = data.approver_notes or data.notes or "Cross-check complete. 5.0% Gross performance bond executed."
    app_record.overall_status = "STAGE_4_CHAIRMAN"

    seal_details = {
        "seal_id": f"SEAL-SHOPSENSE-{random.randint(10000, 99999)}",
        "authorized_by": "Rajesh Menon (Approval Authority)",
        "bond_rate": "5.0% Gross Selling Percentage",
        "escrow_deposit": f"${data.escrow_bond_amount:.2f}",
        "timestamp": ts,
        "status": "PENDING_CHAIRMAN_APPROVAL"
    }
    app_record.seal_details_json = json.dumps(seal_details)
    app_record.handover_to_chairman_json = json.dumps({
        "explanation_letter": data.explanation_letter_to_chairman,
        "timestamp": ts,
        "from": "Rajesh Menon (Approver)"
    })
    
    app_record.stage4_status = "PENDING"

    db.commit()
    db.refresh(app_record)
    return app_record


@router.post("/approver/return/{app_ref}", response_model=schemas.VendorPipelineApplicationResponse)
def approver_return_to_verifier(app_ref: str, data: schemas.Stage3ApproverReturnRequest, db: Session = Depends(get_db)):
    app_record = db.query(models.VendorPipelineApplication).filter(models.VendorPipelineApplication.app_ref == app_ref).first()
    if not app_record and app_ref.isdigit():
        app_record = db.query(models.VendorPipelineApplication).filter(models.VendorPipelineApplication.id == int(app_ref)).first()
    if not app_record:
        raise HTTPException(status_code=404, detail="Vendor application not found")

    ts = datetime.utcnow().strftime("%Y-%m-%d %H:%M")
    app_record.stage3_status = "RETURNED"
    app_record.stage2_status = "RETURNED"
    app_record.overall_status = "RETURNED_TO_VERIFIER"
    reason = data.rejection_reason or data.reason or "Bond or cross-check discrepancy"
    letter = data.rejection_letter or data.letter or "Returned to verifier for re-audit"
    app_record.return_letter_json = json.dumps({
        "sender": "Rajesh Menon (Cross-Check & Approver Authority)",
        "target": "Verifier Admin",
        "reason": reason,
        "letter": letter,
        "timestamp": ts
    })

    db.commit()
    db.refresh(app_record)
    return app_record


@router.post("/approver/cancel/{app_ref}", response_model=schemas.VendorPipelineApplicationResponse)
def approver_cancel(app_ref: str, data: schemas.Stage3ApproverCancelRequest, db: Session = Depends(get_db)):
    app_record = db.query(models.VendorPipelineApplication).filter(models.VendorPipelineApplication.app_ref == app_ref).first()
    if not app_record and app_ref.isdigit():
        app_record = db.query(models.VendorPipelineApplication).filter(models.VendorPipelineApplication.id == int(app_ref)).first()
    if not app_record:
        raise HTTPException(status_code=404, detail="Vendor application not found")

    ts = datetime.utcnow().strftime("%Y-%m-%d %H:%M")
    app_record.stage3_status = "CANCELLED"
    app_record.overall_status = "CANCELLED_BY_APPROVER"
    reason = data.cancellation_reason or data.reason or "Vetoed by approver"
    letter = data.cancellation_letter or data.letter or "Application cancelled by Approver"
    app_record.cancellation_json = json.dumps({
        "by": "Rajesh Menon (Cross-Check & Approver Authority)",
        "role": "Approver Admin (Stage 3)",
        "reason": reason,
        "letter": letter,
        "timestamp": ts
    })
    db.commit()
    db.refresh(app_record)
    return app_record


@router.post("/chairman/approve/{app_ref}", response_model=schemas.VendorPipelineApplicationResponse)
def chairman_final_approve(app_ref: str, data: schemas.Stage4ChairmanApprovalRequest, db: Session = Depends(get_db)):
    app_record = db.query(models.VendorPipelineApplication).filter(models.VendorPipelineApplication.app_ref == app_ref).first()
    if not app_record and app_ref.isdigit():
        app_record = db.query(models.VendorPipelineApplication).filter(models.VendorPipelineApplication.id == int(app_ref)).first()
    if not app_record:
        raise HTTPException(status_code=404, detail="Vendor application not found")

    if app_record.overall_status not in ["STAGE_4_CHAIRMAN", "PENDING_CHAIRMAN_APPROVAL"]:
        raise HTTPException(status_code=400, detail="Vendor application is not pending Chairman approval")

    ts = datetime.utcnow().strftime("%Y-%m-%d %H:%M")
    app_record.stage4_status = "APPROVED"
    app_record.stage4_by = "Supreme Chairman"
    app_record.stage4_timestamp = ts
    app_record.stage4_notes = data.chairman_notes or data.notes or "Final Supreme Chairman Approval Granted. Live access authorized."
    app_record.overall_status = "APPROVED_LIVE"

    if app_record.seal_details_json:
        seal = json.loads(app_record.seal_details_json)
        seal["status"] = "OFFICIALLY_COMMISSIONED"
        app_record.seal_details_json = json.dumps(seal)

    # Check if Vendor model exists in main vendors table; if not, create live store!
    existing_vendor = db.query(models.Vendor).filter(
        (models.Vendor.email == app_record.email) |
        (models.Vendor.name.ilike(app_record.store_name.strip()))
    ).first()
    if not existing_vendor:
        live_v = models.Vendor(
            name=app_record.store_name,
            email=app_record.email,
            rating=4.9,
            status="Active"
        )
        db.add(live_v)
        db.flush()
        target_vendor_id = live_v.id
    else:
        target_vendor_id = existing_vendor.id

    # Automatically seed starter catalog for the new approved vendor
    seed_starter_catalog = None
    try:
        from catalog_generator import seed_starter_catalog_for_new_vendor as seed_starter_catalog
    except Exception:
        try:
            from app.catalog_generator import seed_starter_catalog_for_new_vendor as seed_starter_catalog
        except Exception:
            try:
                import sys, os
                parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                if parent_dir not in sys.path:
                    sys.path.insert(0, parent_dir)
                from catalog_generator import seed_starter_catalog_for_new_vendor as seed_starter_catalog
            except Exception:
                seed_starter_catalog = None

    if seed_starter_catalog is not None:
        try:
            seed_starter_catalog(
                vendor_id=target_vendor_id,
                store_name=app_record.store_name,
                category=app_record.category or "General Goods",
                description=app_record.description or "",
                db=db
            )
        except Exception as e:
            print(f"[CHAIRMAN SEED ERROR] {e}")

    db.commit()
    db.refresh(app_record)
    return app_record


@router.post("/chairman/reject/{app_ref}", response_model=schemas.VendorPipelineApplicationResponse)
def chairman_reject(app_ref: str, data: schemas.Stage4ChairmanRejectRequest, db: Session = Depends(get_db)):
    app_record = db.query(models.VendorPipelineApplication).filter(models.VendorPipelineApplication.app_ref == app_ref).first()
    if not app_record:
        raise HTTPException(status_code=404, detail="Vendor application not found")

    ts = datetime.utcnow().strftime("%Y-%m-%d %H:%M")
    app_record.stage4_status = "CANCELLED"
    app_record.overall_status = "CANCELLED_BY_CHAIRMAN"
    reason = data.rejection_reason or data.reason or "Rejected by Supreme Chairman"
    app_record.cancellation_json = json.dumps({
        "cancelled_by": "Supreme Chairman",
        "reason": reason,
        "timestamp": ts
    })

    db.commit()
    db.refresh(app_record)
    return app_record

@router.get("/vendor-pipeline", response_model=list[schemas.VendorPipelineApplicationResponse])
def list_vendor_pipeline(status: str | None = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.VendorPipelineApplication)
    if status and status.upper() != "ALL":
        query = query.filter(models.VendorPipelineApplication.overall_status == status.upper())
    return query.order_by(models.VendorPipelineApplication.id.desc()).all()


@router.post("/vendor-pipeline/apply", response_model=schemas.VendorPipelineApplicationResponse)
def apply_vendor_pipeline(data: schemas.VendorPipelineApplicationCreate, db: Session = Depends(get_db)):
    # Generate collision-free unique ref
    existing_refs = {v[0] for v in db.query(models.VendorPipelineApplication.app_ref).all()}
    counter = len(existing_refs) + 101
    while f"VAPP-{counter}" in existing_refs:
        counter += 1
    app_ref = f"VAPP-{counter}"

    new_v = models.VendorPipelineApplication(
        app_ref=app_ref,
        store_name=data.store_name,
        owner_name=data.owner_name,
        category=data.category,
        gstin=data.gstin,
        aadhaar_number=data.aadhaar_number,
        email=data.email,
        phone=data.phone,
        description=data.description,
        overall_status="STAGE_1_EXECUTOR",
        stage1_status="PENDING",
        stage2_status="LOCKED",
        stage3_status="LOCKED"
    )
    db.add(new_v)
    db.commit()
    db.refresh(new_v)
    return new_v

def _replenish_next_vendor_application(db: Session):
    """
    Disabled: Applications must only be added when an actual vendor applies via /vendor-pipeline/apply
    """
    return None
