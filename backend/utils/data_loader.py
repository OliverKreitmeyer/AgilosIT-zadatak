import pandas as pd
from fastapi import UploadFile
from io import StringIO


def parse_csv(file: UploadFile) -> pd.DataFrame:
    """
    Read the uploaded CSV file and return a DataFrame with 'Datum' and 'Potrošnja' columns.
    Expects the CSV to have columns: Datum, Potrošnja
    """
    # Read the file content into a string
    content = file.file.read().decode("utf-8")
    df = pd.read_csv(StringIO(content))

    # Make sure the expected columns exist
    if "Datum" not in df.columns or "Potrošnja" not in df.columns:
        raise ValueError("CSV must have 'Datum' and 'Potrošnja' columns")

    # Convert date column to proper datetime format
    df["Datum"] = pd.to_datetime(df["Datum"])

    # Sort by date so the time series is in order
    df = df.sort_values("Datum").reset_index(drop=True)

    return df
