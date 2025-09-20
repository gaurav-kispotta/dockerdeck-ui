import { useAppSelector, useAppDispatch } from '../store/hooks'
import { showViewer, hideViewer, toggleViewer } from '../store/uploadedFileSlice'
import { logInteractionEvent, AnalyticsEvent } from '../utils/analytics'

// Custom hook to replace useUploadFileContext
export const useUploadedFile = () => {
  return useAppSelector((state) => state.uploadedFile)
}

// Custom hook to replace useTheme
export const useTheme = () => {
  return useAppSelector((state) => state.theme)
}

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
export { useFileUpload } from '../context/ReduxAppContext'
