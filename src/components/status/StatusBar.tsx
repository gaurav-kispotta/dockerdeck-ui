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
      <div className="h-8 flex items-center px-3.5 gap-3 font-mono text-[11px] shrink-0">
        {/* Settings cog */}
        <Tooltip title="Settings">
          <Button
            type="text"
            size="small"
            icon={<SettingOutlined className="text-[13px]" />}
            onClick={() => setSettingsOpen(true)}
            className="!w-6 !h-6 !min-w-0 !p-0 grid place-items-center"
          />
        </Tooltip>

        <Divider type="vertical" style={{ height: 14, margin: '0 2px' }} />

        {/* Left — counters */}
        <Space size={12}>
          <Space size={4}>
            <Badge color={T.cyan} />
            <Text className="text-[11px] font-[inherit]">Networks {networkCount}</Text>
          </Space>
          <Space size={4}>
            <Badge color={T.violet} />
            <Text className="text-[11px] font-[inherit]">Services {serviceCount}</Text>
          </Space>
          <Space size={4}>
            <Badge color={T.amber} />
            <Text className="text-[11px] font-[inherit]">Volumes {volumeCount}</Text>
          </Space>
        </Space>

        <div className="flex-1" />

        {/* Controls */}
        <Space size={10}>
          <Space size={6}>
            <Text type="secondary" className="text-[11px] font-[inherit]">↳ deps</Text>
            <Switch
              size="small"
              checked={showDependencies}
              onChange={v => dispatch(setShowDependencies(v))}
              style={{ backgroundColor: showDependencies ? T.rose : undefined }}
            />
          </Space>
          <Space size={6}>
            <Text type="secondary" className="text-[11px] font-[inherit]">⬡ debug</Text>
            <Switch
              size="small"
              checked={debugMode}
              onChange={v => dispatch(setDebugMode(v))}
              style={{ backgroundColor: debugMode ? T.amber : undefined }}
            />
          </Space>
          <Space size={6}>
            <Text type="secondary" className="text-[11px] font-[inherit]">&lt;/&gt; yaml</Text>
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
              style={{ fontSize: 11, fontFamily: 'ui-monospace,Menlo,monospace' }}
              options={(Object.entries(MAP_LAYOUT_LABELS) as [MapLayout, string][]).map(([value, label]) => ({ value, label }))}
              suffixIcon={null}
            />
          </Tooltip>
          <Text type="secondary" className="text-[11px] font-[inherit]">·</Text>
          <Tooltip title="Edge style">
            <Select
              size="small"
              variant="borderless"
              value={edgeStyle}
              onChange={(v) => dispatch(setEdgeStyle(v))}
              style={{ fontSize: 11, fontFamily: 'ui-monospace,Menlo,monospace' }}
              options={(Object.entries(EDGE_STYLE_LABELS) as [EdgeStyle, string][]).map(([value, label]) => ({ value, label }))}
              suffixIcon={null}
            />
          </Tooltip>
        </Space>

        <Divider type="vertical" style={{ height: 14, margin: '0 2px' }} />

        <Text className="text-[11px] font-[inherit]">made with ♥ in Bengaluru 🇮🇳</Text>
      </div>
    </>
  );
}
