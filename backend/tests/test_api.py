import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "MPLAD-GUARD" in data["service"]

def test_auth_login():
    response = client.post("/api/auth/login", json={
        "email": "investigator@mpladguard.gov.in",
        "password": "admin123"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "investigator@mpladguard.gov.in"
    assert "token" in data

def test_dashboard_stats():
    response = client.get("/api/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["total_projects"] >= 50
    assert data["high_priority_count"] > 0
    assert len(data["top_priority_projects"]) > 0

def test_project_list_and_filters():
    response = client.get("/api/projects?min_priority=70")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    for p in data:
        assert p["priority_score"] >= 70.0

def test_golden_case_details():
    response = client.get("/api/projects/MPLAD-NAL-2023-042")
    assert response.status_code == 200
    data = response.json()
    assert data["project_id"] == "MPLAD-NAL-2023-042"
    assert data["risk"]["priority_score"] >= 75.0
    assert data["risk"]["financial_risk"] > 50.0
    assert data["risk"]["timeline_risk"] > 50.0
    assert len(data["evidence_items"]) >= 4

def test_golden_case_peers():
    response = client.get("/api/projects/MPLAD-NAL-2023-042/peers")
    assert response.status_code == 200
    data = response.json()
    assert data["peer_count"] > 1
    assert len(data["peers"]) > 1

def test_agency_list_and_detail():
    response = client.get("/api/agencies")
    assert response.status_code == 200
    agencies = response.json()
    assert len(agencies) >= 5
    
    first_id = agencies[0]["agency_id"]
    detail_res = client.get(f"/api/agencies/{first_id}")
    assert detail_res.status_code == 200
    assert "work_type_distribution" in detail_res.json()

def test_map_markers():
    response = client.get("/api/map/markers")
    assert response.status_code == 200
    markers = response.json()
    assert len(markers) >= 50

def test_investigation_graph():
    response = client.get("/api/graph/project/MPLAD-NAL-2023-042")
    assert response.status_code == 200
    graph = response.json()
    assert len(graph["nodes"]) >= 3
    assert len(graph["edges"]) >= 2

def test_ai_assistant_grounding():
    response = client.post("/api/assistant/ask", json={
        "project_id": "MPLAD-NAL-2023-042",
        "question": "Why was this project prioritized?"
    })
    assert response.status_code == 200
    res = response.json()
    assert "Priority Analysis" in res["answer"]
    assert len(res["evidence_citations"]) >= 4

def test_investigation_update():
    response = client.patch("/api/projects/MPLAD-NAL-2023-042/investigation", json={
        "status": "UNDER REVIEW",
        "notes": "Verified initial spatial clustering. Field inspection planned."
    })
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "UNDER REVIEW"
    assert "spatial clustering" in data["notes"]
