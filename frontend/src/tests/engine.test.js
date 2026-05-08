import { describe, it, expect } from 'vitest'
import {
  calcMetrics,
  runMovingAverage,
  runExponentialSmoothing,
  runDoubleExponentialSmoothing,
  getModelNames,
  getDefaultParams,
} from '../forecast/engine'

// --- calcMetrics ---

describe('calcMetrics', () => {
  it('returns zero error for identical arrays', () => {
    const m = calcMetrics([1, 2, 3], [1, 2, 3])
    expect(m.rmse).toBe(0)
    expect(m.mae).toBe(0)
    expect(m.mape).toBe(0)
  })

  it('computes correct RMSE', () => {
    // errors: 1, -1 → squared: 1, 1 → mean: 1 → sqrt: 1
    const m = calcMetrics([10, 20], [9, 21])
    expect(m.rmse).toBe(1)
  })

  it('computes correct MAE', () => {
    const m = calcMetrics([10, 20], [8, 23])
    // |2| + |3| = 5, /2 = 2.5
    expect(m.mae).toBe(2.5)
  })

  it('computes correct MAPE', () => {
    const m = calcMetrics([100, 200], [90, 220])
    // |10/100| + |20/200| = 0.1 + 0.1 = 0.2, /2 = 0.1, *100 = 10%
    expect(m.mape).toBe(10)
  })

  it('handles mismatched lengths by using the shorter', () => {
    const m = calcMetrics([1, 2, 3, 4], [1, 2])
    expect(m.rmse).toBe(0)
    expect(m.mae).toBe(0)
  })

  it('skips zero actuals in MAPE calculation', () => {
    const m = calcMetrics([0, 10], [5, 10])
    // only second point contributes to MAPE: |0/10| = 0, but first is skipped
    // sumAbsPctErr = 0 (from second), n = 2 → MAPE = 0
    expect(m.mape).toBe(0)
  })
})

// --- Moving Average ---

describe('runMovingAverage', () => {
  it('produces the correct number of predictions', () => {
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const preds = runMovingAverage(values, 5, { windowSize: 3 })
    expect(preds).toHaveLength(5)
  })

  it('first prediction is the mean of the last window', () => {
    const values = [10, 20, 30]
    const preds = runMovingAverage(values, 1, { windowSize: 3 })
    expect(preds[0]).toBe(20)
  })

  it('uses default windowSize of 5', () => {
    const values = [2, 4, 6, 8, 10]
    const preds = runMovingAverage(values, 1, {})
    expect(preds[0]).toBe(6) // mean of [2,4,6,8,10]
  })

  it('converges to a flat line for constant input', () => {
    const values = [5, 5, 5, 5, 5]
    const preds = runMovingAverage(values, 10, { windowSize: 3 })
    preds.forEach((p) => expect(p).toBe(5))
  })
})

// --- Exponential Smoothing ---

describe('runExponentialSmoothing', () => {
  it('produces the correct number of predictions', () => {
    const values = [1, 2, 3, 4, 5]
    const preds = runExponentialSmoothing(values, 7, { alpha: 0.5 })
    expect(preds).toHaveLength(7)
  })

  it('all predictions are the same value (flat forecast)', () => {
    const values = [10, 20, 30, 40, 50]
    const preds = runExponentialSmoothing(values, 3, { alpha: 0.3 })
    expect(preds[0]).toBe(preds[1])
    expect(preds[1]).toBe(preds[2])
  })

  it('with alpha=1, prediction equals last observed value', () => {
    const values = [10, 20, 30, 40, 50]
    const preds = runExponentialSmoothing(values, 1, { alpha: 1 })
    expect(preds[0]).toBe(50)
  })

  it('with alpha=0, prediction equals first observed value', () => {
    const values = [10, 20, 30, 40, 50]
    const preds = runExponentialSmoothing(values, 1, { alpha: 0 })
    expect(preds[0]).toBe(10)
  })
})

// --- Double Exponential Smoothing ---

describe('runDoubleExponentialSmoothing', () => {
  it('produces the correct number of predictions', () => {
    const values = [1, 2, 3, 4, 5]
    const preds = runDoubleExponentialSmoothing(values, 4, { alpha: 0.3, beta: 0.1 })
    expect(preds).toHaveLength(4)
  })

  it('captures upward trend', () => {
    const values = [10, 20, 30, 40, 50]
    const preds = runDoubleExponentialSmoothing(values, 3, { alpha: 0.5, beta: 0.5 })
    // predictions should be increasing
    expect(preds[1]).toBeGreaterThan(preds[0])
    expect(preds[2]).toBeGreaterThan(preds[1])
  })

  it('captures downward trend', () => {
    const values = [50, 40, 30, 20, 10]
    const preds = runDoubleExponentialSmoothing(values, 3, { alpha: 0.5, beta: 0.5 })
    expect(preds[1]).toBeLessThan(preds[0])
    expect(preds[2]).toBeLessThan(preds[1])
  })
})

// --- Model registry ---

describe('getModelNames', () => {
  it('returns all model names', () => {
    const names = getModelNames()
    expect(names).toContain('Moving Average')
    expect(names).toContain('Exponential Smoothing')
    expect(names).toContain('Double Exp. Smoothing')
    expect(names).toContain('ARIMA')
    expect(names).toContain('Auto ARIMA')
    expect(names).toContain('Prophet')
  })
})

describe('getDefaultParams', () => {
  it('returns default params for Moving Average', () => {
    const params = getDefaultParams('Moving Average')
    expect(params).toEqual({ windowSize: 5 })
  })

  it('returns default params for Exponential Smoothing', () => {
    const params = getDefaultParams('Exponential Smoothing')
    expect(params).toEqual({ alpha: 0.3 })
  })

  it('returns a copy, not a reference', () => {
    const a = getDefaultParams('Moving Average')
    const b = getDefaultParams('Moving Average')
    a.windowSize = 999
    expect(b.windowSize).toBe(5)
  })

  it('returns empty object for unknown model', () => {
    const params = getDefaultParams('NonExistent')
    expect(params).toEqual({})
  })
})
