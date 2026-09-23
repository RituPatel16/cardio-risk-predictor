"""
Train the cardiovascular risk logistic regression model.

This reproduces the pipeline from the original Jupyter notebook:
  1. Load cardio_train.csv (semicolon separated)
  2. Remove outliers from age, height, weight, ap_hi, ap_lo using the IQR method
  3. Drop the id column
  4. Train/test split (80/20)
  5. Scale features with StandardScaler
  6. Train a LogisticRegression classifier
  7. Save model.pkl, scaler.pkl and metrics.json for the API to use

Run with:  python train_model.py
"""
import json

import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    classification_report,
    roc_auc_score,
    roc_curve,
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

FEATURE_ORDER = [
    "age", "gender", "height", "weight", "ap_hi", "ap_lo",
    "cholesterol", "gluc", "smoke", "alco", "active",
]


def remove_outliers_iqr(df: pd.DataFrame, column: str) -> pd.DataFrame:
    q1 = df[column].quantile(0.25)
    q3 = df[column].quantile(0.75)
    iqr = q3 - q1
    lower = q1 - 1.5 * iqr
    upper = q3 + 1.5 * iqr
    return df[(df[column] >= lower) & (df[column] <= upper)]


def main():
    print("Loading dataset...")
    df = pd.read_csv("cardio_train.csv", sep=";")
    original_rows = len(df)
    print(f"Loaded {original_rows} rows")

    for col in ["age", "height", "weight", "ap_hi", "ap_lo"]:
        before = len(df)
        df = remove_outliers_iqr(df, col)
        print(f"  removed {before - len(df)} outlier rows on '{col}' -> {len(df)} rows left")

    df = df.drop(columns=["id"])

    X = df[FEATURE_ORDER]
    y = df["cardio"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    print("Training LogisticRegression...")
    model = LogisticRegression(max_iter=1000)
    model.fit(X_train_scaled, y_train)

    y_pred = model.predict(X_test_scaled)
    y_proba = model.predict_proba(X_test_scaled)[:, 1]

    acc = accuracy_score(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred).tolist()
    report = classification_report(y_test, y_pred, output_dict=True)
    auc = roc_auc_score(y_test, y_proba)
    fpr, tpr, _ = roc_curve(y_test, y_proba)

    # Downsample ROC curve points for a lightweight JSON payload
    roc_points = list(zip(fpr.tolist(), tpr.tolist()))
    if len(roc_points) > 60:
        idx = np.linspace(0, len(roc_points) - 1, 60).astype(int)
        roc_points = [roc_points[i] for i in idx]

    # Feature importance from standardized logistic regression coefficients
    coefs = model.coef_[0]
    importance = sorted(
        [
            {"feature": f, "coefficient": float(c)}
            for f, c in zip(FEATURE_ORDER, coefs)
        ],
        key=lambda d: abs(d["coefficient"]),
        reverse=True,
    )

    metrics = {
        "accuracy": acc,
        "auc": auc,
        "confusion_matrix": cm,
        "classification_report": report,
        "roc_curve": [{"fpr": p[0], "tpr": p[1]} for p in roc_points],
        "feature_importance": importance,
        "dataset_rows_original": original_rows,
        "dataset_rows_after_cleaning": len(df),
        "train_rows": len(X_train),
        "test_rows": len(X_test),
        "feature_order": FEATURE_ORDER,
    }

    print(f"\nAccuracy: {acc:.4f}")
    print(f"AUC:      {auc:.4f}")
    print("Confusion matrix:", cm)

    joblib.dump(model, "logistic_model.pkl")
    joblib.dump(scaler, "scaler.pkl")
    with open("metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)

    print("\nSaved logistic_model.pkl, scaler.pkl and metrics.json")


if __name__ == "__main__":
    main()
