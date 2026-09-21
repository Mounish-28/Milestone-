import os
import urllib.request
import urllib.error
import json
import sys
import io
import socket

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

def is_port_open(host, port, timeout=0.8):
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except OSError:
        return False

# Initialize fallback TestClients if ports are not live
admin_client = None
if is_port_open("127.0.0.1", 8000):
    print("🔗 Port 8000 is LIVE - testing over HTTP")
else:
    print("🚀 Port 8000 is offline - using in-process TestClient for Admin Backend")
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    if BASE_DIR not in sys.path:
        sys.path.insert(0, BASE_DIR)
    import app.main as admin_main
    from fastapi.testclient import TestClient
    admin_client = TestClient(admin_main.app, base_url="http://127.0.0.1:8000")

cust_client = None
if is_port_open("127.0.0.1", 8001):
    print("🔗 Port 8001 is LIVE - testing over HTTP")
else:
    print("🚀 Port 8001 is offline - using in-process TestClient for Customer Backend")
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    cb_dir = os.path.join(BASE_DIR, "customer-backend")
    if cb_dir not in sys.path:
        sys.path.insert(0, cb_dir)
    import importlib.util
    spec_cb = importlib.util.spec_from_file_location("cb_main", os.path.join(cb_dir, "main.py"))
    cb_main = importlib.util.module_from_spec(spec_cb)
    spec_cb.loader.exec_module(cb_main)
    from fastapi.testclient import TestClient
    cust_client = TestClient(cb_main.app, base_url="http://127.0.0.1:8001")

def test_endpoint(srv_name, method, url, data=None):
    if ":8000" in url and admin_client is not None:
        path = url.split(":8000", 1)[1]
        try:
            res = admin_client.request(method, path, json=data)
            status = res.status_code
            body = res.text
            if status == 200:
                print(f"[OK] [{srv_name}] {method} {url} -> 200 OK | {str(body)[:80]}")
                return True, 200, None
            else:
                print(f"[FAIL] [{srv_name}] {method} {url} -> HTTP {status} | {str(body)[:120]}")
                return False, status, body
        except Exception as e:
            print(f"[FAIL] [{srv_name}] {method} {url} -> Error: {e}")
            return False, None, str(e)

    if ":8001" in url and cust_client is not None:
        path = url.split(":8001", 1)[1]
        try:
            res = cust_client.request(method, path, json=data)
            status = res.status_code
            body = res.text
            if status == 200:
                print(f"[OK] [{srv_name}] {method} {url} -> 200 OK | {str(body)[:80]}")
                return True, 200, None
            else:
                print(f"[FAIL] [{srv_name}] {method} {url} -> HTTP {status} | {str(body)[:120]}")
                return False, status, body
        except Exception as e:
            print(f"[FAIL] [{srv_name}] {method} {url} -> Error: {e}")
            return False, None, str(e)

    req = urllib.request.Request(url, method=method)
    if data is not None:
        req.add_header('Content-Type', 'application/json')
        req.data = json.dumps(data).encode('utf-8')
    try:
        res = urllib.request.urlopen(req, timeout=8)
        body = res.read().decode('utf-8')
        try:
            parsed = json.loads(body)
            preview = str(parsed)[:80]
        except:
            preview = body[:80]
        clean_preview = preview.encode('ascii', errors='replace').decode('ascii')
        print(f"[OK] [{srv_name}] {method} {url} -> 200 OK | {clean_preview}")
        return True, 200, None
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8')[:120]
        clean_err = err_body.encode('ascii', errors='replace').decode('ascii')
        print(f"[FAIL] [{srv_name}] {method} {url} -> HTTP {e.code} | {clean_err}")
        return False, e.code, err_body
    except Exception as e:
        clean_msg = str(e).encode('ascii', errors='replace').decode('ascii')
        print(f"[FAIL] [{srv_name}] {method} {url} -> Error: {clean_msg}")
        return False, None, str(e)

print("--- AUDITING PORT 8000 (ADMIN BACKEND) ---")
endpoints_8000 = [
    ("GET", "http://127.0.0.1:8000/health", None),
    ("GET", "http://127.0.0.1:8000/", None),
    ("POST", "http://127.0.0.1:8000/auth/login", {"email": "executor.admin@shopsense.com", "password": "any"}),
    ("POST", "http://127.0.0.1:8000/auth/google", {"email": "executor.admin@shopsense.com", "name": "Mounish Sai"}),
    ("POST", "http://127.0.0.1:8000/auth/request-aadhaar-otp", {"aadhaar_number": "987654321234"}),
    ("POST", "http://127.0.0.1:8000/auth/verify-aadhaar-otp", {"aadhaar_number": "987654321234", "otp": "582910"}),
    ("POST", "http://127.0.0.1:8000/auth/send-security-email", {"email": "executor.admin@shopsense.com"}),
    ("POST", "http://127.0.0.1:8000/auth/forgot-security-key", {"email": "executor.admin@shopsense.com"}),
    ("PATCH", "http://127.0.0.1:8000/auth/vendor-status", {"vendor_id": 1, "status": "Active"}),
    ("GET", "http://127.0.0.1:8000/analytics/summary", None),
    ("GET", "http://127.0.0.1:8000/analytics/vendor-analytics", None),
    ("GET", "http://127.0.0.1:8000/analytics/sales-charts", None),
    ("GET", "http://127.0.0.1:8000/analytics/customer-segmentation", None),
    ("GET", "http://127.0.0.1:8000/analytics/customer-insights/1", None),
    ("GET", "http://127.0.0.1:8000/transactions/", None),
    ("GET", "http://127.0.0.1:8000/transactions/customer/Aarav%20Sharma", None),
    ("GET", "http://127.0.0.1:8000/transactions/customer-summary/Aarav%20Sharma", None),
    ("GET", "http://127.0.0.1:8000/transactions/tracking/TXN-984210", None),
    ("POST", "http://127.0.0.1:8000/transactions/tracking/TXN-984210/advance", {"stage": "Packed", "status": "In-Transit"}),
    ("GET", "http://127.0.0.1:8000/vendors/", None),
    ("GET", "http://127.0.0.1:8000/vendors/1", None),
    ("GET", "http://127.0.0.1:8000/vendors/1/products", None),
    ("GET", "http://127.0.0.1:8000/vendors/1/store-summary", None),
    ("GET", "http://127.0.0.1:8000/customers/", None),
    ("GET", "http://127.0.0.1:8000/products/", None),
    ("GET", "http://127.0.0.1:8000/products/1", None),
    ("GET", "http://127.0.0.1:8000/inventory/summary", None),
    ("GET", "http://127.0.0.1:8000/inventory/low-stock-alerts", None),
    ("GET", "http://127.0.0.1:8000/inventory/forecast/1", None),
    ("GET", "http://127.0.0.1:8000/inventory/tracking-logs", None),
    ("GET", "http://127.0.0.1:8000/inventory/warehouse-zones", None),
    ("POST", "http://127.0.0.1:8000/inventory/simulate-stock", {"action": "restock", "vendor_id": 1}),
    ("GET", "http://127.0.0.1:8000/products/recommendations/top-selling", None),
    ("GET", "http://127.0.0.1:8000/products/recommendations/related/1", None),
    ("GET", "http://127.0.0.1:8000/products/reviews/1", None),
    ("POST", "http://127.0.0.1:8000/products/reviews/video-review", {"product_id": 1, "query": "screen quality"}),
    ("POST", "http://127.0.0.1:8000/assistant/query", {"query": "Hello", "page_context": "admin"}),
    ("POST", "http://127.0.0.1:8000/assistant/buy-step-approval", {"step": 1, "product_id": 1}),
    ("POST", "http://127.0.0.1:8000/ai-agent/run", {"task": "analyze_store", "params": {}}),
    ("POST", "http://127.0.0.1:8000/ai-agent/optimize-cart", {"items": []}),
    ("POST", "http://127.0.0.1:8000/ai-agent/compare-products", {"product_ids": [1, 2]}),
    ("POST", "http://127.0.0.1:8000/ai-agent/voice-command", {"command": "show electronics"}),
    ("POST", "http://127.0.0.1:8000/ai-agent/vendor-copilot", {"vendor_id": 1, "prompt": "sales advice"}),
    ("POST", "http://127.0.0.1:8000/ai-agent/admin-copilot", {"prompt": "inventory status"}),
    ("GET", "http://127.0.0.1:8000/admin/governance/summary", None),
    ("GET", "http://127.0.0.1:8000/admin/vendor-pipeline", None),
    ("POST", "http://127.0.0.1:8000/admin/vendor-pipeline/apply", {
        "store_name": "Audit Test Store", "owner_name": "Audit Owner", "category": "Electronics",
        "gstin": "27AADCB2234M1Z5", "aadhaar_number": "987654321234", "email": "audit@test.com"
    }),
    ("GET", "http://127.0.0.1:8000/admin/applicants", None),
    ("GET", "http://127.0.0.1:8000/admin/tasks", None),
    ("GET", "http://127.0.0.1:8000/admin/inquiries", None),
]

p8000_ok = 0
p8000_fail = 0
for method, url, data in endpoints_8000:
    ok, code, err = test_endpoint("Port 8000", method, url, data)
    if ok:
        p8000_ok += 1
    else:
        p8000_fail += 1

print(f"\nPort 8000 Result: {p8000_ok} OK, {p8000_fail} Failed")

print("\n--- AUDITING PORT 8001 (CUSTOMER BACKEND) ---")
endpoints_8001 = [
    ("GET", "http://127.0.0.1:8001/health", None),
    ("GET", "http://127.0.0.1:8001/", None),
    ("POST", "http://127.0.0.1:8001/auth/login", {"email": "aarav@gmail.com", "password": "any"}),
    ("POST", "http://127.0.0.1:8001/auth/google", {"email": "aarav@gmail.com", "name": "Aarav Sharma", "role": "customer"}),
    ("POST", "http://127.0.0.1:8001/auth/customer-send-otp", {"phone": "+91 9876543210"}),
    ("POST", "http://127.0.0.1:8001/auth/customer-verify-otp", {"phone": "+91 9876543210", "otp": "123456"}),
    ("POST", "http://127.0.0.1:8001/auth/customer-register", {"name": "New Cust", "email": f"newcust_{__import__('time').time_ns()}@gmail.com", "phone": "+91 9999988888"}),
    ("GET", "http://127.0.0.1:8001/customers/1/addresses", None),
    ("GET", "http://127.0.0.1:8001/products/", None),
    ("GET", "http://127.0.0.1:8001/products/1", None),
    ("GET", "http://127.0.0.1:8001/products/recommendations/top-selling", None),
    ("GET", "http://127.0.0.1:8001/products/recommendations/related/1", None),
    ("GET", "http://127.0.0.1:8001/products/reviews/1", None),
    ("POST", "http://127.0.0.1:8001/products/reviews/add", {"product_id": 1, "customer_name": "Aarav", "rating": 5, "comment": "Great!"}),
    ("GET", "http://127.0.0.1:8001/transactions/", None),
    ("GET", "http://127.0.0.1:8001/transactions/customer/Aarav%20Sharma", None),
    ("GET", "http://127.0.0.1:8001/transactions/customer-summary/Aarav%20Sharma", None),
    ("GET", "http://127.0.0.1:8001/transactions/tracking/TXN-984210", None),
    ("POST", "http://127.0.0.1:8001/transactions/tracking/TXN-984210/advance", {"stage": "Packed", "status": "In-Transit"}),
    ("POST", "http://127.0.0.1:8001/assistant/query", {"query": "Find best headphones", "page_context": "customer"}),
    ("POST", "http://127.0.0.1:8001/assistant/buy-step-approval", {"step": 1, "product_id": 1}),
    ("POST", "http://127.0.0.1:8001/ai-agent/run", {"task": "find_deals", "params": {}}),
    ("POST", "http://127.0.0.1:8001/ai-agent/optimize-cart", {"items": []}),
    ("POST", "http://127.0.0.1:8001/ai-agent/compare-products", {"product_ids": [1, 2]}),
    ("POST", "http://127.0.0.1:8001/ai-agent/voice-command", {"command": "search for phones"}),
    ("POST", "http://127.0.0.1:8001/ai-agent/vendor-copilot", {"vendor_id": 1, "prompt": "sales advice"}),
    ("POST", "http://127.0.0.1:8001/ai-agent/admin-copilot", {"prompt": "inventory status"}),
    ("GET", "http://127.0.0.1:8001/admin/governance/summary", None),
    ("GET", "http://127.0.0.1:8001/admin/vendor-pipeline", None),
    ("POST", "http://127.0.0.1:8001/admin/vendor-pipeline/apply", {
        "store_name": "Cust Backend Store", "owner_name": "Cust Owner", "category": "Fashion",
        "gstin": "27AADCB2234M1Z5", "aadhaar_number": "987654321234", "email": "cust@test.com"
    }),
]

p8001_ok = 0
p8001_fail = 0
for method, url, data in endpoints_8001:
    ok, code, err = test_endpoint("Port 8001", method, url, data)
    if ok:
        p8001_ok += 1
    else:
        p8001_fail += 1

print(f"\nPort 8001 Result: {p8001_ok} OK, {p8001_fail} Failed")
print(f"\n==================================================")
print(f"TOTAL AUDITED: {p8000_ok + p8001_ok} OK, {p8000_fail + p8001_fail} Failed")
print(f"==================================================")
