import { useReactFlow } from '@xyflow/react';
import { toPng, toSvg, toJpeg } from 'html-to-image';
import { useState } from 'react';
import { Button, Dropdown, Space } from 'antd';
import { DownloadOutlined, DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

interface DownloadControlsProps {
  className?: string;
}

function DownloadControls({ className = 'absolute top-4 right-4 z-10' }: DownloadControlsProps) {
  const { getNodes, getViewport } = useReactFlow();
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadImage = async (format: 'png' | 'svg' | 'jpeg') => {
    setIsDownloading(true);
    try {
      const reactFlowElement = document.querySelector('.react-flow__viewport') as HTMLElement;
      if (!reactFlowElement) {
        console.error('React Flow viewport element not found');
        return;
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      const filename = `docker-compose-graph-${timestamp}.${format}`;

      const opts = {
        backgroundColor: '#ffffff',
        quality: 1.0,
        pixelRatio: 2,
        style: { transform: 'scale(1)', transformOrigin: 'top left' },
      };

      let dataUrl: string;
      if (format === 'png') dataUrl = await toPng(reactFlowElement, opts);
      else if (format === 'jpeg') dataUrl = await toJpeg(reactFlowElement, opts);
      else dataUrl = await toSvg(reactFlowElement, { backgroundColor: '#ffffff', style: opts.style });

      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading image:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadJSON = () => {
    const nodes = getNodes();
    const viewport = getViewport();
    const data = { nodes, viewport, timestamp: new Date().toISOString(), version: '1.0' };
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `docker-compose-graph-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const nodes = getNodes();
  if (nodes.length === 0) return null;

  const menuItems: MenuProps['items'] = [
    { key: 'svg',  label: 'Download SVG',  onClick: () => downloadImage('svg') },
    { key: 'jpeg', label: 'Download JPEG', onClick: () => downloadImage('jpeg') },
    { type: 'divider' },
    { key: 'json', label: 'Export JSON',   onClick: downloadJSON },
  ];

  return (
    <div className={className}>
      <Space.Compact>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          loading={isDownloading}
          onClick={() => downloadImage('png')}
          size="small"
        >
          {isDownloading ? 'Exporting…' : 'PNG'}
        </Button>
        <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={['click']}>
          <Button type="primary" size="small" icon={<DownOutlined />} />
        </Dropdown>
      </Space.Compact>
    </div>
  );
}

export default DownloadControls;