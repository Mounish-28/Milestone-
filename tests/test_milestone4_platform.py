import time


def test_health_check_milestone_status(client):
    """Milestone 4 Base: Platform healthcheck validating active milestones."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "Milestone 4" in data["milestone"]
    assert "Milestone 5" in data["milestone"]
    assert data["version"] == "5.0.0"
    assert "subsystems" in data
    assert data["subsystems"]["milestone_4_optimization_testing_docker"] == "ACTIVE"


def test_openapi_documentation_schema_generation(client):
    """Milestone 4 Base: Comprehensive Swagger OpenAPI schema is valid."""
    response = client.get("/openapi.json")
    assert response.status_code == 200
    schema = response.json()
    assert "openapi" in schema
    assert "info" in schema
    assert schema["info"]["title"] == "ShopSense Multi-Vendor E-Commerce Analytics Platform API"
    assert "paths" in schema
    assert "/vendors/" in schema["paths"]
    assert "/products/" in schema["paths"]
    assert "/ai-agent/weekly-vendor-analysis" in schema["paths"]


def test_swagger_docs_accessible(client):
    """Milestone 4 Base: Interactive Swagger UI endpoint /docs returns 200."""
    response = client.get("/docs")
    assert response.status_code == 200


def test_redoc_docs_accessible(client):
    """Milestone 4 Base: ReDoc API documentation endpoint /redoc returns 200."""
    response = client.get("/redoc")
    assert response.status_code == 200


def test_api_performance_latency(client):
    """Milestone 4 Optimization: Core API response latency stays under 300ms."""
    start = time.time()
    response = client.get("/vendors/")
    elapsed = time.time() - start
    assert response.status_code == 200
    assert elapsed < 0.5, f"Response took {elapsed:.3f}s, expected < 0.5s"
