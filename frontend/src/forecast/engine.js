import ARIMA from 'arima'

// --- Utility functions ---

function mean(arr) {
  return arr.reduce((s, v) => s + v, 0) / arr.length
}

export function calcMetrics(actual, predicted) {
  const n = Math.min(actual.length, predicted.length)
  let sumSqErr = 0
  let sumAbsErr = 0
  let sumAbsPctErr = 0
  for (let i = 0; i < n; i++) {
    const err = actual[i] - predicted[i]
    sumSqErr += err * err
    sumAbsErr += Math.abs(err)
    if (actual[i] !== 0) sumAbsPctErr += Math.abs(err / actual[i])
  }
  return {
    rmse: Math.sqrt(sumSqErr / n),
    mae: sumAbsErr / n,
    mape: (sumAbsPctErr / n) * 100,
  }
}

// --- Models ---

export function runMovingAverage(values, horizon, params) {
  const { windowSize = 5 } = params
  const predictions = []
  const extended = [...values]
  for (let i = 0; i < horizon; i++) {
    const window = extended.slice(-windowSize)
    const avg = mean(window)
    predictions.push(avg)
    extended.push(avg)
  }
  return predictions
}

export function runExponentialSmoothing(values, horizon, params) {
  const { alpha = 0.3 } = params
  let last = values[0]
  for (let i = 1; i < values.length; i++) {
    last = alpha * values[i] + (1 - alpha) * last
  }
  const predictions = []
  for (let i = 0; i < horizon; i++) {
    predictions.push(last)
  }
  return predictions
}

export function runDoubleExponentialSmoothing(values, horizon, params) {
  const { alpha = 0.3, beta = 0.1 } = params
  let level = values[0]
  let trend = values[1] - values[0]
  for (let i = 1; i < values.length; i++) {
    const newLevel = alpha * values[i] + (1 - alpha) * (level + trend)
    const newTrend = beta * (newLevel - level) + (1 - beta) * trend
    level = newLevel
    trend = newTrend
  }
  const predictions = []
  for (let i = 1; i <= horizon; i++) {
    predictions.push(level + i * trend)
  }
  return predictions
}

// method: 0 = Exact Maximum Likelihood (default), 1 = Conditional Sum of Squares, 2 = Box-Jenkins
// optimizer: 0 = Nelder-Mead, 5 = BFGS, 6 = L-BFGS (default)
export function runArima(values, horizon, params) {
  const { p = 2, d = 1, q = 2, method = 0, optimizer = 6 } = params
  const arima = new ARIMA({ p, d, q, method, optimizer, verbose: false })
  arima.train(values)
  const [pred] = arima.predict(horizon)
  return pred
}

export function runAutoArima(values, horizon, params) {
  const { method = 0, optimizer = 6, maxP = 5, maxD = 2, maxQ = 5 } = params

  // Grid search over (p, d, q) combinations, pick the one with lowest in-sample error
  // We hold out the last 10% as a quick validation set
  const holdout = Math.max(5, Math.floor(values.length * 0.1))
  const trainVals = values.slice(0, -holdout)
  const testVals = values.slice(-holdout)

  let bestScore = Infinity
  let bestOrder = { p: 1, d: 1, q: 1 }

  for (let d = 0; d <= maxD; d++) {
    for (let p = 0; p <= maxP; p++) {
      for (let q = 0; q <= maxQ; q++) {
        if (p === 0 && q === 0) continue
        try {
          const arima = new ARIMA({ p, d, q, method, optimizer, verbose: false })
          arima.train(trainVals)
          const [testPred] = arima.predict(holdout)
          const score = calcMetrics(testVals, testPred).rmse
          if (isFinite(score) && score < bestScore) {
            bestScore = score
            bestOrder = { p, d, q }
          }
        } catch {
          // Some combinations fail to converge — skip them
        }
      }
    }
  }

  // Run best model on full data
  const arima = new ARIMA({ ...bestOrder, method, optimizer, verbose: false })
  arima.train(values)
  const [pred] = arima.predict(horizon)
  return pred
}

// --- Prophet (backend) ---

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001'

export async function runProphet(dates, values, horizon, params) {
  const {
    growth = 'linear',
    changepoint_prior_scale = 0.05,
    seasonality_prior_scale = 10.0,
  } = params

  const res = await fetch(`${API_URL}/api/forecast/prophet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dates,
      values,
      horizon,
      growth,
      changepoint_prior_scale,
      seasonality_prior_scale,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Prophet API error: ${text}`)
  }

  return res.json()
}

// --- Model registry ---

// Method names for display in UI
export const METHODS = {
  0: 'Maximum Likelihood',
  1: 'Conditional Sum of Squares',
  2: 'Box-Jenkins',
}

export const OPTIMIZERS = {
  0: 'Nelder-Mead',
  5: 'BFGS',
  6: 'L-BFGS (default)',
}

const MODELS = {
  'Moving Average': {
    run: runMovingAverage,
    defaultParams: { windowSize: 5 },
  },
  'Exponential Smoothing': {
    run: runExponentialSmoothing,
    defaultParams: { alpha: 0.3 },
  },
  'Double Exp. Smoothing': {
    run: runDoubleExponentialSmoothing,
    defaultParams: { alpha: 0.3, beta: 0.1 },
  },
  ARIMA: {
    run: runArima,
    defaultParams: { p: 2, d: 1, q: 2, method: 0, optimizer: 6 },
  },
  'Auto ARIMA': {
    run: runAutoArima,
    defaultParams: { method: 0, optimizer: 6, maxP: 5, maxD: 2, maxQ: 5 },
  },
  Prophet: {
    async: true,
    defaultParams: { growth: 'linear', changepoint_prior_scale: 0.05, seasonality_prior_scale: 10.0 },
  },
}

export function getModelNames() {
  return Object.keys(MODELS)
}

export function getDefaultParams(modelName) {
  return { ...MODELS[modelName]?.defaultParams }
}

export async function runForecast(modelName, data, horizon, params = {}) {
  const model = MODELS[modelName]
  if (!model) throw new Error(`Unknown model: ${modelName}`)

  const merged = { ...model.defaultParams, ...params }
  const values = data.map((d) => d.value)

  // Prophet runs on the backend with its own train/test split
  if (model.async) {
    const dates = data.map((d) => d.date)
    const result = await runProphet(dates, values, horizon, merged)
    return {
      predictions: result.predictions.map((p) => ({ date: p.date, value: p.value })),
      metrics: result.metrics,
    }
  }

  // Client-side models
  const hasTestSet = values.length > horizon + 10
  const trainValues = hasTestSet ? values.slice(0, -horizon) : values
  const testValues = hasTestSet ? values.slice(-horizon) : null

  const predictions = model.run(trainValues, horizon, merged)

  let metrics = null
  if (testValues) {
    metrics = calcMetrics(testValues, predictions)
  }

  const futurePredictions = model.run(values, horizon, merged)

  return { predictions: futurePredictions, metrics }
}

export default MODELS
