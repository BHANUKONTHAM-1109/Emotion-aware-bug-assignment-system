# ML Service (FastAPI)

Stress prediction microservice for the Emotion-Aware Bug Assignment System.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Service info and links |
| GET | `/health` | Health check; `model_loaded: true` if `stress_model.pkl` exists |
| POST | `/predict` | Predict stress score (0–1) for a developer |

## POST /predict

**Request body (JSON):**
```json
{
  "developer_id": 1,
  "features": {
    "open_bug_count": 2,
    "avg_resolution_time_hours": 5.0,
    "current_stress_score": 0.3,
    "role": "DEVELOPER"
  }
}
```

**Response:**
```json
{
  "developer_id": 1,
  "predicted_stress_score": 0.42,
  "model_version": "train-csv-v1"
}
```

## Setup and run

```bash
cd ml
python -m venv .venv
.venv\Scripts\activate   # Windows
# source .venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
python train.py          # creates stress_model.pkl from train.csv
uvicorn stress_model:app --reload --port 8000
```

- Backend: set `ML_SERVICE_URL=http://localhost:8000/predict` in `.env`.
- Interactive API docs: http://localhost:8000/docs
