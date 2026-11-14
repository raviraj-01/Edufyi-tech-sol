from functools import wraps
from flask import session, g
from .errors import make_error
from ..models.user import User

def get_current_user():
    user_id = session.get("user_id")
    if not user_id:
        return None
    try:
        return User.objects(id=user_id).first()
    except Exception:
        return None

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user = get_current_user()
        if not user:
            return make_error("not_logged_in", "Authentication required", 401)
        g.user = user
        return f(*args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user = get_current_user()
        if not user:
            return make_error("not_logged_in", "Authentication required", 401)
        if user.role != "admin":
            return make_error("forbidden", "Admin access required", 403)
        g.user = user
        return f(*args, **kwargs)
    return decorated
