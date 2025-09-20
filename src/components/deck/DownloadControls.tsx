import { useReactFlow } from '@xyflow/react';
import { toPng, toSvg, toJpeg } from 'html-to-image';
import { useState } from 'react';

interface DownloadControlsProps {
  className?: string;
}

function DownloadControls({ className = 'absolute top-4 right-4 z-10' }: DownloadControlsProps) {
  const { getNodes, getViewport } = useReactFlow();
  const [isDownloading, setIsDownloading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const downloadImage = async (format: 'png' | 'svg' | 'jpeg') => {
    setIsDownloading(true);
    setShowOptions(false);
    
    try {
      // Get the React Flow viewport element
      const reactFlowElement = document.querySelector('.react-flow__viewport') as HTMLElement;
      
      if (!reactFlowElement) {
        console.error('React Flow viewport element not found');
        return;
      }

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      const filename = `docker-compose-graph-${timestamp}.${format}`;

      let dataUrl: string;
      
      const downloadOptions = {
        backgroundColor: '#ffffff',
        quality: 1.0,
        pixelRatio: 2, // Higher quality
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        }
      };

      if (format === 'png') {
        dataUrl = await toPng(reactFlowElement, downloadOptions);
      } else if (format === 'jpeg') {
        dataUrl = await toJpeg(reactFlowElement, downloadOptions);
      } else {
        dataUrl = await toSvg(reactFlowElement, {
          backgroundColor: '#ffffff',
          style: downloadOptions.style
        });
      }

      // Create download link
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadJSON = () => {
    const nodes = getNodes();
    const viewport = getViewport();
    
    const data = {
      nodes,
      viewport,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };

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
  const hasContent = nodes.length > 0;

  if (!hasContent) {
    return null; // Don't show download button if no content
  }

  return (
    <div className={className}>
      <div className="flex flex-col gap-2 bg-white border border-gray-300 rounded-lg shadow-lg p-3">
        <div className="flex items-center justify-between mb-1">
          <div className="text-sm font-medium text-gray-700">
            Export Graph
          </div>
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        <button
          onClick={() => downloadImage('png')}
          disabled={isDownloading}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isDownloading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Download PNG</span>
            </>
          )}
        </button>

        {showOptions && (
          <>
            <button
              onClick={() => downloadImage('svg')}
              disabled={isDownloading}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>Download SVG</span>
            </button>

            <button
              onClick={() => downloadImage('jpeg')}
              disabled={isDownloading}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Download JPEG</span>
            </button>

            <button
              onClick={downloadJSON}
              disabled={isDownloading}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export JSON</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default DownloadControls;