def test_autonomous_shopping_agent_workflow(client):
    """Milestone 5: Autonomous Multi-Step Shopping Agent."""
    payload = {
        "prompt": "Find top wireless headphones under $350",
        "category": "Electronics",
        "budget": 350.0,
        "membership_tier": "Diamond"
    }
    response = client.post("/ai-agent/run", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "execution_steps" in data
    assert len(data["execution_steps"]) >= 4
    assert data["winning_recommendation"] is not None


def test_weekly_vendor_store_autonomous_analysis(client):
    """Milestone 5: LangGraph Autonomous Weekly Store Auditor."""
    payload = {
        "vendor_id": 1,
        "lookback_days": 7,
        "simulate_email": True
    }
    response = client.post("/ai-agent/weekly-vendor-analysis", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "report_ref" in data
    assert data["vendor_id"] == 1
    assert "strategic_actions" in data
    assert len(data["strategic_actions"]) >= 1

    # Verify the specific brief requirement: Discount product X because inventory is high and demand dropping
    discount_actions = [a for a in data["strategic_actions"] if a["action_type"] == "DISCOUNT_RECOMMENDATION"]
    assert len(discount_actions) >= 1
    first_discount = discount_actions[0]
    assert "discount" in first_discount["description"].lower()
    assert "inventory is high" in first_discount["description"].lower()
    assert "demand is dropping" in first_discount["description"].lower()

    # Verify LangGraph execution trace
    assert "execution_trace" in data
    assert len(data["execution_trace"]) == 4

    # Verify financial projections
    assert "financial_projections" in data
    assert "projected_gmv_lift_pct" in data["financial_projections"]
    assert "unlocked_idle_capital" in data["financial_projections"]


def test_get_archived_weekly_reports(client):
    """Milestone 5: Retrieve persisted historical agent reports."""
    # First ensure a report was run
    client.post("/ai-agent/weekly-vendor-analysis", json={"vendor_id": 1})

    response = client.get("/ai-agent/weekly-vendor-reports/1")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["reports_count"] >= 1
    assert isinstance(data["reports"], list)


def test_send_weekly_advisory_email(client):
    """Milestone 5: Dispatch proactive executive advisory email."""
    # Generate report
    gen_res = client.post("/ai-agent/weekly-vendor-analysis", json={"vendor_id": 1})
    report_ref = gen_res.json()["report_ref"]

    payload = {
        "report_ref": report_ref,
        "vendor_id": 1,
        "custom_recipient": "vendor.test@shopsense.com"
    }
    response = client.post("/ai-agent/send-weekly-advisory-email", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["recipient"] == "vendor.test@shopsense.com"
    assert data["delivery_mode"] in ["LIVE_SMTP", "SANDBOX_SIMULATOR"]


def test_apply_strategic_discount(client):
    """Milestone 5: 1-Click Apply AI Agent Recommended Discount."""
    payload = {
        "product_id": 1,
        "discount_percentage": 15.0,
        "reason": "Clearance for high inventory and dropping demand"
    }
    response = client.post("/ai-agent/apply-strategic-discount", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["product_id"] == 1
    assert data["discount_percentage"] == 15.0
    assert data["new_price"] < data["original_price"]
