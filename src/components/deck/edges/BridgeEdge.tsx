import { getStraightPath, type EdgeProps } from '@xyflow/react';
import RelationshipTrace from './RelationshipTrace';
import { useRoutingFrame } from '../RoutingContext';

/** Legacy straight bridge geometry, with crossings computed once by its own canvas. */
export default function BridgeEdge(props: EdgeProps) {
  const bridge = useRoutingFrame().legacyBridges.get(props.id);
  const [path, labelX, labelY] = getStraightPath(props);
  return <RelationshipTrace edge={props} path={bridge?.path ?? path} hitPath={bridge?.hitPath}
    labelX={bridge?.label.x ?? labelX} labelY={bridge?.label.y ?? labelY} />;
}
