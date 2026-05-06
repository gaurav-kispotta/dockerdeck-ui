import { useState, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '../../hooks/useReduxHooks';
import { selectNode } from '../../store/slices/selectionSlice';
import { T, themed } from '../../styles/tokens';
import { getIconUrl, VOLUME_ICON } from '../../utils/nodeIcons';

export default function OutlinePanel() {
  const isDark = useAppSelector((s) => s.theme.isDark);
  const th = themed(isDark);
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

  return (
    <div style={{
      width: 260, background: th.bg1,
      borderRight: `1px solid ${th.line}`,
      display: 'flex', flexDirection: 'column',
      fontFamily: 'Inter, system-ui, sans-serif',
      flexShrink: 0,
    }}>
      {/* Filter */}
      <div style={{ padding: '10px 12px', borderBottom: `1px solid ${th.line}` }}>
        <input
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Filter resources…"
          style={{
            width: '100%', height: 30, padding: '0 10px', borderRadius: 8,
            background: th.bg3, border: `1px solid ${th.line}`,
            color: th.text, fontSize: 12, outline: 'none',
            fontFamily: 'inherit',
          }}
        />
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Services */}
        <SectionLabel label="SERVICES" count={filteredServices.length} color={T.cyan} />
        {filteredServices.map(s => {
          const isSelected = selectedNodeId === s.name;
          const rawSvc = (yamlObject?.services as any)?.[s.name] ?? {};
          const health = rawSvc.healthcheck ? 'running' : 'running';
          return (
            <OutlineRow
              key={s.name}
              selected={isSelected}
              accent={T.cyan}
              onClick={() => handleSelectService(s.name)}
            >
              <img src={getIconUrl(s.image.name)} style={{ width: 16, height: 16, objectFit: 'contain', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, color: th.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.name}
                </div>
                <div style={{ fontSize: 10.5, color: th.textFaint, fontFamily: 'ui-monospace,Menlo,monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.image.name}:{s.image.tag}
                </div>
              </div>
              <HealthDot health={health} />
            </OutlineRow>
          );
        })}

        {/* Networks */}
        {filteredNetworks.length > 0 && (
          <>
            <SectionLabel label="NETWORKS" count={filteredNetworks.length} color={T.violet} />
            {filteredNetworks.map(n => (
              <OutlineRow key={n.name} accent={T.violet} selected={selectedNodeId === n.name} onClick={() => handleSelectService(n.name ?? '')}>
                <span style={{ width: 14, height: 14, borderRadius: 4, background: `${T.violet}22`, border: `1px solid ${T.violet}55`, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, color: th.text }}>{n.name}</div>
                </div>
                <span style={{
                  fontSize: 10, padding: '1px 6px', borderRadius: 999,
                  border: `1px solid ${T.violet}55`, color: T.violet,
                  fontFamily: 'ui-monospace,Menlo,monospace',
                }}>{(n as any).driver ?? 'bridge'}</span>
              </OutlineRow>
            ))}
          </>
        )}

        {/* Volumes */}
        {filteredVolumes.length > 0 && (
          <>
            <SectionLabel label="VOLUMES" count={filteredVolumes.length} color={T.amber} />
            {filteredVolumes.map(v => (
              <OutlineRow key={v.name} accent={T.amber} selected={selectedNodeId === v.name} onClick={() => {}}>
                <img src={VOLUME_ICON} style={{ width: 14, height: 14, objectFit: 'contain', flexShrink: 0, opacity: 0.7 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, color: th.text, fontFamily: 'ui-monospace,Menlo,monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {v.name}
                  </div>
                </div>
              </OutlineRow>
            ))}
          </>
        )}

        {filteredServices.length === 0 && filteredNetworks.length === 0 && filteredVolumes.length === 0 && (
          <div style={{ padding: 20, color: th.textFaint, fontSize: 12, textAlign: 'center' }}>
            No resources match "{filter}"
          </div>
        )}
      </div>
    </div>
  );
}

function SectionLabel({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div style={{
      padding: '12px 14px 4px',
      fontSize: 10.5, fontWeight: 700,
      color, letterSpacing: 1.2,
      display: 'flex', alignItems: 'center', gap: 6,
    }}>
      {label} · {count}
    </div>
  );
}

function OutlineRow({ children, selected, accent, onClick }: {
  children: React.ReactNode;
  selected?: boolean;
  accent: string;
  onClick: () => void;
}) {
  const isDark = useAppSelector((s) => s.theme.isDark);
  const th = themed(isDark);
  return (
    <div
      onClick={onClick}
      style={{
        padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 10,
        background: selected ? `${accent}12` : 'transparent',
        borderLeft: `2px solid ${selected ? accent : 'transparent'}`,
        cursor: 'pointer', transition: 'background 0.15s',
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = th.bg2; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent'; }}
    >
      {children}
    </div>
  );
}

function HealthDot({ health }: { health: string }) {
  const color = health === 'running' ? T.green : health === 'warn' ? T.amber : T.rose;
  return <span style={{ width: 7, height: 7, borderRadius: 999, background: color, flexShrink: 0, boxShadow: `0 0 0 2px ${color}22` }} />;
}
