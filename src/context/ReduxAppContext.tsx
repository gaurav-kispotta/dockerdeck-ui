import { ReactNode } from 'react'
import { useAppDispatch } from '../store/hooks'
import { setFileContent, setYamlObject, setProcessingError } from '../store/slices/uploadedFileSlice'
import { clearSelection } from '../store/slices/selectionSlice'
import GlobalContextMenu from '../components/context-menu/GlobalContextMenu'
import YamlObjectTransformer from '../modules/YamlObjectTransformer'
import type { FileContentType } from '../store/slices/uploadedFileSlice'
import { logFileEvent, AnalyticsEvent } from '../utils/analytics'

interface ReduxAppContextProps {
  children: ReactNode
}

// Custom hook to handle file upload logic
export const useFileUpload = () => {
  const dispatch = useAppDispatch()

  const setContent = (fc: FileContentType, fileName?: string) => {
    const startTime = performance.now()
    
    try {
      console.log('Processing uploaded file...')
      
      // Log file processing start
      logFileEvent(AnalyticsEvent.FILE_PROCESSING_START, {
        fileName: fileName,
        fileSize: fc.toString().length,
        fileType: fileName?.split('.').pop() || 'unknown'
      })
      
      // Clear any existing selections when a new file is uploaded
      dispatch(clearSelection())
      
      dispatch(setFileContent(fc))
      
      const yt = new YamlObjectTransformer()
      const yamlObject = yt.yamlToObjects(fc.toString())
      console.log('YAML object parsed:', yamlObject)
      
      dispatch(setYamlObject(yamlObject))
      //dispatch(showViewer()) // Automatically show the viewer when file is loaded
      
      const processingTime = performance.now() - startTime
      
      // Log successful file processing
      logFileEvent(AnalyticsEvent.FILE_PROCESSING_SUCCESS, {
        fileName: fileName,
        fileSize: fc.toString().length,
        fileType: fileName?.split('.').pop() || 'unknown',
        processingTime: Math.round(processingTime),
        servicesCount: yamlObject?.services ? Object.keys(yamlObject.services).length : 0,
        networksCount: yamlObject?.networks ? Object.keys(yamlObject.networks).length : 0,
        volumesCount: yamlObject?.volumes ? Object.keys(yamlObject.volumes).length : 0,
        version: yamlObject?.version
      })
      
    } catch (error) {
      console.error('Error processing file:', error)
      const processingTime = performance.now() - startTime
      
      // Log file processing error
      logFileEvent(AnalyticsEvent.FILE_PROCESSING_ERROR, {
        fileName: fileName,
        fileSize: fc.toString().length,
        fileType: fileName?.split('.').pop() || 'unknown',
        processingTime: Math.round(processingTime),
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      })
      
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
