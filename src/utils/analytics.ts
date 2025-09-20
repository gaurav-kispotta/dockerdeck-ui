import { getAnalytics, logEvent, Analytics } from "firebase/analytics";

// Lazy analytics instance getter
let analytics: Analytics | null = null;

const getAnalyticsInstance = (): Analytics | null => {
  try {
    if (!analytics) {
      analytics = getAnalytics();
    }
    return analytics;
  } catch (error) {
    console.warn('Firebase Analytics not initialized yet:', error);
    return null;
  }
};

// Memory monitoring utility
export interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  usedJSHeapSizeMB: number;
  totalJSHeapSizeMB: number;
  jsHeapSizeLimitMB: number;
}

export const getMemoryUsage = (): MemoryInfo | null => {
  // Check if performance.memory is available (Chrome/Edge)
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usedJSHeapSizeMB: Math.round(memory.usedJSHeapSize / 1024 / 1024 * 100) / 100,
      totalJSHeapSizeMB: Math.round(memory.totalJSHeapSize / 1024 / 1024 * 100) / 100,
      jsHeapSizeLimitMB: Math.round(memory.jsHeapSizeLimit / 1024 / 1024 * 100) / 100
    };
  }
  return null;
};

// Analytics event types
export enum AnalyticsEvent {
  FILE_LOADED = 'file_loaded',
  FILE_PROCESSING_START = 'file_processing_start',
  FILE_PROCESSING_SUCCESS = 'file_processing_success',
  FILE_PROCESSING_ERROR = 'file_processing_error',
  VIEWER_OPENED = 'viewer_opened',
  VIEWER_CLOSED = 'viewer_closed',
  SIDEBAR_TOGGLED = 'sidebar_toggled',
  NODE_SELECTED = 'node_selected',
  EDGE_SELECTED = 'edge_selected',
  CONTEXT_MENU_OPENED = 'context_menu_opened',
  MEMORY_CHECK = 'memory_check',
  MEMORY_WARNING = 'memory_warning',
  APP_INTERACTION = 'app_interaction'
}

// Log file loading events
export const logFileEvent = (eventType: AnalyticsEvent, fileData: {
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  processingTime?: number;
  errorMessage?: string;
  servicesCount?: number;
  networksCount?: number;
  volumesCount?: number;
  version?: string;
  [key: string]: any; // Allow additional properties
}) => {
  const analyticsInstance = getAnalyticsInstance();
  if (!analyticsInstance) return;
  
  const memoryInfo = getMemoryUsage();
  
  logEvent(analyticsInstance, eventType, {
    ...fileData,
    memory_used_mb: memoryInfo?.usedJSHeapSizeMB,
    memory_total_mb: memoryInfo?.totalJSHeapSizeMB,
    memory_limit_mb: memoryInfo?.jsHeapSizeLimitMB,
    timestamp: new Date().toISOString(),
    user_agent: navigator.userAgent.substring(0, 100) // Truncate for analytics
  });
};

// Log user interaction events
export const logInteractionEvent = (eventType: AnalyticsEvent, interactionData: {
  component?: string;
  action?: string;
  target?: string;
  duration?: number;
  [key: string]: any;
}) => {
  const analyticsInstance = getAnalyticsInstance();
  if (!analyticsInstance) return;
  
  const memoryInfo = getMemoryUsage();
  
  logEvent(analyticsInstance, eventType, {
    ...interactionData,
    memory_used_mb: memoryInfo?.usedJSHeapSizeMB,
    memory_total_mb: memoryInfo?.totalJSHeapSizeMB,
    memory_limit_mb: memoryInfo?.jsHeapSizeLimitMB,
    timestamp: new Date().toISOString()
  });
};

// Memory monitoring and warnings
export const checkMemoryUsage = (threshold: number = 80) => {
  const analyticsInstance = getAnalyticsInstance();
  const memoryInfo = getMemoryUsage();
  
  if (memoryInfo) {
    const usagePercentage = (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100;
    
    if (analyticsInstance) {
      logEvent(analyticsInstance, AnalyticsEvent.MEMORY_CHECK, {
        memory_used_mb: memoryInfo.usedJSHeapSizeMB,
        memory_total_mb: memoryInfo.totalJSHeapSizeMB,
        memory_limit_mb: memoryInfo.jsHeapSizeLimitMB,
        usage_percentage: Math.round(usagePercentage * 100) / 100,
        timestamp: new Date().toISOString()
      });
      
      if (usagePercentage > threshold) {
        logEvent(analyticsInstance, AnalyticsEvent.MEMORY_WARNING, {
          memory_used_mb: memoryInfo.usedJSHeapSizeMB,
          memory_total_mb: memoryInfo.totalJSHeapSizeMB,
          memory_limit_mb: memoryInfo.jsHeapSizeLimitMB,
          usage_percentage: Math.round(usagePercentage * 100) / 100,
          threshold: threshold,
          timestamp: new Date().toISOString()
        });
        
        console.warn(`Memory usage is at ${usagePercentage.toFixed(1)}%, above threshold of ${threshold}%`);
      }
    }
    
    return {
      ...memoryInfo,
      usagePercentage: Math.round(usagePercentage * 100) / 100,
      isAboveThreshold: usagePercentage > threshold
    };
  }
  
  return null;
};

// Start periodic memory monitoring
export const startMemoryMonitoring = (intervalMs: number = 50 * 60 * 1000) => { // 50 minutes default
  const interval = setInterval(() => {
    checkMemoryUsage();
  }, intervalMs);
  
  // Return cleanup function
  return () => clearInterval(interval);
};

// Log app initialization
export const logAppInitialization = () => {
  const analyticsInstance = getAnalyticsInstance();
  if (!analyticsInstance) return;
  
  const memoryInfo = getMemoryUsage();
  
  logEvent(analyticsInstance, 'app_initialized', {
    memory_used_mb: memoryInfo?.usedJSHeapSizeMB,
    memory_total_mb: memoryInfo?.totalJSHeapSizeMB,
    memory_limit_mb: memoryInfo?.jsHeapSizeLimitMB,
    timestamp: new Date().toISOString(),
    user_agent: navigator.userAgent.substring(0, 100),
    screen_width: window.screen.width,
    screen_height: window.screen.height,
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight
  });
};
