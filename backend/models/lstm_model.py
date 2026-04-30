import pandas as pd
import numpy as np
import torch
import torch.nn as nn
from sklearn.metrics import mean_squared_error
from sklearn.preprocessing import MinMaxScaler


class LSTMNet(nn.Module):
    """Simple LSTM network with one hidden layer and a single linear output."""

    def __init__(self, hidden_size):
        super().__init__()
        # LSTM takes 1 input feature (consumption value) and outputs hidden_size features
        self.lstm = nn.LSTM(input_size=1, hidden_size=hidden_size, batch_first=True)
        # Map the LSTM output to a single predicted value
        self.linear = nn.Linear(hidden_size, 1)

    def forward(self, x):
        lstm_out, _ = self.lstm(x)
        # Take only the last time step's output
        last_step = lstm_out[:, -1, :]
        return self.linear(last_step)


def create_sequences(data, seq_length):
    """
    Turn a flat array of values into input/output pairs for the LSTM.
    Each input is a window of seq_length values, and the output is the next value.
    """
    xs, ys = [], []
    for i in range(len(data) - seq_length):
        xs.append(data[i : i + seq_length])
        ys.append(data[i + seq_length])
    return np.array(xs), np.array(ys)


def forecast_lstm(
    df: pd.DataFrame, forecast_days: int, seq_length: int, hidden_size: int, epochs: int
) -> dict:
    """
    Train a small LSTM on the uploaded data and forecast future values.
    All training happens from scratch on each request since the data changes.
    """
    dates = df["Datum"]
    values = df["Potrošnja"].values.astype(float)

    # Scale values to 0-1 range so the neural network trains properly
    scaler = MinMaxScaler()
    scaled = scaler.fit_transform(values.reshape(-1, 1)).flatten()

    # Build sequences: each input is seq_length days, output is the next day
    X, y = create_sequences(scaled, seq_length)
    X_tensor = torch.FloatTensor(X).unsqueeze(-1)  # shape: (samples, seq_length, 1)
    y_tensor = torch.FloatTensor(y).unsqueeze(-1)  # shape: (samples, 1)

    # Create and train the model
    model = LSTMNet(hidden_size)
    optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
    loss_fn = nn.MSELoss()

    model.train()
    for epoch in range(epochs):
        optimizer.zero_grad()
        output = model(X_tensor)
        loss = loss_fn(output, y_tensor)
        loss.backward()
        optimizer.step()

    # Calculate RMSE on the training predictions
    model.eval()
    with torch.no_grad():
        train_pred_scaled = model(X_tensor).numpy().flatten()
    train_pred = scaler.inverse_transform(train_pred_scaled.reshape(-1, 1)).flatten()
    actual_for_rmse = values[seq_length:]
    rmse = np.sqrt(mean_squared_error(actual_for_rmse, train_pred))

    # Forecast future values by feeding the last sequence and rolling forward
    model.eval()
    current_seq = scaled[-seq_length:].tolist()
    forecast_scaled = []

    with torch.no_grad():
        for _ in range(forecast_days):
            input_tensor = torch.FloatTensor([current_seq]).unsqueeze(-1)
            next_val = model(input_tensor).item()
            forecast_scaled.append(next_val)
            # Slide the window: drop the oldest value, add the new prediction
            current_seq = current_seq[1:] + [next_val]

    # Convert forecast back from 0-1 scale to original scale
    forecast_values = scaler.inverse_transform(
        np.array(forecast_scaled).reshape(-1, 1)
    ).flatten()

    # Generate future dates
    last_date = dates.iloc[-1]
    future_dates = pd.date_range(start=last_date + pd.Timedelta(days=1), periods=forecast_days)

    return {
        "dates": [d.strftime("%Y-%m-%d") for d in dates],
        "historical": values.tolist(),
        "forecast_dates": [d.strftime("%Y-%m-%d") for d in future_dates],
        "forecast": forecast_values.tolist(),
        "metrics": {"rmse": round(rmse, 2)},
    }
