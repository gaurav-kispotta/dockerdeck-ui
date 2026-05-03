import { useAppDispatch } from './useReduxHooks'
import { logFileEvent, AnalyticsEvent } from '../utils/analytics'
import { FileUploader } from '../modules/file-uploader/FileUploader'

export const useFileUpload = () => {
  const dispatch = useAppDispatch()

  const uploadFile = async (file: File, fileName?: string) => {
    const resolvedName = fileName ?? file.name

    logFileEvent(AnalyticsEvent.FILE_LOADED, {
      fileName: resolvedName,
      fileSize: file.size,
      fileType: resolvedName.split('.').pop() || 'unknown',
    })

    const uploader = new FileUploader(file)
    await uploader.process(dispatch, resolvedName)
  }

  return { uploadFile }
}
