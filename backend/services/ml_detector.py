import os
import sys
from backend.schemas.verify import MLPatternSignal

# Ensure root directory is in sys.path
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if root_dir not in sys.path:
    sys.path.append(root_dir)

from ml.inference import ml_detector

class MLDetectorService:
    @staticmethod
    def analyze_claim(claim_text: str) -> MLPatternSignal:
        """
        Runs ML Pattern Signal inference on the given claim.
        Produces stylistic classification without claiming to be absolute truth.
        """
        res = ml_detector.predict(claim_text)
        return MLPatternSignal(
            pattern_signal=res.get("pattern_signal", "INCONCLUSIVE"),
            misinformation_pattern_probability=res.get("misinformation_pattern_probability", 0.5),
            confidence=res.get("confidence", "LOW"),
            linguistic_signals=res.get("linguistic_signals", {}),
            indicative_terms=res.get("indicative_terms", []),
            disclaimer=res.get("disclaimer", "ML Pattern Signal reflects stylistic and vocabulary markers, not verified factual truth.")
        )
