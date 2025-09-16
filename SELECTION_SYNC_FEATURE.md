# Graph-AST Selection Synchronization Feature

## Overview
This feature implements bidirectional selection synchronization between the Graph view (React Flow diagram) and the AST view (Tree component). When a user selects a node in either view, the corresponding node in the other view is automatically selected and expanded.

## How it Works

### Architecture
1. **Redux Store**: Extended `selectionSlice` to handle both graph and AST selections
   - `selectedNodeId`: Currently selected graph node ID
   - `selectedAstNodeKey`: Currently selected AST tree node key
   - `expandedAstKeys`: Keys of expanded AST tree nodes
   - `connectedNodeIds`/`connectedEdgeIds`: Connected elements in graph

2. **Mapping Functions**: Convert between graph node IDs and AST tree keys
   - `mapGraphNodeToAstKey()`: Graph node ID → AST tree key
   - `mapAstKeyToGraphNode()`: AST tree key → Graph node ID
   - `getParentKeys()`: Generate parent keys for expanding AST tree

3. **Selection Actions**:
   - `selectNode`: Triggered when clicking a graph node
   - `selectAstNode`: Triggered when clicking an AST tree node
   - `clearSelection`: Clear all selections

### ID Mapping Strategy

#### Graph Node IDs
- Services: Use service name directly (e.g., "web", "api", "db")
- Networks: Use network name directly (e.g., "frontend", "backend")
- Volumes: Use volume name directly (e.g., "web-data", "api-data")

#### AST Tree Keys
- Services: `service-{index}` (e.g., "service-0", "service-1")
- Networks: `network-{index}` (e.g., "network-0", "network-1") 
- Volumes: `volume-{index}` (e.g., "volume-0", "volume-1")
- Children: `service-{index}-{property}` (e.g., "service-0-image")

## Testing the Feature

### Prerequisites
1. Start the development server: `npm run dev`
2. Load a Docker Compose file with multiple services, networks, and volumes

### Test Cases

#### Test 1: Graph → AST Selection
1. Click on a service node in the graph view
2. **Expected**: 
   - AST tree expands to show the selected service
   - Service node is highlighted in AST tree
   - Debug panel shows both selections

#### Test 2: AST → Graph Selection  
1. Click on a service node in the AST tree
2. **Expected**:
   - Corresponding service node is selected in graph
   - Graph node gets selection styling (blue glow)
   - Connected edges/nodes are not highlighted (AST selection clears connections)

#### Test 3: Cross-type Selection
1. Click on a network node in graph
2. **Expected**: AST expands networks section and selects network
3. Click on a volume in AST
4. **Expected**: Graph selects corresponding volume node

#### Test 4: Child Node Selection (AST only)
1. Click on service details like "Image" or "Ports" in AST
2. **Expected**: Parent service should be selected in graph

### Debugging
- Open browser console to see mapping debug logs
- Check the debug panel in AST view for current selections
- Use Redux DevTools to inspect state changes

### Known Limitations
1. Only works with nodes that exist in both views
2. Child nodes in AST (ports, volumes, etc.) map to parent service
3. Requires astObject to be available for mapping

## Files Modified

### Core Implementation
- `src/store/selectionSlice.ts`: Extended with AST selection state and mapping functions
- `src/components/debug/AstDebugViewer.tsx`: Added selection handling and visual feedback
- `src/components/deck/DesignDeck.tsx`: Updated to pass AST object to selection action

### Key Functions
- `mapGraphNodeToAstKey()`: Maps graph node names to AST tree keys using index lookup
- `mapAstKeyToGraphNode()`: Reverse mapping from AST keys to graph node names
- `getParentKeys()`: Calculates which AST tree nodes to expand for visibility

## Future Enhancements
1. Support for deep child selections (ports, environment variables)
2. Visual connection lines between graph and AST views
3. Keyboard navigation support
4. Performance optimization for large ASTs
5. Unit tests for mapping functions
