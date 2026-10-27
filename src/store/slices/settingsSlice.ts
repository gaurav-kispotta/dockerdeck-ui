import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ViewMode =
  | 'architecture'  // A: Data flow — all edges, default layout
  | 'networks'      // B: Network isolation — grouped by network
  | 'ports'         // C: External access — port mapping
  | 'volumes'       // D: Storage — volume mounts
  | 'boot-order';   // E: Startup sequence — depends_on dagre

export type MapLayout =
  | 'layered'  // Custom row layout: networks → services → volumes
  | 'dagre'    // Dagre hierarchical graph layout
  | 'elk';     // ELK.js tree layout

export type EdgeStyle =
  | 'orthogonal'  // Circuit-board step routing with bridge arcs (default)
  | 'bridge'      // Straight lines with bridge arcs at crossings
  | 'bezier'      // Classic smooth Bezier curves
  | 'smoothstep'  // Smooth step path (rounded right-angle turns)
  | 'straight';   // Direct straight lines

export interface SettingsState {
  platformPadding: number;
  nodeLevelPadding: number;
  nodeSize: number;
  showDependencies: boolean;
  debugMode: boolean;
  viewMode: ViewMode;
  mapLayout: MapLayout;
  edgeStyle: EdgeStyle;
}

const initialState: SettingsState = {
  platformPadding: 100,
  nodeLevelPadding: 80,
  nodeSize: 100,
  showDependencies: false,
  debugMode: false,
  viewMode: 'architecture',
  mapLayout: 'layered',
  edgeStyle: 'orthogonal',
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setPlatformPadding: (state, action: PayloadAction<number>) => { state.platformPadding = action.payload; },
    setNodeLevelPadding: (state, action: PayloadAction<number>) => { state.nodeLevelPadding = action.payload; },
    setNodeSize: (state, action: PayloadAction<number>) => { state.nodeSize = action.payload; },
    setShowDependencies: (state, action: PayloadAction<boolean>) => { state.showDependencies = action.payload; },
    setDebugMode: (state, action: PayloadAction<boolean>) => { state.debugMode = action.payload; },
    setViewMode: (state, action: PayloadAction<ViewMode>) => { state.viewMode = action.payload; },
    setMapLayout: (state, action: PayloadAction<MapLayout>) => { state.mapLayout = action.payload; },
    setEdgeStyle: (state, action: PayloadAction<EdgeStyle>) => { state.edgeStyle = action.payload; },
  },
});

export const {
  setPlatformPadding, setNodeLevelPadding, setNodeSize,
  setShowDependencies, setDebugMode, setViewMode, setMapLayout, setEdgeStyle,
} = settingsSlice.actions;

export default settingsSlice.reducer;
