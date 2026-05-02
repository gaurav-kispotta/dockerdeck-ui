import { configureStore } from '@reduxjs/toolkit'
import settingsReducer from './slices/settingsSlice'
import selectionReducer from './slices/selectionSlice'
import themeReducer from './slices/themeSlice'
import uploadedFileReducer from './slices/uploadedFileSlice'
import dockerdeckReducer from './slices/dockerdeckSlice'

export const store = configureStore({
  reducer: {
    settings: settingsReducer,
    selection: selectionReducer,
    theme: themeReducer,
    uploadedFile: uploadedFileReducer,
    dockerdeck: dockerdeckReducer, // Dynamically import dockerdeckSlice to avoid circular dependency
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
