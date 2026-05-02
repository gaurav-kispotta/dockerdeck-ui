import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { IDockerComposeAst } from '../../modules/ast/DockerComposeAstBuilder'

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
  astObject?: IDockerComposeAst | null
  isProcessing: boolean
  error?: string
  isViewerVisible: boolean
}

const initialState: UploadedFileState = {
  fileContent: undefined,
  yamlObject: null,
  astObject: null,
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
    setAstObject: (state, action: PayloadAction<IDockerComposeAst | null>) => {
      state.astObject = action.payload
    },
    setProcessingError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.isProcessing = false
    },
    clearFile: (state) => {
      state.fileContent = undefined
      state.yamlObject = null
      state.astObject = null
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
  setAstObject,
  setProcessingError, 
  clearFile, 
  setProcessing,
  showViewer,
  hideViewer,
  toggleViewer
} = uploadedFileSlice.actions

export default uploadedFileSlice.reducer
