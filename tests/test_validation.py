import pytest
from backend.utils.errors import AppError, ValidationError, make_error
from backend.utils.validate import (
    check_name, check_email, check_password, check_startup_name,
    check_website_url, check_funding_ask, check_pitch
)

def test_check_name():
    assert check_name("  Alice  ") == "Alice"
    with pytest.raises(ValidationError) as exc:
        check_name("A")
    assert exc.value.field == "name"

def test_check_email():
    assert check_email("User@Domain.Com ") == "user@domain.com"
    with pytest.raises(ValidationError) as exc:
        check_email("notanemail")
    assert exc.value.field == "email"

def test_check_password():
    assert check_password("password123") == "password123"
    with pytest.raises(ValidationError) as exc:
        check_password("short")
    assert exc.value.field == "password"

def test_check_funding_ask():
    assert check_funding_ask(50000) == 50000
    with pytest.raises(ValidationError) as exc:
        check_funding_ask(500)
    assert exc.value.field == "funding_ask"

def test_404_handler(app):
    client = app.test_client()
    res = client.get("/api/nonexistent")
    assert res.status_code == 404
    data = res.get_json()
    assert data["error"]["code"] == "not_found"
