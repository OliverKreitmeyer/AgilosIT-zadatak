import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>
        <span className="ms-1">Forecast App &copy; {new Date().getFullYear()}</span>
      </div>
      <div className="ms-auto">
        <span className="me-1">Built with</span>
        <a href="https://coreui.io/react" target="_blank" rel="noopener noreferrer">
          CoreUI React
        </a>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
