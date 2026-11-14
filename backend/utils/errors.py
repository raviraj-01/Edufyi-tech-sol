from flask import jsonify

class AppError(Exception):
    def __init__(self, code, message, status_code=400, field=None):
        super().__init__(message)
        self.code = code
        self.message = message
        self.status_code = status_code
        self.field = field

class ValidationError(AppError):
    def __init__(self, message, field=None):
        super().__init__(code="validation_error", message=message, status_code=422, field=field)

def make_error(code, message, status_code=400, field=None):
    payload = {"code": code, "message": message}
    if field is not None:
        payload["field"] = field
    return jsonify({"error": payload}), status_code

def register_error_handlers(app):
    @app.errorhandler(AppError)
    def handle_app_error(err):
        return make_error(err.code, err.message, err.status_code, err.field)

    @app.errorhandler(404)
    def handle_404(err):
        return make_error("not_found", "Resource not found", 404)

    @app.errorhandler(429)
    def handle_429(err):
        return make_error("rate_limited", "Too many requests, try again later", 429)

    @app.errorhandler(500)
    def handle_500(err):
        return make_error("server_error", "Internal server error", 500)
