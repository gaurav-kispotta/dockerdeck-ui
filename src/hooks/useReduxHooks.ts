import { useAppSelector } from '../store/hooks'

// Custom hook to replace useUploadFileContext
export const useUploadedFile = () => {
  return useAppSelector((state) => state.uploadedFile)
}

// Custom hook to replace useTheme
export const useTheme = () => {
  return useAppSelector((state) => state.theme)
}

// Re-export the file upload hook for easier imports
export { useFileUpload } from '../context/ReduxAppContext'
