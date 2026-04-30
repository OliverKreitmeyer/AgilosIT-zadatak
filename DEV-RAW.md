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
uvicorn main:app --reload
```

If using fish shell, activate with:
```fish
source venv/bin/activate.fish
```

Backend runs on http://localhost:8000

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Frontend runs on http://localhost:5173

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
uvicorn main:app --reload
```

Backend runs on http://localhost:8000

### Frontend

```powershell
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Frontend runs on http://localhost:5173

---

## Notes

- Both the backend and frontend need to be running at the same time for the app to work.
- The frontend sends requests to http://localhost:8000, so the backend must be running first.
- Sample test data is in `data/sample_data.csv`.
- PyTorch is installed as CPU-only to keep the install size small. If `pip install -r requirements.txt` fails on the torch line, install it separately:

```bash
pip install torch --index-url https://download.pytorch.org/whl/cpu
```

Then install the rest:

```bash
pip install fastapi uvicorn pandas numpy statsmodels prophet scikit-learn python-multipart
```
