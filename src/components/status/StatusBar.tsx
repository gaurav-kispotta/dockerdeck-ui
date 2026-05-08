import { useState } from 'react';
import { Badge, Switch, Space, Typography, Divider, Button, Tooltip, Select } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../../hooks/useReduxHooks';
import { useViewer } from '../../hooks/useReduxHooks';
import { setDebugMode, setShowDependencies, setMapLayout, setEdgeStyle, MapLayout, EdgeStyle } from '../../store/slices/settingsSlice';
import { T } from '../../styles/tokens';
import SettingsModal from '../modals/SettingsModal';

const { Text } = Typography;

const MAP_LAYOUT_LABELS: Record<MapLayout, string> = {
  layered: 'Layered',
  dagre:   'Dagre',
  elk:     'ELK',
};

const EDGE_STYLE_LABELS: Record<EdgeStyle, string> = {
  orthogonal: 'Orthogonal',
  bridge:     'Bridge',
  bezier:     'Bezier',
  smoothstep: 'Smooth Step',
  straight:   'Straight',
};

const selectStyle: React.CSSProperties = {
  fontSize: 11,
  fontFamily: 'ui-monospace,Menlo,monospace',
};

export default function StatusBar() {
  const { yamlObject } = useAppSelector((s) => s.uploadedFile);
  const { showDependencies, debugMode, mapLayout, edgeStyle } = useAppSelector((s) => s.settings);
  const { isViewerVisible, toggleViewer } = useViewer();
  const dispatch = useAppDispatch();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const serviceCount = yamlObject?.services ? Object.keys(yamlObject.services).length : 0;
  const networkCount = yamlObject?.networks ? Object.keys(yamlObject.networks).length : 0;
  const volumeCount  = yamlObject?.volumes  ? Object.keys(yamlObject.volumes).length  : 0;

  return (
    <>
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <div style={{
        height: 32, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 12,
        borderTop: '1px solid var(--ant-color-border)',
        fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11,
        flexShrink: 0,
      }}>
        {/* Settings cog */}
        <Tooltip title="Settings">
          <Button
            type="text"
            size="small"
            icon={<SettingOutlined style={{ fontSize: 13 }} />}
            onClick={() => setSettingsOpen(true)}
            style={{ width: 24, height: 24, minWidth: 'unset', padding: 0, display: 'grid', placeItems: 'center' }}
          />
        </Tooltip>

        <Divider type="vertical" style={{ height: 14, margin: '0 2px' }} />

        {/* Left — counters */}
        <Space size={12}>
          <Space size={4}>
            <Badge color={T.cyan} />
            <Text style={{ fontSize: 11, fontFamily: 'inherit' }}>Networks {networkCount}</Text>
          </Space>
          <Space size={4}>
            <Badge color={T.violet} />
            <Text style={{ fontSize: 11, fontFamily: 'inherit' }}>Services {serviceCount}</Text>
          </Space>
          <Space size={4}>
            <Badge color={T.amber} />
            <Text style={{ fontSize: 11, fontFamily: 'inherit' }}>Volumes {volumeCount}</Text>
          </Space>
        </Space>

        <div style={{ flex: 1 }} />

        {/* Controls */}
        <Space size={10}>
          <Space size={6}>
            <Text type="secondary" style={{ fontSize: 11, fontFamily: 'inherit' }}>↳ deps</Text>
            <Switch
              size="small"
              checked={showDependencies}
              onChange={v => dispatch(setShowDependencies(v))}
              style={{ backgroundColor: showDependencies ? T.rose : undefined }}
            />
          </Space>
          <Space size={6}>
            <Text type="secondary" style={{ fontSize: 11, fontFamily: 'inherit' }}>⬡ debug</Text>
            <Switch
              size="small"
              checked={debugMode}
              onChange={v => dispatch(setDebugMode(v))}
              style={{ backgroundColor: debugMode ? T.amber : undefined }}
            />
          </Space>
          <Space size={6}>
            <Text type="secondary" style={{ fontSize: 11, fontFamily: 'inherit' }}>&lt;/&gt; yaml</Text>
            <Switch
              size="small"
              checked={isViewerVisible}
              onChange={() => toggleViewer()}
              style={{ backgroundColor: isViewerVisible ? T.cyan : undefined }}
            />
          </Space>
        </Space>

        <Divider type="vertical" style={{ height: 14, margin: '0 2px' }} />

        {/* Quick-change: Map Layout & Edge Style */}
        <Space size={6}>
          <Tooltip title="Map layout">
            <Select
              size="small"
              variant="borderless"
              value={mapLayout}
              onChange={(v) => dispatch(setMapLayout(v))}
              style={selectStyle}
              options={(Object.entries(MAP_LAYOUT_LABELS) as [MapLayout, string][]).map(([value, label]) => ({ value, label }))}
              suffixIcon={null}
            />
          </Tooltip>
          <Text type="secondary" style={{ fontSize: 11, fontFamily: 'inherit' }}>·</Text>
          <Tooltip title="Edge style">
            <Select
              size="small"
              variant="borderless"
              value={edgeStyle}
              onChange={(v) => dispatch(setEdgeStyle(v))}
              style={selectStyle}
              options={(Object.entries(EDGE_STYLE_LABELS) as [EdgeStyle, string][]).map(([value, label]) => ({ value, label }))}
              suffixIcon={null}
            />
          </Tooltip>
        </Space>

        <Divider type="vertical" style={{ height: 14, margin: '0 2px' }} />

        <Text style={{ fontSize: 11, fontFamily: 'inherit' }}>made with ♥ in Bengaluru 🇮🇳</Text>
      </div>
    </>
  );
}
