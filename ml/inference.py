import os
import joblib
import numpy as np

import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from ml.preprocess import preprocess_text, extract_linguistic_signals

class MLPatternDetector:
    _instance = None
    
    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(MLPatternDetector, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if getattr(self, "_initialized", False):
            return
        base_dir = os.path.dirname(__file__)
        self.vec_path = os.path.join(base_dir, "models", "tfidf_vectorizer.joblib")
        self.model_path = os.path.join(base_dir, "models", "logistic_regression_model.joblib")
        self.vectorizer = None
        self.model = None
        self.load_models()
        self._initialized = True

    def load_models(self):
        if os.path.exists(self.vec_path) and os.path.exists(self.model_path):
            try:
                self.vectorizer = joblib.load(self.vec_path)
                self.model = joblib.load(self.model_path)
            except Exception as e:
                print(f"Error loading ML models: {e}")
                self.vectorizer = None
                self.model = None

    def predict(self, text: str) -> dict:
        """
        Runs ML inference on the claim or headline.
        Produces an ML Pattern Signal indicating whether linguistic style
        resembles typical misinformation/hyperbole or credible reporting.
        """
        if not text or not text.strip():
            return {
                "pattern_signal": "INCONCLUSIVE",
                "misinformation_pattern_probability": 0.5,
                "confidence": "LOW",
                "linguistic_signals": extract_linguistic_signals(""),
                "indicative_terms": [],
                "disclaimer": "ML Pattern Signal reflects stylistic and vocabulary markers, not verified factual truth."
            }
            
        if self.vectorizer is None or self.model is None:
            self.load_models()
            
        linguistic = extract_linguistic_signals(text)
        cleaned = preprocess_text(text)
        
        if self.vectorizer is None or self.model is None:
            # Rule-based heuristic fallback if model file isn't loaded
            is_sensational = (linguistic["sensational_term_count"] > 0) or (linguistic["exclamations"] > 1) or (linguistic["caps_ratio"] > 0.25)
            prob = 0.75 if is_sensational else 0.25
            label = "MISINFORMATION_PATTERN" if is_sensational else "CREDIBLE_PATTERN"
            return {
                "pattern_signal": label,
                "misinformation_pattern_probability": prob,
                "confidence": "MODERATE",
                "linguistic_signals": linguistic,
                "indicative_terms": [w for w in ["shocking", "miracle", "secret", "cure", "hoax", "banned"] if w in text.lower()],
                "disclaimer": "ML Pattern Signal reflects stylistic and vocabulary markers, not verified factual truth."
            }

        X = self.vectorizer.transform([cleaned])
        probs = self.model.predict_proba(X)[0]
        # Class 1 is misinformation pattern, Class 0 is credible reporting
        misinfo_prob = float(probs[1])
        
        # Calculate indicative terms
        feature_names = self.vectorizer.get_feature_names_out()
        feature_indices = X.nonzero()[1]
        coefficients = self.model.coef_[0]
        
        # Terms contributing most to either side
        word_scores = []
        for idx in feature_indices:
            term = feature_names[idx]
            weight = coefficients[idx]
            word_scores.append((term, weight))
            
        word_scores.sort(key=lambda x: abs(x[1]), reverse=True)
        top_terms = [term for term, weight in word_scores[:5]]

        if misinfo_prob >= 0.60:
            signal = "MISINFORMATION_PATTERN"
            confidence = "HIGH" if misinfo_prob >= 0.80 else "MODERATE"
        elif misinfo_prob <= 0.40:
            signal = "CREDIBLE_PATTERN"
            confidence = "HIGH" if misinfo_prob <= 0.20 else "MODERATE"
        else:
            signal = "MIXED_OR_AMBIGUOUS"
            confidence = "LOW"
            
        return {
            "pattern_signal": signal,
            "misinformation_pattern_probability": round(misinfo_prob, 4),
            "confidence": confidence,
            "linguistic_signals": linguistic,
            "indicative_terms": top_terms,
            "disclaimer": "ML Pattern Signal reflects stylistic and vocabulary markers, not verified factual truth."
        }

ml_detector = MLPatternDetector()
