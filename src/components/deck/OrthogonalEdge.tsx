import { EdgeProps, EdgeLabelRenderer } from '@xyflow/react';
import { useEffect, useReducer, useState, useMemo } from 'react';
import { useAppSelector } from '../../hooks/useReduxHooks';
import {
  regEdge, unregEdge, subscribeReg, edgeReg,
  computeEdgeRoute, buildOrthogonalPath, routeSegments, BridgePt,
} from '../../utils/orthogonalRouter';
import { segmentIntersect } from '../../utils/edgeBridge';
import { T } from '../../styles/tokens';

/**
 * OrthogonalEdge — circuit-board style step routing with bridge arcs.
 *
 * Uses ReactFlow's EdgeProps `sourceX/Y` and `targetX/Y` directly — these are
 * the exact handle positions on the node boundary, so routes always connect
 * perfectly regardless of node size, grouping, or zoom level.
 *
 * Lane staggering (preventing parallel overlap) is coordinated via a module-
 * level registry that all OrthogonalEdge instances share.
 */
function OrthogonalEdge({
  id,
  sourceX, sourceY, targetX, targetY,
  sourcePosition,
  style, label, selected, data, animated, markerEnd,
}: EdgeProps) {
  const isDark  = useAppSelector(s => s.theme.isDark);
  const bgColor = isDark ? T.bg0 : T.lbg0;
  const [isHovered, setIsHovered] = useState(false);

  // Re-render when any other edge in the registry changes (for lane reassignment)
  const [tick, forceUpdate] = useReducer(v => v + 1, 0);
  useEffect(() => subscribeReg(forceUpdate), []);

  // Register this edge's exact handle positions into the shared registry
  useEffect(() => {
    regEdge({ id, sx: sourceX, sy: sourceY, tx: targetX, ty: targetY, srcPos: sourcePosition });
    return () => unregEdge(id);
  }, [id, sourceX, sourceY, targetX, targetY, sourcePosition]);

  // Compute the orthogonal 4-waypoint route for this edge
  // (depends on registry state, so we re-run whenever tick changes)
  const route = useMemo(
    () => computeEdgeRoute({ id, sx: sourceX, sy: sourceY, tx: targetX, ty: targetY, srcPos: sourcePosition }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id, sourceX, sourceY, targetX, targetY, sourcePosition, tick]
  );

  // Bridge detection: find perpendicular crossings with all other registered routes
  const bridges = useMemo((): BridgePt[] => {
    const mySegs = routeSegments(route);
    const out: BridgePt[] = [];

    for (const [otherId, other] of edgeReg) {
      if (otherId === id) continue;
      const otherRoute = computeEdgeRoute(other);
      const otherSegs  = routeSegments(otherRoute);

      for (const mine of mySegs) {
        const myH = Math.abs(mine.y1 - mine.y2) < 0.5; // is my segment horizontal?
        for (const oSeg of otherSegs) {
          const oH = Math.abs(oSeg.y1 - oSeg.y2) < 0.5;
          if (myH === oH) continue; // skip parallel pairs — only perpendicular crossings make bridges

          const pt = segmentIntersect(
            mine.x1, mine.y1, mine.x2, mine.y2,
            oSeg.x1, oSeg.y1, oSeg.x2, oSeg.y2
          );
          if (!pt) continue;

          out.push({ px: pt.x, py: pt.y, isOver: id > otherId, crossHoriz: oH });
        }
      }
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route, id, tick]);

  // Visual properties
  const strokeColor = (style?.stroke      as string) ?? (isDark ? '#8A93A6' : '#6B7280');
  const strokeWidth = (style?.strokeWidth as number) ?? 1.5;
  const opacity     = (style?.opacity     as number) ?? 1;
  // Animated edges get marching-ant dashes; non-animated depends_on gets static dashes
  const dash   = animated ? '8 4' : (data?.connectionType === 'depends_on' ? '7 4' : undefined);

  const mainPath = buildOrthogonalPath(route, bridges);
  const midX = (route[0].x + route[3].x) / 2;
  const midY = (route[0].y + route[3].y) / 2;

  // Over-crossing masks: erase the under-edge wire with bg-colour line
  const overBridges = bridges.filter(b => b.isOver);

  return (
    <>
      <g
        style={{ opacity }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Transparent wide hit area for hover/click */}
        <path
          d={mainPath}
          fill="none"
          stroke="transparent"
          strokeWidth={16}
          style={{ cursor: 'pointer' }}
        />

        {/* Background mask at each "over" crossing */}
        {overBridges.map((br, i) => {
          const half = 11;
          return (
            <line
              key={`mask-${i}`}
              x1={br.crossHoriz ? br.px - half : br.px}
              y1={br.crossHoriz ? br.py         : br.py - half}
              x2={br.crossHoriz ? br.px + half  : br.px}
              y2={br.crossHoriz ? br.py          : br.py + half}
              stroke={bgColor}
              strokeWidth={strokeWidth + 6}
              strokeLinecap="round"
            />
          );
        })}

        {/* Main edge path with rounded corners, bridges and gaps */}
        <path
          id={id}
          d={mainPath}
          fill="none"
          stroke={strokeColor}
          strokeWidth={isHovered ? strokeWidth + 1.5 : strokeWidth}
          strokeDasharray={dash}
          strokeLinecap="round"
          strokeLinejoin="round"
          markerEnd={markerEnd}
          style={{
            transition: 'stroke-width 0.12s',
            ...(animated && { animation: 'dashdraw 0.5s linear infinite' }),
          }}
        />
      </g>

      {/* Label pill */}
      {label && (isHovered || selected) && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%,-50%) translate(${midX}px,${midY}px)`,
              pointerEvents: 'none',
              fontSize: 10,
              fontFamily: 'ui-monospace,Menlo,monospace',
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

// RouteComputer is no longer needed — kept as empty export so DesignDeck.tsx compiles
export function RouteComputer() { return null; }

export default OrthogonalEdge;
