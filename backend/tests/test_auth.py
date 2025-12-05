from fastapi.testclient import TestClient
from backend.main import app
from backend.database import SessionLocal
from backend import models
from backend.seed_data import ensure_default_admin

client = TestClient(app)


def setup_module(module):
    db = SessionLocal()
    db.query(models.User).delete()
    db.commit()
    ensure_default_admin(db)
    db.close()


def test_register_and_login():
    response = client.post(
        "/auth/register",
        json={"name": "Test User", "email": "test@example.com", "password": "secret", "role": "ADMIN"},
    )
    assert response.status_code == 403
    login_resp = client.post(
        "/auth/login",
        data={"username": "admin@gmail.com", "password": "admin123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert login_resp.status_code == 200
    data = login_resp.json()
    assert data.get("role") == "ADMIN"
    assert "access_token" in data
