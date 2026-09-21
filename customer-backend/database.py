import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Connect to shared shopsense.db in project root or PostgreSQL via DATABASE_URL
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "shopsense.db")
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DB_PATH}")

# Fix postgres:// scheme used by some cloud providers (e.g. Render, Heroku)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {"check_same_thread": False, "timeout": 30} if "sqlite" in DATABASE_URL else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True
)
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)
Base = declarative_base()

def ensure_users_security_columns():
    """Idempotently ensures security key rotation columns exist on SQLite database."""
    try:
        from sqlalchemy import text
        with engine.begin() as conn:
            if "sqlite" in DATABASE_URL:
                res = conn.execute(text("PRAGMA table_info(users)"))
                cols = [row[1] for row in res.fetchall()]
                if cols:
                    if "security_key_updated_at" not in cols:
                        conn.execute(text("ALTER TABLE users ADD COLUMN security_key_updated_at DATETIME"))
                    if "security_key_expires_at" not in cols:
                        conn.execute(text("ALTER TABLE users ADD COLUMN security_key_expires_at DATETIME"))
    except Exception:
        pass

ensure_users_security_columns()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()