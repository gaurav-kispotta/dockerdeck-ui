import { getSmoothStepPath, type EdgeProps } from '@xyflow/react';
import RelationshipTrace from './RelationshipTrace';

export default function SmoothStepEdge(props: EdgeProps) {
  const [path, labelX, labelY] = getSmoothStepPath({ ...props, borderRadius: 12 });
  return <RelationshipTrace edge={props} path={path} labelX={labelX} labelY={labelY} />;
}
