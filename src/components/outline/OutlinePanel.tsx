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
      <div className="w-[260px] flex flex-col shrink-0 h-full">
        {/* Filter */}
        <div className="px-3 py-2.5">
          <Input
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Filter resources…"
            prefix={<SearchOutlined className="text-[var(--ant-color-text-quaternary)]" />}
            allowClear
            size="small"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
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
                  <div className="w-[28px] h-[28px] rounded-[7px] bg-[var(--ant-color-fill-secondary)] flex items-center justify-center shrink-0">
                    <img src={getIconUrl(s.image.name)} className="w-4 h-4 object-contain" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <Tooltip title={s.name} placement="right">
                      <Text ellipsis className="text-[12.5px]">{s.name}</Text>
                    </Tooltip>
                    <Text ellipsis type="secondary" className="text-[10.5px] font-mono">
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
                    <span
                      className="w-3.5 h-3.5 rounded-[4px] shrink-0"
                      style={{ background: `${T.violet}22`, border: `1px solid ${T.violet}55` }}
                    />
                    <Text ellipsis className="flex-1 min-w-0 text-[12.5px]">{n.name}</Text>
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
                  <OutlineRow key={v.name} accent={T.amber} selected={selectedNodeId === v.name} onClick={() => handleSelectService(v.name ?? '')}>
                    <img src={VOLUME_ICON} className="w-3.5 h-3.5 object-contain shrink-0 opacity-70" />
                    <Text ellipsis className="flex-1 min-w-0 text-[12.5px] font-mono">{v.name}</Text>
                  </OutlineRow>
                )}
              />
            </>
          )}

          {filter && !hasResults && (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={<Text type="secondary" className="text-xs">No resources match "{filter}"</Text>}
              className="py-5"
            />
          )}
        </div>
      </div>
    </ConfigProvider>
  );
}

function SectionLabel({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="pt-2.5 px-3.5 pb-1 flex items-center gap-1.5">
      <Text className="text-[10.5px] font-bold tracking-[1.2px]" style={{ color }}>{label}</Text>
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
      className="outline-row !px-3.5 !py-1.5 flex items-center gap-2.5 cursor-pointer transition-[background] duration-150 !border-b-0"
      style={{
        background: selected ? `${accent}18` : 'transparent',
        borderLeft: `2px solid ${selected ? accent : 'transparent'}`,
      }}
    >
      {children}
    </List.Item>
  );
}

function HealthBadge({ health }: { health: string }) {
  const status = health === 'running' ? 'success' : health === 'warn' ? 'warning' : 'error';
  return <Badge status={status} />;
}
