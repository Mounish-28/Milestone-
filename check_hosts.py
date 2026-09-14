import urllib.request
import socket

def check_port(host, port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(2)
        result = s.connect_ex((host, port))
        return result == 0

endpoints = [
    ('Admin Frontend', 'http://localhost:5173/'),
    ('Customer Frontend', 'http://localhost:5174/'),
    ('Admin Backend', 'http://localhost:8000/health'),
    ('Customer Backend', 'http://localhost:8001/health'),
]

print("=== PORT LISTENER CHECK ===")
for name, port in [('Admin Frontend', 5173), ('Customer Frontend', 5174), ('Admin Backend', 8000), ('Customer Backend', 8001)]:
    open_status = check_port('127.0.0.1', port)
    print(f"Port {port} ({name}): {'OPEN' if open_status else 'CLOSED'}")

print("\n=== HTTP ENDPOINT CHECK ===")
for name, url in endpoints:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=3) as resp:
            print(f"[OK] {name} ({url}) -> Status {resp.status}")
    except Exception as e:
        print(f"[FAIL] {name} ({url}) -> {e}")
