import { configureStore } from '@reduxjs/toolkit'
import settingsReducer from './settingsSlice'
import selectionReducer from './selectionSlice'
import themeReducer from './themeSlice'
import uploadedFileReducer from './uploadedFileSlice'

export const store = configureStore({
  reducer: {
    settings: settingsReducer,
    selection: selectionReducer,
    theme: themeReducer,
    uploadedFile: uploadedFileReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
