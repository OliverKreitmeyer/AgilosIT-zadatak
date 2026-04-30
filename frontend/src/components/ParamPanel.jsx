// Reusable number input with custom styled +/- buttons
function NumberInput({ value, min, onChange }) {
  function decrement() {
    const next = value - 1;
    if (min === undefined || next >= min) onChange(next);
  }
  function increment() {
    onChange(value + 1);
  }

  return (
    <div className="number-input">
      <button type="button" className="spin-btn" onClick={decrement}>-</button>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <button type="button" className="spin-btn" onClick={increment}>+</button>
    </div>
  );
}

// Shows different parameter inputs depending on which model is selected
function ParamPanel({ model, params, onParamsChange }) {
  function updateParam(key, value) {
    onParamsChange({ ...params, [key]: value });
  }

  return (
    <div className="param-panel">
      {/* Forecast days applies to all models */}
      <label>
        Forecast days:
        <NumberInput value={params.forecastDays} min={1} onChange={(v) => updateParam("forecastDays", v)} />
      </label>

      {/* Moving Average only needs the window size */}
      {model === "ma" && (
        <label>
          Window size:
          <NumberInput value={params.maWindow} min={2} onChange={(v) => updateParam("maWindow", v)} />
        </label>
      )}

      {/* ARIMA needs p, d, q parameters */}
      {model === "arima" && (
        <>
          <label>
            p:
            <NumberInput value={params.p} min={0} onChange={(v) => updateParam("p", v)} />
          </label>
          <label>
            d:
            <NumberInput value={params.d} min={0} onChange={(v) => updateParam("d", v)} />
          </label>
          <label>
            q:
            <NumberInput value={params.q} min={0} onChange={(v) => updateParam("q", v)} />
          </label>
        </>
      )}

      {/* Prophet has no user-configurable parameters */}
      {model === "prophet" && (
        <p>Prophet automatically detects trend and seasonality.</p>
      )}

      {/* LSTM parameters: sequence length, hidden layer size, training epochs */}
      {model === "lstm" && (
        <>
          <label>
            Sequence length:
            <NumberInput value={params.seqLength} min={2} onChange={(v) => updateParam("seqLength", v)} />
          </label>
          <label>
            Hidden size:
            <NumberInput value={params.hiddenSize} min={10} onChange={(v) => updateParam("hiddenSize", v)} />
          </label>
          <label>
            Epochs:
            <NumberInput value={params.epochs} min={10} onChange={(v) => updateParam("epochs", v)} />
          </label>
        </>
      )}
    </div>
  );
}

export default ParamPanel;
