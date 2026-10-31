import { getBezierPath, type EdgeProps } from '@xyflow/react';
import RelationshipTrace from './RelationshipTrace';

export default function SimpleEdge(props: EdgeProps) {
  const [path, labelX, labelY] = getBezierPath(props);
  return <RelationshipTrace edge={props} path={path} labelX={labelX} labelY={labelY} />;
}
