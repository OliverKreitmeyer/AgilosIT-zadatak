# AgilosIT Forecast — Project Context

## Cilj projekta

Web aplikacija koja predvida buducu potrosnju na temelju povijesnih podataka iz CSV datoteke.
Korisnik ucitava CSV s datumima i vrijednostima, odabire model i horizont predikcije, te dobiva vizualizaciju i metrike kvalitete modela.

---

## Arhitektura

Aplikacija koristi hibridni pristup:
- **Client-side modeli** (Moving Average, Exponential Smoothing, ARIMA, Auto ARIMA) izvrsavaju se direktno u browseru koristeci JavaScript i WebAssembly — nema potrebe za backendom
- **Server-side modeli** (Prophet) zahtijevaju Python backend jer ne postoji JavaScript implementacija

```
Browser (React + CoreUI)
  |
  |-- Client-side: arima (WASM), custom MA/ES implementacije
  |
  |-- Server-side: HTTP POST --> FastAPI --> Prophet --> JSON response
```

---

## Tech Stack

### Frontend
- **React 19 + Vite 8** — SPA s hot reload razvojem
- **CoreUI 5** — Bootstrap-based admin dashboard template (sidebar, kartice, forme, tablice)
- **Chart.js** (kroz @coreui/react-chartjs) — linijski i stupicasti grafovi
- **arima (npm)** — ARIMA/SARIMA/AutoARIMA modeli u browseru putem WebAssembly
- **PapaParse** — CSV parsiranje na klijentu
- **React Router** — client-side routing
- **Redux** — CoreUI tema/sidebar stanje
- **React Context** — upravljanje datasetima i prognozama (DataContext)
- Port: `3000`

### Backend
- **Python + FastAPI** — minimalni REST API samo za Prophet
- **Prophet (Meta)** — model za vremenske serije s automatskom detekcijom sezonalnosti
- **pandas + numpy** — manipulacija podacima i izracun metrika
- Port: `8001`

---

## Format ulaznih podataka (CSV)

Aplikacija automatski detektira stupce za datum i vrijednost.
Podrzani nazivi stupaca ukljucuju: Date/Datum, Value/Potrosnja/Consumption/Amount/Spend.

```
Datum,Potrosnja
2023-01-01,150
2023-01-02,200
...
```

Korisnik moze i rucno odabrati stupce nakon uploada.

---

## Implementirani modeli

### 1. Moving Average
- **Parametar:** windowSize (velicina prozora, default 5)
- **Implementacija:** iterativni klizeci prosjek — svaka buduci predikcija koristi prosjecnu vrijednost prethodnog prozora
- **Tip:** Baseline model, jednostavan i brz

### 2. Exponential Smoothing
- **Parametar:** alpha (faktor izgladivanja, 0.01-1.0, default 0.3)
- **Implementacija:** SES — tezi novijim podacima eksponencijalno vise
- **Predikcija:** ravna linija (konstantna vrijednost) jer jednostruko izgladivanje nema trend komponentu

### 3. Double Exponential Smoothing (Holt)
- **Parametri:** alpha (0.3), beta (0.1)
- **Implementacija:** Holt metoda — razina (level) + trend
- **Predikcija:** linearna ekstrapolacija trenda

### 4. ARIMA
- **Parametri:** p (AR koeficijenti), d (diferenciranje), q (MA koeficijenti)
- **Dodatni parametri:**
  - method: 0=Maximum Likelihood, 1=Conditional Sum of Squares, 2=Box-Jenkins
  - optimizer: 0=Nelder-Mead, 5=BFGS, 6=L-BFGS (default)
- **Implementacija:** npm `arima` paket (C++ portiran na WebAssembly)
- **Default:** p=2, d=1, q=2, method=ML, optimizer=L-BFGS

### 5. Auto ARIMA
- **Parametri:** maxP (5), maxD (2), maxQ (5), method, optimizer
- **Implementacija:** vlastiti grid search:
  1. Odvaja zadnjih 10% podataka kao validacijski set
  2. Isprobava sve kombinacije p(0-maxP), d(0-maxD), q(0-maxQ)
  3. Odabire kombinaciju s najnizim RMSE na validacijskom setu
  4. Trenira konacni model na svim podacima
- **Napomena:** Zamijenjena je ugradeana `auto: true` opcija jer je davala nestabilne rezultate

### 6. Prophet (backend)
- **Parametri:**
  - growth: linear/logistic/flat (default: linear)
  - changepoint_prior_scale (default: 0.05) — fleksibilnost trenda
  - seasonality_prior_scale (default: 10.0) — jacina sezonalnosti
- **Implementacija:** Meta Prophet putem Python backend API-ja
- **Posebnost:** automatski detektira trend, tjednu i godisnju sezonalnost

---

## API

### POST /api/forecast/prophet

Jedini backend endpoint. Svi ostali modeli rade u browseru.

**Request:**
```json
{
  "dates": ["2023-01-01", "2023-01-02", ...],
  "values": [150, 200, ...],
  "horizon": 30,
  "growth": "linear",
  "changepoint_prior_scale": 0.05,
  "seasonality_prior_scale": 10.0
}
```

**Response:**
```json
{
  "predictions": [
    { "date": "2023-04-01", "value": 142.8, "lower": 140.4, "upper": 145.0 },
    ...
  ],
  "metrics": {
    "rmse": 12.5,
    "mae": 10.2,
    "mape": 4.3
  }
}
```

### GET /api/health

Provjera statusa backenda.

---

## Metrike izvedbe modela

Sve metrike se racunaju na **held-out test setu** (podaci koje model nije vidio tijekom treniranja):

- **RMSE** (Root Mean Square Error) — `sqrt(mean((actual - predicted)^2))`. Iste jedinice kao originalni podaci. Manji = bolji.
- **MAE** (Mean Absolute Error) — `mean(|actual - predicted|)`. Robusniji od RMSE na outliere.
- **MAPE** (Mean Absolute Percentage Error) — `mean(|actual - predicted| / actual) * 100%`. Postotak greske, koristan za usporedbu razlicitih datasetova.

### Train/Test Split

Za svaki model (ukljucujuci Prophet):
1. Odvoji zadnjih `horizon` podataka kao test set (ako ima dovoljno podataka: `length > horizon + 10`)
2. Treniraj model samo na train setu
3. Predikcija na test periodu i izracun metrika
4. Ponovo treniraj na svim podacima za konacnu prognozu

---

## UI Funkcionalnosti

### Dashboard
- Pregled statistika: broj datasetova, pokrenute prognoze, najbolji RMSE, najbolji model
- Graf aktivnog dataseta
- Brze akcije za upload/forecast/compare

### Upload Data
- Drag-and-drop ili click za odabir CSV datoteke
- PapaParse parsira CSV na klijentu
- Automatska detekcija stupaca za datum i vrijednost
- Tablicni pregled podataka (prvih 50 redova)
- Rucni odabir stupaca ako automatska detekcija nije tocna

### Datasets
- Popis svih ucitanih datasetova s informacijama (ime, broj tocaka, raspon datuma, datum uploada)
- Oznacavanje aktivnog dataseta
- Brisanje dataseta

### Forecast
- Odabir dataseta, modela, horizonta i parametara
- Jedan forecast po pokretanju (zamjenjuje prethodni)
- Vizualizacija: povijesni podaci + predikcija na istom grafu
- Prikaz metrika (RMSE, MAE, MAPE) u badge komponentama

### Compare Models
- Odabir vise modela istovremeno (checkbox)
- Pokretanje svih paralelno (Promise.all)
- Overlay graf svih predikcija na istom chartu
- Tablica metrika s oznacenim najboljim modelom
- Stupicasti graf usporedbe RMSE i MAE

---

## Struktura projekta

```
project-root/
├── backend/
│   ├── main.py                  # FastAPI app — /api/forecast/prophet + /api/health
│   ├── requirements.txt         # fastapi, uvicorn, pandas, numpy, prophet
│   └── venv/                    # Python virtual environment
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   └── DataContext.jsx  # React Context za datasetove i prognoze
│   │   ├── forecast/
│   │   │   └── engine.js        # Svi modeli (MA, ES, ARIMA, Auto ARIMA) + Prophet API poziv
│   │   ├── views/
│   │   │   ├── dashboard/Dashboard.jsx
│   │   │   ├── upload/Upload.jsx
│   │   │   ├── datasets/Datasets.jsx
│   │   │   ├── forecast/Forecast.jsx
│   │   │   ├── compare/Compare.jsx
│   │   │   └── pages/           # Login, Register, 404, 500
│   │   ├── components/          # CoreUI layout komponente (Header, Sidebar, Footer)
│   │   ├── _nav.jsx             # Sidebar navigacija
│   │   ├── routes.js            # React Router konfiguracija
│   │   ├── App.jsx              # Root komponenta s routing i temama
│   │   ├── index.jsx            # Entry point s Redux Provider i DataProvider
│   │   └── store.js             # Redux store za CoreUI temu/sidebar
│   ├── index.html
│   ├── vite.config.mjs
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
├── data/                        # Primjeri CSV datasetova za testiranje
│   ├── sample_data.csv
│   ├── downtrend.csv
│   ├── stable_flat.csv
│   ├── strong_seasonal.csv
│   └── volatile_spikes.csv
├── docker-compose.yml
├── PROJECT.md                   # Ovaj dokument
├── DEV-RAW.md                   # Upute za dev setup
└── README.md
```

---

## Pokretanje

### Dev mode

```bash
# Terminal 1 — Backend (potreban samo za Prophet)
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --port 8001

# Terminal 2 — Frontend
cd frontend
npm install
npm run start
# http://localhost:3000
```

### Docker (produkcija)

```bash
docker compose up --build
# http://localhost:3000
```

---

## Korištene biblioteke i alati

### Frontend (npm)
- `react` 19 — UI framework
- `vite` 8 — build tool i dev server
- `@coreui/react` 5 — Bootstrap dashboard komponente
- `@coreui/react-chartjs` — Chart.js wrapper za CoreUI
- `chart.js` 4 — grafovi
- `arima` — ARIMA/SARIMA/AutoARIMA u browseru (WebAssembly)
- `papaparse` — CSV parsiranje
- `react-router-dom` 7 — routing
- `react-redux` — state management za CoreUI

### Backend (Python)
- `fastapi` — REST API framework
- `uvicorn` — ASGI server
- `prophet` — Meta model za vremenske serije
- `pandas` — manipulacija podacima
- `numpy` — numericki izracuni

### Alati
- `Claude Code (Anthropic)` — AI asistent koristen za razvoj
- `Docker` + `Docker Compose` — kontejnerizacija
- `CoreUI Free React Admin Template` — UI osnova (MIT licenca)
