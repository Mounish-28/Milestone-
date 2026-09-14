import sys
import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import Base, get_db
from app import models
from app.main import app

from sqlalchemy.pool import StaticPool

# Isolated in-memory SQLite database for testing with StaticPool
TEST_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=test_engine
)


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """Creates tables in isolated in-memory DB and seeds baseline mock data."""
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    try:
        # Seed test vendor
        v1 = models.Vendor(id=1, name="Apex Global Retailers", email="contact@apexretail.test", rating=4.9, status="Active")
        v2 = models.Vendor(id=2, name="Zenith Tech Labs", email="support@zenithtech.test", rating=4.7, status="Active")
        db.add_all([v1, v2])
        db.commit()

        # Seed test products
        p1 = models.Product(
            id=1,
            name="Quantum Sonic Headphones",
            category="Electronics",
            price=299.99,
            stock="In Stock",
            stock_quantity=45,
            reorder_threshold=10,
            units_sold=8,
            rating=4.8,
            description="Active noise canceling premium wireless headphones.",
            vendor_id=1
        )
        p2 = models.Product(
            id=2,
            name="UltraSlim Pro Laptop Stand",
            category="Accessories",
            price=49.99,
            stock="Low Stock",
            stock_quantity=3,
            reorder_threshold=12,
            units_sold=42,
            rating=4.9,
            description="Ergonomic aluminum portable riser stand.",
            vendor_id=1
        )
        db.add_all([p1, p2])
        db.commit()

        # Seed test customers
        c1 = models.Customer(
            id=1,
            name="Aarav Sharma",
            email="aarav.test@shopsense.com",
            phone="+91 9876543210",
            city="Mumbai",
            country="India",
            membership_tier="Diamond"
        )
        c2 = models.Customer(
            id=2,
            name="Priya Patel",
            email="priya.test@shopsense.com",
            phone="+91 9876543211",
            city="Bangalore",
            country="India",
            membership_tier="Gold"
        )
        db.add_all([c1, c2])
        db.commit()

        # Seed test transactions
        t1 = models.Transaction(
            id=1,
            transaction_ref="TXN-TEST-101",
            customer_id=1,
            customer_name="Aarav Sharma",
            product_id=1,
            product_name="Quantum Sonic Headphones",
            vendor_id=1,
            quantity=1,
            amount=299.99,
            payment_method="UPI",
            status="Completed",
            created_at=datetime.utcnow() - timedelta(days=2)
        )
        db.add(t1)
        db.commit()
    finally:
        db.close()

    yield

    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def db_session():
    """Provides a transactional database session for unit tests."""
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(scope="function")
def client(db_session):
    """Provides FastAPI TestClient wired to the isolated test database."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    
    # Also override for all routers
    from app.routers import (
        vendors, inventory, analytics, transactions, 
        products, customers, ai_agent, recommendations, 
        segmentation, admin_governance, auth
    )
    for mod in [vendors, inventory, analytics, transactions, products, customers, ai_agent, recommendations, segmentation, admin_governance, auth]:
        if hasattr(mod, "get_db"):
            app.dependency_overrides[getattr(mod, "get_db")] = override_get_db

    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

