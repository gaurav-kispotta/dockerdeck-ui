import { useRef } from 'react';
import { Button, Tag, Tooltip, Typography, Divider, Space, Dropdown } from 'antd';
import { UploadOutlined, CheckOutlined, SearchOutlined, DownloadOutlined, DownOutlined, LoadingOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useFileUpload } from '../../hooks/useFileUpload';
import { useAppSelector } from '../../hooks/useReduxHooks';
import { useElectron } from '../../hooks/useElectron';
import { useExport } from '../../hooks/useExport';
import { ThemeToggle } from '../theme/ThemeToggle';
import packageJson from '../../../package.json';
import { T } from '../../styles/tokens';

const { Text } = Typography;

export function Navbar() {
  const { uploadFile } = useFileUpload();
  const { fileName, yamlObject } = useAppSelector((s) => s.uploadedFile);
  const isDark = useAppSelector((s) => s.theme.isDark);
  const { leftInset, rightInset } = useElectron();
  const { exportImage, exportJson, isExporting, hasNodes } = useExport();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const serviceCount = yamlObject?.services ? Object.keys(yamlObject.services).length : 0;
  const networkCount = yamlObject?.networks ? Object.keys(yamlObject.networks).length : 0;
  const volumeCount  = yamlObject?.volumes  ? Object.keys(yamlObject.volumes).length  : 0;

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    await uploadFile(file, file.name);
  }

  const chipMeta = yamlObject
    ? `· ${serviceCount} svc · ${networkCount} net · ${volumeCount} vol`
    : null;

  return (
    <div
      className="electron-drag h-[52px] flex items-center gap-[14px] shrink-0"
      style={{ paddingLeft: 16 + leftInset, paddingRight: 16 + rightInset }}
    >
      {/* Logo */}
      <Space size={8} align="center">
        <div
          className="w-[26px] h-[26px] rounded-[7px] grid place-items-center text-[13px] font-extrabold shrink-0 text-[#0B0E14]"
          style={{ background: `linear-gradient(135deg, ${T.cyan}, ${T.violet})` }}
        >D</div>
        <Text strong style={{ letterSpacing: -0.2, fontSize: 14 }}>
          docker<span style={{ color: isDark ? T.cyan : T.violet }}>·</span>deck
        </Text>
        <Tag color="purple" style={{ fontSize: 9, lineHeight: '16px', marginInlineEnd: 0 }}>alpha</Tag>
        <Tag color="green" style={{ fontSize: 9, lineHeight: '16px', fontFamily: 'ui-monospace,Menlo,monospace', marginInlineEnd: 0 }}>
          v{packageJson.version}
        </Tag>
      </Space>

      {/* Centered file chip — acts as the upload trigger */}
      <div className="flex-1 flex justify-center electron-no-drag">
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="max-w-[520px] font-mono text-[12px]"
          icon={<UploadOutlined style={{ color: T.cyan }} />}
        >
          <Text ellipsis style={{ maxWidth: 260, fontSize: 12 }}>
            {fileName ?? 'Upload docker-compose.yml'}
          </Text>
          {chipMeta && (
            <Text type="secondary" className="text-[11px] ml-1.5 whitespace-nowrap">{chipMeta}</Text>
          )}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".yaml,.yml"
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {/* Right controls */}
      <Space size={4} className="electron-no-drag">
        <Tooltip title="Validate">
          <Button type="text" icon={<CheckOutlined />} size="small" />
        </Tooltip>
        <Tooltip title="Search">
          <Button type="text" icon={<SearchOutlined />} size="small" />
        </Tooltip>
        <Divider type="vertical" style={{ height: 22, margin: '0 2px' }} />
        <ThemeToggle />
        <Divider type="vertical" style={{ height: 22, margin: '0 2px' }} />
        <Dropdown
          disabled={!hasNodes}
          menu={{
            items: [
              { key: 'jpg',  label: 'Export as JPG',  onClick: () => exportImage('jpg') },
              { key: 'svg',  label: 'Export as SVG',  onClick: () => exportImage('svg') },
              { type: 'divider' },
              { key: 'json', label: 'Export JSON',    onClick: exportJson },
            ] satisfies MenuProps['items'],
          }}
          placement="bottomRight"
          trigger={['click']}
        >
          <Space.Compact size="small">
            <Button
              icon={isExporting ? <LoadingOutlined /> : <DownloadOutlined />}
              disabled={!hasNodes || isExporting}
              onClick={(e) => { e.stopPropagation(); exportImage('png'); }}
            >
              PNG
            </Button>
            <Button icon={<DownOutlined />} disabled={!hasNodes || isExporting} />
          </Space.Compact>
        </Dropdown>
      </Space>
    </div>
  );
}
