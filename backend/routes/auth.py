from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from ..models import now
from ..models.user import User
from ..utils.errors import make_error
from ..utils.validate import check_name, check_email, check_password
from ..utils.auth import get_current_user

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return make_error("validation_error", "JSON body required", 422)

    name = check_name(data.get("name"))
    email = check_email(data.get("email"))
    password = check_password(data.get("password"))

    existing = User.objects(email=email).first()
    if existing:
        return make_error("email_taken", "Email is already registered", 409, field="email")

    user = User(
        name=name,
        email=email,
        password_hash=generate_password_hash(password),
        role="founder",
        last_login_at=now(),
    ).save()

    session["user_id"] = str(user.id)
    return jsonify({"user": user.to_public()}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return make_error("validation_error", "JSON body required", 422)

    email = check_email(data.get("email"))
    password = data.get("password")
    if not password or not isinstance(password, str):
        return make_error("invalid_credentials", "Invalid email or password", 401)

    user = User.objects(email=email).first()
    # Same error for wrong email or wrong password to prevent user enumeration
    if not user or not check_password_hash(user.password_hash, password):
        return make_error("invalid_credentials", "Invalid email or password", 401)

    user.last_login_at = now()
    user.save()

    session["user_id"] = str(user.id)
    return jsonify({"user": user.to_public()}), 200

@auth_bp.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return "", 204

@auth_bp.route("/me", methods=["GET"])
def me():
    user = get_current_user()
    if not user:
        return jsonify({"user": None}), 200
    return jsonify({"user": user.to_public()}), 200
