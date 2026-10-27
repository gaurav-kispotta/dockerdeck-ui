import { useState } from 'react';
import { toPng, toJpeg, toSvg } from 'html-to-image';
import { useAppSelector } from './useReduxHooks';

export type ExportFormat = 'png' | 'jpg' | 'svg';

function getViewport(): HTMLElement | null {
  return document.querySelector('.react-flow__viewport') as HTMLElement | null;
}

function triggerDownload(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function useExport() {
  const [isExporting, setIsExporting] = useState(false);
  const nodes    = useAppSelector((s) => s.dockerdeck.nodes);
  const hasNodes = nodes.length > 0;

  async function exportImage(format: ExportFormat) {
    const el = getViewport();
    if (!el) return;

    setIsExporting(true);
    try {
      const date = new Date().toISOString().split('T')[0];
      const opts = { backgroundColor: '#ffffff', quality: 1.0, pixelRatio: 2 };

      let dataUrl: string;
      let ext: string;
      if (format === 'png') {
        dataUrl = await toPng(el, opts);
        ext = 'png';
      } else if (format === 'jpg') {
        dataUrl = await toJpeg(el, opts);
        ext = 'jpg';
      } else {
        dataUrl = await toSvg(el, { backgroundColor: '#ffffff' });
        ext = 'svg';
      }
      triggerDownload(dataUrl, `docker-compose-${date}.${ext}`);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  }

  function exportJson() {
    const date = new Date().toISOString().split('T')[0];
    const data = { nodes, timestamp: new Date().toISOString(), version: '1.0' };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, `docker-compose-${date}.json`);
    URL.revokeObjectURL(url);
  }

  return { exportImage, exportJson, isExporting, hasNodes };
}

