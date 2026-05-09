# API Reference

[Back to Wiki](README.md)

The backend exposes two endpoints. Only Prophet requires the backend — all other models run in the browser.

---

## POST `/api/forecast/prophet`

Run a Prophet forecast on the provided time-series data.

### Request

```json
{
  "dates": ["2023-01-01", "2023-01-02", "2023-01-03"],
  "values": [150, 200, 180],
  "horizon": 30,
  "growth": "linear",
  "changepoint_prior_scale": 0.05,
  "seasonality_prior_scale": 10.0
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `dates` | string[] | Yes | — | ISO date strings |
| `values` | number[] | Yes | — | Corresponding numeric values |
| `horizon` | int | Yes | — | Number of days to forecast (1–365) |
| `growth` | string | No | `"linear"` | Growth type: `linear`, `logistic`, or `flat` |
| `changepoint_prior_scale` | float | No | `0.05` | Trend flexibility (higher = more flexible) |
| `seasonality_prior_scale` | float | No | `10.0` | Seasonality strength (higher = stronger) |

### Response (200 OK)

```json
{
  "predictions": [
    {
      "date": "2023-04-01",
      "value": 142.8,
      "lower": 140.4,
      "upper": 145.0
    }
  ],
  "metrics": {
    "rmse": 12.5,
    "mae": 10.2,
    "mape": 4.3
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `predictions` | object[] | Future forecast points |
| `predictions[].date` | string | ISO date |
| `predictions[].value` | float | Predicted value (yhat) |
| `predictions[].lower` | float | Lower confidence bound |
| `predictions[].upper` | float | Upper confidence bound |
| `metrics` | object \| null | Null if insufficient data for test split |
| `metrics.rmse` | float | Root Mean Square Error |
| `metrics.mae` | float | Mean Absolute Error |
| `metrics.mape` | float | Mean Absolute Percentage Error (%) |

### Error Cases

| Scenario | Behavior |
|----------|----------|
| Backend not running | Frontend shows connection error |
| Insufficient data (< 10 points) | Returns predictions but `metrics: null` |
| Invalid dates | Prophet may error (500) |

---

## GET `/api/health`

Health check endpoint.

### Response (200 OK)

```json
{
  "status": "ok"
}
```

---

## CORS

The backend allows all origins (`*`), all methods, and all headers. This is suitable for development but should be restricted in production.

## Base URL

| Environment | URL |
|-------------|-----|
| Local dev | `http://localhost:8001` |
| Docker | `http://backend:8001` (inter-container) |
| Custom | Set `VITE_API_URL` env var on frontend |

## Related Pages

- [Backend](backend.md) — server implementation details
- [Models](models.md) — Prophet model specifics
- [Deployment](deployment.md) — environment configuration
