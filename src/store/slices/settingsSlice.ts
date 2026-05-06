import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ViewMode =
  | 'architecture'  // A: Data flow — all edges, default layout
  | 'networks'      // B: Network isolation — grouped by network
  | 'ports'         // C: External access — port mapping
  | 'volumes'       // D: Storage — volume mounts
  | 'boot-order';   // E: Startup sequence — depends_on dagre

export interface SettingsState {
  platformPadding: number;
  nodeLevelPadding: number;
  nodeSize: number;
  showDependencies: boolean;
  debugMode: boolean;
  viewMode: ViewMode;
}

const initialState: SettingsState = {
  platformPadding: 100,
  nodeLevelPadding: 80,
  nodeSize: 100,
  showDependencies: false,
  debugMode: false,
  viewMode: 'architecture',
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
  },
});

export const {
  setPlatformPadding, setNodeLevelPadding, setNodeSize,
  setShowDependencies, setDebugMode, setViewMode,
} = settingsSlice.actions;

export default settingsSlice.reducer;
