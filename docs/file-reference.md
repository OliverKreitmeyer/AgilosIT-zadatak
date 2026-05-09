# File Reference

[Back to Wiki](README.md)

Every important file in the project, organized by area.

## Frontend — Core

| File | Lines | Purpose |
|------|-------|---------|
| [`src/index.jsx`](../frontend/src/index.jsx) | 24 | Entry point. Sets up provider hierarchy: Google OAuth > Redux > DataContext > Notifications > App |
| [`src/App.jsx`](../frontend/src/App.jsx) | 95 | Root component. HashRouter, theme detection (URL param or Redux), Suspense boundary, public vs protected routes |
| [`src/store.js`](../frontend/src/store.js) | 58 | Redux store for UI state only (sidebar visibility, theme). Uses simple "set" action |
| [`src/routes.js`](../frontend/src/routes.js) | 20 | Route definitions with React.lazy() for code splitting |
| [`src/_nav.jsx`](../frontend/src/_nav.jsx) | 64 | Sidebar navigation config. Sections: Dashboard, Data (Upload, Datasets), Analysis (Forecast, Compare), System (Settings) |

## Frontend — State Management

| File | Lines | Purpose |
|------|-------|---------|
| [`src/context/DataContext.jsx`](../frontend/src/context/DataContext.jsx) | 123 | React Context for datasets, forecasts, user, running state. Reducer pattern with localStorage persistence. User-gated persistence. |
| [`src/context/NotificationContext.jsx`](../frontend/src/context/NotificationContext.jsx) | 77 | Toast notifications (6s auto-dismiss), history (last 50), unread counter, desktop Notification API integration |

## Frontend — Forecasting Engine

| File | Lines | Purpose |
|------|-------|---------|
| [`src/forecast/engine.js`](../frontend/src/forecast/engine.js) | 237 | All model implementations: Moving Average, Exponential Smoothing, Double ES, ARIMA, Auto ARIMA, Prophet (API call). Also: `calcMetrics()`, `getModelNames()`, `getDefaultParams()`, `runForecast()` dispatcher |

## Frontend — Views (Pages)

| File | Lines | Purpose |
|------|-------|---------|
| [`src/views/dashboard/Dashboard.jsx`](../frontend/src/views/dashboard/Dashboard.jsx) | 195 | Landing page. 4 stat cards, active dataset chart, workflow guide, quick action buttons |
| [`src/views/upload/Upload.jsx`](../frontend/src/views/upload/Upload.jsx) | 343 | File upload. Drag-and-drop, CSV (PapaParse) + Excel (XLSX) parsing, column auto-detection (EN/HR), preview table, validation |
| [`src/views/datasets/Datasets.jsx`](../frontend/src/views/datasets/Datasets.jsx) | 129 | Dataset management. Table with name/points/range/date/forecasts, set active, delete (cascading) |
| [`src/views/forecast/Forecast.jsx`](../frontend/src/views/forecast/Forecast.jsx) | 397 | Single-model forecasting. Model selector, horizon input, dynamic params, chart with historical + forecast, metrics badges |
| [`src/views/compare/Compare.jsx`](../frontend/src/views/compare/Compare.jsx) | 412 | Multi-model comparison. Checkbox selection, sequential execution, error handling per-model, overlay chart, metrics table + bar chart |
| [`src/views/settings/Settings.jsx`](../frontend/src/views/settings/Settings.jsx) | 168 | Settings. Account card, clear forecasts, clear all data, confirmation dialogs |

## Frontend — Configuration

| File | Lines | Purpose |
|------|-------|---------|
| [`vite.config.mjs`](../frontend/vite.config.mjs) | 42 | Vite config. Port 3000, jsdom test env, PostCSS autoprefixer, `src/` path alias, relative base |
| [`package.json`](../frontend/package.json) | 65 | Dependencies and scripts. React 19, Vite 8, CoreUI 5, arima (WASM), papaparse, xlsx, chart.js |
| [`Dockerfile`](../frontend/Dockerfile) | 14 | Multi-stage build. Stage 1: node:20-alpine builds app. Stage 2: nginx:alpine serves dist/ |
| [`nginx.conf`](../frontend/nginx.conf) | 17 | SPA routing (try_files /index.html), API proxy (/api/* -> backend:8001) |

## Backend

| File | Lines | Purpose |
|------|-------|---------|
| [`main.py`](../backend/main.py) | 116 | FastAPI app. POST /api/forecast/prophet (train/test split, Prophet fit, metrics), GET /api/health. CORS middleware. Pydantic models for request/response |
| [`requirements.txt`](../backend/requirements.txt) | 6 | Python deps: fastapi, uvicorn, pandas, numpy, prophet, python-multipart |

## Root

| File | Lines | Purpose |
|------|-------|---------|
| [`docker-compose.yml`](../docker-compose.yml) | 15 | Two services: backend (port 8001) + frontend (port 3000, depends_on backend) |
| [`dev.sh`](../dev.sh) | 30 | Dev helper. Starts backend + frontend with hot reload, trap handler for clean shutdown |
| [`test.sh`](../test.sh) | 5 | Runs `npm run test:watch` in frontend/ |
| [`README.md`](../README.md) | 58 | Project overview, model table, quick start, links |
| [`PROJECT.md`](../PROJECT.md) | 296 | Detailed project context document (Croatian) |
| [`DEV-RAW.md`](../DEV-RAW.md) | 112 | Platform-specific dev setup (Arch Linux, Windows) |

## Sample Data

| File | Purpose |
|------|---------|
| [`data/sample_data.csv`](../data/sample_data.csv) | General test dataset |
| [`data/downtrend.csv`](../data/downtrend.csv) | Downward trending data |
| [`data/stable_flat.csv`](../data/stable_flat.csv) | Flat/stable data |
| [`data/strong_seasonal.csv`](../data/strong_seasonal.csv) | Data with strong seasonality |
| [`data/volatile_spikes.csv`](../data/volatile_spikes.csv) | Data with volatile spikes |

## Total

**~2,640 lines** of application code (excluding node_modules, venv, and generated files).

## Related Pages

- [Architecture](architecture.md) — how these files connect
- [Frontend](frontend.md) — component details
- [Backend](backend.md) — server details
