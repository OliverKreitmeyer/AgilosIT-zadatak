import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilCloudUpload,
  cilChartLine,
  cilBalanceScale,
  cilFile,
} from '@coreui/icons'
import { CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Data',
  },
  {
    component: CNavItem,
    name: 'Upload Data',
    to: '/upload',
    icon: <CIcon icon={cilCloudUpload} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Datasets',
    to: '/datasets',
    icon: <CIcon icon={cilFile} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Analysis',
  },
  {
    component: CNavItem,
    name: 'Forecast',
    to: '/forecast',
    icon: <CIcon icon={cilChartLine} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Compare Models',
    to: '/compare',
    icon: <CIcon icon={cilBalanceScale} customClassName="nav-icon" />,
  },
]

export default _nav
