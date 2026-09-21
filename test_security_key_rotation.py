import sys
from datetime import datetime, timedelta

# Ensure UTF-8 output on Windows
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from app.database import SessionLocal
from app.models import User
from app.routers.auth import (
    generate_dynamic_security_key,
    get_or_rotate_security_key,
    compute_key_hours_remaining
)
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_rotation():
    db = SessionLocal()
    try:
        print("=" * 60)
        print("[TEST] 24-HOUR SECURITY KEY ROTATION SUITE")
        print("=" * 60)

        # 1. Test unit rotation helper
        now = datetime.utcnow()
        test_email = "sec_test_admin@shopsense.com"
        user = db.query(User).filter(User.email == test_email).first()
        if not user:
            user = User(
                display_name="Security Test Admin",
                username="sec_admin",
                gender="Male",
                aadhaar_number="999988887777",
                email=test_email,
                phone="+91 9999888877",
                role="admin",
                security_key="SEC-KEY-ORIG",
                security_key_updated_at=now,
                security_key_expires_at=now + timedelta(hours=24),
                is_aadhaar_verified=True,
                is_online=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        # Case A: Key is fresh (created 2 hours ago)
        user.security_key = "SEC-KEY-FRESH"
        user.security_key_updated_at = now - timedelta(hours=2)
        user.security_key_expires_at = user.security_key_updated_at + timedelta(hours=24)
        db.commit()
        db.refresh(user)

        user, rotated = get_or_rotate_security_key(user, db, force_rotate=False)
        assert not rotated, "Fresh key (<24h) should NOT be rotated"
        assert user.security_key == "SEC-KEY-FRESH", "Fresh key content should be preserved"
        rem_hours = compute_key_hours_remaining(user)
        assert 21.0 <= rem_hours <= 22.1, f"Remaining hours should be ~22, got {rem_hours}"
        print("[PASS] Case A: Fresh key (< 24h old) is preserved without premature rotation.")

        # Case B: Key has expired (created 25 hours ago)
        user.security_key = "SEC-KEY-EXPIRED"
        user.security_key_updated_at = now - timedelta(hours=25)
        user.security_key_expires_at = now - timedelta(hours=1)
        db.commit()
        db.refresh(user)

        user, rotated = get_or_rotate_security_key(user, db, force_rotate=False)
        assert rotated, "Expired key (>24h) MUST be rotated"
        assert user.security_key.startswith("SEC-KEY-"), f"New key should start with SEC-KEY-, got {user.security_key}"
        assert user.security_key != "SEC-KEY-EXPIRED", "Expired key must be replaced"
        assert user.security_key_expires_at > datetime.utcnow(), "New key expiration must be in the future"
        print(f"[PASS] Case B: Stale key (> 24h old) auto-rotated to fresh dynamic key {user.security_key}.")

        # Case C: Force rotation (e.g. forgot security key)
        prior_key = user.security_key
        user, rotated = get_or_rotate_security_key(user, db, force_rotate=True)
        assert rotated, "force_rotate=True must rotate key"
        assert user.security_key != prior_key, "Forced rotation must generate a new key"
        print(f"[PASS] Case C: Forced rotation successfully issued new key: {user.security_key}.")

        # 2. Test Endpoints via TestClient
        # Endpoint: GET /auth/security-key-status
        res = client.get(f"/auth/security-key-status?email={test_email}")
        assert res.status_code == 200, f"Status endpoint failed: {res.text}"
        data = res.json()
        assert data["email"] == test_email
        assert "hours_remaining" in data
        assert data["hours_remaining"] > 23.0
        print(f"[PASS] Case D: GET /auth/security-key-status returned valid metadata: {data['security_key']}, {data['hours_remaining']}h remaining.")

        # Endpoint: POST /auth/forgot-security-key
        res = client.post("/auth/forgot-security-key", json={"email": test_email})
        assert res.status_code == 200, f"Forgot endpoint failed: {res.text}"
        data = res.json()
        assert "security_key" in data
        assert data["security_key"].startswith("SEC-KEY-")
        print(f"[PASS] Case E: POST /auth/forgot-security-key rotated and returned {data['security_key']}.")

        # Endpoint: POST /auth/rotate-expired-keys
        # Expire the test user again
        user.security_key_updated_at = now - timedelta(hours=30)
        user.security_key_expires_at = now - timedelta(hours=6)
        db.commit()

        res = client.post("/auth/rotate-expired-keys")
        assert res.status_code == 200, f"Rotate expired keys failed: {res.text}"
        data = res.json()
        assert data["keys_rotated"] >= 1
        print(f"[PASS] Case F: POST /auth/rotate-expired-keys checked {data['accounts_checked']} accounts and rotated {data['keys_rotated']} keys.")

        # Cleanup test user
        db.delete(user)
        db.commit()

        print("=" * 60)
        print("[SUCCESS] ALL 24-HOUR ROTATION TESTS PASSED WITH 100% SUCCESS!")
        print("=" * 60)

    finally:
        db.close()

if __name__ == "__main__":
    test_rotation()
