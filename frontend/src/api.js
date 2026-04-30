// Sends the CSV file and model parameters to the backend, returns the forecast data
export async function fetchForecast({ file, model, forecastDays, p, d, q, maWindow, seqLength, hiddenSize, epochs }) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("model", model);
  formData.append("forecast_days", forecastDays);
  formData.append("p", p);
  formData.append("d", d);
  formData.append("q", q);
  formData.append("ma_window", maWindow);
  formData.append("seq_length", seqLength);
  formData.append("hidden_size", hiddenSize);
  formData.append("epochs", epochs);

  const response = await fetch("http://localhost:8000/api/predict", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  // If the backend returned an error message, throw it so the UI can display it
  if (!response.ok || data.error) {
    throw new Error(data.error || "Backend returned an error");
  }

  return data;
}
