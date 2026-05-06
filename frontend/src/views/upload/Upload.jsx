import React, { useState, useRef } from 'react'
import Papa from 'papaparse'
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
  CAlert,
  CFormSelect,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCloudUpload, cilCheckCircle } from '@coreui/icons'
import { useData } from '../../context/DataContext'
import { useNavigate } from 'react-router-dom'

const Upload = () => {
  const { dispatch } = useData()
  const navigate = useNavigate()
  const fileInputRef = useRef()
  const [preview, setPreview] = useState(null)
  const [headers, setHeaders] = useState([])
  const [dateCol, setDateCol] = useState('')
  const [valueCol, setValueCol] = useState('')
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setError('')
    setSuccess('')
    setFileName(file.name)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError(`Parse error: ${results.errors[0].message}`)
          return
        }
        if (results.data.length === 0) {
          setError('File is empty')
          return
        }
        setHeaders(results.meta.fields)
        setPreview(results.data)

        // Auto-detect columns
        const fields = results.meta.fields.map((f) => f.toLowerCase())
        const dateIdx = fields.findIndex(
          (f) => f.includes('date') || f.includes('datum') || f.includes('time'),
        )
        const valueIdx = fields.findIndex(
          (f) =>
            f.includes('value') ||
            f.includes('potrošnja') ||
            f.includes('potrosnja') ||
            f.includes('consumption') ||
            f.includes('amount') ||
            f.includes('spend'),
        )
        if (dateIdx >= 0) setDateCol(results.meta.fields[dateIdx])
        if (valueIdx >= 0) setValueCol(results.meta.fields[valueIdx])
      },
    })
  }

  const handleImport = () => {
    if (!dateCol || !valueCol) {
      setError('Please select both a date column and a value column')
      return
    }

    const data = preview
      .map((row) => ({
        date: row[dateCol],
        value: parseFloat(row[valueCol]),
      }))
      .filter((row) => row.date && !isNaN(row.value))
      .sort((a, b) => new Date(a.date) - new Date(b.date))

    if (data.length < 5) {
      setError('Need at least 5 valid data points')
      return
    }

    dispatch({ type: 'ADD_DATASET', payload: { name: fileName, data } })
    setSuccess(`Imported ${data.length} data points from "${fileName}"`)
    setPreview(null)
    setHeaders([])
    setDateCol('')
    setValueCol('')
  }

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Upload Dataset</strong>
              <small className="ms-2 text-body-secondary">CSV file with date and value columns</small>
            </CCardHeader>
            <CCardBody>
              {error && <CAlert color="danger">{error}</CAlert>}
              {success && (
                <CAlert color="success">
                  <CIcon icon={cilCheckCircle} className="me-2" />
                  {success}
                  <CButton
                    color="success"
                    variant="ghost"
                    size="sm"
                    className="ms-3"
                    onClick={() => navigate('/forecast')}
                  >
                    Go to Forecast →
                  </CButton>
                </CAlert>
              )}

              <div
                className="border border-dashed rounded p-5 text-center"
                style={{ borderStyle: 'dashed', cursor: 'pointer' }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const file = e.dataTransfer.files[0]
                  if (file) {
                    const dt = new DataTransfer()
                    dt.items.add(file)
                    fileInputRef.current.files = dt.files
                    handleFile({ target: { files: [file] } })
                  }
                }}
              >
                <CIcon icon={cilCloudUpload} size="3xl" className="text-body-secondary mb-3" />
                <div className="text-body-secondary">
                  <strong>Click to upload</strong> or drag and drop
                </div>
                <div className="small text-body-secondary mt-1">CSV files only</div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="d-none"
                  onChange={handleFile}
                />
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {preview && (
        <CRow>
          <CCol xs={12}>
            <CCard className="mb-4">
              <CCardHeader>
                <strong>Preview</strong>
                <small className="ms-2 text-body-secondary">
                  {preview.length} rows — {fileName}
                </small>
              </CCardHeader>
              <CCardBody>
                <CRow className="mb-3">
                  <CCol md={4}>
                    <label className="form-label fw-semibold">Date Column</label>
                    <CFormSelect
                      value={dateCol}
                      onChange={(e) => setDateCol(e.target.value)}
                    >
                      <option value="">Select...</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                  <CCol md={4}>
                    <label className="form-label fw-semibold">Value Column</label>
                    <CFormSelect
                      value={valueCol}
                      onChange={(e) => setValueCol(e.target.value)}
                    >
                      <option value="">Select...</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                  <CCol md={4} className="d-flex align-items-end">
                    <CButton color="primary" onClick={handleImport}>
                      <CIcon icon={cilCheckCircle} className="me-2" />
                      Import Dataset
                    </CButton>
                  </CCol>
                </CRow>

                <div style={{ maxHeight: '400px', overflow: 'auto' }}>
                  <CTable small hover striped>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>#</CTableHeaderCell>
                        {headers.map((h) => (
                          <CTableHeaderCell key={h}>{h}</CTableHeaderCell>
                        ))}
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {preview.slice(0, 50).map((row, i) => (
                        <CTableRow key={i}>
                          <CTableDataCell>{i + 1}</CTableDataCell>
                          {headers.map((h) => (
                            <CTableDataCell key={h}>{row[h]}</CTableDataCell>
                          ))}
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                  {preview.length > 50 && (
                    <div className="text-body-secondary text-center small">
                      Showing first 50 of {preview.length} rows
                    </div>
                  )}
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      )}
    </>
  )
}

export default Upload
