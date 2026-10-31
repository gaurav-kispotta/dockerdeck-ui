import { getStraightPath, type EdgeProps } from '@xyflow/react';
import RelationshipTrace from './RelationshipTrace';

export default function StraightEdge(props: EdgeProps) {
  const [path, labelX, labelY] = getStraightPath(props);
  return <RelationshipTrace edge={props} path={path} labelX={labelX} labelY={labelY} />;
}
