import { BaseEdge, EdgeLabelRenderer, getBezierPath, EdgeProps } from '@xyflow/react';
import { useState } from 'react';
import { useAppSelector } from '../../../hooks/useReduxHooks';
import { T } from '../../../styles/tokens';

function SimpleEdge({
  id,
  sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  markerEnd, style, label, selected, data, animated,
}: EdgeProps) {
    const isDark = useAppSelector(s => s.theme.isDark);
    const [isHovered, setIsHovered] = useState(false);

    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX, sourceY, sourcePosition,
        targetX, targetY, targetPosition,
    });

    const strokeColor = (style?.stroke      as string) ?? (isDark ? '#8A93A6' : '#6B7280');
    const strokeWidth = (style?.strokeWidth as number) ?? 1.5;
    const opacity     = (style?.opacity     as number) ?? 1;
    const dash        = animated ? '8 4' : (data?.connectionType === 'depends_on' ? '7 4' : undefined);

    return (
        <>
            <g
                style={{ opacity }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <BaseEdge
                    id={id}
                    path={edgePath}
                    markerEnd={markerEnd}
                    style={{
                        stroke: strokeColor,
                        strokeWidth: isHovered ? strokeWidth + 1.5 : strokeWidth,
                        strokeDasharray: dash,
                        transition: 'stroke-width 0.12s',
                        ...(animated && { animation: 'dashdraw 0.5s linear infinite' }),
                    }}
                />
            </g>
            {label && (isHovered || selected) && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            pointerEvents: 'none',
                            fontSize: 10,
                            fontFamily: 'ui-monospace,Menlo,monospace',
                            padding: '2px 7px',
                            borderRadius: 999,
                            background: isDark ? T.bg2 : T.lbg1,
                            border: `1px solid ${isDark ? T.line : T.lline}`,
                            color: isDark ? T.textDim : '#5C6577',
                            whiteSpace: 'nowrap',
                        }}
                        className="nodrag nopan"
                    >
                        {label as string}
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
}

export default SimpleEdge;
