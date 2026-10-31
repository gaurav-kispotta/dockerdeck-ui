import { type EdgeProps } from '@xyflow/react';
import { useEffect, useReducer, useMemo } from 'react';
import { useAppSelector } from '../../../hooks/useReduxHooks';
import { regEdge, unregEdge, subscribeReg, edgeReg, computeEdgeRoute, buildOrthogonalPath, routeSegments, type BridgePt } from '../../../utils/orthogonalRouter';
import { segmentIntersect } from '../../../utils/edgeBridge';
import { T } from '../../../styles/tokens';
import RelationshipTrace from './RelationshipTrace';

/** Existing orthogonal routing; canvas-local routing is delivered separately. */
export default function OrthogonalEdge(props: EdgeProps) {
  const { id, sourceX, sourceY, targetX, targetY, sourcePosition } = props;
  const dark = useAppSelector(s => s.theme.isDark);
  const background = dark ? T.bg0 : T.lbg0;
  const [tick, update] = useReducer(v => v + 1, 0);
  useEffect(() => subscribeReg(update), []);
  useEffect(() => {
    regEdge({ id, sx: sourceX, sy: sourceY, tx: targetX, ty: targetY, srcPos: sourcePosition });
    return () => unregEdge(id);
  }, [id, sourceX, sourceY, targetX, targetY, sourcePosition]);
  const route = useMemo(() => computeEdgeRoute({ id, sx: sourceX, sy: sourceY, tx: targetX, ty: targetY, srcPos: sourcePosition }),
    // Registry tick reassigns lanes after any edge moves.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id, sourceX, sourceY, targetX, targetY, sourcePosition, tick]);
  const bridges = useMemo((): BridgePt[] => {
    const result: BridgePt[] = [];
    for (const [otherId, other] of edgeReg) {
      if (otherId === id) continue;
      for (const mine of routeSegments(route)) {
        const myH = Math.abs(mine.y1 - mine.y2) < 0.5;
        for (const segment of routeSegments(computeEdgeRoute(other))) {
          const otherH = Math.abs(segment.y1 - segment.y2) < 0.5;
          if (myH === otherH) continue;
          const point = segmentIntersect(mine.x1, mine.y1, mine.x2, mine.y2, segment.x1, segment.y1, segment.x2, segment.y2);
          if (point) result.push({ px: point.x, py: point.y, isOver: id > otherId, crossHoriz: otherH });
        }
      }
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route, id, tick]);
  const masks = bridges.filter(b => b.isOver).map((bridge, i) => <line key={i}
    x1={bridge.crossHoriz ? bridge.px - 11 : bridge.px} y1={bridge.crossHoriz ? bridge.py : bridge.py - 11}
    x2={bridge.crossHoriz ? bridge.px + 11 : bridge.px} y2={bridge.crossHoriz ? bridge.py : bridge.py + 11}
    stroke={background} strokeWidth={14} strokeLinecap="round" />);
  return <RelationshipTrace edge={props} path={buildOrthogonalPath(route, bridges)}
    labelX={(route[0].x + route[3].x) / 2} labelY={(route[0].y + route[3].y) / 2} masks={masks} />;
}

export function RouteComputer() { return null; }
