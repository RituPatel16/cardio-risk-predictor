"""
Cardiovascular Risk Predictor — API

FastAPI backend that loads the trained logistic regression model and
scaler produced by train_model.py, and exposes:

  GET  /api/health        - liveness check
  GET  /api/model-info    - accuracy, AUC, confusion matrix, feature importance
  POST /api/predict       - run a prediction for one patient

Run with:
    uvicorn main:app --reload --port 8000
"""
import json
import os

import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "logistic_model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "scaler.pkl")
METRICS_PATH = os.path.join(BASE_DIR, "metrics.json")

FEATURE_ORDER = [
    "age", "gender", "height", "weight", "ap_hi", "ap_lo",
    "cholesterol", "gluc", "smoke", "alco", "active",
]

app = FastAPI(title="Cardiovascular Risk Predictor API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in os.getenv("FRONTEND_ORIGINS", "http://localhost:5173").split(",")
        if origin.strip()
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Load model artifacts at startup -----------------------------------
if not (os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH)):
    raise RuntimeError(
        "Model files not found. Run `python train_model.py` first to train "
        "and save logistic_model.pkl / scaler.pkl."
    )

model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)

metrics = {}
if os.path.exists(METRICS_PATH):
    with open(METRICS_PATH) as f:
        metrics = json.load(f)


class PatientInput(BaseModel):
    age_years: float = Field(..., ge=1, le=120, description="Age in years")
    gender: int = Field(..., ge=1, le=2, description="1 = female, 2 = male")
    height: float = Field(..., ge=100, le=220, description="Height in cm")
    weight: float = Field(..., ge=20, le=250, description="Weight in kg")
    ap_hi: int = Field(..., ge=60, le=260, description="Systolic blood pressure")
    ap_lo: int = Field(..., ge=30, le=200, description="Diastolic blood pressure")
    cholesterol: int = Field(..., ge=1, le=3, description="1 normal, 2 above normal, 3 well above normal")
    gluc: int = Field(..., ge=1, le=3, description="1 normal, 2 above normal, 3 well above normal")
    smoke: int = Field(..., ge=0, le=1)
    alco: int = Field(..., ge=0, le=1)
    active: int = Field(..., ge=0, le=1)


class PredictionResponse(BaseModel):
    prediction: int
    probability: float
    risk_label: str
    bmi: float
    bmi_category: str
    pulse_pressure: int
    top_contributors: list


def bmi_category(bmi: float) -> str:
    if bmi < 18.5:
        return "Underweight"
    if bmi < 25:
        return "Normal"
    if bmi < 30:
        return "Overweight"
    return "Obese"

@app.get("/")
def root():
    return {"message": "Vitalis API is running. See /docs for available endpoints."}    


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/model-info")
def model_info():
    return metrics


@app.post("/api/predict", response_model=PredictionResponse)
def predict(patient: PatientInput):
    if patient.ap_lo > patient.ap_hi:
        raise HTTPException(
            status_code=422,
            detail="Diastolic pressure (ap_lo) cannot be higher than systolic pressure (ap_hi).",
        )

    age_days = patient.age_years * 365

    row = np.array([[
        age_days,
        patient.gender,
        patient.height,
        patient.weight,
        patient.ap_hi,
        patient.ap_lo,
        patient.cholesterol,
        patient.gluc,
        patient.smoke,
        patient.alco,
        patient.active,
    ]])

    scaled = scaler.transform(row)
    pred = int(model.predict(scaled)[0])
    proba = float(model.predict_proba(scaled)[0][1])

    bmi = round(patient.weight / ((patient.height / 100) ** 2), 1)

    # Per-patient contribution = standardized value * coefficient,
    # so patients see which of *their* inputs pushed risk up or down.
    coefs = model.coef_[0]
    contributions = []
    for i, feat in enumerate(FEATURE_ORDER):
        contributions.append({
            "feature": feat,
            "contribution": float(scaled[0][i] * coefs[i]),
        })
    contributions.sort(key=lambda d: abs(d["contribution"]), reverse=True)

    return PredictionResponse(
        prediction=pred,
        probability=proba,
        risk_label="High" if pred == 1 else "Low",
        bmi=bmi,
        bmi_category=bmi_category(bmi),
        pulse_pressure=patient.ap_hi - patient.ap_lo,
        top_contributors=contributions[:5],
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
