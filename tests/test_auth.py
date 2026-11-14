def test_register_success(client):
    res = client.post("/api/auth/register", json={
        "name": "Ravi Raj",
        "email": "ravi@example.com",
        "password": "password123",
    })
    assert res.status_code == 201
    data = res.get_json()
    assert "user" in data
    assert data["user"]["name"] == "Ravi Raj"
    assert data["user"]["email"] == "ravi@example.com"
    assert data["user"]["role"] == "founder"
    assert "password_hash" not in data["user"]

def test_register_duplicate_email(client):
    client.post("/api/auth/register", json={
        "name": "User One",
        "email": "same@example.com",
        "password": "password123",
    })
    res = client.post("/api/auth/register", json={
        "name": "User Two",
        "email": "same@example.com",
        "password": "password123",
    })
    assert res.status_code == 409
    data = res.get_json()
    assert data["error"]["code"] == "email_taken"
    assert data["error"]["field"] == "email"

def test_register_short_password(client):
    res = client.post("/api/auth/register", json={
        "name": "User Three",
        "email": "three@example.com",
        "password": "short",
    })
    assert res.status_code == 422
    data = res.get_json()
    assert data["error"]["code"] == "validation_error"
    assert data["error"]["field"] == "password"

def test_login_success(client):
    client.post("/api/auth/register", json={
        "name": "Login User",
        "email": "login@example.com",
        "password": "password123",
    })
    client.post("/api/auth/logout")

    res = client.post("/api/auth/login", json={
        "email": "login@example.com",
        "password": "password123",
    })
    assert res.status_code == 200
    data = res.get_json()
    assert data["user"]["email"] == "login@example.com"

def test_login_wrong_password(client):
    client.post("/api/auth/register", json={
        "name": "User Four",
        "email": "four@example.com",
        "password": "password123",
    })
    res = client.post("/api/auth/login", json={
        "email": "four@example.com",
        "password": "wrongpassword",
    })
    assert res.status_code == 401
    data = res.get_json()
    assert data["error"]["code"] == "invalid_credentials"

def test_me_logged_out(client):
    res = client.get("/api/auth/me")
    assert res.status_code == 200
    assert res.get_json() == {"user": None}

def test_me_logged_in_and_logout(client):
    client.post("/api/auth/register", json={
        "name": "Auth User",
        "email": "auth@example.com",
        "password": "password123",
    })
    res = client.get("/api/auth/me")
    assert res.status_code == 200
    assert res.get_json()["user"]["email"] == "auth@example.com"

    logout_res = client.post("/api/auth/logout")
    assert logout_res.status_code == 204

    res_after = client.get("/api/auth/me")
    assert res_after.status_code == 200
    assert res_after.get_json() == {"user": None}
