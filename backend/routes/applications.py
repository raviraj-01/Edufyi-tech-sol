from flask import Blueprint, request, jsonify, g
from ..models.application import Application, StatusChange
from ..utils.auth import login_required
from ..utils.errors import make_error
from ..utils.validate import (
    check_startup_name, check_website_url, check_industry,
    check_stage, check_funding_ask, check_pitch
)

applications_bp = Blueprint("applications", __name__, url_prefix="/api/applications")

@applications_bp.route("", methods=["POST"])
@login_required
def create_application():
    user = g.user
    if Application.objects(user=user).count() >= 3:
        return make_error("limit_reached", "You can submit at most 3 applications", 409)

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return make_error("validation_error", "JSON body required", 422)

    startup_name = check_startup_name(data.get("startup_name"))
    website_url = check_website_url(data.get("website_url"))
    industry = check_industry(data.get("industry"))
    stage = check_stage(data.get("stage"))
    funding_ask = check_funding_ask(data.get("funding_ask"))
    pitch = check_pitch(data.get("pitch"))

    app_doc = Application(
        user=user,
        startup_name=startup_name,
        website_url=website_url,
        industry=industry,
        stage=stage,
        funding_ask=funding_ask,
        pitch=pitch,
        status="submitted",
        history=[StatusChange(status="submitted", note="Application submitted by founder")],
    ).save()

    return jsonify({"application": app_doc.to_dict()}), 201

@applications_bp.route("/mine", methods=["GET"])
@login_required
def my_applications():
    user = g.user
    apps = Application.objects(user=user).order_by("-created_at")
    return jsonify({"applications": [a.to_dict() for a in apps]}), 200
