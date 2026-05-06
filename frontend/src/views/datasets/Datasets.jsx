import React from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilChartLine, cilCloudUpload } from '@coreui/icons'
import { useData } from '../../context/DataContext'
import { useNavigate } from 'react-router-dom'

const Datasets = () => {
  const { state, dispatch } = useData()
  const { datasets, activeDatasetId, forecasts } = state
  const navigate = useNavigate()

  const getForecastCount = (datasetId) => forecasts.filter((f) => f.datasetId === datasetId).length

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Uploaded Datasets</strong>
            <CButton color="primary" size="sm" onClick={() => navigate('/upload')}>
              <CIcon icon={cilCloudUpload} className="me-1" />
              Upload New
            </CButton>
          </CCardHeader>
          <CCardBody>
            {datasets.length === 0 ? (
              <div className="text-center text-body-secondary py-5">
                <CIcon icon={cilCloudUpload} size="3xl" className="mb-3 d-block mx-auto" />
                <p>No datasets uploaded yet</p>
                <CButton color="primary" onClick={() => navigate('/upload')}>
                  Upload Your First Dataset
                </CButton>
              </div>
            ) : (
              <CTable hover responsive align="middle">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Name</CTableHeaderCell>
                    <CTableHeaderCell>Data Points</CTableHeaderCell>
                    <CTableHeaderCell>Date Range</CTableHeaderCell>
                    <CTableHeaderCell>Uploaded</CTableHeaderCell>
                    <CTableHeaderCell>Forecasts</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell></CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {datasets.map((ds) => (
                    <CTableRow key={ds.id}>
                      <CTableDataCell className="fw-semibold">{ds.name}</CTableDataCell>
                      <CTableDataCell>{ds.data.length}</CTableDataCell>
                      <CTableDataCell className="small">
                        {ds.data[0]?.date} — {ds.data[ds.data.length - 1]?.date}
                      </CTableDataCell>
                      <CTableDataCell className="small text-body-secondary">
                        {new Date(ds.uploadedAt).toLocaleDateString()}
                      </CTableDataCell>
                      <CTableDataCell>
                        {getForecastCount(ds.id) > 0 ? (
                          <CBadge color="info">{getForecastCount(ds.id)}</CBadge>
                        ) : (
                          <span className="text-body-secondary">—</span>
                        )}
                      </CTableDataCell>
                      <CTableDataCell>
                        {ds.id === activeDatasetId ? (
                          <CBadge color="success">Active</CBadge>
                        ) : (
                          <CButton
                            color="light"
                            size="sm"
                            onClick={() =>
                              dispatch({ type: 'SET_ACTIVE_DATASET', payload: ds.id })
                            }
                          >
                            Set Active
                          </CButton>
                        )}
                      </CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          color="primary"
                          variant="ghost"
                          size="sm"
                          className="me-1"
                          onClick={() => {
                            dispatch({ type: 'SET_ACTIVE_DATASET', payload: ds.id })
                            navigate('/forecast')
                          }}
                        >
                          <CIcon icon={cilChartLine} />
                        </CButton>
                        <CButton
                          color="danger"
                          variant="ghost"
                          size="sm"
                          onClick={() => dispatch({ type: 'DELETE_DATASET', payload: ds.id })}
                        >
                          <CIcon icon={cilTrash} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Datasets
