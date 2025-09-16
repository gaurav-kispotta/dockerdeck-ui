import { useEffect, useState, useCallback, useRef } from 'react';
import { MemoryInfo, getMemoryUsage, checkMemoryUsage } from '../utils/analytics';

interface UseMemoryMonitorOptions {
  enabled?: boolean;
  intervalMs?: number;
  warningThreshold?: number;
  onMemoryWarning?: (memoryInfo: MemoryInfo & { usagePercentage: number }) => void;
}

export const useMemoryMonitor = (options: UseMemoryMonitorOptions = {}) => {
  const {
    enabled = true,
    intervalMs = 50 * 60 * 1000, // 50 minutes (3,000,000 ms)
    warningThreshold = 80,
    onMemoryWarning
  } = options;

  const [memoryInfo, setMemoryInfo] = useState<MemoryInfo | null>(null);
  const [isHighMemoryUsage, setIsHighMemoryUsage] = useState(false);
  
  // Use ref to store the callback to avoid recreating it
  const onMemoryWarningRef = useRef(onMemoryWarning);
  onMemoryWarningRef.current = onMemoryWarning;

  const updateMemoryInfo = useCallback(() => {
    const memory = getMemoryUsage();
    setMemoryInfo(memory);

    if (memory) {
      const usagePercentage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
      const isHigh = usagePercentage > warningThreshold;
      setIsHighMemoryUsage(isHigh);

      if (isHigh && onMemoryWarningRef.current) {
        onMemoryWarningRef.current({
          ...memory,
          usagePercentage
        });
      }
    }
  }, [warningThreshold]); // Only depend on warningThreshold

  const forceMemoryCheck = useCallback(() => {
    const result = checkMemoryUsage(warningThreshold);
    updateMemoryInfo();
    return result;
  }, [warningThreshold, updateMemoryInfo]);

  useEffect(() => {
    if (!enabled) return;

    // Initial check
    updateMemoryInfo();

    // Set up interval
    const interval = setInterval(() => {
      updateMemoryInfo();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [enabled, intervalMs, updateMemoryInfo]);

  return {
    memoryInfo,
    isHighMemoryUsage,
    forceMemoryCheck,
    isSupported: 'memory' in performance
  };
};
