import pytest
from backend.services.ml_detector import MLDetectorService

def test_ml_inference_detection():
    # Misinformation pattern
    misinfo = MLDetectorService.analyze_claim("SHOCKING SECRET: Miracle lemon juice completely cures 100% of cancer!")
    assert misinfo.pattern_signal in ("MISINFORMATION_PATTERN", "MIXED_OR_AMBIGUOUS")
    assert misinfo.misinformation_pattern_probability >= 0.5
    assert len(misinfo.indicative_terms) > 0
    assert "ML Pattern Signal" in misinfo.disclaimer

    # Credible style pattern
    credible = MLDetectorService.analyze_claim("The Federal Reserve announced a quarter point interest rate adjustment.")
    assert credible.pattern_signal in ("CREDIBLE_PATTERN", "MIXED_OR_AMBIGUOUS")
    assert credible.misinformation_pattern_probability <= 0.6
