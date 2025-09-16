import { useAppSelector, useAppDispatch } from '../store/hooks'
import { showViewer, hideViewer, toggleViewer } from '../store/uploadedFileSlice'

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
    showViewer: () => dispatch(showViewer()),
    hideViewer: () => dispatch(hideViewer()),
    toggleViewer: () => dispatch(toggleViewer())
  }
}

// Re-export the file upload hook for easier imports
export { useFileUpload } from '../context/ReduxAppContext'
