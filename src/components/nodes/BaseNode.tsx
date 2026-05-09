import { Handle, Position } from '@xyflow/react';
import { useState, ReactNode } from 'react';
import { useAppSelector } from '../../hooks/useReduxHooks';
import { T } from '../../styles/tokens';
import { getIconUrl, VOLUME_ICON } from '../../utils/nodeIcons';

import '@xyflow/react/dist/style.css';

export interface BaseNodeProps {
  dockerServiceId: string;
  dockerImageName: string;
  dockerIconUrl?: string;
  nodeType?: 'service' | 'network' | 'volume';
  children?: ReactNode;
}

const ACCENT: Record<string, string> = {
  service: T.cyan,
  network: T.violet,
  volume:  T.amber,
};

const HANDLES = [
  { type: 'source' as const, position: Position.Top,    id: 'a' },
  { type: 'source' as const, position: Position.Right,  id: 'b' },
  { type: 'source' as const, position: Position.Bottom, id: 'c' },
  { type: 'source' as const, position: Position.Left,   id: 'd' },
  { type: 'target' as const, position: Position.Top,    id: 'e' },
  { type: 'target' as const, position: Position.Right,  id: 'f' },
  { type: 'target' as const, position: Position.Bottom, id: 'g' },
  { type: 'target' as const, position: Position.Left,   id: 'h' },
];

export default function BaseNode({
  dockerServiceId,
  dockerImageName,
  dockerIconUrl,
  nodeType = 'service',
  children,
}: BaseNodeProps) {
  const [hovered, setHovered] = useState(false);
  const [hoveredHandle, setHoveredHandle] = useState<string | null>(null);
  const isDark    = useAppSelector((s) => s.theme.isDark);
  const selection = useAppSelector((s) => s.selection);
  const debugMode = useAppSelector((s) => s.settings.debugMode);
  const astObject = useAppSelector((s) => s.uploadedFile.astObject);

  const accent     = ACCENT[nodeType] ?? T.cyan;
  const isSelected  = selection.selectedNodeId === dockerServiceId;
  const isConnected = selection.connectedNodeIds.includes(dockerServiceId);

  const svcAst  = astObject?.services?.find((s) => s.name === dockerServiceId);
  const imageTag = svcAst ? `${svcAst.image.name}:${svcAst.image.tag}` : dockerImageName;

  const iconUrl = nodeType === 'volume'
    ? VOLUME_ICON
    : svcAst
    ? getIconUrl(svcAst.image.name)
    : dockerIconUrl;

  const borderColor = isSelected
    ? accent
    : isConnected ? `${accent}88`
    : isDark ? T.line : T.lline;

  const glowClass = isSelected
    ? (isDark ? 'dd-sel-dark'  : 'dd-sel-light')
    : isConnected
    ? (isDark ? 'dd-con-dark'  : 'dd-con-light')
    : '';

  return (
    <div
      className={glowClass}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 200,
        background: isDark ? T.bg2 : T.lbg1,
        border: `1px solid ${borderColor}`,
        borderRadius: 12,
        padding: 10,
        boxShadow: !isSelected && !isConnected ? '0 2px 8px rgba(0,0,0,0.18)' : undefined,
        position: 'relative',
        fontFamily: 'Inter, system-ui, sans-serif',
        transition: 'border-color 0.2s',
        cursor: 'pointer',
        outline: debugMode ? `2px dashed ${T.amber}88` : 'none',
      }}
    >
      {/* Gradient accent overlay */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 12, pointerEvents: 'none',
        background: `linear-gradient(180deg, ${accent}0E, transparent 50%)`,
      }} />

      {/* Header: icon · name · image tag · health dot */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          background: `${accent}1F`, border: `1px solid ${accent}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
        }}>
          {iconUrl
            ? <img src={iconUrl} style={{ width: 18, height: 18, objectFit: 'contain', display: 'block' }} />
            : <span style={{ fontSize: 13 }}>📦</span>}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 12.5, fontWeight: 600, color: isDark ? T.text : '#0B0E14',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{dockerServiceId}</div>
          <div style={{
            fontSize: 10, color: isDark ? T.textFaint : '#8A93A6',
            fontFamily: 'ui-monospace,Menlo,monospace',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{imageTag}</div>
        </div>

        <span style={{
          width: 7, height: 7, borderRadius: 999, flexShrink: 0,
          background: T.green, boxShadow: `0 0 0 2px ${T.green}22`,
        }} />
      </div>

      {/* View-mode-specific slot */}
      {children}

      {/* Handles */}
      {HANDLES.map((h) => (
        <Handle
          key={h.id}
          type={h.type}
          position={h.position}
          id={h.id}
          isConnectable
          style={{
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.2s, width 0.15s, height 0.15s',
            width:  hoveredHandle === h.id ? 14 : 7,
            height: hoveredHandle === h.id ? 14 : 7,
            background: accent,
            border: `2px solid ${isDark ? T.bg0 : '#fff'}`,
          }}
          onMouseEnter={(e) => { e.stopPropagation(); setHoveredHandle(h.id); }}
          onMouseLeave={(e) => { e.stopPropagation(); setHoveredHandle(null); }}
        />
      ))}
    </div>
  );
}
