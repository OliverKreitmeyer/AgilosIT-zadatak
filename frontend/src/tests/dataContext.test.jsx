import { describe, it, expect, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, act } from '@testing-library/react'
import { DataProvider, useData } from '../context/DataContext'

// Helper component that exposes state and dispatch for testing
function TestConsumer({ action, onState }) {
  const { state, dispatch } = useData()
  React.useEffect(() => {
    if (onState) onState(state)
  })
  return (
    <div>
      <span data-testid="datasets">{state.datasets.length}</span>
      <span data-testid="forecasts">{state.forecasts.length}</span>
      <span data-testid="user">{state.user ? state.user.name : 'none'}</span>
      {action && (
        <button data-testid="action" onClick={() => dispatch(action)}>
          Act
        </button>
      )}
    </div>
  )
}

function renderWithProvider(action, onState) {
  return render(
    <DataProvider>
      <TestConsumer action={action} onState={onState} />
    </DataProvider>,
  )
}

beforeEach(() => {
  localStorage.clear()
})

describe('DataContext reducer', () => {
  it('starts with empty state', () => {
    renderWithProvider()
    expect(screen.getByTestId('datasets').textContent).toBe('0')
    expect(screen.getByTestId('forecasts').textContent).toBe('0')
    expect(screen.getByTestId('user').textContent).toBe('none')
  })

  it('ADD_DATASET adds a dataset', () => {
    const action = {
      type: 'ADD_DATASET',
      payload: { name: 'test.csv', data: [{ date: '2024-01-01', value: 10 }] },
    }
    renderWithProvider(action)

    act(() => screen.getByTestId('action').click())
    expect(screen.getByTestId('datasets').textContent).toBe('1')
  })

  it('SET_USER sets the user', () => {
    const action = {
      type: 'SET_USER',
      payload: { name: 'John', email: 'john@test.com', avatar: null },
    }
    renderWithProvider(action)

    act(() => screen.getByTestId('action').click())
    expect(screen.getByTestId('user').textContent).toBe('John')
  })

  it('LOGOUT clears all state', () => {
    // We'll use a component that sets up state then logs out
    function LogoutTest() {
      const { state, dispatch } = useData()
      return (
        <div>
          <span data-testid="datasets">{state.datasets.length}</span>
          <span data-testid="user">{state.user ? state.user.name : 'none'}</span>
          <button
            data-testid="setup"
            onClick={() => {
              dispatch({
                type: 'SET_USER',
                payload: { name: 'John', email: 'john@test.com', avatar: null },
              })
              dispatch({
                type: 'ADD_DATASET',
                payload: { name: 'test.csv', data: [{ date: '2024-01-01', value: 10 }] },
              })
            }}
          >
            Setup
          </button>
          <button data-testid="logout" onClick={() => dispatch({ type: 'LOGOUT' })}>
            Logout
          </button>
        </div>
      )
    }

    render(
      <DataProvider>
        <LogoutTest />
      </DataProvider>,
    )

    act(() => screen.getByTestId('setup').click())
    expect(screen.getByTestId('user').textContent).toBe('John')
    expect(screen.getByTestId('datasets').textContent).toBe('1')

    act(() => screen.getByTestId('logout').click())
    expect(screen.getByTestId('user').textContent).toBe('none')
    expect(screen.getByTestId('datasets').textContent).toBe('0')
  })

  it('ADD_FORECAST adds a forecast', () => {
    function ForecastTest() {
      const { state, dispatch } = useData()
      return (
        <div>
          <span data-testid="forecasts">{state.forecasts.length}</span>
          <button
            data-testid="add"
            onClick={() =>
              dispatch({
                type: 'ADD_FORECAST',
                payload: {
                  datasetId: '1',
                  modelName: 'Moving Average',
                  predictions: [1, 2, 3],
                  metrics: { rmse: 1.5, mae: 1.2, mape: 5 },
                },
              })
            }
          >
            Add
          </button>
        </div>
      )
    }

    render(
      <DataProvider>
        <ForecastTest />
      </DataProvider>,
    )

    act(() => screen.getByTestId('add').click())
    expect(screen.getByTestId('forecasts').textContent).toBe('1')
  })

  it('CLEAR_ALL_FORECASTS removes all forecasts', () => {
    function ClearTest() {
      const { state, dispatch } = useData()
      return (
        <div>
          <span data-testid="forecasts">{state.forecasts.length}</span>
          <button
            data-testid="add"
            onClick={() =>
              dispatch({
                type: 'ADD_FORECAST',
                payload: { datasetId: '1', modelName: 'MA', predictions: [], metrics: null },
              })
            }
          >
            Add
          </button>
          <button
            data-testid="clear"
            onClick={() => dispatch({ type: 'CLEAR_ALL_FORECASTS' })}
          >
            Clear
          </button>
        </div>
      )
    }

    render(
      <DataProvider>
        <ClearTest />
      </DataProvider>,
    )

    act(() => screen.getByTestId('add').click())
    act(() => screen.getByTestId('add').click())
    expect(screen.getByTestId('forecasts').textContent).toBe('2')

    act(() => screen.getByTestId('clear').click())
    expect(screen.getByTestId('forecasts').textContent).toBe('0')
  })

  it('CLEAR_FORECASTS only removes forecasts for the given dataset', () => {
    function ClearByDatasetTest() {
      const { state, dispatch } = useData()
      return (
        <div>
          <span data-testid="forecasts">{state.forecasts.length}</span>
          <button
            data-testid="add-ds1"
            onClick={() =>
              dispatch({
                type: 'ADD_FORECAST',
                payload: { datasetId: 'ds1', modelName: 'MA', predictions: [], metrics: null },
              })
            }
          >
            Add DS1
          </button>
          <button
            data-testid="add-ds2"
            onClick={() =>
              dispatch({
                type: 'ADD_FORECAST',
                payload: { datasetId: 'ds2', modelName: 'MA', predictions: [], metrics: null },
              })
            }
          >
            Add DS2
          </button>
          <button
            data-testid="clear-ds1"
            onClick={() => dispatch({ type: 'CLEAR_FORECASTS', payload: 'ds1' })}
          >
            Clear DS1
          </button>
        </div>
      )
    }

    render(
      <DataProvider>
        <ClearByDatasetTest />
      </DataProvider>,
    )

    act(() => screen.getByTestId('add-ds1').click())
    act(() => screen.getByTestId('add-ds2').click())
    expect(screen.getByTestId('forecasts').textContent).toBe('2')

    act(() => screen.getByTestId('clear-ds1').click())
    expect(screen.getByTestId('forecasts').textContent).toBe('1')
  })

  it('DELETE_DATASET removes dataset and its forecasts', () => {
    function DeleteTest() {
      const { state, dispatch } = useData()
      const dsId = state.datasets[0]?.id
      return (
        <div>
          <span data-testid="datasets">{state.datasets.length}</span>
          <span data-testid="forecasts">{state.forecasts.length}</span>
          <span data-testid="dsid">{dsId || 'none'}</span>
          <button
            data-testid="add-ds"
            onClick={() =>
              dispatch({
                type: 'ADD_DATASET',
                payload: { name: 'test.csv', data: [{ date: '2024-01-01', value: 10 }] },
              })
            }
          >
            Add DS
          </button>
          <button
            data-testid="add-fc"
            onClick={() => {
              if (dsId) {
                dispatch({
                  type: 'ADD_FORECAST',
                  payload: { datasetId: dsId, modelName: 'MA', predictions: [], metrics: null },
                })
              }
            }}
          >
            Add FC
          </button>
          <button
            data-testid="delete"
            onClick={() => {
              if (dsId) dispatch({ type: 'DELETE_DATASET', payload: dsId })
            }}
          >
            Delete
          </button>
        </div>
      )
    }

    render(
      <DataProvider>
        <DeleteTest />
      </DataProvider>,
    )

    act(() => screen.getByTestId('add-ds').click())
    expect(screen.getByTestId('datasets').textContent).toBe('1')

    act(() => screen.getByTestId('add-fc').click())
    expect(screen.getByTestId('forecasts').textContent).toBe('1')

    act(() => screen.getByTestId('delete').click())
    expect(screen.getByTestId('datasets').textContent).toBe('0')
    expect(screen.getByTestId('forecasts').textContent).toBe('0')
  })
})
