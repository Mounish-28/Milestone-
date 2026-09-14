import urllib.request
import json
import sys

checks = [
    ('Admin FE HTML', 'http://localhost:5173/'),
    ('Admin FE JS', 'http://localhost:5173/src/main.jsx'),
    ('Customer FE HTML', 'http://localhost:5174/'),
    ('Customer FE JS', 'http://localhost:5174/src/main.jsx'),
    ('Admin BE Health', 'http://localhost:8000/health'),
    ('Admin BE Products', 'http://localhost:8000/products/'),
    ('Admin BE Vendors', 'http://localhost:8000/vendors/'),
    ('Customer BE Health', 'http://localhost:8001/health'),
    ('Customer BE Products', 'http://localhost:8001/products/'),
    ('Customer BE Vendors', 'http://localhost:8001/vendors/'),
    ('Customer Proxy Products', 'http://localhost:5174/api/products/'),
    ('Admin Proxy Products', 'http://localhost:5173/api/products/'),
]

all_passed = True
for name, url in checks:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = resp.read()
            if b'Internal Server Error' in data or resp.status != 200:
                print(f'[FAIL] {name} ({url}) -> Status {resp.status}', flush=True)
                all_passed = False
            else:
                print(f'[SUCCESS] {name} -> 200 OK ({len(data)} bytes)', flush=True)
    except Exception as e:
        print(f'[ERROR] {name} ({url}) -> {e}', flush=True)
        all_passed = False

if all_passed:
    print('\nALL 12 CRITICAL CHECKS PASSED!')
    sys.exit(0)
else:
    print('\nSOME CHECKS FAILED!')
    sys.exit(1)
