import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { DockerDeckEdge } from '../../model/DockerDeckEdge'
import { DockerDeckNode } from '../../model/DockerDeckNode'

interface DockerDeckState {
  nodes: DockerDeckNode[]
  edges: DockerDeckEdge[]
}

const initialState: DockerDeckState = {
  nodes: [],
  edges: []
}

const dockerDeckSlice = createSlice({
  name: 'docker-deck',
  initialState,
  reducers: {
    setNodes: (state, action: PayloadAction<DockerDeckNode[]>) => {
      state.nodes = action.payload
    },
    setEdges: (state, action: PayloadAction<DockerDeckEdge[]>) => {
      state.edges = action.payload
    }
  }
})

export const { setNodes, setEdges } = dockerDeckSlice.actions
export default dockerDeckSlice.reducer
