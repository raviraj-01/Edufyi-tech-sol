from flask import Blueprint, request, jsonify
from ..models.contact import ContactMessage
from ..utils.errors import make_error
from ..utils.validate import check_name, check_email, check_topic, check_message

contact_bp = Blueprint("contact", __name__, url_prefix="/api/contact")

@contact_bp.route("", methods=["POST"])
def submit_contact():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return make_error("validation_error", "JSON body required", 422)

    # Honeypot check: bot filled the hidden website_confirm field
    honeypot = data.get("website_confirm")
    if honeypot:
        return jsonify({"ok": True}), 201

    name = check_name(data.get("name"))
    email = check_email(data.get("email"))
    topic = check_topic(data.get("topic", "general"))
    message = check_message(data.get("message"))

    ContactMessage(
        name=name,
        email=email,
        topic=topic,
        message=message,
    ).save()

    return jsonify({"ok": True}), 201
