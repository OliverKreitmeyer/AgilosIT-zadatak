import pandas as pd
import numpy as np
from prophet import Prophet
from sklearn.metrics import mean_squared_error


def forecast_prophet(df: pd.DataFrame, forecast_days: int) -> dict:
    """
    Prophet forecast with automatic trend and seasonality detection.
    Returns historical data, forecast with confidence intervals.
    """
    dates = df["Datum"]
    values = df["Potrošnja"]

    # Prophet requires columns named 'ds' (date) and 'y' (value)
    prophet_df = pd.DataFrame({"ds": dates, "y": values})

    # Fit the model (suppress verbose output)
    model = Prophet()
    model.fit(prophet_df)

    # Create a dataframe of future dates to predict
    future = model.make_future_dataframe(periods=forecast_days)
    prediction = model.predict(future)

    # Split the prediction into historical period and forecast period
    historical_pred = prediction[prediction["ds"].isin(dates)]
    future_pred = prediction[~prediction["ds"].isin(dates)]

    # Calculate RMSE on the historical (in-sample) predictions
    rmse = np.sqrt(mean_squared_error(values, historical_pred["yhat"]))

    return {
        "dates": [d.strftime("%Y-%m-%d") for d in dates],
        "historical": values.tolist(),
        "forecast_dates": [d.strftime("%Y-%m-%d") for d in future_pred["ds"]],
        "forecast": future_pred["yhat"].tolist(),
        "lower_ci": future_pred["yhat_lower"].tolist(),
        "upper_ci": future_pred["yhat_upper"].tolist(),
        "metrics": {"rmse": round(rmse, 2)},
    }
