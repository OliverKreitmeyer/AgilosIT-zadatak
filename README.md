# AgilosIT Forecast

Web aplikacija za predvidanje buduce potrosnje na temelju povijesnih podataka iz CSV datoteke.

## Modeli

| Model | Opis | Izvrsavanje |
|---|---|---|
| **Moving Average** | Klizeci prosjek s podesivom velicinom prozora | Browser |
| **Exponential Smoothing** | Jednostruko eksponencijalno izgladivanje (alpha) | Browser |
| **Double Exp. Smoothing** | Holt-ovo dvostruko izgladivanje (alpha + beta za trend) | Browser |
| **ARIMA** | Statisticki model s rucnim p, d, q parametrima | Browser (WASM) |
| **Auto ARIMA** | Automatski grid search za optimalne p, d, q | Browser (WASM) |
| **Prophet** | Meta-ov model s automatskom detekcijom trenda i sezonalnosti | Python backend |

## Brzo pokretanje

### Razvoj (dev mode)

```bash
# Terminal 1 — Backend (potreban samo za Prophet model)
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --port 8001

# Terminal 2 — Frontend
cd frontend
npm install
npm run start
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8001

### Docker (produkcija)

```bash
docker compose up --build
```

Aplikacija je dostupna na http://localhost:3000

## Dokumentacija

- [PROJECT.md](PROJECT.md) — arhitektura, API, struktura projekta
- [DEV-RAW.md](DEV-RAW.md) — upute za postavljanje razvojnog okruzenja (Arch Linux + Windows)

## Korišteni izvori

- [CoreUI Free React Admin Template](https://github.com/coreui/coreui-free-react-admin-template) — UI template (MIT licenca)
- [arima (npm)](https://github.com/zemlyansky/arima) — ARIMA/SARIMA/AutoARIMA u browseru putem WebAssembly
- [PapaParse](https://www.papaparse.com/) — CSV parsiranje u browseru
- [Prophet (Meta)](https://facebook.github.io/prophet/) — model za vremenske serije
- [FastAPI](https://fastapi.tiangolo.com/) — Python web framework za backend API
- [Chart.js](https://www.chartjs.org/) — grafovi (integriran kroz CoreUI)
- [Claude Code (Anthropic)](https://claude.ai) — AI asistent koristen za razvoj
