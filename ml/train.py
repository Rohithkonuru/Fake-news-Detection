import os
import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from ml.preprocess import preprocess_text
from ml.evaluate import evaluate_model

def train_model():
    base_dir = os.path.dirname(__file__)
    dataset_path = os.path.join(base_dir, "dataset", "train_claims.csv")
    models_dir = os.path.join(base_dir, "models")
    os.makedirs(models_dir, exist_ok=True)
    
    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Training dataset not found at {dataset_path}")
    
    df = pd.read_csv(dataset_path)
    cleaned_texts = [preprocess_text(t) for t in df["text"]]
    labels = df["label"].values
    
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        min_df=1,
        sublinear_tf=True
    )
    X = vectorizer.fit_transform(cleaned_texts)
    
    classifier = LogisticRegression(
        C=1.5,
        max_iter=1000,
        random_state=42,
        class_weight="balanced"
    )
    classifier.fit(X, labels)
    
    vec_path = os.path.join(models_dir, "tfidf_vectorizer.joblib")
    model_path = os.path.join(models_dir, "logistic_regression_model.joblib")
    
    joblib.dump(vectorizer, vec_path)
    joblib.dump(classifier, model_path)
    print(f"Model and vectorizer saved to {models_dir}")
    
    # Run evaluation
    metrics = evaluate_model(vectorizer, classifier)
    return metrics

if __name__ == "__main__":
    train_model()
