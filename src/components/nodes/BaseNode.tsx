import { Handle, Position } from '@xyflow/react'
import { useState, ReactNode } from 'react'
import { useAppSelector } from '../../hooks/useReduxHooks'

import '@xyflow/react/dist/style.css';

interface HandleConfig {
  type: 'source' | 'target';
  position: Position;
  id: string;
}

interface BaseNodeProps {
  children: ReactNode;
  // Label rendered below the bounding box so it doesn't distort handle alignment
  label?: ReactNode;
  handles?: HandleConfig[];
  hoverAreaSize?: number;
  className?: string;
}

function BaseNode({
  children,
  label,
  handles = [],
  hoverAreaSize = 200,
  className = 'relative',
}: BaseNodeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const debugMode = useAppSelector((state) => state.settings.debugMode);

  return (
    // This div is what React Flow measures for the node bounding box.
    <div className={className}>

      {/* ── Debug overlay: bounding box ── */}
      {debugMode && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            border: '2px dashed rgba(59,130,246,0.7)',   // blue dashed = React Flow node boundary
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: 20,
          }}
        />
      )}

      {/* ── Debug overlay: handle hit-area ring ── */}
      {debugMode && (
        <div
          style={{
            position: 'absolute',
            width: `${hoverAreaSize}px`,
            height: `${hoverAreaSize}px`,
            borderRadius: '50%',
            transform: 'translate(-20px, -20px)',
            border: '2px dashed rgba(245,158,11,0.6)',    // amber dashed = hover / handle zone
            background: 'rgba(245,158,11,0.06)',
            pointerEvents: 'none',
            zIndex: 19,
          }}
        />
      )}

      {/* Expanded invisible hover area so handles are easier to grab */}
      <div
        className="absolute inset-0"
        style={{
          width: `${hoverAreaSize}px`,
          height: `${hoverAreaSize}px`,
          borderRadius: '50%',
          transform: 'translate(-20px, -20px)',
          pointerEvents: 'all',
          cursor: 'pointer',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      {/* Node icon — sized to match the bounding box */}
      <div className="relative z-10">
        {children}

        {handles.map((handle) => (
          <Handle
            key={handle.id}
            type={handle.type}
            position={handle.position}
            id={handle.id}
            isConnectable={true}
            style={{
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.2s ease-in-out',
            }}
          />
        ))}
      </div>

      {/* Label floats below the bounding box — absolutely positioned so it
          doesn't expand the box that React Flow uses to place handles */}
      {label !== undefined && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            paddingTop: 6,
            pointerEvents: 'none',
            zIndex: 10,
            width: 'max-content',
            maxWidth: 96,
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}

export default BaseNode
