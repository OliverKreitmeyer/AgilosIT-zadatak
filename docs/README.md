# AgilosIT Forecast — Documentation Wiki

Welcome to the project documentation. This wiki covers architecture, features, models, API, and every important file in the codebase.

## Quick Links

| Page | Description |
|------|-------------|
| [Architecture](architecture.md) | System design, data flow, state management |
| [Features](features.md) | Complete feature list by page |
| [Models](models.md) | All 6 forecasting models in detail |
| [Frontend](frontend.md) | React app structure, components, context |
| [Backend](backend.md) | FastAPI server, Prophet integration |
| [API Reference](api.md) | Endpoint specs, request/response formats |
| [Deployment](deployment.md) | Docker, dev setup, environment variables |
| [Edge Cases & Validation](edge-cases.md) | Error handling, data validation, known limits |
| [File Reference](file-reference.md) | Every important file with purpose and line count |

## Project at a Glance

**AgilosIT Forecast** is a web application that predicts future consumption from historical time-series data. Users upload a CSV or Excel file, pick a forecasting model and prediction horizon, and get interactive charts with accuracy metrics.

- **Frontend:** React 19 + Vite 8 + CoreUI 5 — runs on port 3000
- **Backend:** Python FastAPI — runs on port 8001 (only needed for Prophet)
- **Models:** 5 run in the browser (JS/WASM), 1 runs on the server (Prophet)
- **State:** React Context + localStorage persistence (no database)

## Getting Started

```bash
# Dev mode (two terminals)
cd backend && source venv/bin/activate && uvicorn main:app --port 8001 --reload
cd frontend && npm install && npm start

# Or use the helper script
./dev.sh

# Docker (production)
docker compose up --build
```

See [Deployment](deployment.md) for full setup instructions.
