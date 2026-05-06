import React from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import {
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CRow,
  CAlert,
} from '@coreui/react'
import { useData } from '../../../context/DataContext'

function decodeJwt(token) {
  const base64Url = token.split('.')[1]
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join(''),
  )
  return JSON.parse(jsonPayload)
}

const Login = () => {
  const { dispatch } = useData()
  const navigate = useNavigate()
  const [error, setError] = React.useState('')

  const handleSuccess = (credentialResponse) => {
    try {
      const decoded = decodeJwt(credentialResponse.credential)
      dispatch({
        type: 'SET_USER',
        payload: {
          name: decoded.name,
          email: decoded.email,
          avatar: decoded.picture,
        },
      })
      navigate('/dashboard')
    } catch {
      setError('Failed to process login response')
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={5}>
            <CCard className="p-4">
              <CCardBody className="text-center">
                <h1 className="mb-2">Login</h1>
                <p className="text-body-secondary mb-4">
                  Sign in to AgilosIT Forecast
                </p>
                {error && <CAlert color="danger">{error}</CAlert>}
                <div className="d-flex justify-content-center">
                  <GoogleLogin
                    onSuccess={handleSuccess}
                    onError={() => setError('Google login failed')}
                    size="large"
                    theme="outline"
                    text="signin_with"
                    shape="rectangular"
                    width="300"
                  />
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
