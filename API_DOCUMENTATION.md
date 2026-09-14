# 📖 ShopSense Multi-Vendor Analytics Platform - API Documentation
## Milestones 1, 2, 3, 4 & 5 Complete Specification

The **ShopSense API** is an enterprise-grade REST and WebSocket API built with **FastAPI**. It includes automatic OpenAPI schema generation, interactive Swagger UI (`/docs`), ReDoc (`/redoc`), and rich Pydantic schemas.

---

## 🧭 Interactive Documentation Links

| Service | Swagger UI | ReDoc UI | OpenAPI JSON |
| :--- | :--- | :--- | :--- |
| **Admin Backend (Port 8000)** | [http://localhost:8000/docs](http://localhost:8000/docs) | [http://localhost:8000/redoc](http://localhost:8000/redoc) | [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json) |
| **Customer Backend (Port 8001)** | [http://localhost:8001/docs](http://localhost:8001/docs) | [http://localhost:8001/redoc](http://localhost:8001/redoc) | [http://localhost:8001/openapi.json](http://localhost:8001/openapi.json) |

---

## 🤖 Milestone 5: Autonomous AI Agent & Weekly Store Strategy

### 1. Run Autonomous Weekly Store Analysis (LangGraph Workflow)
* **Method**: `POST`
* **Path**: `/ai-agent/weekly-vendor-analysis`
* **Description**: Executes the LangGraph multi-node state machine to audit store telemetry, detect stagnant high-inventory items with dropping demand, formulate strategic discount advice, project financial lift, and draft an executive briefing email.
* **Request Body**:
```json
{
  "vendor_id": 1,
  "lookback_days": 7,
  "simulate_email": true
}
```
* **Response (200 OK)**:
```json
{
  "status": "success",
  "report_ref": "AGENT-REP-2026-W37-1-193022",
  "vendor_id": 1,
  "vendor_name": "TechWorld Electronics & Gadgets",
  "period": "2026-09-04 to 2026-09-11",
  "executive_summary": "Autonomous Store Copilot audited 8 products for TechWorld Electronics. Identified 2 high-inventory items requiring strategic discount clearance...",
  "execution_trace": [
    {
      "step": 1,
      "node": "audit_store_telemetry_node",
      "agent_thought": "Ingested store catalog telemetry. Evaluated 8 products...",
      "status": "COMPLETED"
    },
    {
      "step": 2,
      "node": "strategic_reasoning_node",
      "agent_thought": "Synthesized pricing elasticity and demand trends...",
      "status": "COMPLETED"
    },
    {
      "step": 3,
      "node": "financial_projection_node",
      "agent_thought": "Calculated store cashflow unlock...",
      "status": "COMPLETED"
    },
    {
      "step": 4,
      "node": "proactive_advisor_and_email_node",
      "agent_thought": "Persisted weekly report and compiled executive advisory email...",
      "status": "COMPLETED"
    }
  ],
  "strategic_actions": [
    {
      "action_id": "ACT-DISC-1",
      "action_type": "DISCOUNT_RECOMMENDATION",
      "urgency": "HIGH",
      "product_id": 1,
      "product_name": "Samsung Galaxy S24 Ultra 5G",
      "title": "Discount Samsung Galaxy S24 Ultra 5G by 15%",
      "description": "You should discount product 'Samsung Galaxy S24 Ultra 5G' by 15% because inventory is high (45 units on hand) and recent weekly demand is dropping. Repricing accelerates turnover and frees working capital.",
      "current_price": 1299.99,
      "suggested_price": 1104.99,
      "discount_percentage": 15.0,
      "financial_impact": "+$37,293.41 Freed Capital"
    }
  ],
  "financial_projections": {
    "unlocked_idle_capital": 37293.41,
    "projected_gmv_lift_pct": "+17.9%",
    "projected_weekly_revenue_addition": 45497.96,
    "turnover_acceleration_factor": "2.4x"
  }
}
```

### 2. 1-Click Apply AI Agent Recommended Discount
* **Method**: `POST`
* **Path**: `/ai-agent/apply-strategic-discount`
* **Request Body**:
```json
{
  "product_id": 1,
  "discount_percentage": 15.0,
  "reason": "Clearance for high inventory and dropping demand"
}
```
* **Response (200 OK)**:
```json
{
  "status": "success",
  "message": "Successfully applied 15.0% discount to 'Samsung Galaxy S24 Ultra 5G'",
  "product_id": 1,
  "original_price": 1299.99,
  "discount_percentage": 15.0,
  "new_price": 1104.99
}
```

### 3. Dispatch Proactive Strategic Advisory Email
* **Method**: `POST`
* **Path**: `/ai-agent/send-weekly-advisory-email`
* **Request Body**:
```json
{
  "report_ref": "AGENT-REP-2026-W37-1-193022",
  "vendor_id": 1,
  "custom_recipient": "vendor@shopsense.com"
}
```

---

## ⚡ Core Platform Endpoints (Milestones 1, 2, 3 & 4)

### Health & System Status
* `GET /health`: Returns subsystem statuses, milestone achievements, and enabled engine features.
* `GET /`: Root verification endpoint.

### Vendors (Milestone 1)
* `GET /vendors/`: List all approved marketplace vendors.
* `POST /vendors/`: Register a new vendor partner with input validation.
* `GET /vendors/{id}`: Fetch vendor profile.
* `GET /vendors/{id}/store-summary`: Aggregated sales, product count, and gross revenue by vendor.

### Inventory Intelligence (Milestone 2)
* `GET /inventory/summary`: Total catalog units, warehouse stock value, low-stock counts.
* `GET /inventory/low-stock-alerts`: List of products below reorder threshold.
* `POST /inventory/simulate-stock`: Restock simulation and stress-testing.

### Analytics & BI Reporting (Milestone 3)
* `GET /analytics/summary`: Platform-wide gross revenue, active orders, and monthly run-rate.
* `GET /analytics/sales-charts`: Time-series formatted for frontend Recharts graphs.
* `GET /analytics/vendor-analytics`: Marketplace benchmarking metrics.
* `POST /rag-assistant/chat`: RAG chatbot querying product catalog embeddings.
* `POST /data-analyst/ask`: Natural Language Text-to-SQL data analyst.
