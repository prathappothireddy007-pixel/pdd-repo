import os
os.environ['USE_MOCK_DB'] = 'True'

from fastapi.testclient import TestClient
import pytest
from main import app, seed_data

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_register_user(client):
    response = client.post("/api/auth/register", json={
        "username": "testuser1",
        "email": "test@test.com",
        "password": "password123"
    })
    assert response.status_code == 200
    assert response.json()["username"] == "testuser1"

def test_get_auctions(client):
    response = client.get("/api/auctions")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_login_user(client):
    response = client.post("/api/auth/login", json={
        "username": "admin",
        "password": "admin123"
    })
    assert response.status_code == 200
    assert response.json()["username"] == "admin"

