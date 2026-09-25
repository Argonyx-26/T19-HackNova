"""Tests for External Context Ingestion & Normalization Routes."""

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_get_earthquakes():
    response = client.get("/api/context/earthquakes")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    first = data[0]
    assert "magnitude" in first
    assert "place" in first
    assert "coordinates" in first
    assert first["source"] == "USGS"

def test_get_flights_and_maritime():
    resp_flights = client.get("/api/context/flights")
    assert resp_flights.status_code == 200
    assert len(resp_flights.json()) > 0

    resp_maritime = client.get("/api/context/maritime")
    assert resp_maritime.status_code == 200
    assert len(resp_maritime.json()) > 0

def test_get_layer_definitions():
    resp = client.get("/api/context/layers")
    assert resp.status_code == 200
    layers = resp.json()
    assert "intel_layers" in layers
    assert "context_layers" in layers
