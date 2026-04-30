import { useState } from "react";
import { fetchForecast } from "./api";
import FileUpload from "./components/FileUpload";
import ModelSelector from "./components/ModelSelector";
import ParamPanel from "./components/ParamPanel";
import ForecastChart from "./components/ForecastChart";

function App() {
  const [file, setFile] = useState(null);
  const [model, setModel] = useState("arima");
  const [params, setParams] = useState({
    forecastDays: 30,
    p: 1,
    d: 1,
    q: 1,
    maWindow: 7,
    seqLength: 7,
    hiddenSize: 100,
    epochs: 200,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Send the data to the backend and get a forecast
  async function handlePredict() {
    if (!file) {
      setError("Please upload a CSV file first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchForecast({ file, model, ...params });
      setResult(data);
    } catch (err) {
      setError("Prediction failed. Check your CSV format and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <h1>Consumption Forecast</h1>

      <div className="controls">
        <div className="controls-row">
          <FileUpload onFileSelect={setFile} />
          <ModelSelector model={model} onModelChange={setModel} />
        </div>
        <div className="controls-row">
          <ParamPanel model={model} params={params} onParamsChange={setParams} />
        </div>
        <div className="controls-row controls-row-right">
          <button onClick={handlePredict} disabled={loading}>
            {loading ? "Loading..." : "Predict"}
          </button>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      <ForecastChart data={result} />

      {/* Show metrics if available */}
      {result && result.metrics && (
        <div className="metrics">
          <h3>Metrics</h3>
          {result.metrics.rmse !== undefined && <p>RMSE: {result.metrics.rmse}</p>}
          {result.metrics.aic !== undefined && <p>AIC: {result.metrics.aic}</p>}
        </div>
      )}
    </div>
  );
}

export default App;
