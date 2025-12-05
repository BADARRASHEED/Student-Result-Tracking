from fastapi.testclient import TestClient
from backend.main import app
from backend.database import SessionLocal
from backend import models
from backend.auth import get_password_hash

client = TestClient(app)


def setup_module(module):
    db = SessionLocal()
    db.query(models.User).delete()
    db.commit()
    db.close()


def test_register_and_login():
    response = client.post(
        "/auth/register",
        json={"name": "Test User", "email": "test@example.com", "password": "secret", "role": "ADMIN"},
    )
    assert response.status_code == 200
    login_resp = client.post(
        "/auth/login", data={"username": "test@example.com", "password": "secret"}, headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert login_resp.status_code == 200
    data = login_resp.json()
    assert "access_token" in data
