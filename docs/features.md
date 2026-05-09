# Features

[Back to Wiki](README.md)

Complete feature list organized by application area.

## Data Management

- [x] CSV file upload with drag-and-drop
- [x] Excel (.xlsx, .xls) file upload
- [x] Auto-detection of date and value columns (English + Croatian names)
- [x] Manual column selection override
- [x] Data preview table (first 50 rows)
- [x] Data validation (min 5 points, valid dates, numeric values)
- [x] Multiple dataset management
- [x] Active dataset selection
- [x] Dataset deletion (cascades to forecasts)
- [x] Persistent storage via localStorage

## Forecasting

- [x] 6 forecasting models (5 client-side, 1 server-side)
- [x] Configurable prediction horizon (1–365 days)
- [x] Per-model parameter tuning with dynamic UI
- [x] Train/test split for honest metric evaluation
- [x] Single-forecast mode (Forecast page)
- [x] Multi-model comparison mode (Compare page)
- [x] Sequential model execution for browser responsiveness
- [x] Per-model error handling in comparison mode
- [x] Auto ARIMA with custom grid search (up to 75 combinations)

## Visualization

- [x] Interactive line charts (Chart.js)
- [x] Historical data + forecast overlay
- [x] Multi-forecast overlay in Compare mode
- [x] Color-coded forecast lines (5-color palette)
- [x] Metrics bar chart (RMSE/MAE comparison)
- [x] Dashboard overview chart
- [x] Auto-rotating axis labels (max 12 ticks)

## Metrics & Evaluation

- [x] RMSE (Root Mean Square Error)
- [x] MAE (Mean Absolute Error)
- [x] MAPE (Mean Absolute Percentage Error)
- [x] Metrics calculated on held-out test set (not training data)
- [x] Best model highlighting (lowest RMSE)
- [x] Metrics comparison table

## Notifications

- [x] Toast notifications (top-right, auto-dismiss 6s)
- [x] Notification history (last 50)
- [x] Unread counter (increments when tab is hidden)
- [x] Desktop notifications (browser Notification API)
- [x] Forecast completion notifications with RMSE

## User & Auth

- [x] Google OAuth login
- [x] User session stored in context
- [x] Avatar, name, email display in settings
- [x] User-gated localStorage persistence
- [x] Logout clears all data

## Settings & Data Management

- [x] Clear forecast stats (keep datasets)
- [x] Clear all data (datasets + forecasts)
- [x] Confirmation dialogs for destructive actions
- [x] Disabled buttons when nothing to clear

## UI/UX

- [x] CoreUI admin template (sidebar, cards, tables)
- [x] Light/dark theme support
- [x] Responsive layout
- [x] Loading spinners during forecast computation
- [x] Empty state messaging
- [x] Lazy-loaded routes (code splitting)
- [x] SPA routing (HashRouter)

## Deployment

- [x] Docker Compose (frontend + backend)
- [x] Multi-stage Docker build (Node build + Nginx serve)
- [x] Nginx SPA routing + API proxy
- [x] Dev helper script (`dev.sh`)
- [x] Environment variable configuration

## Related Pages

- [Architecture](architecture.md) — how features connect
- [Models](models.md) — forecasting model details
- [Edge Cases](edge-cases.md) — validation and error handling
