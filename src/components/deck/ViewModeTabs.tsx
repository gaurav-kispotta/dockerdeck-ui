import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../hooks/useReduxHooks';
import { setViewMode, ViewMode } from '../../store/slices/settingsSlice';
import { T, themed } from '../../styles/tokens';

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
  const isDark   = useAppSelector(s => s.theme.isDark);
  const viewMode = useAppSelector(s => s.settings.viewMode);
  const dispatch = useAppDispatch();
  const th       = themed(isDark);
  const [hovered, setHovered] = useState<ViewMode | null>(null);

  const active = VIEWS.find(v => v.id === viewMode)!;

  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      background: th.bg1, borderBottom: `1px solid ${th.line}`,
      padding: '0 12px', gap: 4, height: 40, flexShrink: 0,
    }}>
      {/* Icon button group */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 2,
        padding: '3px 4px',
        background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
        borderRadius: 10,
        border: `1px solid ${th.line}`,
      }}>
        {VIEWS.map(v => {
          const isActive  = viewMode === v.id;
          const isHovered = hovered === v.id;
          return (
            <button
              key={v.id}
              onClick={() => dispatch(setViewMode(v.id))}
              onMouseEnter={() => setHovered(v.id)}
              onMouseLeave={() => setHovered(null)}
              title={`${v.label} — ${v.desc}`}
              style={{
                all: 'unset',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 30, height: 28, borderRadius: 7,
                cursor: 'pointer',
                color: isActive ? v.accent : isHovered ? th.text : th.textDim,
                background: isActive
                  ? `${v.accent}18`
                  : isHovered
                  ? isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'
                  : 'transparent',
                transition: 'background 0.15s, color 0.15s',
                outline: isActive ? `1.5px solid ${v.accent}44` : 'none',
                outlineOffset: '-1px',
              }}
            >
              {ICONS[v.id]}
            </button>
          );
        })}
      </div>

      {/* Separator */}
      <div style={{ width: 1, height: 20, background: th.line, margin: '0 4px' }} />

      {/* Active view label + description */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>
        <span style={{
          fontSize: 11, fontWeight: 600, color: active.accent,
          letterSpacing: 0.1,
        }}>
          {active.label}
        </span>
        <span style={{ fontSize: 11, color: th.textFaint }}>—</span>
        <span style={{ fontSize: 11, color: th.textFaint }}>{active.desc}</span>
      </div>

      <div style={{ flex: 1 }} />

      {/* Keyboard shortcut hint */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 10,
        color: th.textFaint,
      }}>
        {VIEWS.map(v => (
          <span
            key={v.id}
            style={{
              width: 18, height: 18, borderRadius: 4, display: 'grid', placeItems: 'center',
              border: `1px solid ${viewMode === v.id ? v.accent + '66' : th.line}`,
              background: viewMode === v.id ? `${v.accent}12` : 'transparent',
              color: viewMode === v.id ? v.accent : th.textFaint,
              cursor: 'pointer', userSelect: 'none',
            }}
            onClick={() => dispatch(setViewMode(v.id))}
            title={v.label}
          >{v.shortcut}</span>
        ))}
      </div>
    </div>
  );
}
