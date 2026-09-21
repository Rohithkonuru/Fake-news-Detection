import re
import string

def preprocess_text(text: str) -> str:
    """
    Cleans and standardizes input text for TF-IDF feature extraction.
    Retains linguistic patterns indicative of credibility or sensationalism.
    """
    if not text or not isinstance(text, str):
        return ""
    
    # Normalize unicode quotes and dashes
    text = text.replace("“", "\"").replace("”", "\"").replace("‘", "'").replace("’", "'")
    text = text.replace("—", " - ").replace("–", " - ")
    
    # Lowercase
    cleaned = text.lower()
    
    # Remove URLs if any
    cleaned = re.sub(r'https?://\S+|www\.\S+', ' ', cleaned)
    
    # Remove email addresses
    cleaned = re.sub(r'\S+@\S+', ' ', cleaned)
    
    # Keep alphanumeric, basic punctuation markers like '!' and '?' which carry emotional polarity
    cleaned = re.sub(r'[^\w\s\?!]', ' ', cleaned)
    
    # Normalize whitespace
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned

def extract_linguistic_signals(text: str) -> dict:
    """
    Computes linguistic cues often correlated with misinformation/hyperbole:
    - exclamation marks
    - question marks
    - uppercase ratio
    - sensational keywords
    """
    if not text:
        return {"exclamations": 0, "questions": 0, "sensational_term_count": 0, "caps_ratio": 0.0}
    
    exclamations = text.count("!")
    questions = text.count("?")
    caps_count = sum(1 for c in text if c.isupper())
    caps_ratio = caps_count / max(len(text), 1)
    
    sensational_words = {
        "shocking", "unbelievable", "secret", "miracle", "cure", "hoax", 
        "exposed", "conspiracy", "mainstream", "hidden", "banned", "they don't want you to know",
        "100%", "guaranteed", "proof", "truth about"
    }
    
    lower_text = text.lower()
    sensational_count = sum(1 for term in sensational_words if term in lower_text)
    
    return {
        "exclamations": exclamations,
        "questions": questions,
        "sensational_term_count": sensational_count,
        "caps_ratio": round(caps_ratio, 4)
    }
