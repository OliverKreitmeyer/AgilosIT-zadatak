# AgilosIT Forecast — Dev Setup Guide

## Prerequisites

- Python 3.10+
- Node.js 18+
- npm

---

## Arch Linux

### Backend

```bash
cd backend

# Create a virtual environment (Arch blocks system-wide pip installs)
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn main:app --port 8001
```

If using fish shell, activate with:
```fish
source venv/bin/activate.fish
```

Backend runs on http://localhost:8001

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run start
```

Frontend runs on http://localhost:3000

---

## Windows

### Backend

```powershell
cd backend

# Create a virtual environment
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn main:app --port 8001
```

Backend runs on http://localhost:8001

### Frontend

```powershell
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run start
```

Frontend runs on http://localhost:3000

---

## Notes

- The backend is only needed for the Prophet model. All other models (Moving Average, Exponential Smoothing, ARIMA, Auto ARIMA) run entirely in the browser.
- If you don't need Prophet, you can skip the backend setup entirely.
- The frontend communicates with the backend at `http://localhost:8001`. To change this, set the `VITE_API_URL` environment variable before starting the frontend.
- Sample test data is in `data/` (sample_data.csv, downtrend.csv, strong_seasonal.csv, etc.).

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8001` | Backend API URL (frontend) |

---

## Docker

```bash
docker compose up --build
```

This starts both frontend and backend. The app is available at http://localhost:3000.
