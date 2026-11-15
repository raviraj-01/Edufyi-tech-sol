from backend.models.stats import StatsSnapshot
from backend.models.plan import Plan
from backend.seed import seed_stats, seed_plans

def test_health(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.get_json() == {"ok": True}

def test_stats_fallback(client):
    StatsSnapshot.objects.delete()
    res = client.get("/api/stats")
    assert res.status_code == 200
    data = res.get_json()
    assert "launching_startups" in data
    assert data["launching_startups"]["success_rate"] == 83
    assert data["launching_startups"]["failure_rate"] == 17

def test_stats_seeded(client):
    seed_stats()
    res = client.get("/api/stats")
    assert res.status_code == 200
    data = res.get_json()
    assert data["launching_startups"]["launch_score"] == 86
    assert data["launching_startups"]["growth_pct"] == 4.52

def test_plans(client):
    seed_plans()
    res = client.get("/api/plans")
    assert res.status_code == 200
    data = res.get_json()
    assert "plans" in data
    assert len(data["plans"]) == 3
    assert data["plans"][0]["slug"] == "starter"
    assert data["plans"][1]["slug"] == "growth"
    assert data["plans"][2]["slug"] == "scale"

def test_public_routes_db_down_fallback(client):
    from unittest.mock import patch
    import pymongo.errors

    with patch("backend.routes.public.StatsSnapshot.objects") as mock_stats:
        mock_stats.order_by.side_effect = pymongo.errors.ServerSelectionTimeoutError("Atlas down")
        res = client.get("/api/stats")
        assert res.status_code == 200
        data = res.get_json()
        assert data["launching_startups"]["success_rate"] == 83
        assert data["launching_startups"]["launch_score"] == 86
        assert data["launching_startups"]["growth_pct"] == 4.52

    with patch("backend.routes.public.Plan.objects") as mock_plans:
        mock_plans.order_by.side_effect = pymongo.errors.ServerSelectionTimeoutError("Atlas down")
        res = client.get("/api/plans")
        assert res.status_code == 200
        data = res.get_json()
        assert len(data["plans"]) == 3
        assert data["plans"][0]["slug"] == "starter"
        assert data["plans"][1]["slug"] == "growth"
        assert data["plans"][2]["slug"] == "scale"
