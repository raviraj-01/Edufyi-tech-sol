from flask import Blueprint, jsonify
from ..models.stats import StatsSnapshot
from ..models.plan import Plan

public_bp = Blueprint("public", __name__, url_prefix="/api")

DEFAULT_STATS = {
    "launching_startups": {
        "success_rate": 83,
        "failure_rate": 17,
        "launch_score": 86,
        "growth_pct": 4.52,
        "updated_at": None,
    }
}

DEFAULT_PLANS = [
    {
        "id": "starter",
        "slug": "starter",
        "name": "Starter",
        "price_monthly": 0,
        "highlighted": False,
        "blurb": "For founders exploring early ideas.",
        "features": ["Idea review", "Community access", "Monthly office hours"],
        "position": 1,
    },
    {
        "id": "growth",
        "slug": "growth",
        "name": "Growth",
        "price_monthly": 49,
        "highlighted": True,
        "blurb": "For early stage startups seeking momentum.",
        "features": ["Mentor sessions", "Pitch deck review", "Investor intro list"],
        "position": 2,
    },
    {
        "id": "scale",
        "slug": "scale",
        "name": "Scale",
        "price_monthly": 199,
        "highlighted": False,
        "blurb": "For scaling ventures preparing for institutional capital.",
        "features": ["Dedicated advisor", "Funding readiness audit", "Partner perks"],
        "position": 3,
    },
]

@public_bp.route("/health", methods=["GET"])
def health():
    return jsonify({"ok": True})

@public_bp.route("/stats", methods=["GET"])
def stats():
    try:
        latest = StatsSnapshot.objects.order_by("-captured_at").first()
        if not latest:
            return jsonify(DEFAULT_STATS)
        return jsonify(latest.to_public())
    except Exception:
        return jsonify(DEFAULT_STATS)

@public_bp.route("/plans", methods=["GET"])
def plans():
    try:
        items = Plan.objects.order_by("position")
        if not items:
            return jsonify({"plans": DEFAULT_PLANS})
        return jsonify({"plans": [p.to_public() for p in items]})
    except Exception:
        return jsonify({"plans": DEFAULT_PLANS})
