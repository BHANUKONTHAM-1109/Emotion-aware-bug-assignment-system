"""
ML microservice for stress prediction.
Backend calls POST /predict with { developer_id, features }.
Returns { predicted_stress_score (0-1), model_version }.
Model trained on train.csv (Avg_Working_Hours_Per_Day, Work_From, Work_Pressure, etc.).
Run: uvicorn stress_model:app --reload --port 8000
"""

import os
import joblib
import pandas as pd
from pathlib import Path
from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

MODEL_PATH = Path(__file__).resolve().parent / "stress_model.pkl"
app = FastAPI(
    title="Emotion-Aware Stress Model",
    description="Stress prediction for bug assignment (backend calls POST /predict)",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Feature names expected by the pipeline (from train.py: cat_cols + num_cols)
CAT_COLS = ["Work_From", "Work_Life_Balance", "Lives_With_Family", "Working_State"]
NUM_COLS = [
    "Avg_Working_Hours_Per_Day",
    "Work_Pressure",
    "Manager_Support",
    "Sleeping_Habit",
    "Exercise_Habit",
    "Job_Satisfaction",
    "Social_Person",
]
FEATURE_ORDER = [
    "Avg_Working_Hours_Per_Day",
    "Work_From",
    "Work_Pressure",
    "Manager_Support",
    "Sleeping_Habit",
    "Exercise_Habit",
    "Job_Satisfaction",
    "Work_Life_Balance",
    "Social_Person",
    "Lives_With_Family",
    "Working_State",
]


def load_model():
    if not MODEL_PATH.exists():
        return None, "no-model"
    obj = joblib.load(MODEL_PATH)
    return obj, "train-csv-v1"


pipeline, model_version = load_model()


class PredictRequest(BaseModel):
    developer_id: int
    features: dict[str, Any]


class PredictResponse(BaseModel):
    developer_id: int
    predicted_stress_score: float
    model_version: str


def map_backend_features_to_model(features: dict) -> dict:
    """Map backend metrics to the columns expected by train.csv-based model."""
    open_bugs = int(features.get("open_bug_count", 0))
    avg_hours = float(features.get("avg_resolution_time_hours", 0)) or 1.0
    current_stress = float(features.get("current_stress_score", 0.5))

    # Work pressure 1-5 from open bug count
    work_pressure = min(5, max(1, 1 + open_bugs))
    # Approximate working hours from resolution time + workload
    avg_working_hours = min(14, max(4, 7 + open_bugs * 0.5 + avg_hours * 0.1))

    return {
        "Avg_Working_Hours_Per_Day": avg_working_hours,
        "Work_From": "Hybrid" if open_bugs > 3 else "Office",
        "Work_Pressure": work_pressure,
        "Manager_Support": max(1, min(5, 4 - int(current_stress * 3))),
        "Sleeping_Habit": max(1, min(5, 4 - int(current_stress * 2))),
        "Exercise_Habit": max(1, min(5, 3 - int(current_stress * 2))),
        "Job_Satisfaction": max(1, min(5, 4 - int(current_stress * 3))),
        "Work_Life_Balance": "No" if current_stress > 0.5 else "Yes",
        "Social_Person": max(1, min(5, 3)),
        "Lives_With_Family": "Yes",
        "Working_State": "Karnataka",
    }


@app.get("/")
def root():
    return {
        "service": "Emotion-Aware Stress Model",
        "docs": "/docs",
        "health": "/health",
        "predict": "POST /predict",
    }


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": pipeline is not None}


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    if pipeline is None:
        # Fallback when model not trained
        score = min(1.0, max(0.0, 0.3 + req.features.get("open_bug_count", 0) * 0.05))
        return PredictResponse(
            developer_id=req.developer_id,
            predicted_stress_score=round(score, 4),
            model_version="fallback",
        )
    row = map_backend_features_to_model(req.features)
    df = pd.DataFrame([row])
    df = df[FEATURE_ORDER]
    pred = pipeline.predict(df)[0]
    # Stress_Level in train.csv is 1-5; normalize to 0-1
    p = float(pred)
    score = (p - 1.0) / 4.0 if p >= 1 else 0.0
    score = max(0.0, min(1.0, score))
    return PredictResponse(
        developer_id=req.developer_id,
        predicted_stress_score=round(score, 4),
        model_version=model_version,
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
