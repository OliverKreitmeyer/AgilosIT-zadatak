# Frontend

[Back to Wiki](README.md)

The frontend is a React 19 single-page application built with Vite 8, using the CoreUI 5 admin template for layout and UI components.

## Project Structure

```
frontend/src/
  index.jsx              # Entry point — providers hierarchy
  App.jsx                # Root component, routing, theme
  store.js               # Redux store (sidebar, theme)
  routes.js              # Lazy-loaded route definitions
  _nav.jsx               # Sidebar navigation config
  context/
    DataContext.jsx       # Datasets, forecasts, user state
    NotificationContext.jsx  # Toast notifications + history
  forecast/
    engine.js             # All model logic + metrics
  views/
    dashboard/Dashboard.jsx  # Overview stats + quick actions
    upload/Upload.jsx        # CSV/Excel upload + column detection
    datasets/Datasets.jsx    # Dataset list + management
    forecast/Forecast.jsx    # Single-model forecasting
    compare/Compare.jsx      # Multi-model comparison
    settings/Settings.jsx    # Data management + account info
    pages/                   # Login, Register, 404, 500
  components/               # CoreUI layout (Header, Sidebar, Footer)
```

## Provider Hierarchy

```
GoogleOAuthProvider
  Redux Provider
    DataProvider (datasets, forecasts, user)
      NotificationProvider (toasts, history)
        App
```

## Pages

### Dashboard (`/dashboard`)
- 4 stat cards: dataset count, forecast count, best RMSE, best model
- Active dataset preview chart (historical data only)
- 3-step workflow guide for new users
- Quick action buttons to Upload, Forecast, Compare

### Upload Data (`/upload`)
- Drag-and-drop or click to select CSV/Excel files
- Auto-detects date and value columns by name (supports English and Croatian column names)
- Preview table showing first 50 rows
- Manual column override if auto-detection is wrong
- Validates: minimum 5 data points, valid dates, numeric values

### Datasets (`/datasets`)
- Table listing all uploaded datasets
- Shows: name, point count, date range, upload date, forecast count
- Actions: set as active, navigate to forecast, delete
- Deleting a dataset also removes its forecasts

### Forecast (`/forecast`)
- Model selector dropdown (defaults to Auto ARIMA)
- Horizon input (1–365 days)
- Dynamic parameter inputs based on selected model
- Runs one forecast at a time (clears previous)
- Chart: historical data (solid blue) + forecast (dashed colored)
- Metrics display: RMSE, MAE, MAPE badges
- Desktop notification on completion

### Compare Models (`/compare`)
- Checkbox selection of multiple models (minimum 2)
- Runs models sequentially for browser responsiveness
- Per-model error handling (failed models don't block others)
- Overlay chart with all forecasts on same axes
- Metrics comparison table with "Best" badge on lowest RMSE
- Bar chart comparing RMSE and MAE
- Success count in notification (e.g., "5/6 models finished")

### Settings (`/settings`)
- User account card (avatar, name, email from Google OAuth)
- Clear Forecast Stats — removes all forecasts, keeps datasets
- Clear All Data — removes everything (with confirmation dialog)
- Disabled buttons when nothing to clear

## State Management

### DataContext (React Context)
Manages all application data. Actions:

| Action | Effect |
|--------|--------|
| `ADD_DATASET` | Store parsed dataset |
| `SET_ACTIVE_DATASET` | Change which dataset is selected |
| `DELETE_DATASET` | Remove dataset + associated forecasts |
| `ADD_FORECAST` | Store forecast result |
| `CLEAR_FORECASTS` | Remove forecasts for one dataset |
| `CLEAR_ALL_FORECASTS` | Remove all forecasts |
| `SET_USER` / `LOGOUT` | Auth state |
| `SET_RUNNING_FORECAST` / `CLEAR_RUNNING_FORECAST` | Loading state |

Persists to localStorage on every state change (only when user is logged in).

### NotificationContext
- Toast notifications (auto-dismiss after 6 seconds)
- Notification history (last 50 entries)
- Unread counter (increments when tab is hidden)
- Desktop notifications via Notification API (if permitted)

### Redux Store
Minimal — only tracks sidebar visibility and theme (light/dark).

## Routing

All routes use `React.lazy()` for code splitting:

| Path | Component |
|------|-----------|
| `/dashboard` | Dashboard |
| `/upload` | Upload |
| `/datasets` | Datasets |
| `/forecast` | Forecast |
| `/compare` | Compare |
| `/settings` | Settings |

HashRouter is used (`/#/dashboard`) for compatibility with static file serving.

## Charts

Built with Chart.js 4 via `@coreui/react-chartjs`:
- Historical data: solid blue line
- Forecasts: dashed lines with 5-color rotating palette
- Last historical point connects to first prediction for continuity
- Max 12 x-axis tick labels with auto-rotation

## Related Pages

- [Architecture](architecture.md) — system design and data flow
- [Models](models.md) — forecasting engine details
- [File Reference](file-reference.md) — all source files
