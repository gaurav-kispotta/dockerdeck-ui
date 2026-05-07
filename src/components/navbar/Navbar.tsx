import { useRef } from 'react';
import { Button, Tag, Tooltip, Typography, Divider, Space } from 'antd';
import { UploadOutlined, CheckOutlined, SearchOutlined } from '@ant-design/icons';
import { useFileUpload } from '../../hooks/useFileUpload';
import { useAppSelector } from '../../hooks/useReduxHooks';
import { useElectron } from '../../hooks/useElectron';
import { ThemeToggle } from '../theme/ThemeToggle';
import packageJson from '../../../package.json';
import { T } from '../../styles/tokens';

const { Text } = Typography;

export function Navbar() {
  const { uploadFile } = useFileUpload();
  const { fileName, yamlObject } = useAppSelector((s) => s.uploadedFile);
  const isDark = useAppSelector((s) => s.theme.isDark);
  const { leftInset, rightInset } = useElectron();

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
      className="electron-drag"
      style={{
        height: 52,
        display: 'flex',
        alignItems: 'center',
        paddingLeft:  16 + leftInset,
        paddingRight: 16 + rightInset,
        borderBottom: '1px solid var(--ant-color-border)',
        gap: 14,
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <Space size={8} align="center">
        <div style={{
          width: 26, height: 26, borderRadius: 7,
          background: `linear-gradient(135deg, ${T.cyan}, ${T.violet})`,
          display: 'grid', placeItems: 'center',
          color: '#0B0E14', fontWeight: 800, fontSize: 13, flexShrink: 0,
        }}>D</div>
        <Text strong style={{ letterSpacing: -0.2, fontSize: 14 }}>
          docker<span style={{ color: isDark ? T.cyan : T.violet }}>·</span>deck
        </Text>
        <Tag color="purple" style={{ fontSize: 9, lineHeight: '16px', marginInlineEnd: 0 }}>alpha</Tag>
        <Tag color="green" style={{ fontSize: 9, lineHeight: '16px', fontFamily: 'ui-monospace,Menlo,monospace', marginInlineEnd: 0 }}>
          v{packageJson.version}
        </Tag>
      </Space>

      {/* Centered file chip — acts as the upload trigger */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }} className="electron-no-drag">
        <Button
          onClick={() => fileInputRef.current?.click()}
          style={{ maxWidth: 520, fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 12 }}
          icon={<UploadOutlined style={{ color: T.cyan }} />}
        >
          <Text ellipsis style={{ maxWidth: 260, fontSize: 12 }}>
            {fileName ?? 'Upload docker-compose.yml'}
          </Text>
          {chipMeta && (
            <Text type="secondary" style={{ fontSize: 11, marginLeft: 6, whiteSpace: 'nowrap' }}>{chipMeta}</Text>
          )}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".yaml,.yml"
          style={{ display: 'none' }}
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
        <Button
          type="primary"
          icon={<UploadOutlined />}
          size="small"
          onClick={() => fileInputRef.current?.click()}
        >
          Upload
        </Button>
      </Space>
    </div>
  );
}

