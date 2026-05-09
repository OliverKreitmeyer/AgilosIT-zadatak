# Forecasting Models

[Back to Wiki](README.md)

All model logic lives in [`frontend/src/forecast/engine.js`](../frontend/src/forecast/engine.js). The entry point is `runForecast(modelName, data, horizon, params)`, which dispatches to the appropriate model function.

## Model Summary

| # | Model | Execution | Parameters | Prediction Shape |
|---|-------|-----------|------------|------------------|
| 1 | Moving Average | Browser (JS) | windowSize | Flat/gradual |
| 2 | Exponential Smoothing | Browser (JS) | alpha | Flat line |
| 3 | Double Exp. Smoothing | Browser (JS) | alpha, beta | Linear trend |
| 4 | ARIMA | Browser (WASM) | p, d, q, method, optimizer | Complex pattern |
| 5 | Auto ARIMA | Browser (WASM) | maxP, maxD, maxQ, method, optimizer | Best-fit ARIMA |
| 6 | Prophet | Python backend | growth, changepoint_prior_scale, seasonality_prior_scale | Trend + seasonality |

---

## 1. Moving Average

**Function:** `runMovingAverage(values, horizon, params)`

Simple iterative sliding window. Each future prediction is the mean of the previous `windowSize` values (including earlier predictions).

- **Default:** windowSize = 5
- **Behavior:** Predictions converge toward the mean over time
- **Best for:** Stable, low-variance data

---

## 2. Exponential Smoothing (SES)

**Function:** `runExponentialSmoothing(values, horizon, params)`

Single Exponential Smoothing — weights recent observations exponentially more than older ones.

- **Default:** alpha = 0.3 (smoothing factor, range 0.01–1.0)
- **Behavior:** Produces a **flat forecast line** (constant value) because SES has no trend component
- **Best for:** Data without trend or seasonality

---

## 3. Double Exponential Smoothing (Holt)

**Function:** `runDoubleExponentialSmoothing(values, horizon, params)`

Holt's method — adds a trend component on top of level smoothing.

- **Defaults:** alpha = 0.3, beta = 0.1
- **Behavior:** Linear extrapolation of the detected trend
- **Best for:** Data with a clear upward or downward trend

---

## 4. ARIMA

**Function:** `runArima(values, horizon, params)`

AutoRegressive Integrated Moving Average, implemented via the `arima` npm package (C++ compiled to WebAssembly).

- **Defaults:** p=2, d=1, q=2
- **Additional params:**
  - `method`: 0 = Maximum Likelihood, 1 = CSS, 2 = Box-Jenkins
  - `optimizer`: 0 = Nelder-Mead, 5 = BFGS, 6 = L-BFGS (default)
- **Best for:** Users who know the right (p,d,q) for their data

---

## 5. Auto ARIMA

**Function:** `runAutoArima(values, horizon, params)`

Custom grid search that finds the best ARIMA parameters automatically.

- **Defaults:** maxP=5, maxD=2, maxQ=5
- **Search space:** Up to 5 x 3 x 5 = 75 combinations (skips p=0, q=0)
- **Process:**
  1. Hold out last 10% of data as validation set (minimum 5 points)
  2. Try all (p, d, q) combinations within limits
  3. Pick the combination with lowest RMSE on validation set
  4. Retrain on full data with best parameters

**Why not the library's `auto: true`?** The built-in auto option produced wild oscillations and unstable results. The custom grid search is slower but reliable.

---

## 6. Prophet

**Function:** `runProphet(dates, values, horizon, params)`

Meta's Prophet model, called via HTTP to the Python backend.

- **Defaults:** growth = "linear", changepoint_prior_scale = 0.05, seasonality_prior_scale = 10.0
- **Growth options:** linear, logistic, flat
- **Features:** Automatic trend, weekly and yearly seasonality detection
- **Returns:** Predictions with confidence intervals (lower/upper bounds)
- **Requires:** Backend running on port 8001

See [API Reference](api.md) for the endpoint specification.

---

## Metrics

All models are evaluated on a **held-out test set** (not training data):

| Metric | Formula | Interpretation |
|--------|---------|----------------|
| **RMSE** | `sqrt(mean((actual - predicted)^2))` | Same units as data. Lower = better. Penalizes large errors. |
| **MAE** | `mean(\|actual - predicted\|)` | Same units as data. Lower = better. More robust to outliers. |
| **MAPE** | `mean(\|actual - predicted\| / actual) * 100%` | Percentage error. Lower = better. Skips zero values. |

### Train/Test Split

1. If `data.length > horizon + 10`: hold out last `horizon` points as test set
2. Train model on remaining data
3. Predict on test period, calculate metrics
4. Retrain on **all** data for final forecast

## Related Pages

- [Architecture](architecture.md) — how models fit into the system
- [Edge Cases](edge-cases.md) — validation rules and error handling
- [API Reference](api.md) — Prophet endpoint details
