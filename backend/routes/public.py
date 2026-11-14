from flask import Blueprint, jsonify
from ..models.stats import StatsSnapshot
from ..models.plan import Plan

public_bp = Blueprint("public", __name__, url_prefix="/api")

@public_bp.route("/health", methods=["GET"])
def health():
    return jsonify({"ok": True})

@public_bp.route("/stats", methods=["GET"])
def stats():
    latest = StatsSnapshot.objects.order_by("-captured_at").first()
    if not latest:
        return jsonify({
            "launching_startups": {
                "success_rate": 83,
                "failure_rate": 17,
                "launch_score": 86,
                "growth_pct": 4.52,
                "updated_at": None,
            }
        })
    return jsonify(latest.to_public())

@public_bp.route("/plans", methods=["GET"])
def plans():
    items = Plan.objects.order_by("position")
    return jsonify({"plans": [p.to_public() for p in items]})
