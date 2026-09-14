def test_inventory_summary(client):
    """Milestone 2 Base: Current stock levels and inventory totals."""
    response = client.get("/inventory/summary")
    assert response.status_code == 200
    data = response.json()
    assert "total_products" in data
    assert "total_units_in_stock" in data
    assert "low_stock_count" in data
    assert data["total_products"] >= 2


def test_low_stock_alerts(client):
    """Milestone 2 Base: Detect products at or below safety reorder threshold."""
    response = client.get("/inventory/low-stock-alerts")
    assert response.status_code == 200
    data = response.json()
    assert "alerts" in data or isinstance(data, list)
    alerts_list = data["alerts"] if isinstance(data, dict) and "alerts" in data else data
    found_alert = any(item.get("product_name") == "UltraSlim Pro Laptop Stand" or item.get("name") == "UltraSlim Pro Laptop Stand" for item in alerts_list)
    assert found_alert is True


def test_customer_segmentation(client):
    """Milestone 2 Base: SQL-based customer grouping by total spent."""
    response = client.get("/analytics/customer-segmentation")
    assert response.status_code == 200
    data = response.json()
    assert "segments" in data or "summary" in data or isinstance(data, list)


def test_rule_based_recommendations(client):
    """Milestone 2 Base: Category and top-selling product recommendations."""
    response = client.get("/products/recommendations/top-selling")
    assert response.status_code == 200
    data = response.json()
    rec_list = data["recommendations"] if isinstance(data, dict) and "recommendations" in data else data
    assert len(rec_list) >= 1


def test_simulate_stock_restock_action(client):
    """Milestone 2 Base: Restock simulation updating quantities and thresholds."""
    payload = {
        "action": "quick_restock_all"
    }
    response = client.post("/inventory/simulate-stock", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
