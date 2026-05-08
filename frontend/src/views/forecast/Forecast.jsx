import React, { useState, useMemo, useEffect, useCallback } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CFormSelect,
  CFormInput,
  CFormLabel,
  CAlert,
  CBadge,
  CSpinner,
} from '@coreui/react'
import { CChartLine } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import { cilMediaPlay, cilChartLine } from '@coreui/icons'
import { useData } from '../../context/DataContext'
import { useNotification } from '../../context/NotificationContext'
import {
  getModelNames,
  getDefaultParams,
  runForecast,
  METHODS,
  OPTIMIZERS,
} from '../../forecast/engine'

// Yield to the browser between heavy sync work
function runAsync(fn) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(fn())
      } catch (e) {
        reject(e)
      }
    }, 0)
  })
}

const Forecast = () => {
  const { state, dispatch } = useData()
  const { addToast } = useNotification()
  const { datasets, activeDatasetId, forecasts, runningForecast } = state

  const activeDataset = datasets.find((d) => d.id === activeDatasetId)
  const datasetForecasts = forecasts.filter((f) => f.datasetId === activeDatasetId)

  const [modelName, setModelName] = useState('Auto ARIMA')
  const [horizon, setHorizon] = useState(30)
  const [params, setParams] = useState({})
  const [error, setError] = useState('')

  const running = runningForecast?.type === 'forecast'

  const modelNames = getModelNames()

  const handleModelChange = (name) => {
    setModelName(name)
    setParams(getDefaultParams(name))
  }

  // Request notification permission on first interaction
  const requestNotificationPermission = useCallback(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const handleRun = async () => {
    if (!activeDataset) {
      setError('No dataset selected. Upload data first.')
      return
    }
    if (running) return

    setError('')
    requestNotificationPermission()

    dispatch({
      type: 'SET_RUNNING_FORECAST',
      payload: { type: 'forecast', modelName, datasetId: activeDatasetId },
    })

    try {
      const result = await runAsync(() =>
        runForecast(modelName, activeDataset.data, parseInt(horizon), params),
      )

      let predictions
      if (result.predictions.length > 0 && result.predictions[0].date) {
        predictions = result.predictions
      } else {
        const lastDate = new Date(activeDataset.data[activeDataset.data.length - 1].date)
        predictions = result.predictions.map((value, i) => {
          const date = new Date(lastDate)
          date.setDate(date.getDate() + i + 1)
          return { date: date.toISOString().split('T')[0], value }
        })
      }

      dispatch({ type: 'CLEAR_FORECASTS', payload: activeDatasetId })
      dispatch({
        type: 'ADD_FORECAST',
        payload: {
          datasetId: activeDatasetId,
          modelName,
          params: { ...params, horizon: parseInt(horizon) },
          predictions,
          metrics: result.metrics,
        },
      })

      const metricsMsg = result.metrics
        ? `RMSE: ${result.metrics.rmse.toFixed(2)}`
        : 'No test metrics'
      addToast({
        title: 'Forecast Complete',
        message: `${modelName} finished. ${metricsMsg}`,
        color: 'success',
      })
    } catch (e) {
      setError(`Forecast failed: ${e.message}`)
      addToast({
        title: 'Forecast Failed',
        message: `${modelName}: ${e.message}`,
        color: 'danger',
      })
    } finally {
      dispatch({ type: 'CLEAR_RUNNING_FORECAST' })
    }
  }

  const chartData = useMemo(() => {
    if (!activeDataset) return null

    const histLabels = activeDataset.data.map((d) => d.date)
    const histValues = activeDataset.data.map((d) => d.value)

    const chartDatasets = [
      {
        label: 'Historical',
        data: histValues,
        borderColor: '#321fdb',
        backgroundColor: 'rgba(50, 31, 219, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 0,
      },
    ]

    const colors = ['#e55353', '#2eb85c', '#f9b115', '#3399ff', '#9b59b6']
    const allLabels = [...histLabels]

    datasetForecasts.forEach((fc, idx) => {
      const predLabels = fc.predictions.map((p) => p.date)
      predLabels.forEach((l) => {
        if (!allLabels.includes(l)) allLabels.push(l)
      })

      const data = new Array(histLabels.length - 1).fill(null)
      data.push(histValues[histValues.length - 1])
      fc.predictions.forEach((p) => data.push(p.value))

      chartDatasets.push({
        label: fc.modelName,
        data,
        borderColor: colors[idx % colors.length],
        borderDash: [5, 5],
        tension: 0.3,
        pointRadius: 0,
        fill: false,
      })
    })

    return { labels: allLabels, datasets: chartDatasets }
  }, [activeDataset, datasetForecasts])

  return (
    <>
      <CRow>
        <CCol md={4}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Configuration</strong>
            </CCardHeader>
            <CCardBody>
              <div className="mb-3">
                <CFormLabel>Dataset</CFormLabel>
                <CFormSelect
                  value={activeDatasetId || ''}
                  onChange={(e) => dispatch({ type: 'SET_ACTIVE_DATASET', payload: e.target.value })}
                >
                  <option value="">Select dataset...</option>
                  {datasets.map((ds) => (
                    <option key={ds.id} value={ds.id}>
                      {ds.name} ({ds.data.length} points)
                    </option>
                  ))}
                </CFormSelect>
              </div>

              <div className="mb-3">
                <CFormLabel>Model</CFormLabel>
                <CFormSelect
                  value={modelName}
                  onChange={(e) => handleModelChange(e.target.value)}
                >
                  {modelNames.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </CFormSelect>
              </div>

              <div className="mb-3">
                <CFormLabel>Forecast Horizon (days)</CFormLabel>
                <CFormInput
                  type="number"
                  min={1}
                  max={365}
                  value={horizon}
                  onChange={(e) => setHorizon(e.target.value)}
                />
              </div>

              {Object.keys(params).length > 0 && (
                <div className="mb-3">
                  <CFormLabel className="fw-semibold">Model Parameters</CFormLabel>
                  {Object.entries(params).map(([key, val]) => {
                    const labels = {
                      p: 'p (autoregressive)',
                      d: 'd (differencing)',
                      q: 'q (moving average)',
                      maxP: 'Max p (search range)',
                      maxD: 'Max d (search range)',
                      maxQ: 'Max q (search range)',
                      alpha: 'Alpha (smoothing)',
                      beta: 'Beta (trend)',
                      windowSize: 'Window Size',
                      method: 'Fitting Method',
                      optimizer: 'Optimizer',
                      growth: 'Growth Model',
                      changepoint_prior_scale: 'Changepoint Prior Scale',
                      seasonality_prior_scale: 'Seasonality Prior Scale',
                    }
                    return (
                    <div key={key} className="mb-2">
                      <CFormLabel className="small text-body-secondary">{labels[key] || key}</CFormLabel>
                      {key === 'growth' ? (
                        <CFormSelect
                          value={val}
                          onChange={(e) =>
                            setParams({ ...params, growth: e.target.value })
                          }
                        >
                          <option value="linear">Linear</option>
                          <option value="logistic">Logistic</option>
                          <option value="flat">Flat</option>
                        </CFormSelect>
                      ) : key === 'method' ? (
                        <CFormSelect
                          value={val}
                          onChange={(e) =>
                            setParams({ ...params, method: parseInt(e.target.value) })
                          }
                        >
                          {Object.entries(METHODS).map(([k, label]) => (
                            <option key={k} value={k}>{label}</option>
                          ))}
                        </CFormSelect>
                      ) : key === 'optimizer' ? (
                        <CFormSelect
                          value={val}
                          onChange={(e) =>
                            setParams({ ...params, optimizer: parseInt(e.target.value) })
                          }
                        >
                          {Object.entries(OPTIMIZERS).map(([k, label]) => (
                            <option key={k} value={k}>{label}</option>
                          ))}
                        </CFormSelect>
                      ) : (
                        <CFormInput
                          type="number"
                          step={key === 'alpha' || key === 'beta' ? 0.05 : 1}
                          min={key === 'alpha' || key === 'beta' ? 0.01 : 0}
                          max={key === 'alpha' || key === 'beta' ? 1 : 20}
                          value={val}
                          onChange={(e) =>
                            setParams({ ...params, [key]: parseFloat(e.target.value) })
                          }
                        />
                      )}
                    </div>
                    )
                  })}
                </div>
              )}

              {error && <CAlert color="danger" className="small">{error}</CAlert>}

              <CButton color="primary" className="w-100" onClick={handleRun} disabled={running}>
                {running ? (
                  <CSpinner size="sm" className="me-2" />
                ) : (
                  <CIcon icon={cilMediaPlay} className="me-2" />
                )}
                {running ? `Running ${runningForecast?.modelName}...` : 'Run Forecast'}
              </CButton>
            </CCardBody>
          </CCard>

          {datasetForecasts.length > 0 && (
            <CCard className="mb-4">
              <CCardHeader>
                <strong>Results</strong>
              </CCardHeader>
              <CCardBody>
                {datasetForecasts.map((fc) => (
                  <div key={fc.id} className="mb-3 p-2 border rounded">
                    <div className="fw-semibold">
                      <CIcon icon={cilChartLine} className="me-1" />
                      {fc.modelName}
                    </div>
                    <div className="small text-body-secondary">
                      {fc.predictions.length} days forecast
                    </div>
                    {fc.metrics && (
                      <div className="mt-2">
                        <CBadge color="info" className="me-1">
                          RMSE: {fc.metrics.rmse.toFixed(2)}
                        </CBadge>
                        <CBadge color="warning" className="me-1">
                          MAE: {fc.metrics.mae.toFixed(2)}
                        </CBadge>
                        <CBadge color="danger">MAPE: {fc.metrics.mape.toFixed(1)}%</CBadge>
                      </div>
                    )}
                  </div>
                ))}
              </CCardBody>
            </CCard>
          )}
        </CCol>

        <CCol md={8}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>
                <CIcon icon={cilChartLine} className="me-2" />
                Forecast Chart
              </strong>
            </CCardHeader>
            <CCardBody>
              {chartData ? (
                <CChartLine
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'top' },
                      tooltip: { mode: 'index', intersect: false },
                    },
                    scales: {
                      x: {
                        ticks: {
                          maxTicksLimit: 12,
                          maxRotation: 45,
                        },
                      },
                      y: {
                        title: { display: true, text: 'Value' },
                      },
                    },
                    interaction: { mode: 'nearest', axis: 'x', intersect: false },
                  }}
                  style={{ height: '500px' }}
                />
              ) : (
                <div className="text-center text-body-secondary py-5">
                  <CIcon icon={cilChartLine} size="3xl" className="mb-3 d-block mx-auto" />
                  Upload a dataset and run a forecast to see the chart
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Forecast
