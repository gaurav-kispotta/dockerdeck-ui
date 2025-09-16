# Redux Migration Summary

This document outlines the conversion from React Context API to Redux for state management throughout the application.

## Changes Made

### 1. Created Redux Slices

#### Theme Slice (`src/store/themeSlice.ts`)
- Manages theme mode (`light`, `dark`, `system`)
- Handles dark mode detection
- Manages localStorage persistence
- Handles system theme change events
- Replaces `ThemeContext.tsx`

#### Uploaded File Slice (`src/store/uploadedFileSlice.ts`)
- Manages file content and YAML object state
- Tracks processing status and errors
- Replaces `UploadedFileContext.ts`

### 2. Updated Store Configuration

#### Updated `src/store/store.ts`
- Added `themeReducer` and `uploadedFileReducer` to the store
- Maintains existing `settingsReducer` and `selectionReducer`

### 3. Created Redux-Based Components

#### Redux Theme Provider (`src/components/theme/ReduxThemeProvider.tsx`)
- Replaces `ThemeProvider` from `ThemeContext.tsx`
- Uses Redux state for theme management
- Maintains Ant Design ConfigProvider integration
- Handles system theme change detection

#### Redux App Context (`src/context/ReduxAppContext.tsx`)
- Replaces `AppContext.tsx`
- Exports `useFileUpload` hook for file upload functionality
- Handles YAML object transformation using Redux actions

### 4. Updated Components

#### Theme Toggle (`src/components/theme/ThemeToggle.tsx`)
- Now uses Redux hooks instead of `useTheme` context hook
- Dispatches `setThemeMode` action for theme changes

#### Navbar (`src/components/navbar/Navbar.tsx`)
- Uses `useFileUpload` hook instead of `useUploadFileContext`
- File upload functionality now uses Redux actions

#### Main Component (`src/components/main/Main.tsx`)
- Uses `useAppSelector` to access uploaded file state
- Replaces `useUploadFileContext` with Redux selector

#### Status Bar (`src/components/status/StatusBar.tsx`)
- Uses `useAppSelector` to access YAML object from Redux state
- Replaces `useUploadFileContext` with Redux selector

#### Design Deck (`src/components/deck/DesignDeck.tsx`)
- Uses `useAppSelector` for both theme and uploaded file state
- Removes dependencies on React context hooks

#### Docker Compose Viewer (`src/components/viewer/DockerComposeViewer.tsx`)
- Uses `useAppSelector` to access theme state
- Replaces `useTheme` context hook

### 5. Updated App Structure

#### App Component (`src/App.tsx`)
- Uses `ReduxThemeProvider` instead of `ThemeProvider`
- Uses `ReduxAppContext` instead of `AppContext`
- Maintains the same component structure

### 6. Created Helper Hooks (`src/hooks/useReduxHooks.ts`)
- `useUploadedFile()` - replacement for `useUploadFileContext`
- `useTheme()` - replacement for context-based `useTheme`
- `useFileUpload()` - re-export for file upload functionality

## Benefits of the Migration

1. **Centralized State Management**: All application state is now managed in a single Redux store
2. **Better DevTools**: Redux DevTools provide better debugging capabilities
3. **Predictable State Updates**: All state changes go through reducers with clear actions
4. **Time Travel Debugging**: Redux enables time travel debugging and state replay
5. **Consistency**: Single pattern for state management across the entire application
6. **Scalability**: Easier to add new state slices and manage complex state relationships

## Key Redux Actions

### Theme Actions
- `setThemeMode(mode)` - Sets the theme mode (light/dark/system)
- `updateSystemTheme()` - Updates theme when system preference changes
- `initializeTheme()` - Initializes theme on app startup

### File Upload Actions
- `setFileContent(content)` - Sets the uploaded file content
- `setYamlObject(object)` - Sets the parsed YAML object
- `setProcessingError(error)` - Sets processing error message
- `clearFile()` - Clears all file-related state
- `setProcessing(boolean)` - Sets processing status

## State Structure

```typescript
interface RootState {
  settings: SettingsState
  selection: SelectionState
  theme: {
    themeMode: 'light' | 'dark' | 'system'
    isDark: boolean
  }
  uploadedFile: {
    fileContent?: string | ArrayBuffer
    yamlObject?: YamlDockerCompose | null
    isProcessing: boolean
    error?: string
  }
}
```

## Migration Notes

- All React Context API usage has been removed
- Redux Provider is already configured in `main.tsx`
- Theme persistence and system theme detection work the same as before
- File upload and processing logic remains unchanged, just moved to Redux
- All components now use consistent Redux patterns for state access
