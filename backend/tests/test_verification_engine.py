import pytest
from backend.services.verification_engine import VerificationEngine
from backend.schemas.verify import EvidenceSource, ExternalFactCheck, MLPatternSignal

def test_insufficient_evidence_leads_to_unverified():
    # When no sources or evidence exist, MUST produce UNVERIFIED, never CONTRADICTED or FAKE
    ml_sig = MLPatternSignal(
        pattern_signal="MIXED_OR_AMBIGUOUS",
        misinformation_pattern_probability=0.5,
        confidence="LOW",
        linguistic_signals={},
        indicative_terms=[]
    )
    result = VerificationEngine.evaluate_claim(
        claim_id="c1",
        claim_text="An obscure unknown local event happened in 1842.",
        evidence_sources=[],
        fact_checks=[],
        ml_signal=ml_sig
    )
    assert result.verdict == "UNVERIFIED"
    assert result.evidence_strength == "INSUFFICIENT"
    assert "reliable evidence" in result.explanation.lower()

def test_supported_evidence_leads_to_supported():
    ml_sig = MLPatternSignal(
        pattern_signal="CREDIBLE_PATTERN",
        misinformation_pattern_probability=0.1,
        confidence="HIGH",
        linguistic_signals={},
        indicative_terms=[]
    )
    sources = [
        EvidenceSource(
            title="NASA Webb Detection",
            url="https://www.nasa.gov/article-1",
            source_name="NASA",
            source_type="Government / Official",
            snippet="NASA confirmed the discovery of carbon dioxide.",
            stance="SUPPORTS",
            relevance_score=0.95
        ),
        EvidenceSource(
            title="Nature Exoplanet Study",
            url="https://www.nature.com/article-2",
            source_name="Nature",
            source_type="Scientific / Academic",
            snippet="Peer-reviewed findings confirm the atmosphere detection.",
            stance="SUPPORTS",
            relevance_score=0.98
        )
    ]
    result = VerificationEngine.evaluate_claim(
        claim_id="c2",
        claim_text="NASA detected carbon dioxide on exoplanet.",
        evidence_sources=sources,
        fact_checks=[],
        ml_signal=ml_sig
    )
    assert result.verdict == "SUPPORTED"
    assert result.evidence_strength in ("HIGH", "MODERATE")

def test_fact_check_contradiction_leads_to_contradicted():
    ml_sig = MLPatternSignal(
        pattern_signal="MISINFORMATION_PATTERN",
        misinformation_pattern_probability=0.9,
        confidence="HIGH",
        linguistic_signals={},
        indicative_terms=["cure", "bleach"]
    )
    fc = [
        ExternalFactCheck(
            publisher="PolitiFact",
            original_claim="Drinking bleach cures diseases",
            external_rating="False / Pants on Fire",
            url="https://politifact.com/factcheck/1"
        )
    ]
    result = VerificationEngine.evaluate_claim(
        claim_id="c3",
        claim_text="Drinking bleach cures diseases.",
        evidence_sources=[],
        fact_checks=fc,
        ml_signal=ml_sig
    )
    assert result.verdict == "CONTRADICTED"
