import { type EdgeProps } from '@xyflow/react';
import { useEffect, useReducer } from 'react';
import { useAppSelector } from '../../../hooks/useReduxHooks';
import { registerEdge, unregisterEdge, subscribeToRegistry, getEdgeCrossings } from '../../../utils/edgeRegistry';
import { buildBridgePath, buildMaskSegments } from '../../../utils/edgeBridge';
import { T } from '../../../styles/tokens';
import RelationshipTrace from './RelationshipTrace';

/** Existing bridge geometry; semantics are shared with every other renderer. */
export default function BridgeEdge(props: EdgeProps) {
  const { id, sourceX: sx, sourceY: sy, targetX: tx, targetY: ty } = props;
  const dark = useAppSelector(s => s.theme.isDark);
  const background = dark ? T.bg0 : T.lbg0;
  const [, update] = useReducer(v => v + 1, 0);
  useEffect(() => subscribeToRegistry(update), []);
  useEffect(() => {
    registerEdge(id, sx, sy, tx, ty);
    return () => unregisterEdge(id);
  }, [id, sx, sy, tx, ty]);
  const crossings = getEdgeCrossings(id, sx, sy, tx, ty);
  const path = buildBridgePath(sx, sy, tx, ty, crossings);
  const masks = buildMaskSegments(crossings).map((m, i) =>
    <line key={i} x1={m.x1} y1={m.y1} x2={m.x2} y2={m.y2} stroke={background} strokeWidth={14} strokeLinecap="round" />
  );
  return <RelationshipTrace edge={props} path={path} labelX={(sx + tx) / 2} labelY={(sy + ty) / 2} masks={masks} />;
}
