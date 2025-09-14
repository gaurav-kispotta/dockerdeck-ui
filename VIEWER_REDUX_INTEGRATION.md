# DockerComposeViewer Redux Integration

## Summary

The DockerComposeViewer visibility has been successfully integrated into the Redux store. Here's what was implemented:

### Changes Made:

1. **Updated `uploadedFileSlice.ts`**:
   - Added `isViewerVisible: boolean` to the state interface
   - Added three new actions:
     - `showViewer()` - Shows the viewer
     - `hideViewer()` - Hides the viewer  
     - `toggleViewer()` - Toggles viewer visibility
   - Updated `clearFile()` to also hide the viewer when file is cleared

2. **Updated `DockerComposeViewer.tsx`**:
   - Removed `yamlObject` prop (now gets it from Redux state)
   - Removed local `useState` for visibility
   - Uses Redux `isViewerVisible` state for conditional rendering
   - Uses Redux `hideViewer()` action in `handleClose()`
   - Gets `yamlObject` directly from Redux store

3. **Updated `Main.tsx`**:
   - Removed local `isViewerOpen` state
   - Uses Redux `isViewerVisible` for all visibility logic
   - Uses Redux `toggleViewer()` and `hideViewer()` actions
   - Removed `yamlObject` prop from DockerComposeViewer component
   - Updated splitter size logic to use Redux state

4. **Updated `ReduxAppContext.tsx`**:
   - Auto-shows viewer when file is successfully loaded using `showViewer()`

5. **Created `useViewer()` hook** in `useReduxHooks.ts`:
   - Provides convenient access to viewer state and actions
   - Returns `{ isViewerVisible, showViewer, hideViewer, toggleViewer }`

### New Redux State Structure:

```typescript
interface UploadedFileState {
  fileContent?: FileContentType
  yamlObject?: YamlDockerCompose | null
  isProcessing: boolean
  error?: string
  isViewerVisible: boolean  // NEW
}
```

### Available Actions:

```typescript
// Show/hide viewer
dispatch(showViewer())
dispatch(hideViewer()) 
dispatch(toggleViewer())

// Or use the custom hook
const { isViewerVisible, showViewer, hideViewer, toggleViewer } = useViewer()
```

### Usage:

1. **Automatic Behavior**: Viewer automatically shows when a Docker Compose file is uploaded
2. **Manual Control**: Use toggle button in Main component to show/hide
3. **Close Button**: Click X in viewer header to hide
4. **File Clear**: Viewer automatically hides when file is cleared

### Benefits:

- **Centralized State**: Viewer visibility is now part of the global state
- **Persistence**: State persists across component re-renders
- **Predictable**: All visibility changes go through Redux actions
- **Debuggable**: Can track visibility changes in Redux DevTools
- **Reusable**: Viewer state can be accessed from any component

The viewer now fully integrates with the Redux state management system while maintaining all existing functionality.
