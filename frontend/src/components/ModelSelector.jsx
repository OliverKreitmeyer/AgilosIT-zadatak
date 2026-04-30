import { useState } from "react";

// Descriptions for each forecasting model
const modelDescriptions = {
  ma: "Simple baseline that averages the last N days and extends it forward as a flat line.",
  arima: "Statistical model that captures trends and autocorrelation. Tunable via p, d, q parameters.",
  prophet: "Meta's open-source model that automatically detects trend, seasonality, and provides confidence intervals.",
  lstm: "Neural network that learns patterns from sequences of past values. Slower but can capture complex nonlinear relationships.",
};

const modelLabels = {
  ma: "Moving Average",
  arima: "ARIMA",
  prophet: "Prophet",
  lstm: "LSTM (Neural Network)",
};

// Dropdown for choosing which forecasting model to use, with a tooltip that follows the cursor
function ModelSelector({ model, onModelChange }) {
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0 });

  function handleMouseMove(e) {
    setTooltip({ visible: true, x: e.clientX + 12, y: e.clientY + 12 });
  }

  function handleMouseLeave() {
    setTooltip({ visible: false, x: 0, y: 0 });
  }

  return (
    <div className="model-selector" style={{ position: "relative" }}>
      <label htmlFor="model-select">Model:</label>
      <select
        id="model-select"
        value={model}
        onChange={(e) => onModelChange(e.target.value)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {Object.keys(modelLabels).map((key) => (
          <option key={key} value={key}>{modelLabels[key]}</option>
        ))}
      </select>

      {tooltip.visible && modelDescriptions[model] && (
        <div
          style={{
            position: "fixed",
            left: tooltip.x,
            top: tooltip.y,
            background: "#1e3128",
            color: "#fff",
            padding: "6px 10px",
            borderRadius: "4px",
            fontSize: "0.8rem",
            maxWidth: "260px",
            pointerEvents: "none",
            zIndex: 1000,
          }}
        >
          {modelDescriptions[model]}
        </div>
      )}
    </div>
  );
}

export default ModelSelector;
