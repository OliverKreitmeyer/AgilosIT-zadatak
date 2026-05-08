import React, { useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilChartLine, cilFile, cilUser } from '@coreui/icons'
import { useData } from '../../context/DataContext'

const Settings = () => {
  const { state, dispatch } = useData()
  const { datasets, forecasts, user } = state

  const [confirmAction, setConfirmAction] = useState(null)

  const forecastCount = forecasts.length
  const datasetCount = datasets.length

  const handleClearForecasts = () => {
    dispatch({ type: 'CLEAR_ALL_FORECASTS' })
    setConfirmAction(null)
  }

  const handleClearAll = () => {
    dispatch({ type: 'CLEAR_ALL_FORECASTS' })
    datasets.forEach((ds) => dispatch({ type: 'DELETE_DATASET', payload: ds.id }))
    setConfirmAction(null)
  }

  return (
    <CRow>
      <CCol md={8} lg={6}>
        {user && (
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Account</strong>
            </CCardHeader>
            <CCardBody>
              <div className="d-flex align-items-center">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="rounded-circle me-3"
                    width={48}
                    height={48}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                    style={{ width: 48, height: 48 }}
                  >
                    <CIcon icon={cilUser} size="lg" />
                  </div>
                )}
                <div>
                  <h6 className="mb-0">{user.name}</h6>
                  <span className="text-body-secondary small">{user.email}</span>
                </div>
              </div>
            </CCardBody>
          </CCard>
        )}

        <CCard className="mb-4">
          <CCardHeader>
            <strong>Data Management</strong>
          </CCardHeader>
          <CCardBody>
            <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
              <div>
                <h6 className="mb-1">
                  <CIcon icon={cilChartLine} className="me-2" />
                  Clear Forecast Stats
                </h6>
                <p className="text-body-secondary small mb-0">
                  Remove all forecast results and metrics ({forecastCount} forecast
                  {forecastCount !== 1 && 's'}). Uploaded datasets will be kept.
                </p>
              </div>
              <div className="ms-3 flex-shrink-0">
                {confirmAction === 'forecasts' ? (
                  <div className="d-flex gap-2">
                    <CButton color="danger" size="sm" onClick={handleClearForecasts}>
                      Confirm
                    </CButton>
                    <CButton
                      color="secondary"
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmAction(null)}
                    >
                      Cancel
                    </CButton>
                  </div>
                ) : (
                  <CButton
                    color="warning"
                    size="sm"
                    disabled={forecastCount === 0}
                    onClick={() => setConfirmAction('forecasts')}
                  >
                    <CIcon icon={cilTrash} className="me-1" />
                    Clear Stats
                  </CButton>
                )}
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="mb-1">
                  <CIcon icon={cilFile} className="me-2" />
                  Clear All Data
                </h6>
                <p className="text-body-secondary small mb-0">
                  Remove everything — {datasetCount} dataset{datasetCount !== 1 && 's'} and{' '}
                  {forecastCount} forecast{forecastCount !== 1 && 's'}. This cannot be undone.
                </p>
              </div>
              <div className="ms-3 flex-shrink-0">
                {confirmAction === 'all' ? (
                  <div className="d-flex gap-2">
                    <CButton color="danger" size="sm" onClick={handleClearAll}>
                      Confirm
                    </CButton>
                    <CButton
                      color="secondary"
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmAction(null)}
                    >
                      Cancel
                    </CButton>
                  </div>
                ) : (
                  <CButton
                    color="danger"
                    size="sm"
                    disabled={datasetCount === 0 && forecastCount === 0}
                    onClick={() => setConfirmAction('all')}
                  >
                    <CIcon icon={cilTrash} className="me-1" />
                    Clear All Data
                  </CButton>
                )}
              </div>
            </div>

            {confirmAction && (
              <CAlert color="warning" className="mt-3 mb-0 small">
                Are you sure? This action cannot be undone.
              </CAlert>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Settings
