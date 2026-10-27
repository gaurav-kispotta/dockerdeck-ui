import { EdgeProps, EdgeLabelRenderer, useInternalNode } from '@xyflow/react';
import { useEffect, useReducer, useMemo, useState } from 'react';
import { useAppSelector } from '../../../hooks/useReduxHooks';
import { registerEdge, unregisterEdge, subscribeToRegistry, getEdgeCrossings } from '../../../utils/edgeRegistry';
import { buildBridgePath, buildMaskSegments } from '../../../utils/edgeBridge';
import { T } from '../../../styles/tokens';

/**
 * BridgeEdge — a ReactFlow edge that detects intersections with all other edges
 * and renders:
 *   • a semicircular bridge arc where this edge crosses OVER another
 *   • a visible gap where this edge passes UNDER another
 *   • a background-colour mask on the "under" edge's path, completing the illusion
 *
 * Circuit-board convention: higher edge ID (lexicographic) = "over".
 */
function BridgeEdge({ id, source, target, style, label, selected, data, animated, markerEnd }: EdgeProps) {
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);
  const isDark = useAppSelector(s => s.theme.isDark);
  const bgColor = isDark ? T.bg0 : T.lbg0;
  const [isHovered, setIsHovered] = useState(false);

  // Rerender trigger: fires once after all edges in a batch have registered
  const [, forceUpdate] = useReducer(v => v + 1, 0);
  useEffect(() => subscribeToRegistry(forceUpdate), []);

  // Use absolute canvas positions so cross-group intersections are detected correctly
  const { sx, sy, tx, ty } = useMemo(() => ({
    sx: (sourceNode?.internals.positionAbsolute.x ?? 0) + (sourceNode?.measured?.width  ?? 200) / 2,
    sy: (sourceNode?.internals.positionAbsolute.y ?? 0) + (sourceNode?.measured?.height ?? 80)  / 2,
    tx: (targetNode?.internals.positionAbsolute.x ?? 0) + (targetNode?.measured?.width  ?? 200) / 2,
    ty: (targetNode?.internals.positionAbsolute.y ?? 0) + (targetNode?.measured?.height ?? 80)  / 2,
  }), [sourceNode, targetNode]);

  // Register this edge's segment so other edges can detect intersections with it
  useEffect(() => {
    if (!sourceNode || !targetNode) return;
    registerEdge(id, sx, sy, tx, ty);
    return () => unregisterEdge(id);
  }, [id, sx, sy, tx, ty, sourceNode, targetNode]);

  if (!sourceNode || !targetNode) return null;

  // Intersection data (read from module-level registry)
  const crossings = getEdgeCrossings(id, sx, sy, tx, ty);
  const mainPath  = buildBridgePath(sx, sy, tx, ty, crossings);
  const masks     = buildMaskSegments(crossings);

  // Visual styling — mirror SimpleEdge's appearance
  const strokeColor  = (style?.stroke  as string) ?? (isDark ? '#8A93A6' : '#6B7280');
  const strokeWidth  = (style?.strokeWidth as number) ?? 2;
  const opacity      = (style?.opacity as number) ?? 1;
  const isDep        = data?.connectionType === 'depends_on';
  const strokeDash   = animated ? '8 4' : (isDep ? '6 4' : undefined);

  // Midpoint for label
  const midX = (sx + tx) / 2;
  const midY = (sy + ty) / 2;

  // Hover hit area: invisible wide stroke so the edge is easy to hover
  const hitPath = `M ${sx} ${sy} L ${tx} ${ty}`;

  return (
    <>
      <g
        style={{ opacity }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Invisible wide hit area for hover/click */}
        <path
          d={hitPath}
          fill="none"
          stroke="transparent"
          strokeWidth={16}
          style={{ cursor: 'pointer' }}
        />

        {/* Background masks: erase the "under" edge at each crossing where we're "over" */}
        {masks.map((m, i) => (
          <line
            key={`mask-${i}`}
            x1={m.x1} y1={m.y1}
            x2={m.x2} y2={m.y2}
            stroke={bgColor}
            strokeWidth={strokeWidth + 6}
            strokeLinecap="round"
          />
        ))}

        {/* Main edge path — includes bridge arcs and gaps */}
        <path
          id={id}
          d={mainPath}
          fill="none"
          stroke={strokeColor}
          strokeWidth={isHovered ? strokeWidth + 2 : strokeWidth}
          strokeDasharray={strokeDash}
          strokeLinecap="round"
          markerEnd={markerEnd}
          style={{
            transition: 'stroke-width 0.15s',
            ...(animated && { animation: 'dashdraw 0.5s linear infinite' }),
          }}
        />

        {/* Bridge arc highlight ring — subtle glow on bridge arcs when hovered */}
        {isHovered && masks.length > 0 && (
          <path
            d={mainPath}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth + 4}
            strokeOpacity={0.15}
            strokeLinecap="round"
          />
        )}
      </g>

      {/* Edge label, shown on hover or when selected */}
      {label && (isHovered || selected) && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${midX}px, ${midY}px)`,
              pointerEvents: 'none',
              fontSize: 10,
              fontFamily: 'ui-monospace, Menlo, monospace',
              padding: '2px 7px',
              borderRadius: 999,
              background: isDark ? T.bg2 : T.lbg1,
              border: `1px solid ${isDark ? T.line : T.lline}`,
              color: isDark ? T.textDim : '#5C6577',
              whiteSpace: 'nowrap',
            }}
            className="nodrag nopan"
          >
            {label as string}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default BridgeEdge;
