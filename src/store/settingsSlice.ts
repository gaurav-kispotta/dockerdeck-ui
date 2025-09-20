import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  platformPadding: number;
  nodeLevelPadding: number;
  nodeSize: number;
  showDependencies: boolean;
}

const initialState: SettingsState = {
  platformPadding: 50,
  nodeLevelPadding: 30,
  nodeSize: 100,
  showDependencies: false, // Default to not showing dependencies
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
  },
});

export const { 
  setPlatformPadding, 
  setNodeLevelPadding, 
  setNodeSize, 
  setShowDependencies,
} = settingsSlice.actions;

export default settingsSlice.reducer;
