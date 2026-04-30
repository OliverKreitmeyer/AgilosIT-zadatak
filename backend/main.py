from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

from utils.data_loader import parse_csv
from models.moving_average import forecast_moving_average
from models.arima_model import forecast_arima
from models.prophet_model import forecast_prophet
from models.lstm_model import forecast_lstm

app = FastAPI()

# Allow the React frontend (port 3000) to talk to our backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/predict")
async def predict(
    file: UploadFile = File(...),
    model: str = Form("arima"),
    forecast_days: int = Form(30),
    p: int = Form(1),
    d: int = Form(1),
    q: int = Form(1),
    ma_window: int = Form(7),
    seq_length: int = Form(7),
    hidden_size: int = Form(50),
    epochs: int = Form(100),
):
    # Read and validate the uploaded CSV file
    df = parse_csv(file)

    # Route to the correct forecasting model based on user selection
    if model == "ma":
        result = forecast_moving_average(df, forecast_days, ma_window)
    elif model == "arima":
        result = forecast_arima(df, forecast_days, p, d, q)
    elif model == "prophet":
        result = forecast_prophet(df, forecast_days)
    elif model == "lstm":
        result = forecast_lstm(df, forecast_days, seq_length, hidden_size, epochs)
    else:
        return {"error": f"Unknown model: {model}"}

    return result
