import asyncio
from backend.services.claim_extractor import ClaimExtractor

def test_compound_claim_extraction():
    async def _run():
        sentence = "Scientists say drinking coffee prevents cancer and increases lifespan."
        claims = await ClaimExtractor.extract_claims(sentence)
        assert len(claims) == 2
        assert "Drinking coffee prevents cancer." in claims
        assert "Drinking coffee increases lifespan." in claims
    asyncio.run(_run())

def test_attribution_stripping():
    async def _run():
        sentence = "According to reports, NASA discovered water on Mars."
        claims = await ClaimExtractor.extract_claims(sentence)
        assert len(claims) >= 1
        assert "NASA discovered water on Mars." in claims[0]
    asyncio.run(_run())
