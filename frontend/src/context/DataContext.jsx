import React, { createContext, useContext, useReducer, useEffect } from 'react'

const DataContext = createContext()

const savedUser = (() => {
  try {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
})()

const savedDatasets = (() => {
  if (!savedUser) return []
  try {
    const stored = localStorage.getItem('datasets')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
})()

const initialState = {
  datasets: savedDatasets,
  activeDatasetId: (savedUser && localStorage.getItem('activeDatasetId')) || null,
  forecasts: [],
  user: savedUser,
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_DATASET': {
      const dataset = {
        id: Date.now().toString(),
        name: action.payload.name,
        uploadedAt: new Date().toISOString(),
        data: action.payload.data,
      }
      return {
        ...state,
        datasets: [...state.datasets, dataset],
        activeDatasetId: dataset.id,
      }
    }
    case 'SET_ACTIVE_DATASET':
      return { ...state, activeDatasetId: action.payload }
    case 'DELETE_DATASET':
      return {
        ...state,
        datasets: state.datasets.filter((d) => d.id !== action.payload),
        forecasts: state.forecasts.filter((f) => f.datasetId !== action.payload),
        activeDatasetId:
          state.activeDatasetId === action.payload ? null : state.activeDatasetId,
      }
    case 'ADD_FORECAST':
      return {
        ...state,
        forecasts: [...state.forecasts, { id: Date.now().toString(), ...action.payload }],
      }
    case 'CLEAR_FORECASTS':
      return {
        ...state,
        forecasts: state.forecasts.filter((f) => f.datasetId !== action.payload),
      }
    case 'SET_USER':
      localStorage.setItem('user', JSON.stringify(action.payload))
      return { ...state, user: action.payload }
    case 'LOGOUT':
      localStorage.removeItem('user')
      localStorage.removeItem('datasets')
      localStorage.removeItem('activeDatasetId')
      return { ...state, user: null, datasets: [], activeDatasetId: null, forecasts: [] }
    default:
      return state
  }
}

function persist(state) {
  if (state.user) {
    localStorage.setItem('datasets', JSON.stringify(state.datasets))
    if (state.activeDatasetId) {
      localStorage.setItem('activeDatasetId', state.activeDatasetId)
    } else {
      localStorage.removeItem('activeDatasetId')
    }
  }
}

export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    persist(state)
  }, [state.datasets, state.activeDatasetId, state.user])

  return <DataContext.Provider value={{ state, dispatch }}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) throw new Error('useData must be used within DataProvider')
  return context
}
