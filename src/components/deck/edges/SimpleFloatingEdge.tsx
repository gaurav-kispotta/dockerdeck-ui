import { getBezierPath, useInternalNode } from '@xyflow/react';

import { getEdgeParams } from '../../../utils/floatingEdge';

interface SimpleFloatingEdgeProps {
    id: string;
    source: string;
    target: string;
    markerEnd?: string;
    style?: React.CSSProperties;
}

function SimpleFloatingEdge({ id, source, target, markerEnd, style }: SimpleFloatingEdgeProps) {
    const sourceNode = useInternalNode(source);
    const targetNode = useInternalNode(target);

    if (!sourceNode || !targetNode) {
        return null;
    }

    const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
        sourceNode,
        targetNode,
    );

    const [edgePath] = getBezierPath({
        sourceX: sx,
        sourceY: sy,
        sourcePosition: sourcePos,
        targetPosition: targetPos,
        targetX: tx,
        targetY: ty,
        curvature: 100,
    });

    return (
        <path
            id={id}
            className="react-flow__edge-path"
            d={edgePath}
            strokeWidth={style?.strokeWidth || 2}
            markerEnd={markerEnd}
            style={style}
            ></path>
    );
}

export default SimpleFloatingEdge;
