def test_analytics_summary(client):
    """Milestone 3 Base: Overall analytics summary formatted for frontend."""
    response = client.get("/analytics/summary")
    assert response.status_code == 200
    data = response.json()
    assert "total_revenue" in data
    assert "active_orders" in data or "total_orders" in data
    assert "monthly_income" in data


def test_sales_charts_formatting(client):
    """Milestone 3 Base: Endpoints specifically formatted for Recharts time-series."""
    response = client.get("/analytics/sales-charts")
    assert response.status_code == 200
    data = response.json()
    assert "monthly_sales" in data or "weekly_trend" in data
    assert "top_categories" in data or "category_distribution" in data


def test_vendor_benchmarking_metrics(client):
    """Milestone 3 Base: Benchmarking vendor performance vs marketplace average."""
    response = client.get("/analytics/vendor-analytics")
    assert response.status_code == 200
    data = response.json()
    assert "total_monthly_income" in data or "highest_performing_vendor" in data or isinstance(data, list)


def test_transactions_export_data(client):
    """Milestone 3 Base: Transactions ledger data retrieval for CSV/PDF reporting."""
    response = client.get("/transactions/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["transaction_ref"] == "TXN-TEST-101"


def test_rag_shopping_assistant(client):
    """Milestone 3 Advanced: RAG Shopping Assistant answering questions from catalog."""
    payload = {"query": "Find good noise cancelling headphones under $400"}
    response = client.post("/rag-assistant/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "response" in data or "recommendations" in data or "answer" in data


def test_natural_language_data_analyst(client):
    """Milestone 3 Advanced: AI Data Analyst Text-to-SQL question answering."""
    payload = {"query": "How many total products are in the catalog?"}
    response = client.post("/data-analyst/ask", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data or "result" in data or "query" in data
