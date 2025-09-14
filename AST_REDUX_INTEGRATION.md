# Docker Compose AST Redux Integration

This document describes the implementation of storing the Docker Compose AST (Abstract Syntax Tree) in the Redux state.

## Changes Made

### 1. Updated `uploadedFileSlice.ts`
- Added proper TypeScript types for the AST object
- Added `setAstObject` action to store the AST
- Updated `clearFile` action to also clear the AST
- Imported `IDockerComposeAst` interface from the AST builder

### 2. Updated `DockerComposeAstBuilder.ts`
- Exported the `IDockerComposeAst` interface to make it available for typing

### 3. Updated `MapMaker.ts`
- Modified `buildMap3` method to accept an optional `dispatch` parameter
- Added logic to dispatch the generated AST to Redux state when dispatch is provided
- Added necessary imports for Redux types and actions

### 4. Updated `DesignDeck.tsx`
- Modified the call to `buildMap3` to pass the dispatch function
- Added dispatch to the useEffect dependency array

### 5. Added Utility Components and Hooks
- **`AstDebugViewer.tsx`**: A debug component to visualize the AST stored in Redux
- **`useDockerComposeAst.ts`**: Custom hooks for accessing AST data from Redux

## Usage

### Accessing the AST in Components

```tsx
import { useDockerComposeAst, useDockerComposeAstData } from '../hooks/useDockerComposeAst';

function MyComponent() {
    // Get the full AST object
    const ast = useDockerComposeAst();
    
    // Or get specific data with fallbacks
    const { services, networks, volumes, hasAst } = useDockerComposeAstData();
    
    if (!hasAst) {
        return <div>No Docker Compose data available</div>;
    }
    
    return (
        <div>
            <h3>Services: {services.length}</h3>
            <h3>Networks: {networks.length}</h3>
            <h3>Volumes: {volumes.length}</h3>
        </div>
    );
}
```

### Redux State Structure

The AST is stored in the Redux state at:
```
state.uploadedFile.astObject
```

The AST object has the following structure:
```typescript
interface IDockerComposeAst {
    services: IDockerService[];
    networks?: IDockerNetwork[];
    volumes?: IDockerVolume[];
}
```

### Debugging

To view the current AST in the application, you can temporarily add the `AstDebugViewer` component:

```tsx
import AstDebugViewer from './components/debug/AstDebugViewer';

// Add this somewhere in your component tree
<AstDebugViewer />
```

## Flow

1. User uploads a Docker Compose file
2. YAML is parsed and stored in `yamlObject`
3. `DesignDeck` component detects the YAML change
4. `MapMaker.buildMap3()` is called with the dispatch function
5. `DockerComposeAstBuilder` creates the AST
6. AST is dispatched to Redux via `setAstObject` action
7. AST is now available throughout the application via Redux selectors

## Benefits

- **Centralized State**: AST is available to all components via Redux
- **Performance**: AST is built once and reused
- **Type Safety**: Proper TypeScript interfaces ensure type safety
- **Debugging**: Easy to inspect AST data for debugging purposes
- **Extensibility**: Other components can now access parsed Docker Compose data without re-parsing
