import { BaseEdge, EdgeLabelRenderer, getBezierPath, useInternalNode, EdgeProps } from '@xyflow/react';
import { useMemo, useState } from 'react';

function SimpleEdge({ id, source, target, markerEnd, style, label, selected }: EdgeProps) {
    const sourceNode = useInternalNode(source);
    const targetNode = useInternalNode(target);

    const [isLabelVisible, setIsLabelVisible] = useState(false);

    // Return null if nodes aren't ready yet
    if (!sourceNode || !targetNode) {
        return null;
    }

    // Simple edge path calculation using node centers
    const { sx, sy, tx, ty } = useMemo(() => {
        return {
            sx: (sourceNode.position?.x || 0) + (sourceNode.width || 100) / 2,
            sy: (sourceNode.position?.y || 0) + (sourceNode.height || 100) / 2,
            tx: (targetNode.position?.x || 0) + (targetNode.width || 100) / 2,
            ty: (targetNode.position?.y || 0) + (targetNode.height || 100) / 2,
        };
    }, [sourceNode, targetNode]);

    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX: sx,
        sourceY: sy,
        targetX: tx,
        targetY: ty,
    });

    // Show label if connected to a selected node
    const isConnectedToSelected = (sourceNode?.selected ?? false) || (targetNode?.selected ?? false);

    return (
        <>
            <g
                onMouseEnter={() => setIsLabelVisible(true)}
                onMouseLeave={() => setIsLabelVisible(false)}
            >
                <BaseEdge 
                    id={id}
                    path={edgePath} 
                    markerEnd={markerEnd}
                    style={style}
                />
            </g>
            {label && (isLabelVisible || selected || isConnectedToSelected) && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            fontSize: 12,
                            pointerEvents: 'none',
                        }}
                        className="nodrag nopan"
                    >
                        {label}
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
}

export default SimpleEdge;