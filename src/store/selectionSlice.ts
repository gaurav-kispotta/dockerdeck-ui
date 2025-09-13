import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface SelectionState {
  selectedNodeId: string | null
  connectedNodeIds: string[]
  connectedEdgeIds: string[]
}

const initialState: SelectionState = {
  selectedNodeId: null,
  connectedNodeIds: [],
  connectedEdgeIds: [],
}

export const selectionSlice = createSlice({
  name: 'selection',
  initialState,
  reducers: {
    selectNode: (state, action: PayloadAction<{ nodeId: string; connectedNodeIds: string[]; connectedEdgeIds: string[] }>) => {
      state.selectedNodeId = action.payload.nodeId
      state.connectedNodeIds = action.payload.connectedNodeIds
      state.connectedEdgeIds = action.payload.connectedEdgeIds
    },
    clearSelection: (state) => {
      state.selectedNodeId = null
      state.connectedNodeIds = []
      state.connectedEdgeIds = []
    },
  },
})

export const { selectNode, clearSelection } = selectionSlice.actions

export default selectionSlice.reducer
