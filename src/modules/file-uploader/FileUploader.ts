import type { AppDispatch } from '../../store/store'
import { setFileContent, setYamlObject, setProcessingError, clearFile } from '../../store/slices/uploadedFileSlice'
import { clearSelection } from '../../store/slices/selectionSlice'
import { clearDeck } from '../../store/slices/dockerdeckSlice'
import { showModal } from '../../store/slices/windowSlice'
import YamlObjectTransformer from '../YamlObjectTransformer'
import { logFileEvent, AnalyticsEvent } from '../../utils/analytics'

export class FileUploader {
    file: File

    constructor(file: File) {
        this.file = file
    }

    public getFile() {
        return this.file
    }

    private readFileContent(): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (event) => {
                if (event.target?.result) {
                    resolve(event.target.result as string)
                } else {
                    reject(new Error('Error while reading file or file is empty'))
                }
            }
            reader.onerror = () => reject(new Error('Error reading file'))
            reader.readAsText(this.file)
        })
    }

    public async process(dispatch: AppDispatch, fileName?: string): Promise<void> {
        const startTime = performance.now()
        const resolvedName = fileName ?? this.file.name

        try {
            const fc = await this.readFileContent()

            logFileEvent(AnalyticsEvent.FILE_PROCESSING_START, {
                fileName: resolvedName,
                fileSize: fc.length,
                fileType: resolvedName.split('.').pop() || 'unknown',
            })

            // Clear previous file data, selection and deck before processing new file
            dispatch(clearFile())
            dispatch(clearSelection())
            dispatch(clearDeck())
            dispatch(setFileContent({ content: fc, fileName: resolvedName }))

            const yt = new YamlObjectTransformer()
            const yamlObject = yt.yamlToObjects(fc)
            console.log('YAML object parsed:', yamlObject)

            dispatch(setYamlObject(yamlObject))

            const processingTime = performance.now() - startTime

            logFileEvent(AnalyticsEvent.FILE_PROCESSING_SUCCESS, {
                fileName: resolvedName,
                fileSize: fc.length,
                fileType: resolvedName.split('.').pop() || 'unknown',
                processingTime: Math.round(processingTime),
                servicesCount: yamlObject?.services ? Object.keys(yamlObject.services).length : 0,
                networksCount: yamlObject?.networks ? Object.keys(yamlObject.networks).length : 0,
                volumesCount: yamlObject?.volumes ? Object.keys(yamlObject.volumes).length : 0,
                version: yamlObject?.version,
            })
        } catch (error) {
            console.error('Error processing file:', error)
            const processingTime = performance.now() - startTime
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'

            logFileEvent(AnalyticsEvent.FILE_PROCESSING_ERROR, {
                fileName: resolvedName,
                fileSize: this.file.size,
                fileType: resolvedName.split('.').pop() || 'unknown',
                processingTime: Math.round(processingTime),
                errorMessage,
            })

            dispatch(setProcessingError(errorMessage))
            dispatch(showModal({
                modalType: 'error',
                title: 'File Parsing Failed',
                body: errorMessage,
            }))
        }
    }
}