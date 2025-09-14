import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type FileContentType = string | ArrayBuffer

export type YamlDockerCompose = {
  networks?: { [key: string]: {} }
  services?: { [key: string]: {} }
  volumes?: { [key: string]: {} }
  version?: string
}

interface UploadedFileState {
  fileContent?: FileContentType
  yamlObject?: YamlDockerCompose | null
  isProcessing: boolean
  error?: string
  isViewerVisible: boolean
}

const initialState: UploadedFileState = {
  fileContent: undefined,
  yamlObject: null,
  isProcessing: false,
  error: undefined,
  isViewerVisible: false
}

const uploadedFileSlice = createSlice({
  name: 'uploadedFile',
  initialState,
  reducers: {
    setFileContent: (state, action: PayloadAction<FileContentType>) => {
      state.fileContent = action.payload
      state.isProcessing = true
      state.error = undefined
    },
    setYamlObject: (state, action: PayloadAction<YamlDockerCompose | null>) => {
      state.yamlObject = action.payload
      state.isProcessing = false
      state.error = undefined
    },
    setProcessingError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.isProcessing = false
    },
    clearFile: (state) => {
      state.fileContent = undefined
      state.yamlObject = null
      state.isProcessing = false
      state.error = undefined
      state.isViewerVisible = false
    },
    setProcessing: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload
    },
    showViewer: (state) => {
      state.isViewerVisible = true
    },
    hideViewer: (state) => {
      state.isViewerVisible = false
    },
    toggleViewer: (state) => {
      state.isViewerVisible = !state.isViewerVisible
    }
  }
})

export const { 
  setFileContent, 
  setYamlObject, 
  setProcessingError, 
  clearFile, 
  setProcessing,
  showViewer,
  hideViewer,
  toggleViewer
} = uploadedFileSlice.actions

export default uploadedFileSlice.reducer
