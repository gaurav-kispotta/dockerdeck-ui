import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './store'

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()

// Prepared hooks:
export const useUploadedFileFromStore = () => useAppSelector((state) => state.uploadedFile)
export const useSettingsFromStore = () => useAppSelector((state) => state.settings)
export const useThemeFromStore = () => useAppSelector((state) => state.theme)
export const useSelectionFromStore = () => useAppSelector((state) => state.selection)
export const useDockerDeckFromStore = () => useAppSelector((state) => state.dockerdeck)
export const useWindowFromStore = () => useAppSelector((state) => state.window)