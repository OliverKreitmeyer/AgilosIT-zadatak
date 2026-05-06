from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
from prophet import Prophet

app = FastAPI(title="Forecast API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ProphetRequest(BaseModel):
    dates: list[str]
    values: list[float]
    horizon: int = 30
    yearly_seasonality: bool | str = "auto"
    weekly_seasonality: bool | str = "auto"
    daily_seasonality: bool | str = "auto"
    changepoint_prior_scale: float = 0.05
    seasonality_prior_scale: float = 10.0
    growth: str = "linear"


class ForecastPoint(BaseModel):
    date: str
    value: float
    lower: float | None = None
    upper: float | None = None


class Metrics(BaseModel):
    rmse: float | None = None
    mae: float | None = None
    mape: float | None = None


class ProphetResponse(BaseModel):
    predictions: list[ForecastPoint]
    metrics: Metrics | None = None


def calc_metrics(actual: np.ndarray, predicted: np.ndarray) -> Metrics:
    n = min(len(actual), len(predicted))
    actual = actual[:n]
    predicted = predicted[:n]
    errors = actual - predicted
    rmse = float(np.sqrt(np.mean(errors**2)))
    mae = float(np.mean(np.abs(errors)))
    nonzero = actual != 0
    mape = float(np.mean(np.abs(errors[nonzero] / actual[nonzero])) * 100) if nonzero.any() else None
    return Metrics(rmse=rmse, mae=mae, mape=mape)


@app.post("/api/forecast/prophet", response_model=ProphetResponse)
def forecast_prophet(req: ProphetRequest):
    df = pd.DataFrame({"ds": pd.to_datetime(req.dates), "y": req.values})
    df = df.sort_values("ds").reset_index(drop=True)

    # Train/test split for metrics
    horizon = min(req.horizon, len(df) - 10)
    metrics = None
    if horizon > 0 and len(df) > horizon + 10:
        train_df = df.iloc[:-horizon]
        test_df = df.iloc[-horizon:]

        m = Prophet(
            growth=req.growth,
            yearly_seasonality=req.yearly_seasonality,
            weekly_seasonality=req.weekly_seasonality,
            daily_seasonality=req.daily_seasonality,
            changepoint_prior_scale=req.changepoint_prior_scale,
            seasonality_prior_scale=req.seasonality_prior_scale,
        )
        m.fit(train_df)
        future = m.make_future_dataframe(periods=horizon)
        fc = m.predict(future)
        test_pred = fc.iloc[-horizon:]["yhat"].values
        metrics = calc_metrics(test_df["y"].values, test_pred)

    # Full model for actual predictions
    m = Prophet(
        growth=req.growth,
        yearly_seasonality=req.yearly_seasonality,
        weekly_seasonality=req.weekly_seasonality,
        daily_seasonality=req.daily_seasonality,
        changepoint_prior_scale=req.changepoint_prior_scale,
        seasonality_prior_scale=req.seasonality_prior_scale,
    )
    m.fit(df)
    future = m.make_future_dataframe(periods=req.horizon)
    fc = m.predict(future)

    # Only return future predictions (after last historical date)
    future_fc = fc.iloc[len(df):]
    predictions = [
        ForecastPoint(
            date=row["ds"].strftime("%Y-%m-%d"),
            value=float(row["yhat"]),
            lower=float(row["yhat_lower"]),
            upper=float(row["yhat_upper"]),
        )
        for _, row in future_fc.iterrows()
    ]

    return ProphetResponse(predictions=predictions, metrics=metrics)


@app.get("/api/health")
def health():
    return {"status": "ok"}
