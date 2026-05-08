import React, { useState, useRef } from 'react'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
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

  const SUPPORTED_EXTENSIONS = ['.csv', '.xlsx', '.xls']

  const autoDetectColumns = (fields) => {
    const lower = fields.map((f) => f.toLowerCase())
    const dateIdx = lower.findIndex(
      (f) => f.includes('date') || f.includes('datum') || f.includes('time'),
    )
    const valueIdx = lower.findIndex(
      (f) =>
        f.includes('value') ||
        f.includes('potrošnja') ||
        f.includes('potrosnja') ||
        f.includes('consumption') ||
        f.includes('amount') ||
        f.includes('spend'),
    )
    if (dateIdx >= 0) setDateCol(fields[dateIdx])
    if (valueIdx >= 0) setValueCol(fields[valueIdx])
  }

  const loadParsedData = (fields, rows) => {
    if (!fields || fields.length === 0) {
      setError('Could not find any columns. Make sure your file has a header row.')
      return
    }
    if (fields.length < 2) {
      setError('File must have at least 2 columns (date and value). Found only 1 column.')
      return
    }
    if (rows.length === 0) {
      setError('File has headers but no data rows.')
      return
    }
    setHeaders(fields)
    setPreview(rows)
    autoDetectColumns(fields)
  }

  const parseCSV = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError(`CSV parse error: ${results.errors[0].message}`)
          return
        }
        loadParsedData(results.meta.fields, results.data)
      },
    })
  }

  const parseExcel = (file) => {
    const reader = new FileReader()
    reader.onerror = () => {
      setError('Failed to read the Excel file. It may be corrupted or password-protected.')
    }
    reader.onload = (evt) => {
      try {
        const workbook = XLSX.read(evt.target.result, { type: 'array', cellDates: true })

        if (workbook.SheetNames.length === 0) {
          setError('The Excel file has no sheets.')
          return
        }

        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' })

        if (jsonData.length === 0) {
          setError(
            'The first sheet is empty. Make sure your data starts in the first row with headers.',
          )
          return
        }

        const fields = Object.keys(jsonData[0])

        // Convert Date objects to ISO strings for consistency
        const rows = jsonData.map((row) => {
          const cleaned = {}
          for (const key of fields) {
            const val = row[key]
            if (val instanceof Date) {
              cleaned[key] = val.toISOString().split('T')[0]
            } else {
              cleaned[key] = String(val)
            }
          }
          return cleaned
        })

        loadParsedData(fields, rows)
      } catch {
        setError(
          'Failed to parse the Excel file. Make sure it is a valid .xlsx or .xls file, not a renamed file with a different format.',
        )
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setError('')
    setSuccess('')
    setFileName(file.name)

    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))

    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
      setError(
        `Unsupported file type "${ext}". Please upload a CSV (.csv) or Excel (.xlsx, .xls) file.`,
      )
      return
    }

    if (ext === '.csv') {
      parseCSV(file)
    } else {
      parseExcel(file)
    }
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

    if (data.length === 0) {
      setError(
        'No valid data found. Make sure the date column contains recognizable dates and the value column contains numbers.',
      )
      return
    }

    if (data.length < 5) {
      setError(
        `Only ${data.length} valid data point${data.length !== 1 ? 's' : ''} found — need at least 5. Check that your value column contains numbers (not text).`,
      )
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
              <small className="ms-2 text-body-secondary">CSV or Excel file with date and value columns</small>
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
                <div className="small text-body-secondary mt-1">CSV or Excel (.xlsx, .xls)</div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
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
