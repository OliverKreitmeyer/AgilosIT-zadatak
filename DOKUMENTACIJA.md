# AgilosIT Forecast — Dokumentacija

## Opis pristupa

AgilosIT Forecast je web aplikacija koja predvida buducu potrosnju na temelju povijesnih podataka iz CSV datoteke. Arhitektura se sastoji od dva dijela:

- **Backend (Python + FastAPI)** — prima CSV datoteku, pokrece odabrani model i vraca rezultate kao JSON

- **Frontend (React + Plotly.js)** — korisnicko sucelje za upload podataka, odabir modela, konfiguraciju parametara i vizualizaciju rezultata

Korisnik uploada CSV datoteku s dva stupca (`Datum`, `Potrosnja`), odabere model i parametre, te dobije interaktivni graf s povijesnim podacima i predikcijom.


## Implementirani modeli

### 1. Moving Average (MA) — baseline

- Racuna klizeci prosjek s odabranom velicinom prozora

- Predikcija je ravna linija na razini zadnjeg prosjeka

- Sluzi kao referentna tocka za usporedbu s naprednijim modelima

- Parametar: `window` (velicina prozora)

### 2. ARIMA (AutoRegressive Integrated Moving Average)

- Statisticki model koji kombinira autoregresiju, diferenciranje i pomicni prosjek

- Koristi `trend='t'` za podatke s trendom, sto omogucuje predikciju koja prati smjer podataka

- Parametri: `p` (autoregresivni red), `d` (stupanj diferenciranja), `q` (red pomicnog prosjeka)

- Metrike: RMSE i AIC

- Biblioteka: `statsmodels`

### 3. Prophet

- Meta-ov open-source model za vremenske serije

- Automatski detektira trend i sezonalnost bez potrebe za rucnim podesavanjem

- Vraca confidence interval (gornju i donju granicu predikcije)

- Parametri: nema — potpuno automatski

- Biblioteka: `prophet`

### 4. LSTM (Long Short-Term Memory) — neuronska mreza

- Duboko ucenje za prepoznavanje uzoraka u sekvencama podataka

- Trenira se od nula na svakom zahtjevu jer se podaci mijenjaju

- Moze uhvatiti nelinearne odnose koje statisticki modeli ne mogu

- Parametri: `seq\_length` (duljina sekvence), `hidden\_size` (velicina skrivenog sloja), `epochs` (broj iteracija treninga)

- Biblioteka: `PyTorch`


## Plan rada

| Faza | Zadatak | Status |
| - | - | - |
| 1 | Definicija projekta i tech stacka | Zavrseno |
| 2 | FastAPI skeleton + CSV parser + data loader | Zavrseno |
| 3 | Implementacija MA modela | Zavrseno |
| 4 | Implementacija ARIMA modela (s drift termom) | Zavrseno |
| 5 | Implementacija Prophet modela | Zavrseno |
| 6 | Implementacija LSTM modela | Zavrseno |
| 7 | React UI — FileUpload, ModelSelector, ParamPanel | Zavrseno |
| 8 | Plotly graf integracija s temom | Zavrseno |
| 9 | Povezivanje frontend \<-\> backend (REST API) | Zavrseno |
| 10 | Data preview tablica nakon uploada | Zavrseno |
| 11 | Error handling (backend + frontend) | Zavrseno |
| 12 | UI poliranje — tema, custom kontrole, tooltipovi | Zavrseno |



## Procjena izvedbe modela

Koristimo dvije metrike za procjenu kvalitete predikcija:

### RMSE (Root Mean Square Error)

- Mjeri prosjecnu gresku predikcije u istim jedinicama kao podaci

- Racuna se na in-sample podacima (koliko dobro model fitira povijesne podatke)

- Manji RMSE = bolja predikcija

- Dostupno za sve modele

### AIC (Akaike Information Criterion)

- Mjeri kvalitetu modela uz penalizaciju kompleksnosti

- Koristan za usporedbu ARIMA modela s razlicitim (p,d,q) parametrima

- Manji AIC = bolji balans izmedu tocnosti i jednostavnosti

- Dostupno samo za ARIMA

### Confidence Interval

- Prophet automatski generira gornju i donju granicu predikcije

- Prikazan kao sjencast podrucje oko linije predikcije na grafu

- Omogucuje korisniku da vidi nesigurnost predikcije


## Korišteni vanjski izvori

### Biblioteke (Backend)

| Biblioteka | Verzija | Namjena |
| - | - | - |
| FastAPI | 0.136+ | Python web framework za REST API |
| uvicorn | 0.46+ | ASGI server za pokretanje FastAPI-ja |
| pandas | 3.0+ | Manipulacija podacima i CSV parsiranje |
| numpy | 2.4+ | Numericke operacije |
| statsmodels | 0.14+ | ARIMA implementacija |
| prophet | 1.3+ | Meta-ov model za vremenske serije |
| scikit-learn | 1.8+ | Racunanje RMSE metrike |
| PyTorch | 2.11+ | LSTM neuronska mreza |
| python-multipart | 0.0.27+ | Parsiranje multipart form data (CSV upload) |


### Biblioteke (Frontend)

| Biblioteka | Namjena |
| - | - |
| React | Frontend framework |
| Vite | Build tool i dev server |
| Plotly.js | Interaktivni grafovi |
| react-plotly.js | React wrapper za Plotly |


### Alati

- **Claude Code (Anthropic)** — AI asistent koristen za pomoc u razvoju aplikacije

- **Git/GitHub** — Verzioniranje koda

### Reference

- statsmodels dokumentacija: [https://www.statsmodels.org](https://www.statsmodels.org/)

- Prophet dokumentacija: [https://facebook.github.io/prophet/](https://facebook.github.io/prophet/)

- FastAPI dokumentacija: [https://fastapi.tiangolo.com](https://fastapi.tiangolo.com/)

- Plotly.js dokumentacija: [https://plotly.com/javascript/](https://plotly.com/javascript/)

- PyTorch dokumentacija: [https://pytorch.org/docs/](https://pytorch.org/docs/)

