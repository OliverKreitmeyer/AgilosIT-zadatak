# Architecture

[Back to Wiki](README.md)

## Overview

The application uses a **hybrid architecture**: most forecasting models run directly in the browser using JavaScript and WebAssembly, while Prophet runs on a Python backend. This means the backend is only needed if the user wants to use the Prophet model.

```
Browser (React + CoreUI)
  |
  |-- Client-side models (JS/WASM):
  |     Moving Average, Exponential Smoothing,
  |     Double Exp. Smoothing, ARIMA, Auto ARIMA
  |
  |-- Server-side model (HTTP):
  |     POST /api/forecast/prophet --> FastAPI --> Prophet --> JSON
  |
  +-- State: React Context + localStorage (no database)
```

## Data Flow

```
1. Upload CSV/Excel
   --> PapaParse (CSV) or XLSX (Excel) parses file in browser
   --> Auto-detect date + value columns
   --> Store dataset in React Context

2. Run Forecast
   --> engine.js selects model function
   --> Train/test split (hold out last `horizon` points)
   --> Train on training set, evaluate on test set (RMSE/MAE/MAPE)
   --> Retrain on full data, predict `horizon` future points
   --> Store forecast in React Context

3. Prophet (server-side variant)
   --> POST dates + values + params to /api/forecast/prophet
   --> FastAPI does train/test split server-side
   --> Returns predictions + metrics as JSON
```

## State Management

Two separate state systems serve different purposes:

| System | Scope | What it stores |
|--------|-------|----------------|
| **React Context** (DataContext) | Data & forecasts | Datasets, forecasts, active dataset, user, running forecast state |
| **Redux** | UI chrome | Sidebar visibility, theme (light/dark) |

### DataContext State Shape

```javascript
{
  datasets: [{ id, name, uploadedAt, data: [{ date, value }] }],
  activeDatasetId: string | null,
  forecasts: [{ id, datasetId, modelName, params, predictions, metrics }],
  user: { name, email, avatar } | null,
  runningForecast: { modelName, datasetId, type } | null
}
```

### Persistence

- State is saved to `localStorage` on every change
- Only persists when a user is logged in (Google OAuth guard)
- Handles corrupt JSON gracefully (falls back to empty state)

## Technology Choices

| Choice | Rationale |
|--------|-----------|
| Client-side ARIMA (WASM) | No server needed for most models; faster iteration |
| Custom Auto ARIMA grid search | Library's `auto: true` produced unstable results |
| CoreUI admin template | Provides sidebar, cards, tables, charts out of the box |
| React Context over Redux for data | Simpler than Redux for dataset/forecast CRUD |
| localStorage over database | No backend database needed; data stays on client |
| FastAPI for Prophet | Prophet is Python-only; FastAPI is lightweight and async |

## Related Pages

- [Models](models.md) — detailed model implementations
- [Frontend](frontend.md) — React component structure
- [Backend](backend.md) — FastAPI server details
