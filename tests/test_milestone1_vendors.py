def test_list_vendors(client):
    """Milestone 1 Base: Retrieve all registered vendors."""
    response = client.get("/vendors/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["name"] == "Apex Global Retailers"


def test_get_vendor_by_id(client):
    """Milestone 1 Base: Fetch specific vendor profile by ID."""
    response = client.get("/vendors/1")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 1
    assert data["email"] == "contact@apexretail.test"
    assert data["status"] == "Active"


def test_register_vendor_with_validation(client):
    """Milestone 1 Base: Register new vendor and validate input constraints."""
    payload = {
        "name": "Nexus Dynamics Inc",
        "email": "partnerships@nexusdynamics.test",
        "rating": 4.95
    }
    response = client.post("/vendors/", json=payload)
    assert response.status_code in [200, 201]
    data = response.json()
    assert data["name"] == "Nexus Dynamics Inc"
    assert data["email"] == "partnerships@nexusdynamics.test"
    assert data["rating"] == 4.95


def test_vendor_store_summary_and_revenue_aggregation(client):
    """Milestone 1 Base: Aggregate sales, revenue, and product counts for a vendor."""
    response = client.get("/vendors/1/store-summary")
    assert response.status_code == 200
    data = response.json()
    assert "store_name" in data
    assert "total_products" in data
    assert "total_stock_units" in data
    assert "total_revenue" in data
    assert data["total_products"] >= 2
