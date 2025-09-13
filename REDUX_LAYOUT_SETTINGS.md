# Redux Dynamic Layout Settings

## Overview
This implementation adds React Redux state management to dynamically control the layout settings for the Docker Deck visualization. The settings now affect the graph layout in real-time.

## Features Implemented

### Redux Store
- **Store**: Configured with Redux Toolkit
- **Settings Slice**: Manages three layout properties:
  - `platformPadding`: Controls the overall padding around groups (10-200px)
  - `nodeLevelPadding`: Controls spacing between nodes (10-150px)  
  - `nodeSize`: Controls the size of individual nodes (50-200px)

### Dynamic Layout Application
- **ElkJsLayoutEngine**: Updated to accept settings and apply them to layout options
- **MapMaker**: Modified to pass settings to node builders and layout engine
- **GroupNodeBuilder**: Enhanced to use dynamic spacing and padding
- **All Node Builders**: Support dynamic width and height based on settings

### Settings Component
- **Real-time Updates**: Settings sliders dispatch Redux actions on change
- **Visual Feedback**: Shows current values and min/max ranges
- **Improved UX**: Better labeled controls with meaningful ranges

## How to Test

1. **Start the Development Server**:
   ```bash
   npm run dev
   ```

2. **Load a Docker Compose File**:
   - Use the file upload feature to load a docker-compose.yaml file
   - The graph will render with default layout settings

3. **Adjust Settings**:
   - Open the Settings panel in the sidebar
   - Move the sliders for:
     - **Platform Padding**: Changes spacing around group containers
     - **Node Level Padding**: Changes spacing between individual nodes
     - **Node Size**: Changes the size of service/network/volume nodes

4. **Observe Real-time Changes**:
   - The graph will automatically re-layout when settings change
   - Changes are applied immediately thanks to Redux state management
   - Each setting affects different aspects of the layout

## Technical Details

### Redux Integration
- `src/store/store.ts`: Main Redux store configuration
- `src/store/settingsSlice.ts`: Settings state management
- `src/store/hooks.ts`: Typed Redux hooks
- `src/main.tsx`: Provider wrapper

### Layout Engine Updates
- Dynamic layout options based on Redux state
- Settings passed through the entire rendering pipeline
- Real-time recalculation of node positions and spacing

### Key Files Modified
- `DesignDeck.tsx`: Connects to Redux and triggers re-renders
- `MapMaker.ts`: Applies settings to node builders
- `ElkJsLayoutEngine.ts`: Uses settings for layout calculations
- `Settings.tsx`: Converted to functional component with Redux

## Settings Ranges

| Setting | Min | Max | Default | Effect |
|---------|-----|-----|---------|--------|
| Platform Padding | 10px | 200px | 100px | Group container padding |
| Node Level Padding | 10px | 150px | 80px | Spacing between nodes |
| Node Size | 50px | 200px | 100px | Individual node dimensions |

The implementation ensures that changes to any setting immediately reflect in the graph layout, providing a responsive and interactive user experience.
