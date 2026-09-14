"""
End-to-End Test Suite for ShopSense 4-Tier Sequential Governance Pipeline
Validates:
1. Vendor Application submission -> Stage 1 Executor Desk
2. Executor due-diligence approval -> Advances to Stage 2 Verifier Desk
3. Verifier physical geolocation/quality approval -> Advances to Stage 3 Approver Desk
4. Approver performance bond seal -> Advances to Stage 4 Supreme Chairman Desk
5. Supreme Chairman Live Portal Access approval -> Sets APPROVED_LIVE & registers Vendor in marketplace
6. Return/re-audit workflows between Verifier and Executor
"""

import pytest


def test_full_sequential_governance_pipeline_lifecycle(client):
    # Step 1: New Vendor Applies for Pipeline
    app_payload = {
        "store_name": "Titan Precision Robotics & Sensors",
        "owner_name": "Arjun Singhal",
        "category": "Industrial Automation & Robotics",
        "gstin": "29AAACT9988M1Z9",
        "aadhaar_number": "987654329988",
        "email": "contact@titanrobotics.test",
        "phone": "+91 9988776655",
        "description": "Manufacturer of high-precision lidar sensors and automated warehouse drones."
    }
    create_res = client.post("/admin/vendor-pipeline/apply", json=app_payload)
    assert create_res.status_code == 200, create_res.text
    app_data = create_res.json()
    app_ref = app_data["app_ref"]
    assert app_data["overall_status"] == "STAGE_1_EXECUTOR"
    assert app_data["stage1_status"] == "PENDING"
    assert app_data["stage2_status"] == "LOCKED"
    assert app_data["stage3_status"] == "LOCKED"

    # Step 2: Stage 1 Executor Admin Due-Diligence Approval
    executor_payload = {
        "due_diligence_notes": "MCA registration verified, 0 consumer complaints found, trust score 98/100.",
        "handover_subject": f"Stage 1 Handover: {app_data['store_name']}",
        "handover_content": "Due diligence approved. Forwarding to Verifier Desk for warehouse audit."
    }
    st1_res = client.post(f"/admin/executor/approve/{app_ref}", json=executor_payload)
    assert st1_res.status_code == 200, st1_res.text
    st1_data = st1_res.json()
    assert st1_data["stage1_status"] == "COMPLETED"
    assert st1_data["stage2_status"] == "PENDING"
    assert st1_data["overall_status"] == "STAGE_2_VERIFIER"

    # Step 3: Stage 2 Verifier Admin Audits Locations & Approves
    verifier_payload = {
        "verifier_notes": "Physical warehouse coordinates inspected, stock quality Grade-A verified.",
        "explanation_subject": f"Stage 2 Clearance: {app_data['store_name']}",
        "explanation_body": "Quality check passed. Forwarding to Approver Desk for commercial performance bond."
    }
    st2_res = client.post(f"/admin/verifier/approve/{app_ref}", json=verifier_payload)
    assert st2_res.status_code == 200, st2_res.text
    st2_data = st2_res.json()
    assert st2_data["stage2_status"] == "COMPLETED"
    assert st2_data["stage3_status"] == "PENDING"
    assert st2_data["overall_status"] == "STAGE_3_APPROVER"

    # Step 4: Stage 3 Approver Admin Cross-Checks & Issues Bond Seal
    approver_payload = {
        "approver_notes": "5.0% performance bond agreement executed in escrow.",
        "escrow_bond_amount": 5000.0,
        "explanation_letter_to_chairman": "All 3 admin audits passed with pristine record. Forwarding to Supreme Chairman for live vendor portal access authorization."
    }
    st3_res = client.post(f"/admin/approver/approve/{app_ref}", json=approver_payload)
    assert st3_res.status_code == 200, st3_res.text
    st3_data = st3_res.json()
    assert st3_data["stage3_status"] == "COMPLETED"
    assert st3_data["stage4_status"] == "PENDING"
    assert st3_data["overall_status"] == "STAGE_4_CHAIRMAN"

    # Step 5: Stage 4 Supreme Chairman Grants Live Vendor Portal Access
    chairman_payload = {
        "chairman_notes": "Supreme Chairman Mounish has authorized live vendor portal access and commissioned the store."
    }
    st4_res = client.post(f"/admin/chairman/approve/{app_ref}", json=chairman_payload)
    assert st4_res.status_code == 200, st4_res.text
    st4_data = st4_res.json()
    assert st4_data["stage4_status"] == "APPROVED"
    assert st4_data["overall_status"] == "APPROVED_LIVE"

    # Step 6: Verify Vendor is Officially Commissioned in Marketplace Vendors Table
    vendors_res = client.get("/vendors/")
    assert vendors_res.status_code == 200
    all_vendors = vendors_res.json()
    matching_vendor = next((v for v in all_vendors if v["email"] == "contact@titanrobotics.test"), None)
    assert matching_vendor is not None, "Vendor must be created in core vendors table after Chairman clearance"
    assert matching_vendor["name"] == "Titan Precision Robotics & Sensors"
    assert matching_vendor["status"] == "Active"


def test_verifier_return_to_executor_workflow(client):
    # Apply vendor
    create_res = client.post("/admin/vendor-pipeline/apply", json={
        "store_name": "Amber Textiles & Silks",
        "owner_name": "Sita Lakshmi",
        "category": "Apparel & Textiles",
        "gstin": "33AAACA1122M1Z1",
        "aadhaar_number": "987654321122",
        "email": "contact@ambertextiles.test",
        "phone": "+91 9112233445",
        "description": "Pure Kanchipuram silk sarees and handloom garments."
    })
    app_ref = create_res.json()["app_ref"]

    # Executor approves
    client.post(f"/admin/executor/approve/{app_ref}", json={
        "due_diligence_notes": "Initial background check clear.",
        "handover_subject": "Handover to Verifier",
        "handover_content": "Please verify warehouse address."
    })

    # Verifier finds warehouse address mismatch -> returns to Executor
    return_res = client.post(f"/admin/verifier/return/{app_ref}", json={
        "rejection_reason": "Warehouse location discrepancy",
        "rejection_letter": "Physical facility address differs from GST certificate. Re-check required."
    })
    assert return_res.status_code == 200
    ret_data = return_res.json()
    assert ret_data["stage2_status"] == "RETURNED"
    assert ret_data["stage1_status"] == "RETURNED"
    assert ret_data["overall_status"] == "RETURNED_TO_EXECUTOR"
