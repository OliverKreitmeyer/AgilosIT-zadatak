# Backend

[Back to Wiki](README.md)

The backend is a minimal Python FastAPI server. Its only purpose is to serve the Prophet forecasting model, which has no JavaScript implementation.

## Stack

| Component | Version | Purpose |
|-----------|---------|---------|
| FastAPI | latest | REST API framework |
| Uvicorn | latest | ASGI server |
| Prophet | latest | Meta's time-series model |
| Pandas | latest | DataFrame manipulation |
| NumPy | latest | Metric calculations |

## File: `backend/main.py` (116 lines)

### Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/forecast/prophet` | Run Prophet forecast |
| `GET` | `/api/health` | Health check |

See [API Reference](api.md) for request/response formats.

### Prophet Forecast Flow

```
1. Receive dates, values, horizon, params
2. Build DataFrame with 'ds' (dates) and 'y' (values) columns
3. Train/test split:
   - If enough data (>= horizon + 10): hold out last `horizon` points
   - Otherwise: no test set, no metrics
4. Fit Prophet on training data with params:
   - growth (linear/logistic/flat)
   - changepoint_prior_scale (trend flexibility)
   - seasonality_prior_scale (seasonality strength)
5. Predict on test set, calculate RMSE/MAE/MAPE
6. Refit on full dataset
7. Generate future dataframe for `horizon` days
8. Return predictions (date, value, lower, upper) + metrics
```

### CORS Configuration

Wide-open for development — allows all origins, methods, and headers:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Dependencies

```
# backend/requirements.txt
fastapi
uvicorn
pandas
numpy
prophet
python-multipart
```

### Running

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Linux/Mac
pip install -r requirements.txt
uvicorn main:app --port 8001 --reload
```

## When is the backend needed?

Only when using the Prophet model. All other models (Moving Average, Exponential Smoothing, Double ES, ARIMA, Auto ARIMA) run entirely in the browser. The frontend gracefully handles a missing backend — Prophet will simply fail with an error message.

## Related Pages

- [API Reference](api.md) — endpoint specifications
- [Models](models.md) — all model details including Prophet
- [Deployment](deployment.md) — Docker and production setup
