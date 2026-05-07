import { useState, useMemo } from 'react';
import { Input, Typography, Badge, Tag, Tooltip, List, Empty, ConfigProvider, theme as antTheme } from 'antd';
import './OutlinePanel.css';
import { SearchOutlined } from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../../hooks/useReduxHooks';
import { selectNode } from '../../store/slices/selectionSlice';
import { T } from '../../styles/tokens';
import { getIconUrl, VOLUME_ICON } from '../../utils/nodeIcons';

const { Text } = Typography;

export default function OutlinePanel() {
  const isDark = useAppSelector((s) => s.theme.isDark);
  const { yamlObject, astObject } = useAppSelector((s) => s.uploadedFile);
  const { selectedNodeId } = useAppSelector((s) => s.selection);
  const edges = useAppSelector((s) => s.dockerdeck.edges);
  const dispatch = useAppDispatch();

  const [filter, setFilter] = useState('');

  const services = useMemo(() => astObject?.services ?? [], [astObject]);
  const networks = useMemo(() => astObject?.networks ?? [], [astObject]);
  const volumes  = useMemo(() => astObject?.volumes  ?? [], [astObject]);

  const q = filter.toLowerCase();
  const filteredServices = q ? services.filter(s => s.name.toLowerCase().includes(q) || s.image.name.toLowerCase().includes(q)) : services;
  const filteredNetworks  = q ? networks.filter(n => n.name?.toLowerCase().includes(q)) : networks;
  const filteredVolumes   = q ? volumes.filter(v => v.name?.toLowerCase().includes(q))  : volumes;

  function handleSelectService(name: string) {
    const connectedEdgeIds: string[] = [];
    const connectedNodeIds: string[] = [];
    edges.forEach(e => {
      if (e.source === name || e.target === name) {
        connectedEdgeIds.push(e.id);
        connectedNodeIds.push(e.source === name ? e.target : e.source);
      }
    });
    dispatch(selectNode({ nodeId: name, connectedNodeIds, connectedEdgeIds, astObject }));
  }

  const hasResults = filteredServices.length > 0 || filteredNetworks.length > 0 || filteredVolumes.length > 0;

  return (
    <ConfigProvider theme={{ algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm }}>
      <div style={{ width: 260, display: 'flex', flexDirection: 'column', flexShrink: 0, height: '100%', borderRight: '1px solid var(--ant-color-border)' }}>
        {/* Filter */}
        <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--ant-color-border)' }}>
          <Input
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Filter resources…"
            prefix={<SearchOutlined style={{ color: 'var(--ant-color-text-quaternary)' }} />}
            allowClear
            size="small"
          />
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {/* Services */}
          <SectionLabel label="SERVICES" count={filteredServices.length} color={T.cyan} />
          <List
            size="small"
            dataSource={filteredServices}
            renderItem={s => {
              const isSelected = selectedNodeId === s.name;
              const rawSvc = (yamlObject?.services as any)?.[s.name] ?? {};
              const health = rawSvc.healthcheck ? 'running' : 'running';
              return (
                <OutlineRow key={s.name} selected={isSelected} accent={T.cyan} onClick={() => handleSelectService(s.name)}>
                  <img src={getIconUrl(s.image.name)} style={{ width: 16, height: 16, objectFit: 'contain', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Tooltip title={s.name} placement="right">
                      <Text ellipsis style={{ fontSize: 12.5, display: 'block' }}>{s.name}</Text>
                    </Tooltip>
                    <Text ellipsis type="secondary" style={{ fontSize: 10.5, fontFamily: 'ui-monospace,Menlo,monospace', display: 'block' }}>
                      {s.image.name}:{s.image.tag}
                    </Text>
                  </div>
                  <HealthBadge health={health} />
                </OutlineRow>
              );
            }}
          />

          {/* Networks */}
          {filteredNetworks.length > 0 && (
            <>
              <SectionLabel label="NETWORKS" count={filteredNetworks.length} color={T.violet} />
              <List
                size="small"
                dataSource={filteredNetworks}
                renderItem={n => (
                  <OutlineRow key={n.name} accent={T.violet} selected={selectedNodeId === n.name} onClick={() => handleSelectService(n.name ?? '')}>
                    <span style={{ width: 14, height: 14, borderRadius: 4, background: `${T.violet}22`, border: `1px solid ${T.violet}55`, flexShrink: 0 }} />
                    <Text ellipsis style={{ flex: 1, minWidth: 0, fontSize: 12.5 }}>{n.name}</Text>
                    <Tag color="purple" style={{ fontSize: 10, margin: 0 }}>{(n as any).driver ?? 'bridge'}</Tag>
                  </OutlineRow>
                )}
              />
            </>
          )}

          {/* Volumes */}
          {filteredVolumes.length > 0 && (
            <>
              <SectionLabel label="VOLUMES" count={filteredVolumes.length} color={T.amber} />
              <List
                size="small"
                dataSource={filteredVolumes}
                renderItem={v => (
                  <OutlineRow key={v.name} accent={T.amber} selected={selectedNodeId === v.name} onClick={() => {}}>
                    <img src={VOLUME_ICON} style={{ width: 14, height: 14, objectFit: 'contain', flexShrink: 0, opacity: 0.7 }} />
                    <Text ellipsis style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontFamily: 'ui-monospace,Menlo,monospace' }}>{v.name}</Text>
                  </OutlineRow>
                )}
              />
            </>
          )}

          {filter && !hasResults && (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={<Text type="secondary" style={{ fontSize: 12 }}>No resources match "{filter}"</Text>}
              style={{ padding: '20px 0' }}
            />
          )}
        </div>
      </div>
    </ConfigProvider>
  );
}

function SectionLabel({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div style={{ padding: '10px 14px 4px', display: 'flex', alignItems: 'center', gap: 6 }}>
      <Text style={{ fontSize: 10.5, fontWeight: 700, color, letterSpacing: 1.2 }}>{label}</Text>
      <Badge count={count} color={color} style={{ fontSize: 9 }} overflowCount={999} />
    </div>
  );
}

function OutlineRow({ children, selected, accent, onClick }: {
  children: React.ReactNode;
  selected?: boolean;
  accent: string;
  onClick: () => void;
}) {
  return (
    <List.Item
      onClick={onClick}
      style={{
        padding: '6px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: selected ? `${accent}18` : 'transparent',
        borderLeft: `2px solid ${selected ? accent : 'transparent'}`,
        cursor: 'pointer',
        transition: 'background 0.15s',
        borderBottom: 'none',
      }}
      className="outline-row"
    >
      {children}
    </List.Item>
  );
}

function HealthBadge({ health }: { health: string }) {
  const status = health === 'running' ? 'success' : health === 'warn' ? 'warning' : 'error';
  return <Badge status={status} />;
}
