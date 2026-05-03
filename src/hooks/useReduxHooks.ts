import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../store/store'
import { showViewer, hideViewer, toggleViewer } from '../store/slices/uploadedFileSlice'
import { logInteractionEvent, AnalyticsEvent } from '../utils/analytics'

// Typed base hooks
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()

// Slice selector hooks
export const useUploadedFileFromStore = () => useAppSelector((state) => state.uploadedFile)
export const useSettingsFromStore = () => useAppSelector((state) => state.settings)
export const useThemeFromStore = () => useAppSelector((state) => state.theme)
export const useSelectionFromStore = () => useAppSelector((state) => state.selection)
export const useDockerDeckFromStore = () => useAppSelector((state) => state.dockerdeck)
export const useWindowFromStore = () => useAppSelector((state) => state.window)

// Custom hook to replace useUploadFileContext
export const useUploadedFile = () => useAppSelector((state) => state.uploadedFile)

// Custom hook to replace useTheme
export const useTheme = () => useAppSelector((state) => state.theme)

// Custom hook for viewer controls
export const useViewer = () => {
  const dispatch = useAppDispatch()
  const { isViewerVisible } = useAppSelector((state) => state.uploadedFile)

  return {
    isViewerVisible,
    showViewer: () => {
      dispatch(showViewer())
      logInteractionEvent(AnalyticsEvent.VIEWER_OPENED, {
        component: 'viewer',
        action: 'show'
      })
    },
    hideViewer: () => {
      dispatch(hideViewer())
      logInteractionEvent(AnalyticsEvent.VIEWER_CLOSED, {
        component: 'viewer',
        action: 'hide'
      })
    },
    toggleViewer: () => {
      const newState = !isViewerVisible
      dispatch(toggleViewer())
      logInteractionEvent(newState ? AnalyticsEvent.VIEWER_OPENED : AnalyticsEvent.VIEWER_CLOSED, {
        component: 'viewer',
        action: 'toggle',
        newState: newState ? 'visible' : 'hidden'
      })
    }
  }
}

// Re-export the file upload hook for easier imports
export { useFileUpload } from './useFileUpload'

