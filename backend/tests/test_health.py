import asyncio
from httpx import AsyncClient, ASGITransport
from backend.main import app

def test_health_endpoint():
    async def _run():
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.get("/api/health")
            assert resp.status_code == 200
            data = resp.json()
            assert data["status"] == "healthy"
            assert data["app_name"] == "TruthLens"
            assert "database" in data
            assert "ml_model" in data
    asyncio.run(_run())
