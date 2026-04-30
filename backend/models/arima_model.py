import pandas as pd
import numpy as np
from statsmodels.tsa.arima.model import ARIMA
from sklearn.metrics import mean_squared_error


def forecast_arima(df: pd.DataFrame, forecast_days: int, p: int, d: int, q: int) -> dict:
    """
    ARIMA forecast with user-specified (p, d, q) parameters.
    Returns historical data, forecast, and model quality metrics.
    """
    dates = df["Datum"]
    values = df["Potrošnja"]

    # Set the date as index with daily frequency so ARIMA understands the time structure
    series = pd.Series(values.values, index=pd.DatetimeIndex(dates, freq="D"))

    # Use trend='t' when differencing is applied so the forecast follows the data's trend.
    # Without this, ARIMA with d>=1 defaults to no drift and produces a flat forecast.
    trend = "t" if d >= 1 else "c"
    model = ARIMA(series, order=(p, d, q), trend=trend)
    fitted = model.fit()

    # Generate forecast for the requested number of days
    forecast_result = fitted.get_forecast(steps=forecast_days)
    forecast_values = forecast_result.predicted_mean

    # Create future dates from the forecast index
    future_dates = forecast_values.index

    # Calculate RMSE on the fitted (in-sample) values
    fitted_values = fitted.fittedvalues
    rmse = np.sqrt(mean_squared_error(series.iloc[d:], fitted_values.iloc[d:]))

    return {
        "dates": [d.strftime("%Y-%m-%d") for d in dates],
        "historical": values.tolist(),
        "forecast_dates": [d.strftime("%Y-%m-%d") for d in future_dates],
        "forecast": forecast_values.tolist(),
        "metrics": {
            "rmse": round(rmse, 2),
            "aic": round(fitted.aic, 2),
        },
    }
