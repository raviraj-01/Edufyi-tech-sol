import sys
from pathlib import Path
from flask import Flask, jsonify, send_from_directory
import mongoengine

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.config import Config

def create_app(config_class=Config, test_config=None):
    frontend_dir = Path(__file__).resolve().parent.parent / "frontend"
    app = Flask(__name__, static_folder=str(frontend_dir), static_url_path="")
    app.config.from_object(config_class)
    if test_config:
        app.config.update(test_config)

    if not app.config.get("TESTING") and app.config.get("MONGODB_URI"):
        try:
            mongo_uri = app.config["MONGODB_URI"]
            connect_kwargs = {"host": mongo_uri, "serverSelectionTimeoutMS": 5000}
            if "mongodb+srv://" in mongo_uri and "/" not in mongo_uri.split("@")[-1]:
                connect_kwargs["db"] = "upfound"
            mongoengine.connect(**connect_kwargs)
        except Exception:
            pass

    @app.before_request
    def check_content_type():
        from flask import request
        if request.method in ("POST", "PATCH") and request.path.startswith("/api/"):
            if request.path == "/api/auth/logout":
                return
            if request.content_length and not request.is_json:
                from backend.utils.errors import make_error
                return make_error("validation_error", "Content-Type must be application/json", 415)

    @app.after_request
    def set_security_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com data:; "
            "img-src 'self' data: https:; "
            "media-src 'self'; "
            "connect-src 'self';"
        )
        return response

    # Error handlers
    from backend.utils.errors import register_error_handlers
    register_error_handlers(app)

    # Routes
    from backend.routes.public import public_bp
    from backend.routes.auth import auth_bp
    from backend.routes.applications import applications_bp
    from backend.routes.contact import contact_bp
    from backend.routes.admin import admin_bp
    app.register_blueprint(public_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(applications_bp)
    app.register_blueprint(contact_bp)
    app.register_blueprint(admin_bp)

    @app.route("/")
    def index():
        return send_from_directory(app.static_folder, "index.html")

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
