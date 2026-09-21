import os
import sys
import io
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

import httpx
from httpx import Client

# Auto-fallback to in-process TestClient if live uvicorn is not running
client = None
try:
    live_client = Client(base_url="http://127.0.0.1:8001", timeout=1.0)
    res = live_client.get("/health")
    if res.status_code == 200:
        client = live_client
        print("🔗 Connected to live Customer Backend on http://127.0.0.1:8001")
except Exception:
    pass

if client is None:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    cb_dir = os.path.join(BASE_DIR, "customer-backend")
    if cb_dir not in sys.path:
        sys.path.insert(0, cb_dir)
    import importlib.util
    spec_cb = importlib.util.spec_from_file_location("cb_main", os.path.join(cb_dir, "main.py"))
    cb_main = importlib.util.module_from_spec(spec_cb)
    spec_cb.loader.exec_module(cb_main)
    from fastapi.testclient import TestClient
    client = TestClient(cb_main.app, base_url="http://127.0.0.1:8001")
    print("🚀 In-process TestClient initialized for Customer Backend")

print("==================================================")
print("TESTING CUSTOMER BACKEND (PORT 8001)")
print("==================================================\n")

# 1. Health
res = client.get("/health")
assert res.status_code == 200, f"Health check failed: {res.text}"
print("[PASS] 1. Health check: 200 OK")

# 2. Products Catalog
res = client.get("/products/")
assert res.status_code == 200, f"Products listing failed: {res.text}"
products = res.json()
print(f"[PASS] 2. Products catalog: {len(products)} products loaded")
assert len(products) > 0

# 3. Vendors
res = client.get("/vendors/")
assert res.status_code == 200, f"Vendors listing failed: {res.text}"
vendors = res.json()
print(f"[PASS] 3. Vendors listing: {len(vendors)} active vendors")
assert len(vendors) > 0

# 4. Customers
res = client.get("/customers/")
assert res.status_code == 200, f"Customers listing failed: {res.text}"
customers = res.json()
print(f"[PASS] 4. Customers listing: {len(customers)} customers")

# 5. Customer Segmentation
res = client.get("/analytics/customer-segmentation")
assert res.status_code == 200, f"Segmentation failed: {res.text}"
seg = res.json()
print(f"[PASS] 5. RFM Customer Segmentation: {seg.get('summary', {}).get('total_customers', 0)} segmented records")

# 6. Analytics
res = client.get("/analytics/summary")
assert res.status_code == 200, f"Analytics summary failed: {res.text}"
analytics = res.json()
print(f"[PASS] 6. Analytics summary: revenue=${analytics.get('total_revenue', 0)}")

# 7. AI Assistant
res = client.post("/assistant/query", json={
    "query": "Find the best deals on mobile phones",
    "page_context": "customer"
})
assert res.status_code == 200, f"AI Assistant query failed: {res.text}"
ai_res = res.json()
print(f"[PASS] 7. AI Assistant response: {ai_res.get('engine')} responded")

print("\n==================================================")
print("ALL CUSTOMER BACKEND TESTS PASSED WITH 100% SUCCESS!")
print("==================================================")
