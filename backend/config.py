import os
from pathlib import Path
from dotenv import load_dotenv

_root = Path(__file__).resolve().parent.parent
load_dotenv(_root / ".env")
load_dotenv(_root / "backend" / "atlas-credentials.env")
load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-prod")
    MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/upfound")
    FLASK_ENV = os.getenv("FLASK_ENV", "development")
    ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@upfound.test")
    ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "AdminUpfound2026!")

    if FLASK_ENV == "production" and (not SECRET_KEY or SECRET_KEY == "dev-secret-key-change-in-prod"):
        raise RuntimeError("SECRET_KEY must be set in production and cannot use default value")

    # Session cookie settings
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    SESSION_COOKIE_SECURE = os.getenv("FLASK_ENV") == "production"
    PERMANENT_SESSION_LIFETIME = 7 * 24 * 3600
