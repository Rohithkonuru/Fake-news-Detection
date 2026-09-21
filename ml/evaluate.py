import os
import json
import joblib
import pandas as pd
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from ml.preprocess import preprocess_text

def evaluate_model(vectorizer=None, classifier=None):
    base_dir = os.path.dirname(__file__)
    models_dir = os.path.join(base_dir, "models")
    test_path = os.path.join(base_dir, "dataset", "test_claims.csv")
    
    if vectorizer is None:
        vec_path = os.path.join(models_dir, "tfidf_vectorizer.joblib")
        vectorizer = joblib.load(vec_path)
    if classifier is None:
        model_path = os.path.join(models_dir, "logistic_regression_model.joblib")
        classifier = joblib.load(model_path)
        
    df_test = pd.read_csv(test_path)
    cleaned_test = [preprocess_text(t) for t in df_test["text"]]
    y_true = df_test["label"].values
    
    X_test = vectorizer.transform(cleaned_test)
    y_pred = classifier.predict(X_test)
    
    acc = float(accuracy_score(y_true, y_pred))
    prec = float(precision_score(y_true, y_pred, zero_division=0))
    rec = float(recall_score(y_true, y_pred, zero_division=0))
    f1 = float(f1_score(y_true, y_pred, zero_division=0))
    cm = confusion_matrix(y_true, y_pred).tolist()
    
    metrics = {
        "model_architecture": "TF-IDF (1,2 n-grams, sublinear_tf) + LogisticRegression (l2)",
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "confusion_matrix": {
            "true_negative": cm[0][0] if len(cm) > 0 and len(cm[0]) > 0 else 0,
            "false_positive": cm[0][1] if len(cm) > 0 and len(cm[0]) > 1 else 0,
            "false_negative": cm[1][0] if len(cm) > 1 and len(cm[1]) > 0 else 0,
            "true_positive": cm[1][1] if len(cm) > 1 and len(cm[1]) > 1 else 0
        },
        "test_sample_count": len(y_true),
        "evaluation_notes": "Trained to identify linguistic and stylistic patterns of misinformation vs standard reporting. Not intended as proof of factual truth."
    }
    
    metrics_path = os.path.join(models_dir, "evaluation_metrics.json")
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)
        
    print("Evaluation Results:")
    print(f"Accuracy:  {acc:.4f}")
    print(f"Precision: {prec:.4f}")
    print(f"Recall:    {rec:.4f}")
    print(f"F1 Score:  {f1:.4f}")
    print(f"Confusion Matrix: {cm}")
    print(f"Saved metrics to {metrics_path}")
    return metrics

if __name__ == "__main__":
    evaluate_model()
