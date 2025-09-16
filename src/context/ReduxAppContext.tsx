import { ReactNode } from 'react'
import { useAppDispatch } from '../store/hooks'
import { setFileContent, setYamlObject, setProcessingError, showViewer } from '../store/uploadedFileSlice'
import { clearSelection } from '../store/selectionSlice'
import GlobalContextMenu from '../components/context-menu/GlobalContextMenu'
import YamlObjectTransformer from '../modules/YamlObjectTransformer'
import type { FileContentType } from '../store/uploadedFileSlice'

interface ReduxAppContextProps {
  children: ReactNode
}

// Custom hook to handle file upload logic
export const useFileUpload = () => {
  const dispatch = useAppDispatch()

  const setContent = (fc: FileContentType) => {
    try {
      console.log('Processing uploaded file...')
      
      // Clear any existing selections when a new file is uploaded
      dispatch(clearSelection())
      
      dispatch(setFileContent(fc))
      
      const yt = new YamlObjectTransformer()
      const yamlObject = yt.yamlToObjects(fc.toString())
      console.log('YAML object parsed:', yamlObject)
      
      dispatch(setYamlObject(yamlObject))
      dispatch(showViewer()) // Automatically show the viewer when file is loaded
    } catch (error) {
      console.error('Error processing file:', error)
      dispatch(setProcessingError(error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  return { setContent }
}

export default function ReduxAppContext({ children }: ReduxAppContextProps) {
  return (
    <>
      {children}
      <GlobalContextMenu />
    </>
  )
}
