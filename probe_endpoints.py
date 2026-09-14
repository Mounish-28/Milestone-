import urllib.request
import json

endpoints = [
    ('8000 Admin', 'GET', 'http://127.0.0.1:8000/health', None),
    ('8000 Admin', 'GET', 'http://127.0.0.1:8000/', None),
    ('8000 Admin', 'GET', 'http://127.0.0.1:8000/admin/governance/summary', None),
    ('8000 Admin', 'GET', 'http://127.0.0.1:8000/admin/applicants', None),
    ('8000 Admin', 'GET', 'http://127.0.0.1:8000/admin/tasks', None),
    ('8000 Admin', 'GET', 'http://127.0.0.1:8000/admin/inquiries', None),
    ('8000 Admin', 'GET', 'http://127.0.0.1:8000/admin/vendor-pipeline', None),
    ('8000 Admin', 'GET', 'http://127.0.0.1:8000/products/', None),
    ('8000 Admin', 'GET', 'http://127.0.0.1:8000/vendors/', None),
    ('8000 Admin', 'GET', 'http://127.0.0.1:8000/customers/', None),
    ('8000 Admin', 'GET', 'http://127.0.0.1:8000/analytics/summary', None),
    ('8000 Admin', 'GET', 'http://127.0.0.1:8000/analytics/customer-segmentation', None),
    ('8000 Admin', 'GET', 'http://127.0.0.1:8000/analytics/segmentation', None),
    ('8000 Admin', 'GET', 'http://127.0.0.1:8000/inventory/', None),
    ('8000 Admin', 'GET', 'http://127.0.0.1:8000/transactions/', None),
    ('8000 Admin', 'GET', 'http://127.0.0.1:8000/recommendations/top-selling', None),
    ('8000 Admin', 'POST', 'http://127.0.0.1:8000/assistant/query', {'query': 'Find deals on mobile phones', 'page_context': 'admin'}),

    ('8001 Customer', 'GET', 'http://127.0.0.1:8001/health', None),
    ('8001 Customer', 'GET', 'http://127.0.0.1:8001/', None),
    ('8001 Customer', 'GET', 'http://127.0.0.1:8001/products/', None),
    ('8001 Customer', 'GET', 'http://127.0.0.1:8001/vendors/', None),
    ('8001 Customer', 'GET', 'http://127.0.0.1:8001/customers/', None),
    ('8001 Customer', 'GET', 'http://127.0.0.1:8001/analytics/summary', None),
    ('8001 Customer', 'GET', 'http://127.0.0.1:8001/analytics/customer-segmentation', None),
    ('8001 Customer', 'GET', 'http://127.0.0.1:8001/analytics/segmentation', None),
    ('8001 Customer', 'GET', 'http://127.0.0.1:8001/inventory/', None),
    ('8001 Customer', 'GET', 'http://127.0.0.1:8001/transactions/', None),
    ('8001 Customer', 'GET', 'http://127.0.0.1:8001/recommendations/top-selling', None),
    ('8001 Customer', 'POST', 'http://127.0.0.1:8001/assistant/query', {'query': 'Find deals on mobile phones', 'page_context': 'customer'}),
]

passed = 0
failed = 0
for srv, method, url, data in endpoints:
    req = urllib.request.Request(url, method=method)
    if data:
        req.add_header('Content-Type', 'application/json')
        req.data = json.dumps(data).encode('utf-8')
    try:
        res = urllib.request.urlopen(req, timeout=5)
        path = url.split('127.0.0.1:')[1]
        print(f"[OK 200] [{srv}] {method} {path}")
        passed += 1
    except Exception as e:
        print(f"[FAIL] [{srv}] {method} {url} -> {e}")
        failed += 1

print(f"\n==========================================")
print(f"Total Probe Results: {passed} PASSED, {failed} FAILED.")
print(f"==========================================")
