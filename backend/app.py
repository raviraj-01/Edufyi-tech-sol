from pathlib import Path
from flask import Flask, jsonify, send_from_directory
import mongoengine
from .config import Config

def create_app(config_class=Config, test_config=None):
    frontend_dir = Path(__file__).resolve().parent.parent / "frontend"
    app = Flask(__name__, static_folder=str(frontend_dir), static_url_path="")
    app.config.from_object(config_class)
    if test_config:
        app.config.update(test_config)

    if not app.config.get("TESTING") and app.config.get("MONGODB_URI"):
        try:
            mongo_uri = app.config["MONGODB_URI"]
            if "mongodb+srv://" in mongo_uri and "/" not in mongo_uri.split("@")[-1]:
                mongoengine.connect(host=mongo_uri, db="upfound")
            else:
                mongoengine.connect(host=mongo_uri)
        except Exception:
            pass

    @app.after_request
    def set_security_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response

    # Rate limiting
    from .limiter import limiter
    limiter.init_app(app)
    if app.config.get("TESTING"):
        limiter.enabled = False

    # Error handlers
    from .utils.errors import register_error_handlers
    register_error_handlers(app)

    # Routes
    from .routes.public import public_bp
    from .routes.auth import auth_bp
    from .routes.applications import applications_bp
    from .routes.contact import contact_bp
    from .routes.admin import admin_bp
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
