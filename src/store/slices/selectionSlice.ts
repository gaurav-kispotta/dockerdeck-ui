import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { logInteractionEvent, AnalyticsEvent } from '../../utils/analytics'
import { resourceAstKey, astKeyResourceId } from '../../utils/resourceIdentity'

function getParentKeys(key: string): string[] {
  const match = /^(service|network|volume)-(\d+)/.exec(key);
  return match ? ['root', `${match[1]}s`, `${match[1]}-${match[2]}`] : ['root'];
}

export interface SelectionState {
  selectedNodeId: string | null
  selectedEdgeId: string | null
  connectedNodeIds: string[]
  connectedEdgeIds: string[]
  selectedAstNodeKey: string | null
  expandedAstKeys: string[]
}

const initialState: SelectionState = {
  selectedNodeId: null, selectedEdgeId: null, connectedNodeIds: [], connectedEdgeIds: [], selectedAstNodeKey: null, expandedAstKeys: [],
}

export const selectionSlice = createSlice({
  name: 'selection', initialState,
  reducers: {
    selectNode: (state, action: PayloadAction<{
      nodeId: string; connectedNodeIds: string[]; connectedEdgeIds: string[]; astObject?: any;
    }>) => {
      state.selectedEdgeId = null
      state.selectedNodeId = action.payload.nodeId
      state.connectedNodeIds = action.payload.connectedNodeIds
      state.connectedEdgeIds = action.payload.connectedEdgeIds
      logInteractionEvent(AnalyticsEvent.NODE_SELECTED, {
        component: 'graph', action: 'node_selected', nodeId: action.payload.nodeId,
        connectedNodesCount: action.payload.connectedNodeIds.length,
        connectedEdgesCount: action.payload.connectedEdgeIds.length,
      });
      state.selectedAstNodeKey = resourceAstKey(action.payload.nodeId, action.payload.astObject)
      state.expandedAstKeys = state.selectedAstNodeKey ? getParentKeys(state.selectedAstNodeKey) : []
    },
    selectAstNode: (state, action: PayloadAction<{
      astNodeKey: string; expandedKeys: string[]; astObject?: any;
    }>) => {
      state.selectedEdgeId = null
      state.selectedAstNodeKey = action.payload.astNodeKey
      state.expandedAstKeys = action.payload.expandedKeys
      state.selectedNodeId = astKeyResourceId(action.payload.astNodeKey, action.payload.astObject)
      state.connectedNodeIds = []
      state.connectedEdgeIds = []
    },
    selectEdge: (state, action: PayloadAction<{ id: string; source: string; target: string }>) => {
      state.selectedNodeId = null
      state.selectedEdgeId = action.payload.id
      state.connectedNodeIds = [...new Set([action.payload.source, action.payload.target])]
      state.connectedEdgeIds = [action.payload.id]
      state.selectedAstNodeKey = null
      state.expandedAstKeys = []
    },
    clearSelection: () => initialState,
  },
})

export const { selectNode, selectAstNode, selectEdge, clearSelection } = selectionSlice.actions
export default selectionSlice.reducer
