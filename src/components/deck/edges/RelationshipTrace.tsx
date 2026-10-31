import { EdgeLabelRenderer, type EdgeProps } from '@xyflow/react';
import { useId, useState, type ReactNode } from 'react';
import { useAppSelector } from '../../../hooks/useReduxHooks';
import { relationshipPresentation, type EndpointSymbol, type RelationshipPresentation } from '../../../utils/relationshipPresentation';
import { parseResourceId } from '../../../utils/resourceIdentity';
import { T } from '../../../styles/tokens';

function Endpoint({ symbol, color, background }: { symbol: EndpointSymbol; color: string; background: string }) {
  switch (symbol) {
    case 'triangle': return <path d="M 2 1 L 11 6 L 2 11 Z" fill={color} style={{ animation: 'none', strokeDasharray: 'none' }} />;
    case 'round': return <circle cx="6" cy="6" r="3.5" fill={color} />;
    case 'diamond': return <path d="M 6 1 L 11 6 L 6 11 L 1 6 Z" fill={background} stroke={color} strokeWidth="2" style={{ animation: 'none', strokeDasharray: 'none' }} />;
    case 'square': return <rect x="2" y="2" width="8" height="8" fill={color} />;
    default: return null;
  }
}

export function RelationshipMarkers({ prefix, presentation: p, background }: { prefix: string; presentation: RelationshipPresentation; background: string }) {
  return <defs>{(['start', 'end'] as const).map(side => p[side] !== 'none' && (
    <marker key={side} id={`${prefix}-${side}`} data-endpoint-symbol={p[side]} markerWidth="12" markerHeight="12" viewBox="0 0 12 12"
      refX={p[side] === 'triangle' ? 11 : 6} refY="6" orient="auto-start-reverse" markerUnits="userSpaceOnUse" overflow="visible">
      <Endpoint symbol={p[side]} color={p.color} background={background} />
    </marker>
  ))}</defs>;
}

/** Shared SVG meaning for every geometry and the persistent legend. */
export function RelationshipStroke({ path, presentation: p, background, width = 2, prefix, id }: {
  path: string; presentation: RelationshipPresentation; background: string; width?: number; prefix: string; id?: string;
}) {
  return <>
    <RelationshipMarkers prefix={prefix} presentation={p} background={background} />
    <path id={id} data-relationship-stroke={p.kind} d={path} fill="none" stroke={p.color} strokeWidth={p.double ? width * 3 : width}
      strokeDasharray={p.dash} strokeLinecap="round" strokeLinejoin="round"
      style={{ animation: 'none', strokeDasharray: p.dash ?? 'none' }}
      markerStart={p.double || p.start === 'none' ? undefined : `url(#${prefix}-start)`}
      markerEnd={p.double || p.end === 'none' ? undefined : `url(#${prefix}-end)`} />
    {p.double && <path data-double-gap="true" d={path} fill="none" stroke={background} strokeWidth={width} strokeLinecap="round" pointerEvents="none" style={{ animation: 'none', strokeDasharray: 'none' }} />}
    {p.double && <path data-endpoint-host="true" d={path} fill="none" stroke="none" pointerEvents="none"
      style={{ animation: 'none', strokeDasharray: 'none' }}
      markerStart={`url(#${prefix}-start)`} markerEnd={`url(#${prefix}-end)`} />}
  </>;
}

interface TraceProps {
  edge: Pick<EdgeProps, 'id' | 'source' | 'target' | 'style' | 'label' | 'selected' | 'data'>;
  path: string;
  labelX: number;
  labelY: number;
  masks?: ReactNode;
}

export default function RelationshipTrace({ edge, path, labelX, labelY, masks }: TraceProps) {
  const dark = useAppSelector(s => s.theme.isDark);
  const [hovered, setHovered] = useState(false);
  const prefix = `relationship-${useId().replace(/:/g, '')}`;
  const p = relationshipPresentation(edge.data?.connectionType, dark);
  const background = dark ? T.bg0 : T.lbg0;
  const width = Math.max(2, (edge.style?.strokeWidth as number | undefined) ?? 2) + (hovered || edge.selected ? 0.75 : 0);
  const source = parseResourceId(edge.source)?.name ?? edge.source;
  const target = parseResourceId(edge.target)?.name ?? edge.target;
  const detail = edge.label && edge.label !== 'communicates' ? String(edge.label) : '';
  const label = `${p.label}${detail && detail !== p.label && detail !== 'depends on' ? ` · ${detail}` : ''}`;
  const description = `${p.label}: ${source} ${p.kind === 'depends_on' ? 'depends on' : 'and'} ${target}. ${p.description}`;

  return <>
    <g data-relationship={p.kind} role="img" aria-label={description} style={{ opacity: edge.style?.opacity ?? 1 }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <title>{description}</title>
      <path data-relationship-hit={p.kind} d={path} fill="none" stroke="transparent" strokeWidth="18" style={{ cursor: 'pointer', animation: 'none', strokeDasharray: 'none' }} />
      {masks}
      <RelationshipStroke id={edge.id} prefix={prefix} path={path} presentation={p} background={background} width={width} />
    </g>
    {(hovered || edge.selected) && <EdgeLabelRenderer>
      <div className="nodrag nopan" style={{ position: 'absolute', transform: `translate(-50%,-50%) translate(${labelX}px,${labelY}px)`,
        pointerEvents: 'none', fontSize: 11, padding: '3px 8px', borderRadius: 7, background: dark ? T.bg2 : T.lbg1,
        border: `1px solid ${p.color}`, color: dark ? T.text : '#0B0E14', whiteSpace: 'nowrap' }}>{label}</div>
    </EdgeLabelRenderer>}
  </>;
}
