import asyncio
import uuid
from httpx import AsyncClient, ASGITransport
from backend.main import app

def test_auth_registration_and_login():
    async def _run():
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            unique_id = str(uuid.uuid4())[:8]
            reg_payload = {
                "username": f"user_{unique_id}",
                "email": f"test_{unique_id}@truthlens.io",
                "password": "SecurePassword123!"
            }
            reg_resp = await client.post("/api/auth/register", json=reg_payload)
            assert reg_resp.status_code == 200
            reg_data = reg_resp.json()
            assert "access_token" in reg_data
            token = reg_data["access_token"]

            # Test login
            login_resp = await client.post("/api/auth/login", json={
                "email_or_username": reg_payload["email"],
                "password": reg_payload["password"]
            })
            assert login_resp.status_code == 200
            assert "access_token" in login_resp.json()

            # Test profile /me
            me_resp = await client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
            assert me_resp.status_code == 200
            assert me_resp.json()["email"] == reg_payload["email"]
    asyncio.run(_run())

def test_demo_endpoint():
    async def _run():
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.get("/api/verify/demo/supported")
            assert resp.status_code == 200
            data = resp.json()
            assert data["overall_verdict"] == "SUPPORTED"
            assert data["is_demo"] is True
            assert len(data["claims"]) > 0

            # Contradicted demo
            resp_c = await client.get("/api/verify/demo/contradicted")
            assert resp_c.status_code == 200
            assert resp_c.json()["overall_verdict"] == "CONTRADICTED"
    asyncio.run(_run())
