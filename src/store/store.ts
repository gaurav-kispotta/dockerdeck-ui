import { configureStore } from '@reduxjs/toolkit'
import settingsReducer from './settingsSlice'
import selectionReducer from './selectionSlice'

export const store = configureStore({
  reducer: {
    settings: settingsReducer,
    selection: selectionReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
