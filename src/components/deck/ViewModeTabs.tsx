import { useAppSelector, useAppDispatch } from '../../hooks/useReduxHooks';
import { setViewMode, ViewMode } from '../../store/slices/settingsSlice';
import { T } from '../../styles/tokens';
import { Segmented, Typography, Divider, Tooltip } from 'antd';

const { Text } = Typography;

// SVG icons per view — crisp at 16×16
const ICONS: Record<ViewMode, React.ReactNode> = {
  architecture: (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="3" r="1.5" />
      <circle cx="3" cy="12" r="1.5" />
      <circle cx="13" cy="12" r="1.5" />
      <line x1="8" y1="4.5" x2="3.8" y2="10.5" />
      <line x1="8" y1="4.5" x2="12.2" y2="10.5" />
      <line x1="4.5" y1="12" x2="11.5" y2="12" />
    </svg>
  ),
  networks: (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="1.5" width="13" height="13" rx="2.5" />
      <rect x="4" y="4" width="3.5" height="3.5" rx="1" />
      <rect x="8.5" y="4" width="3.5" height="3.5" rx="1" />
      <rect x="4" y="8.5" width="3.5" height="3.5" rx="1" />
      <rect x="8.5" y="8.5" width="3.5" height="3.5" rx="1" />
    </svg>
  ),
  ports: (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4.5" width="4" height="7" rx="1" />
      <rect x="11" y="4.5" width="4" height="7" rx="1" />
      <line x1="5" y1="8" x2="11" y2="8" />
      <line x1="8.5" y1="5.5" x2="11" y2="8" />
      <line x1="8.5" y1="10.5" x2="11" y2="8" />
    </svg>
  ),
  volumes: (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="8" cy="4.5" rx="5.5" ry="2" />
      <path d="M2.5 4.5v7c0 1.1 2.46 2 5.5 2s5.5-.9 5.5-2v-7" />
      <line x1="8" y1="8" x2="8" y2="11" />
    </svg>
  ),
  'boot-order': (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5.5" y="1" width="5" height="3" rx="1" />
      <rect x="1" y="6.5" width="5" height="3" rx="1" />
      <rect x="10" y="6.5" width="5" height="3" rx="1" />
      <rect x="3" y="12" width="5" height="3" rx="1" />
      <line x1="8" y1="4" x2="3.5" y2="6.5" />
      <line x1="8" y1="4" x2="12.5" y2="6.5" />
      <line x1="3.5" y1="9.5" x2="5.5" y2="12" />
    </svg>
  ),
};

const VIEWS: {
  id: ViewMode;
  label: string;
  desc: string;
  accent: string;
  shortcut: string;
}[] = [
  { id: 'architecture', label: 'Architecture', desc: 'Full data flow — all services, networks and volumes',       accent: T.cyan,   shortcut: '1' },
  { id: 'networks',     label: 'Networks',     desc: 'Network isolation & security boundaries',                   accent: T.violet, shortcut: '2' },
  { id: 'ports',        label: 'Ports',        desc: 'External access — which ports are exposed to the host',    accent: T.green,  shortcut: '3' },
  { id: 'volumes',      label: 'Storage',      desc: 'Data persistence — volumes and bind mounts',               accent: T.amber,  shortcut: '4' },
  { id: 'boot-order',   label: 'Boot Order',   desc: 'Startup sequence — which services must start first',       accent: T.rose,   shortcut: '5' },
];

export default function ViewModeTabs() {
  const viewMode = useAppSelector(s => s.settings.viewMode);
  const dispatch = useAppDispatch();

  const active = VIEWS.find(v => v.id === viewMode)!;

  const segmentedOptions = VIEWS.map(v => ({
    value: v.id,
    label: (
      <Tooltip title={`${v.label} — ${v.desc}`} placement="bottom">
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px 4px' }}>
          {ICONS[v.id]}
        </span>
      </Tooltip>
    ),
  }));

  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      borderBottom: '1px solid var(--ant-color-border)',
      padding: '0 12px', gap: 8, height: 40, flexShrink: 0,
    }}>
      <Segmented
        value={viewMode}
        options={segmentedOptions}
        onChange={(val) => dispatch(setViewMode(val as ViewMode))}
        size="small"
      />

      <Divider type="vertical" style={{ height: 20, margin: '0 2px' }} />

      <Text style={{ fontSize: 11, fontWeight: 600, color: active.accent }}>{active.label}</Text>
      <Text type="secondary" style={{ fontSize: 11 }}>—</Text>
      <Text type="secondary" style={{ fontSize: 11 }}>{active.desc}</Text>

      <div style={{ flex: 1 }} />

      {/* Keyboard shortcut hints */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 10 }}>
        {VIEWS.map(v => (
          <Tooltip key={v.id} title={v.label} placement="bottom">
            <span
              onClick={() => dispatch(setViewMode(v.id))}
              style={{
                width: 18, height: 18, borderRadius: 4, display: 'grid', placeItems: 'center',
                border: `1px solid ${viewMode === v.id ? v.accent + '66' : 'var(--ant-color-border)'}`,
                background: viewMode === v.id ? `${v.accent}12` : 'transparent',
                color: viewMode === v.id ? v.accent : 'var(--ant-color-text-quaternary)',
                cursor: 'pointer', userSelect: 'none',
              }}
            >{v.shortcut}</span>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}
