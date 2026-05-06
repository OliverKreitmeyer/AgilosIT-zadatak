import React from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CWidgetStatsF,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilCloudUpload,
  cilChartLine,
  cilBalanceScale,
  cilFile,
} from '@coreui/icons'
import { CChartLine } from '@coreui/react-chartjs'
import { useData } from '../../context/DataContext'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const { state } = useData()
  const { datasets, activeDatasetId, forecasts } = state
  const navigate = useNavigate()

  const activeDataset = datasets.find((d) => d.id === activeDatasetId)
  const totalForecasts = forecasts.length
  const bestForecast = forecasts
    .filter((f) => f.metrics)
    .sort((a, b) => a.metrics.rmse - b.metrics.rmse)[0]

  return (
    <>
      <CRow className="mb-4">
        <CCol sm={6} lg={3}>
          <CWidgetStatsF
            className="mb-3"
            icon={<CIcon icon={cilFile} height={24} />}
            title="Datasets"
            value={datasets.length}
            color="primary"
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <CWidgetStatsF
            className="mb-3"
            icon={<CIcon icon={cilChartLine} height={24} />}
            title="Forecasts Run"
            value={totalForecasts}
            color="info"
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <CWidgetStatsF
            className="mb-3"
            icon={<CIcon icon={cilBalanceScale} height={24} />}
            title="Best RMSE"
            value={bestForecast ? bestForecast.metrics.rmse.toFixed(2) : '—'}
            color="success"
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <CWidgetStatsF
            className="mb-3"
            icon={<CIcon icon={cilChartLine} height={24} />}
            title="Best Model"
            value={bestForecast ? bestForecast.modelName : '—'}
            color="warning"
          />
        </CCol>
      </CRow>

      {activeDataset ? (
        <CRow>
          <CCol xs={12}>
            <CCard className="mb-4">
              <CCardHeader className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>Active Dataset: {activeDataset.name}</strong>
                  <span className="ms-2 text-body-secondary small">
                    {activeDataset.data.length} data points
                  </span>
                </div>
                <CButton color="primary" size="sm" onClick={() => navigate('/forecast')}>
                  <CIcon icon={cilChartLine} className="me-1" />
                  Run Forecast
                </CButton>
              </CCardHeader>
              <CCardBody>
                <CChartLine
                  data={{
                    labels: activeDataset.data.map((d) => d.date),
                    datasets: [
                      {
                        label: 'Historical Data',
                        data: activeDataset.data.map((d) => d.value),
                        borderColor: '#321fdb',
                        backgroundColor: 'rgba(50, 31, 219, 0.1)',
                        fill: true,
                        tension: 0.3,
                        pointRadius: 0,
                      },
                    ],
                  }}
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
                  }}
                  style={{ height: '350px' }}
                />
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      ) : (
        <CRow>
          <CCol xs={12}>
            <CCard className="mb-4">
              <CCardBody className="text-center py-5">
                <CIcon icon={cilCloudUpload} size="3xl" className="text-body-secondary mb-3" />
                <h5>Get Started</h5>
                <p className="text-body-secondary">
                  Upload a CSV file with historical consumption data to begin forecasting
                </p>
                <CButton color="primary" onClick={() => navigate('/upload')}>
                  <CIcon icon={cilCloudUpload} className="me-2" />
                  Upload Dataset
                </CButton>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      )}

      <CRow>
        <CCol md={4}>
          <CCard
            className="mb-4 text-center"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/upload')}
          >
            <CCardBody className="py-4">
              <CIcon icon={cilCloudUpload} size="xl" className="text-primary mb-2" />
              <h6>1. Upload Data</h6>
              <p className="small text-body-secondary mb-0">
                Import your CSV with dates and values
              </p>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={4}>
          <CCard
            className="mb-4 text-center"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/forecast')}
          >
            <CCardBody className="py-4">
              <CIcon icon={cilChartLine} size="xl" className="text-info mb-2" />
              <h6>2. Run Forecast</h6>
              <p className="small text-body-secondary mb-0">
                Choose a model and predict future values
              </p>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={4}>
          <CCard
            className="mb-4 text-center"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/compare')}
          >
            <CCardBody className="py-4">
              <CIcon icon={cilBalanceScale} size="xl" className="text-success mb-2" />
              <h6>3. Compare Models</h6>
              <p className="small text-body-secondary mb-0">
                Find the best model for your data
              </p>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Dashboard
