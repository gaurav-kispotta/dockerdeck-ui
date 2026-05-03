import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { IDockerComposeAst } from '../../modules/ast/DockerComposeAstBuilder'

export type FileContentType = string | ArrayBuffer
export type DockerComposeFile = {
  fileName: string
  content: FileContentType
}

export type YamlDockerCompose = {
  networks?: { [key: string]: {} }
  services?: { [key: string]: {} }
  volumes?: { [key: string]: {} }
  version?: string
}

interface UploadedFileState {
  fileName?: string
  fileContent?: FileContentType
  yamlObject?: YamlDockerCompose | null
  astObject?: IDockerComposeAst | null
  isProcessing: boolean
  error?: string
  isViewerVisible: boolean
}

const initialState: UploadedFileState = {
  fileName: undefined,
  fileContent: undefined,
  yamlObject: null,
  astObject: null,
  isProcessing: false,
  error: undefined,
  isViewerVisible: false
}

const uploadedFileSlice = createSlice({
  name: 'uploaded-file',
  initialState,
  reducers: {
    setFileContent: (state, action: PayloadAction<DockerComposeFile>) => {
      state.fileContent = action.payload.content
      state.fileName = action.payload.fileName
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
      state.fileName = undefined
    },
    clearFile: (state) => {
      state.fileName = undefined
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
