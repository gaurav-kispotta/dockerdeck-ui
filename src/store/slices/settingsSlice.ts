import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SettingsState {
  platformPadding: number;
  nodeLevelPadding: number;
  nodeSize: number;
  showDependencies: boolean;
  debugMode: boolean;
}

const initialState: SettingsState = {
  platformPadding: 100,
  nodeLevelPadding: 80,
  nodeSize: 100,
  showDependencies: false,
  debugMode: false,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setPlatformPadding: (state, action: PayloadAction<number>) => {
      state.platformPadding = action.payload;
    },
    setNodeLevelPadding: (state, action: PayloadAction<number>) => {
      state.nodeLevelPadding = action.payload;
    },
    setNodeSize: (state, action: PayloadAction<number>) => {
      state.nodeSize = action.payload;
    },
    setShowDependencies: (state, action: PayloadAction<boolean>) => {
      state.showDependencies = action.payload;
    },
    setDebugMode: (state, action: PayloadAction<boolean>) => {
      state.debugMode = action.payload;
    },
  },
});

export const {
  setPlatformPadding,
  setNodeLevelPadding,
  setNodeSize,
  setShowDependencies,
  setDebugMode,
} = settingsSlice.actions;

export default settingsSlice.reducer;
