import React, { useState } from 'react'
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
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CBadge,
  CSpinner,
  CFormCheck,
} from '@coreui/react'
import { CChartLine, CChartBar } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import { cilBalanceScale, cilChartLine } from '@coreui/icons'
import { useData } from '../../context/DataContext'
import { getModelNames, runForecast } from '../../forecast/engine'

const Compare = () => {
  const { state, dispatch } = useData()
  const { datasets, activeDatasetId } = state

  const activeDataset = datasets.find((d) => d.id === activeDatasetId)
  const modelNames = getModelNames()

  const [selectedModels, setSelectedModels] = useState(['Moving Average', 'ARIMA', 'Auto ARIMA'])
  const [horizon, setHorizon] = useState(30)
  const [results, setResults] = useState([])
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')

  const toggleModel = (name) => {
    setSelectedModels((prev) =>
      prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name],
    )
  }

  const handleCompare = async () => {
    if (!activeDataset) {
      setError('No dataset selected')
      return
    }
    if (selectedModels.length < 2) {
      setError('Select at least 2 models to compare')
      return
    }
    setError('')
    setRunning(true)

    try {
      const lastDate = new Date(activeDataset.data[activeDataset.data.length - 1].date)

      const newResults = await Promise.all(
        selectedModels.map(async (modelName) => {
          try {
            const result = await runForecast(modelName, activeDataset.data, parseInt(horizon))

            let predictions
            if (result.predictions.length > 0 && result.predictions[0].date) {
              predictions = result.predictions
            } else {
              predictions = result.predictions.map((value, i) => {
                const date = new Date(lastDate)
                date.setDate(date.getDate() + i + 1)
                return { date: date.toISOString().split('T')[0], value }
              })
            }

            return { modelName, predictions, metrics: result.metrics, error: null }
          } catch (e) {
            return { modelName, predictions: [], metrics: null, error: e.message }
          }
        }),
      )

      setResults(newResults)

      newResults
        .filter((r) => !r.error)
        .forEach((r) => {
          dispatch({
            type: 'ADD_FORECAST',
            payload: {
              datasetId: activeDatasetId,
              modelName: r.modelName,
              params: { horizon: parseInt(horizon) },
              predictions: r.predictions,
              metrics: r.metrics,
            },
          })
        })
    } catch (e) {
      setError(`Comparison failed: ${e.message}`)
    } finally {
      setRunning(false)
    }
  }

  const colors = ['#321fdb', '#e55353', '#2eb85c', '#f9b115', '#9b59b6']

  const chartData =
    activeDataset && results.length > 0
      ? (() => {
          const histLabels = activeDataset.data.map((d) => d.date)
          const histValues = activeDataset.data.map((d) => d.value)
          const allLabels = [...histLabels]

          const chartDatasets = [
            {
              label: 'Historical',
              data: histValues,
              borderColor: '#636f83',
              backgroundColor: 'rgba(99, 111, 131, 0.1)',
              fill: true,
              tension: 0.3,
              pointRadius: 0,
            },
          ]

          results
            .filter((r) => !r.error)
            .forEach((r, idx) => {
              r.predictions.forEach((p) => {
                if (!allLabels.includes(p.date)) allLabels.push(p.date)
              })

              const data = new Array(histLabels.length - 1).fill(null)
              data.push(histValues[histValues.length - 1])
              r.predictions.forEach((p) => data.push(p.value))

              chartDatasets.push({
                label: r.modelName,
                data,
                borderColor: colors[idx % colors.length],
                borderDash: [5, 5],
                tension: 0.3,
                pointRadius: 0,
                fill: false,
              })
            })

          return { labels: allLabels, datasets: chartDatasets }
        })()
      : null

  const metricsChartData =
    results.filter((r) => r.metrics).length > 0
      ? {
          labels: results.filter((r) => r.metrics).map((r) => r.modelName),
          datasets: [
            {
              label: 'RMSE',
              data: results.filter((r) => r.metrics).map((r) => r.metrics.rmse),
              backgroundColor: 'rgba(50, 31, 219, 0.7)',
            },
            {
              label: 'MAE',
              data: results.filter((r) => r.metrics).map((r) => r.metrics.mae),
              backgroundColor: 'rgba(229, 83, 83, 0.7)',
            },
          ],
        }
      : null

  const bestModel = results
    .filter((r) => r.metrics)
    .sort((a, b) => a.metrics.rmse - b.metrics.rmse)[0]

  return (
    <>
      <CRow>
        <CCol md={4}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Compare Models</strong>
            </CCardHeader>
            <CCardBody>
              <div className="mb-3">
                <CFormLabel>Dataset</CFormLabel>
                <CFormSelect
                  value={activeDatasetId || ''}
                  onChange={(e) =>
                    dispatch({ type: 'SET_ACTIVE_DATASET', payload: e.target.value })
                  }
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
                <CFormLabel>Forecast Horizon (days)</CFormLabel>
                <CFormInput
                  type="number"
                  min={1}
                  max={365}
                  value={horizon}
                  onChange={(e) => setHorizon(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <CFormLabel className="fw-semibold">Select Models</CFormLabel>
                {modelNames.map((m) => (
                  <CFormCheck
                    key={m}
                    id={`model-${m}`}
                    label={m}
                    checked={selectedModels.includes(m)}
                    onChange={() => toggleModel(m)}
                    className="mb-1"
                  />
                ))}
              </div>

              {error && <CAlert color="danger" className="small">{error}</CAlert>}

              <CButton color="primary" className="w-100" onClick={handleCompare} disabled={running}>
                {running ? (
                  <CSpinner size="sm" className="me-2" />
                ) : (
                  <CIcon icon={cilBalanceScale} className="me-2" />
                )}
                Compare All
              </CButton>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol md={8}>
          {bestModel && (
            <CAlert color="success" className="mb-4">
              <strong>Best Model:</strong> {bestModel.modelName} with RMSE{' '}
              {bestModel.metrics.rmse.toFixed(2)}
            </CAlert>
          )}

          {chartData && (
            <CCard className="mb-4">
              <CCardHeader>
                <strong>
                  <CIcon icon={cilChartLine} className="me-2" />
                  Forecast Comparison
                </strong>
              </CCardHeader>
              <CCardBody>
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
                      x: { ticks: { maxTicksLimit: 12, maxRotation: 45 } },
                      y: { title: { display: true, text: 'Value' } },
                    },
                    interaction: { mode: 'nearest', axis: 'x', intersect: false },
                  }}
                  style={{ height: '400px' }}
                />
              </CCardBody>
            </CCard>
          )}

          {results.length > 0 && (
            <CRow>
              <CCol md={metricsChartData ? 6 : 12}>
                <CCard className="mb-4">
                  <CCardHeader>
                    <strong>Error Metrics</strong>
                  </CCardHeader>
                  <CCardBody>
                    <CTable hover striped responsive>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>Model</CTableHeaderCell>
                          <CTableHeaderCell>RMSE</CTableHeaderCell>
                          <CTableHeaderCell>MAE</CTableHeaderCell>
                          <CTableHeaderCell>MAPE</CTableHeaderCell>
                          <CTableHeaderCell></CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {results.map((r) => (
                          <CTableRow key={r.modelName}>
                            <CTableDataCell className="fw-semibold">{r.modelName}</CTableDataCell>
                            {r.metrics ? (
                              <>
                                <CTableDataCell>{r.metrics.rmse.toFixed(2)}</CTableDataCell>
                                <CTableDataCell>{r.metrics.mae.toFixed(2)}</CTableDataCell>
                                <CTableDataCell>{r.metrics.mape.toFixed(1)}%</CTableDataCell>
                                <CTableDataCell>
                                  {r === bestModel && (
                                    <CBadge color="success">Best</CBadge>
                                  )}
                                </CTableDataCell>
                              </>
                            ) : (
                              <CTableDataCell colSpan={4}>
                                {r.error ? (
                                  <CBadge color="danger">Error</CBadge>
                                ) : (
                                  <span className="text-body-secondary">
                                    Not enough data for metrics
                                  </span>
                                )}
                              </CTableDataCell>
                            )}
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  </CCardBody>
                </CCard>
              </CCol>

              {metricsChartData && (
                <CCol md={6}>
                  <CCard className="mb-4">
                    <CCardHeader>
                      <strong>Metrics Comparison</strong>
                    </CCardHeader>
                    <CCardBody>
                      <CChartBar
                        data={metricsChartData}
                        options={{
                          responsive: true,
                          plugins: { legend: { position: 'top' } },
                        }}
                      />
                    </CCardBody>
                  </CCard>
                </CCol>
              )}
            </CRow>
          )}
        </CCol>
      </CRow>
    </>
  )
}

export default Compare
