import { getBezierPath, useInternalNode, type EdgeProps } from '@xyflow/react';

import { getEdgeParams } from '../../../utils/floatingEdge';
import RelationshipTrace from './RelationshipTrace';

type SimpleFloatingEdgeProps = Pick<EdgeProps, 'id' | 'source' | 'target' | 'style' | 'label' | 'selected' | 'data'>;

function SimpleFloatingEdge(props: SimpleFloatingEdgeProps) {
    const { source, target } = props;
    const sourceNode = useInternalNode(source);
    const targetNode = useInternalNode(target);

    if (!sourceNode || !targetNode) {
        return null;
    }

    const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
        sourceNode,
        targetNode,
    );

    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX: sx,
        sourceY: sy,
        sourcePosition: sourcePos,
        targetPosition: targetPos,
        targetX: tx,
        targetY: ty,
        curvature: 100,
    });

    return <RelationshipTrace edge={props} path={edgePath} labelX={labelX} labelY={labelY} />;
}

export default SimpleFloatingEdge;
