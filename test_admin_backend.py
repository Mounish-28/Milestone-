import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from httpx import Client

client = Client(base_url="http://127.0.0.1:8000", timeout=10.0)

print("==================================================")
print("🧪 TESTING ADMIN GOVERNANCE & CLEARANCE DESK BACKEND")
print("==================================================\n")

# 1. Test Health and Home Endpoints
res = client.get("/health")
assert res.status_code == 200, f"Health check failed: {res.text}"
print("✅ 1. Health check: 200 OK")

# 2. Test Governance Summary Endpoint
res = client.get("/admin/governance/summary")
assert res.status_code == 200, f"Governance summary failed: {res.text}"
summary = res.json()
print(f"✅ 2. Governance summary: {summary}")
assert "pending_admin_applicants" in summary
assert "total_active_tasks" in summary

# 3. Test Admin Applicants Listing
res = client.get("/admin/applicants")
assert res.status_code == 200, f"List applicants failed: {res.text}"
applicants = res.json()
print(f"✅ 3. Listed {len(applicants)} Admin Applicants")
assert len(applicants) >= 3

# 4. Test New Admin Registration with Resume
new_app_data = {
    "full_name": "Dr. Raghavendra Swamy",
    "username": "raghav_swamy",
    "email": "raghav.swamy@shopsense.com",
    "phone": "+91 9876543399",
    "aadhaar_number": "987654327788",
    "gender": "Male",
    "requested_role": "verifier",
    "requested_role_title": "Type 2: Compliance & Physical Facility Verifier",
    "experience_summary": "10 years managing pharmaceutical cold storage and warehouse inspections.",
    "headline": "Senior Logistics Compliance & Facility Auditor",
    "education": "Ph.D in Supply Chain Management (IIT Delhi)",
    "certifications": ["ISO 22000 Lead Auditor", "Six Sigma Master Black Belt"],
    "skills": ["Cold-Chain Telemetry", "Drone Surveying", "Regulatory Compliance"],
    "resume_file_name": "CV_Dr_Raghav_Swamy_PhD.pdf"
}
res = client.post("/admin/applicants/register", json=new_app_data)
assert res.status_code == 200, f"Register applicant failed: {res.text}"
created_applicant = res.json()
app_ref = created_applicant["applicant_ref"]
print(f"✅ 4. Registered new admin applicant: {app_ref} ({created_applicant['full_name']})")

# 5. Test Chairman Approving Admin Applicant
approve_payload = {
    "assigned_role": "verifier",
    "assigned_role_title": "Type 2: Compliance & KYC Verifier Admin",
    "chairman_notes": "Approved by Chairman Mounish Sai based on stellar Ph.D logistics background."
}
res = client.post(f"/admin/applicants/{app_ref}/approve", json=approve_payload)
assert res.status_code == 200, f"Approve applicant failed: {res.text}"
approved_app = res.json()
assert approved_app["status"] == "APPROVED"
assert approved_app["assigned_role"] == "verifier"
print(f"✅ 5. Chairman approved applicant {app_ref} -> Status: APPROVED")

# 6. Test Chairman Directives & Tasks
task_payload = {
    "target_admin": "executor",
    "target_admin_name": "Mounish Sai (Executor Admin)",
    "title": "Audit High-Risk Merchant GSTIN Declarations",
    "description": "Perform e-Courts litigation checks on all active fashion applicants.",
    "priority": "CRITICAL",
    "due_date": "2026-08-25 18:00"
}
res = client.post("/admin/tasks", json=task_payload)
assert res.status_code == 200, f"Create task failed: {res.text}"
created_task = res.json()
task_ref = created_task["task_ref"]
print(f"✅ 6. Chairman assigned directive: {task_ref} ({created_task['title']})")

# Update task status to IN_PROGRESS
res = client.patch(f"/admin/tasks/{task_ref}", json={"status": "IN_PROGRESS", "completion_notes": "Scanning initiated across MCA portal."})
assert res.status_code == 200, f"Update task failed: {res.text}"
print(f"✅ 7. Admin updated task {task_ref} status to IN_PROGRESS")

# 7. Test Chairman Inquiries & Admin Replies
inq_payload = {
    "target_admin": "verifier",
    "target_admin_name": "Ananya Rao (Verifier Admin)",
    "subject": "Hazardous Goods Storage Verification",
    "question": "Have you verified the fire suppression systems in the Bengaluru electronics warehouse?"
}
res = client.post("/admin/inquiries", json=inq_payload)
assert res.status_code == 200, f"Create inquiry failed: {res.text}"
created_inq = res.json()
inq_ref = created_inq["inquiry_ref"]
print(f"✅ 8. Chairman dispatched inquiry: {inq_ref} ({created_inq['subject']})")

# Admin submits formal reply
reply_payload = {
    "reply": "Yes Chairman, fire suppression systems and sprinkler telemetry were physically audited and certified Grade-A."
}
res = client.post(f"/admin/inquiries/{inq_ref}/reply", json=reply_payload)
assert res.status_code == 200, f"Reply inquiry failed: {res.text}"
replied_inq = res.json()
assert replied_inq["status"] == "ANSWERED"
assert replied_inq["reply"] is not None
print(f"✅ 9. Admin formally replied to inquiry {inq_ref} -> Status: ANSWERED")

# 8. Test 3-Tier Sequential Clearance Desk: Stage 1 Executor Approval
res = client.post("/admin/executor/approve/VAPP-101", json={
    "due_diligence_notes": "Clean legal track record, 0 consumer complaints.",
    "explanation_subject": "Stage 1 Clearance Handover: TechWorld Electronics",
    "explanation_body": "Due diligence passed. Routing to Verifier Ananya Rao."
})
assert res.status_code == 200, f"Executor approve failed: {res.text}"
vapp1 = res.json()
assert vapp1["stage1_status"] == "COMPLETED"
assert vapp1["stage2_status"] == "PENDING"
print("✅ 10. Executor Admin approved Stage 1 for VAPP-101 -> Stage 2 Unlocked (PENDING)")

# 9. Test Stage 2 Verifier Approval
res = client.post("/admin/verifier/approve/VAPP-101", json={
    "verifier_notes": "Physical warehouse geo-verified. 4K OLED stock audited.",
    "explanation_subject": "Stage 2 Geolocation Clearance: TechWorld Electronics",
    "explanation_body": "Physical audits passed. Routing to Approver Rajesh Menon for 5.0% bond execution."
})
assert res.status_code == 200, f"Verifier approve failed: {res.text}"
vapp1 = res.json()
assert vapp1["stage2_status"] == "COMPLETED"
assert vapp1["stage3_status"] == "PENDING"
print("✅ 11. Verifier Admin approved Stage 2 for VAPP-101 -> Stage 3 Unlocked (PENDING)")

# 10. Test Stage 3 Approver Official Seal & 5.0% Bond Execution
res = client.post("/admin/approver/approve/VAPP-101", json={
    "approver_notes": "Commercial 5.0% bond deed signed. Escrow secured. Official ShopSense Seal issued.",
    "escrow_bond_amount": 500.0
})
assert res.status_code == 200, f"Approver seal failed: {res.text}"
vapp1 = res.json()
assert vapp1["stage3_status"] == "COMPLETED"
assert vapp1["overall_status"] == "STAGE_4_CHAIRMAN"
assert vapp1["seal_details_json"] is not None
print("✅ 12. Approver Admin executed 5.0% performance bond & sealed store -> Status: STAGE_4_CHAIRMAN")

# 11. Test Stage 4 Chairman Final Approval to Live
res = client.post("/admin/chairman/approve/VAPP-101", json={
    "chairman_notes": "Final Chairman approval granted. Store is officially live on ShopSense marketplace."
})
assert res.status_code == 200, f"Chairman approval failed: {res.text}"
vapp_final = res.json()
assert vapp_final["stage4_status"] == "APPROVED"
assert vapp_final["overall_status"] == "APPROVED_LIVE"
print("✅ 13. Supreme Chairman approved vendor store live -> Status: APPROVED_LIVE")

print("\n==================================================")
print("🎉 ALL 13 ADMIN BACKEND TESTS PASSED WITH 100% SUCCESS!")
print("==================================================")
