import pandas as pd
import numpy as np
from sklearn.metrics import mean_squared_error


def forecast_moving_average(df: pd.DataFrame, forecast_days: int, window: int) -> dict:
    """
    Simple moving average forecast.
    The prediction is a flat line extending from the last computed moving average value.
    """
    dates = df["Datum"]
    values = df["Potrošnja"]

    # Calculate the rolling mean with the given window size
    rolling_mean = values.rolling(window=window).mean()

    # The forecast value is the last computed moving average
    last_ma_value = rolling_mean.iloc[-1]

    # Generate future dates starting from the day after the last data point
    last_date = dates.iloc[-1]
    future_dates = pd.date_range(start=last_date + pd.Timedelta(days=1), periods=forecast_days)

    # The forecast is a flat line at the last moving average value
    forecast_values = [last_ma_value] * forecast_days

    # Calculate RMSE by comparing the rolling mean to actual values (where both exist)
    valid_mask = rolling_mean.notna()
    rmse = np.sqrt(mean_squared_error(values[valid_mask], rolling_mean[valid_mask]))

    return {
        "dates": [d.strftime("%Y-%m-%d") for d in dates],
        "historical": values.tolist(),
        "forecast_dates": [d.strftime("%Y-%m-%d") for d in future_dates],
        "forecast": forecast_values,
        "metrics": {"rmse": round(rmse, 2)},
    }
