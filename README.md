# AgilosIT Forecast

Web aplikacija za predviđanje potrošnje na temelju povijesnih podataka iz CSV datoteke.

## Modeli

- **Moving Average** — jednostavni klizeci prosjek (baseline)
- **ARIMA** — statisticki model s podesivim p, d, q parametrima
- **Prophet** — Meta-ov model s automatskom detekcijom trenda i sezonalnosti
- **LSTM** — neuronska mreza za prepoznavanje nelinearnih uzoraka

## Brzo pokretanje (Docker)

```bash
docker compose up --build
```

Aplikacija je dostupna na http://localhost:3000

## Razvoj

Upute za postavljanje razvojnog okruzenja na Arch Linuxu i Windowsu nalaze se u [DEV-RAW.md](DEV-RAW.md).

## Dokumentacija

Detaljni opis pristupa, modela i korištenih izvora nalazi se u [DOKUMENTACIJA.md](DOKUMENTACIJA.md).
