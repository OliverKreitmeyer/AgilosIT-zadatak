import React, { createContext, useContext, useReducer } from 'react'

const DataContext = createContext()

const initialState = {
  datasets: [], // { id, name, uploadedAt, data: [{date, value}] }
  activeDatasetId: null,
  forecasts: [], // { id, datasetId, modelName, params, predictions: [{date, value}], metrics: {rmse, mae, mape} }
  user: null, // { name, email, avatar } or null if not logged in
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
      return { ...state, user: action.payload }
    case 'LOGOUT':
      return { ...state, user: null }
    default:
      return state
  }
}

export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return <DataContext.Provider value={{ state, dispatch }}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) throw new Error('useData must be used within DataProvider')
  return context
}
