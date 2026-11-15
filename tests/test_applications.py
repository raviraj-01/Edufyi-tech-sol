from backend.models.contact import ContactMessage

def register_and_login(client, email="founder@example.com"):
    client.post("/api/auth/register", json={
        "name": "Test Founder",
        "email": email,
        "password": "password123",
    })

def test_application_needs_login(client):
    res = client.post("/api/applications", json={
        "startup_name": "Test Co",
        "industry": "saas",
        "stage": "mvp",
        "funding_ask": 50000,
        "pitch": "A pitch that is long enough to pass validation check easily.",
    })
    assert res.status_code == 401
    assert res.get_json()["error"]["code"] == "not_logged_in"

def test_application_validation_error(client):
    register_and_login(client, "valid@example.com")
    res = client.post("/api/applications", json={
        "startup_name": "T",  # Too short
        "industry": "saas",
        "stage": "mvp",
        "funding_ask": 50000,
        "pitch": "Valid pitch string for testing purposes only here.",
    })
    assert res.status_code == 422
    assert res.get_json()["error"]["code"] == "validation_error"
    assert res.get_json()["error"]["field"] == "startup_name"

def test_application_creation_and_limit(client):
    register_and_login(client, "limit@example.com")
    payload = {
        "startup_name": "Startup Alpha",
        "website_url": "https://alpha.example",
        "industry": "fintech",
        "stage": "mvp",
        "funding_ask": 25000,
        "pitch": "We build seamless payments for small offline merchants.",
    }

    # Submit 3 applications
    for i in range(3):
        p = dict(payload, startup_name=f"Startup {i+1}")
        res = client.post("/api/applications", json=p)
        assert res.status_code == 201
        data = res.get_json()
        assert data["application"]["status"] == "submitted"
        assert len(data["application"]["history"]) == 1
        assert data["application"]["history"][0]["status"] == "submitted"

    # 4th application should be rejected with limit_reached
    p4 = dict(payload, startup_name="Startup 4")
    res4 = client.post("/api/applications", json=p4)
    assert res4.status_code == 409
    assert res4.get_json()["error"]["code"] == "limit_reached"

    # Check mine
    mine_res = client.get("/api/applications/mine")
    assert mine_res.status_code == 200
    mine_data = mine_res.get_json()
    assert len(mine_data["applications"]) == 3

def test_contact_submission(client):
    res = client.post("/api/contact", json={
        "name": "Contact Person",
        "email": "person@example.com",
        "topic": "funding",
        "message": "Hello, I would like to know more about the program.",
    })
    assert res.status_code == 201
    assert res.get_json() == {"ok": True}
    assert ContactMessage.objects(email="person@example.com").count() == 1

def test_contact_honeypot(client):
    res = client.post("/api/contact", json={
        "name": "Spam Bot",
        "email": "spambot@example.com",
        "topic": "general",
        "message": "Buy cheap stuff at spam link dot com.",
        "website_confirm": "http://spam.example",
    })
    assert res.status_code == 201
    # Honeypot filled: must not be saved to DB
    assert ContactMessage.objects(email="spambot@example.com").count() == 0

def test_admin_application_flow(client):
    from backend.models.user import User
    from werkzeug.security import generate_password_hash

    # Create admin user
    admin = User(
        name="Super Admin",
        email="superadmin@example.com",
        password_hash=generate_password_hash("password123"),
        role="admin"
    ).save()

    # Create founder and submit application
    client.post("/api/auth/register", json={
        "name": "Applicant",
        "email": "applicant@example.com",
        "password": "password123",
    })
    app_res = client.post("/api/applications", json={
        "startup_name": "Admin Test Co",
        "industry": "fintech",
        "stage": "mvp",
        "funding_ask": 75000,
        "pitch": "A great fintech startup pitch for evaluation purposes.",
    })
    app_id = app_res.get_json()["application"]["id"]

    # Founder cannot access admin route
    forbidden_res = client.get("/api/admin/applications")
    assert forbidden_res.status_code == 403

    # Login as admin
    client.post("/api/auth/login", json={
        "email": "superadmin@example.com",
        "password": "password123",
    })

    # Admin list
    list_res = client.get("/api/admin/applications")
    assert list_res.status_code == 200
    assert len(list_res.get_json()["applications"]) >= 1

    # Admin patch status
    patch_res = client.patch(f"/api/admin/applications/{app_id}", json={
        "status": "shortlisted",
        "note": "Great traction, schedule founder call.",
    })
    assert patch_res.status_code == 200
    updated = patch_res.get_json()["application"]
    assert updated["status"] == "shortlisted"
    assert len(updated["history"]) == 2
    assert updated["history"][1]["status"] == "shortlisted"

def test_write_route_database_unavailable_503(client):
    from unittest.mock import patch
    import pymongo.errors

    register_and_login(client, "dbdown@example.com")
    with patch("backend.models.application.Application.save") as mock_save:
        mock_save.side_effect = pymongo.errors.ServerSelectionTimeoutError("Database connection lost")
        res = client.post("/api/applications", json={
            "startup_name": "Resilient Co",
            "industry": "saas",
            "stage": "mvp",
            "funding_ask": 50000,
            "pitch": "A pitch that easily meets the length requirements for validation.",
        })
        assert res.status_code == 503
        data = res.get_json()
        assert data["error"]["code"] == "database_unavailable"
        assert "Database connection failed" in data["error"]["message"]
