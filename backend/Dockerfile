FROM python:3.12-slim

WORKDIR /app

# Install dependencies first (cached layer if requirements.txt doesn't change)
COPY requirements.txt .
RUN pip install --no-cache-dir fastapi uvicorn pandas numpy statsmodels prophet scikit-learn python-multipart
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# Copy the application code
COPY . .

# Run the FastAPI server on port 8000, accessible from outside the container
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
