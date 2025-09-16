import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// Helper functions for mapping between graph nodes and AST keys
function mapGraphNodeToAstKey(graphNodeId: string, astObject?: any): string | null {
  console.log('Mapping graph node to AST key:', graphNodeId, 'AST object:', astObject);
  
  if (!astObject) {
    console.log('No AST object available for mapping');
    return null;
  }
  
  // Services: graph uses service name directly
  if (astObject.services) {
    const serviceIndex = astObject.services.findIndex((service: any) => service.name === graphNodeId)
    if (serviceIndex !== -1) {
      const astKey = `service-${serviceIndex}`;
      console.log('Found service mapping:', graphNodeId, '->', astKey);
      return astKey;
    }
  }
  
  // Networks: graph uses network name directly
  if (astObject.networks) {
    const networkIndex = astObject.networks.findIndex((network: any) => network.name === graphNodeId)
    if (networkIndex !== -1) {
      const astKey = `network-${networkIndex}`;
      console.log('Found network mapping:', graphNodeId, '->', astKey);
      return astKey;
    }
  }
  
  // Volumes: graph uses volume name directly
  if (astObject.volumes) {
    const volumeIndex = astObject.volumes.findIndex((volume: any) => volume.name === graphNodeId)
    if (volumeIndex !== -1) {
      const astKey = `volume-${volumeIndex}`;
      console.log('Found volume mapping:', graphNodeId, '->', astKey);
      return astKey;
    }
  }
  
  console.log('No mapping found for graph node:', graphNodeId);
  return null
}

function mapAstKeyToGraphNode(astNodeKey: string, astObject?: any): string | null {
  console.log('Mapping AST key to graph node:', astNodeKey, 'AST object:', astObject);
  
  if (!astObject) {
    console.log('No AST object available for reverse mapping');
    return null;
  }
  
  const parts = astNodeKey.split('-')
  
  if (astNodeKey.startsWith('service-') && parts.length >= 2) {
    const serviceIndex = parseInt(parts[1])
    if (astObject.services && astObject.services[serviceIndex]) {
      const graphNodeId = astObject.services[serviceIndex].name;
      console.log('Found reverse service mapping:', astNodeKey, '->', graphNodeId);
      return graphNodeId;
    }
  }
  
  if (astNodeKey.startsWith('network-') && parts.length >= 2) {
    const networkIndex = parseInt(parts[1])
    if (astObject.networks && astObject.networks[networkIndex]) {
      const graphNodeId = astObject.networks[networkIndex].name;
      console.log('Found reverse network mapping:', astNodeKey, '->', graphNodeId);
      return graphNodeId;
    }
  }
  
  if (astNodeKey.startsWith('volume-') && parts.length >= 2) {
    const volumeIndex = parseInt(parts[1])
    if (astObject.volumes && astObject.volumes[volumeIndex]) {
      const graphNodeId = astObject.volumes[volumeIndex].name;
      console.log('Found reverse volume mapping:', astNodeKey, '->', graphNodeId);
      return graphNodeId;
    }
  }
  
  console.log('No reverse mapping found for AST key:', astNodeKey);
  return null
}

function getParentKeys(astNodeKey: string): string[] {
  const keys: string[] = ['root'] // Always expand root
  const parts = astNodeKey.split('-')
  
  if (astNodeKey.startsWith('service-')) {
    keys.push('services')
    if (parts.length >= 2) {
      keys.push(`service-${parts[1]}`) // Add the specific service
    }
  } else if (astNodeKey.startsWith('network-')) {
    keys.push('networks')
    if (parts.length >= 2) {
      keys.push(`network-${parts[1]}`)
    }
  } else if (astNodeKey.startsWith('volume-')) {
    keys.push('volumes')
    if (parts.length >= 2) {
      keys.push(`volume-${parts[1]}`)
    }
  }
  
  return keys
}

export interface SelectionState {
  selectedNodeId: string | null
  connectedNodeIds: string[]
  connectedEdgeIds: string[]
  selectedAstNodeKey: string | null
  expandedAstKeys: string[]
}

const initialState: SelectionState = {
  selectedNodeId: null,
  connectedNodeIds: [],
  connectedEdgeIds: [],
  selectedAstNodeKey: null,
  expandedAstKeys: [],
}

export const selectionSlice = createSlice({
  name: 'selection',
  initialState,
  reducers: {
    selectNode: (state, action: PayloadAction<{ 
      nodeId: string; 
      connectedNodeIds: string[]; 
      connectedEdgeIds: string[];
      astObject?: any;
    }>) => {
      console.log('SelectNode reducer called with:', action.payload);
      
      state.selectedNodeId = action.payload.nodeId
      state.connectedNodeIds = action.payload.connectedNodeIds
      state.connectedEdgeIds = action.payload.connectedEdgeIds
      
      // Map graph node to AST node key
      const astNodeKey = mapGraphNodeToAstKey(action.payload.nodeId, action.payload.astObject)
      if (astNodeKey) {
        state.selectedAstNodeKey = astNodeKey
        // Expand parent keys to show the selected node
        state.expandedAstKeys = getParentKeys(astNodeKey)
        console.log('Updated AST selection:', astNodeKey, 'expanded keys:', state.expandedAstKeys);
      } else {
        console.log('Could not map graph node to AST key');
      }
    },
    selectAstNode: (state, action: PayloadAction<{ 
      astNodeKey: string; 
      expandedKeys: string[];
      astObject?: any;
    }>) => {
      console.log('SelectAstNode reducer called with:', action.payload);
      
      state.selectedAstNodeKey = action.payload.astNodeKey
      state.expandedAstKeys = action.payload.expandedKeys
      
      // Map AST node to graph node
      const graphNodeId = mapAstKeyToGraphNode(action.payload.astNodeKey, action.payload.astObject)
      if (graphNodeId) {
        state.selectedNodeId = graphNodeId
        // Clear connected nodes when selecting from AST
        state.connectedNodeIds = []
        state.connectedEdgeIds = []
        console.log('Updated graph selection:', graphNodeId);
      } else {
        console.log('Could not map AST key to graph node');
      }
    },
    clearSelection: (state) => {
      state.selectedNodeId = null
      state.connectedNodeIds = []
      state.connectedEdgeIds = []
      state.selectedAstNodeKey = null
      state.expandedAstKeys = []
    },
  },
})

export const { selectNode, selectAstNode, clearSelection } = selectionSlice.actions

export default selectionSlice.reducer
