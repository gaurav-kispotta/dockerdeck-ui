import { EdgeProps, EdgeLabelRenderer, getSmoothStepPath } from '@xyflow/react';
import { useState } from 'react';
import { useAppSelector } from '../../hooks/useReduxHooks';
import { T } from '../../styles/tokens';

/**
 * SmoothStepEdge — right-angle turns with rounded corners.
 * Uses ReactFlow's getSmoothStepPath for the path geometry so it connects
 * precisely to node handles and respects source/target handle positions.
 */
function SmoothStepEdge({
  id,
  sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  style, label, selected, data,
}: EdgeProps) {
  const isDark = useAppSelector(s => s.theme.isDark);
  const [isHovered, setIsHovered] = useState(false);

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
    borderRadius: 12,
  });

  const strokeColor = (style?.stroke      as string) ?? (isDark ? '#8A93A6' : '#6B7280');
  const strokeWidth = (style?.strokeWidth as number) ?? 1.5;
  const opacity     = (style?.opacity     as number) ?? 1;
  const dash        = data?.connectionType === 'depends_on' ? '7 4' : undefined;

  return (
    <>
      <g
        style={{ opacity }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Wide transparent hit area */}
        <path
          d={edgePath}
          fill="none"
          stroke="transparent"
          strokeWidth={16}
          style={{ cursor: 'pointer' }}
        />
        <path
          id={id}
          d={edgePath}
          fill="none"
          stroke={strokeColor}
          strokeWidth={isHovered ? strokeWidth + 1.5 : strokeWidth}
          strokeDasharray={dash}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transition: 'stroke-width 0.12s' }}
        />
      </g>

      {label && (isHovered || selected) && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%,-50%) translate(${labelX}px,${labelY}px)`,
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

export default SmoothStepEdge;
