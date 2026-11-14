from flask import Blueprint, request, jsonify
from bson import ObjectId
from ..models import now
from ..models.application import Application, StatusChange
from ..utils.auth import admin_required
from ..utils.errors import make_error
from ..utils.validate import check_status

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

@admin_bp.route("/applications", methods=["GET"])
@admin_required
def list_all_applications():
    status_filter = request.args.get("status")
    query = {}
    if status_filter:
        query["status"] = status_filter

    apps = Application.objects(**query).order_by("-created_at")
    return jsonify({"applications": [a.to_dict() for a in apps]}), 200

@admin_bp.route("/applications/<app_id>", methods=["PATCH"])
@admin_required
def update_application_status(app_id):
    if not ObjectId.is_valid(app_id):
        return make_error("validation_error", "Invalid application ID", 422)

    app_doc = Application.objects(id=app_id).first()
    if not app_doc:
        return make_error("not_found", "Application not found", 404)

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return make_error("validation_error", "JSON body required", 422)

    new_status = check_status(data.get("status"))
    note = data.get("note", "").strip()
    if len(note) > 300:
        return make_error("validation_error", "Note cannot exceed 300 characters", 422, field="note")

    app_doc.status = new_status
    app_doc.history.append(StatusChange(
        status=new_status,
        note=note if note else f"Status updated to {new_status} by admin",
        at=now(),
    ))
    app_doc.updated_at = now()
    app_doc.save()

    return jsonify({"application": app_doc.to_dict()}), 200
