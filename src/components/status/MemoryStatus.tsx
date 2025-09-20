import React, { useCallback } from 'react';
import { Badge, Tooltip, Typography } from 'antd';
import { WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useMemoryMonitor } from '../../hooks/useMemoryMonitor';

const { Text } = Typography;

interface MemoryStatusProps {
  showDetails?: boolean;
  warningThreshold?: number;
}

export const MemoryStatus: React.FC<MemoryStatusProps> = ({ 
  showDetails = false, 
  warningThreshold = 80 
}) => {
  // Memoize the warning callback to prevent re-renders
  const handleMemoryWarning = useCallback((info: any) => {
    console.warn(`High memory usage detected: ${info.usagePercentage.toFixed(1)}%`);
  }, []);

  const { memoryInfo, isHighMemoryUsage, isSupported } = useMemoryMonitor({
    warningThreshold,
    intervalMs: 50 * 60 * 1000, // 50 minutes in milliseconds
    onMemoryWarning: handleMemoryWarning
  });

  if (!isSupported || !memoryInfo) {
    return null;
  }

  const usagePercentage = (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100;
  const statusColor = isHighMemoryUsage ? 'red' : usagePercentage > 60 ? 'orange' : 'green';
  const statusIcon = isHighMemoryUsage ? <WarningOutlined /> : <CheckCircleOutlined />;

  const tooltipContent = (
    <div>
      <div>Used: {memoryInfo.usedJSHeapSizeMB} MB</div>
      <div>Total: {memoryInfo.totalJSHeapSizeMB} MB</div>
      <div>Limit: {memoryInfo.jsHeapSizeLimitMB} MB</div>
      <div>Usage: {usagePercentage.toFixed(1)}%</div>
    </div>
  );

  if (showDetails) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Badge color={statusColor} />
        <Text type={isHighMemoryUsage ? 'danger' : 'secondary'}>
          Memory: {memoryInfo.usedJSHeapSizeMB} / {memoryInfo.jsHeapSizeLimitMB} MB 
          ({usagePercentage.toFixed(1)}%)
        </Text>
        {isHighMemoryUsage && statusIcon}
      </div>
    );
  }

  return (
    <Tooltip title={tooltipContent}>
      <Badge 
        color={statusColor} 
        size="small"
        style={{ cursor: 'pointer' }}
      />
    </Tooltip>
  );
};

export default MemoryStatus;
