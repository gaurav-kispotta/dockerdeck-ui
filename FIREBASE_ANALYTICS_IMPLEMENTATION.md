# Firebase Analytics Implementation Summary

This document outlines the comprehensive Firebase Analytics implementation for DockerDeck UI, including user interaction tracking and browser memory monitoring.

## 🚀 Features Implemented

### 1. Core Analytics Infrastructure (`src/utils/analytics.ts`)

#### Analytics Events Tracked:
- `FILE_LOADED` - When a user selects a file to upload
- `FILE_PROCESSING_START` - When file processing begins
- `FILE_PROCESSING_SUCCESS` - When file is successfully processed with metadata
- `FILE_PROCESSING_ERROR` - When file processing fails
- `VIEWER_OPENED` - When the YAML/AST viewer is opened
- `VIEWER_CLOSED` - When the YAML/AST viewer is closed
- `SIDEBAR_TOGGLED` - When the sidebar is toggled open/closed
- `NODE_SELECTED` - When a node is selected in the graph
- `EDGE_SELECTED` - When an edge is selected in the graph
- `CONTEXT_MENU_OPENED` - When right-click context menu is opened
- `MEMORY_CHECK` - Periodic memory usage reporting
- `MEMORY_WARNING` - When memory usage exceeds threshold
- `APP_INTERACTION` - General user interactions

#### Memory Monitoring:
- Real-time JavaScript heap usage tracking
- Memory usage percentage calculation
- Configurable warning thresholds
- Automatic periodic monitoring
- Support for browsers with `performance.memory` API

### 2. File Upload Analytics (`src/context/ReduxAppContext.tsx`)

**Tracked Data:**
- File name and size
- File type (yaml/yml)
- Processing time in milliseconds
- Docker Compose structure metrics:
  - Number of services
  - Number of networks  
  - Number of volumes
  - Docker Compose version
- Memory usage during processing
- Error messages if processing fails

### 3. User Interaction Analytics

#### Navbar Component (`src/components/navbar/Navbar.tsx`)
- File selection events with metadata
- Memory status display integration

#### Main Component (`src/components/main/Main.tsx`)
- Sidebar toggle tracking
- Context menu interaction tracking

#### Graph Interactions (`src/components/deck/DesignDeck.tsx`)
- Node selection with connection metadata
- Edge selection with relationship data
- Clear selection events

#### Selection Management (`src/store/selectionSlice.ts`)
- Node selection events with connected elements count
- AST-Graph synchronization tracking

#### Viewer Controls (`src/hooks/useReduxHooks.ts`)
- Viewer show/hide events
- Toggle state tracking

### 4. Memory Monitoring Components

#### Memory Monitor Hook (`src/hooks/useMemoryMonitor.ts`)
**Features:**
- Configurable monitoring intervals
- Memory warning callbacks
- Real-time memory info updates
- High memory usage detection
- Force memory check capability

#### Memory Status Component (`src/components/status/MemoryStatus.tsx`)
**Features:**
- Visual memory usage indicator
- Color-coded status (green/orange/red)
- Detailed tooltip with memory breakdown
- Warning icon for high usage
- Compact and detailed display modes

### 5. App Initialization (`src/main.tsx`)

**Startup Analytics:**
- Browser and device information
- Screen resolution and viewport size
- Initial memory usage
- Automatic memory monitoring activation

## 📊 Data Collected

### File Operations
```typescript
{
  fileName: string,
  fileSize: number,
  fileType: string,
  processingTime: number,
  servicesCount: number,
  networksCount: number,
  volumesCount: number,
  version: string,
  memory_used_mb: number,
  memory_total_mb: number,
  memory_limit_mb: number,
  timestamp: string
}
```

### User Interactions
```typescript
{
  component: string,
  action: string,
  target?: string,
  nodeId?: string,
  edgeId?: string,
  connectionType?: string,
  newState?: string,
  memory_used_mb: number,
  timestamp: string
}
```

### Memory Monitoring
```typescript
{
  memory_used_mb: number,
  memory_total_mb: number,
  memory_limit_mb: number,
  usage_percentage: number,
  threshold?: number,
  timestamp: string
}
```

## 🔧 Configuration

### Memory Monitoring Settings
- **Default Interval**: 50 minutes
- **Warning Threshold**: 80% memory usage
- **Supported Browsers**: Chrome, Edge (with `performance.memory`)

### Analytics Settings
- **Auto Collection**: Enabled
- **Firebase Config**: Pre-configured for `docker-deck` project
- **Event Batching**: Handled by Firebase SDK

## 🎯 Benefits

1. **Performance Monitoring**: Track memory usage patterns and identify potential memory leaks
2. **User Behavior Analytics**: Understand how users interact with different features
3. **Error Tracking**: Detailed file processing error analytics
4. **Feature Usage**: Track which features are most/least used
5. **Performance Optimization**: Identify slow operations and bottlenecks

## 🚀 Usage

### Viewing Analytics
1. Firebase Console → Analytics → Events
2. Filter by custom events (file_loaded, node_selected, etc.)
3. Monitor memory_check events for performance trends
4. Track conversion funnels from file upload to visualization

### Memory Status
- Visual indicator in navbar
- Hover for detailed memory breakdown
- Automatic warnings for high usage

### Custom Events
```typescript
import { logInteractionEvent, AnalyticsEvent } from '../utils/analytics'

logInteractionEvent(AnalyticsEvent.APP_INTERACTION, {
  component: 'my-component',
  action: 'custom-action',
  customData: 'value'
})
```

## 🔮 Future Enhancements

1. **Error Boundary Analytics**: Track React error boundaries
2. **Performance Metrics**: Page load times, render performance
3. **User Journey Analytics**: Track complete user workflows
4. **A/B Testing**: Feature flag and variant tracking
5. **Custom Dashboards**: Real-time analytics visualization within the app
6. **Crash Reporting**: Integration with Firebase Crashlytics
7. **Network Performance**: API response time tracking

## 📱 Browser Compatibility

- **Memory Monitoring**: Chrome 69+, Edge 79+ (with `performance.memory`)
- **Analytics**: All modern browsers with Firebase support
- **Graceful Degradation**: Features work without memory API support
