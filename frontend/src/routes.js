import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Upload = React.lazy(() => import('./views/upload/Upload'))
const Datasets = React.lazy(() => import('./views/datasets/Datasets'))
const Forecast = React.lazy(() => import('./views/forecast/Forecast'))
const Compare = React.lazy(() => import('./views/compare/Compare'))
const Settings = React.lazy(() => import('./views/settings/Settings'))

export const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/upload', name: 'Upload Data', element: Upload },
  { path: '/datasets', name: 'Datasets', element: Datasets },
  { path: '/forecast', name: 'Forecast', element: Forecast },
  { path: '/compare', name: 'Compare Models', element: Compare },
  { path: '/settings', name: 'Settings', element: Settings },
]

export default routes
