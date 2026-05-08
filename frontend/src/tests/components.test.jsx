import { describe, it, expect } from 'vitest'
import React from 'react'
import { render, screen, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DataProvider } from '../context/DataContext'
import { useData } from '../context/DataContext'

// Wrap component with required providers
function renderWithProviders(ui) {
  return render(
    <MemoryRouter>
      <DataProvider>{ui}</DataProvider>
    </MemoryRouter>,
  )
}

describe('Settings page', () => {
  it('renders without crashing', async () => {
    const Settings = (await import('../views/settings/Settings')).default
    renderWithProviders(<Settings />)
    expect(screen.getByText('Data Management')).toBeInTheDocument()
  })

  it('shows clear buttons', async () => {
    const Settings = (await import('../views/settings/Settings')).default
    renderWithProviders(<Settings />)
    expect(screen.getByText('Clear Stats')).toBeInTheDocument()
    // "Clear All Data" appears in both heading and button, so check for at least one
    expect(screen.getAllByText('Clear All Data').length).toBeGreaterThanOrEqual(1)
  })

  it('shows account card when user is set via dispatch', async () => {
    const Settings = (await import('../views/settings/Settings')).default

    // Helper that sets user then renders Settings
    function SetupAndRender() {
      const { dispatch } = useData()
      React.useEffect(() => {
        dispatch({
          type: 'SET_USER',
          payload: { name: 'Test User', email: 'test@example.com', avatar: null },
        })
      }, [dispatch])
      return <Settings />
    }

    render(
      <MemoryRouter>
        <DataProvider>
          <SetupAndRender />
        </DataProvider>
      </MemoryRouter>,
    )

    expect(screen.getByText('Account')).toBeInTheDocument()
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })
})

describe('Dashboard page', () => {
  it('renders without crashing', async () => {
    const Dashboard = (await import('../views/dashboard/Dashboard')).default
    renderWithProviders(<Dashboard />)
    expect(screen.getByText('Datasets')).toBeInTheDocument()
    expect(screen.getByText('Forecasts Run')).toBeInTheDocument()
    expect(screen.getByText('Best RMSE')).toBeInTheDocument()
  })

  it('shows Get Started when no dataset is active', async () => {
    const Dashboard = (await import('../views/dashboard/Dashboard')).default
    renderWithProviders(<Dashboard />)
    expect(screen.getByText('Get Started')).toBeInTheDocument()
  })
})
