import { getSmoothStepPath, type EdgeProps } from '@xyflow/react';
import RelationshipTrace from './RelationshipTrace';
import { useRoutingFrame } from '../RoutingContext';

export default function OrthogonalEdge(props: EdgeProps) {
  const route = useRoutingFrame().routes.get(props.id);
  const [fallback, x, y] = getSmoothStepPath({ ...props, borderRadius: 0 });
  return <RelationshipTrace edge={props} path={route?.path ?? fallback} hitPath={route?.hitPath}
    labelX={route?.label.x ?? x} labelY={route?.label.y ?? y} route={route} />;
}
