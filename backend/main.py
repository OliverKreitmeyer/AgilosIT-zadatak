from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from utils.data_loader import parse_csv
from models.moving_average import forecast_moving_average
from models.arima_model import forecast_arima
from models.prophet_model import forecast_prophet
from models.lstm_model import forecast_lstm

app = FastAPI()

# Allow the React frontend to talk to our backend
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
    # Parse the CSV and return a clear error if it fails
    try:
        df = parse_csv(file)
    except ValueError as e:
        return JSONResponse(status_code=400, content={"error": str(e)})
    except Exception:
        return JSONResponse(status_code=400, content={"error": "Could not read the CSV file. Check the format."})

    # Route to the correct model, catching any errors during forecasting
    try:
        if model == "ma":
            result = forecast_moving_average(df, forecast_days, ma_window)
        elif model == "arima":
            result = forecast_arima(df, forecast_days, p, d, q)
        elif model == "prophet":
            result = forecast_prophet(df, forecast_days)
        elif model == "lstm":
            result = forecast_lstm(df, forecast_days, seq_length, hidden_size, epochs)
        else:
            return JSONResponse(status_code=400, content={"error": f"Unknown model: {model}"})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"Model error: {str(e)}"})

    return result
