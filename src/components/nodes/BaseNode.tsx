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
}: BaseNodeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredHandleId, setHoveredHandleId] = useState<string | null>(null);
  const debugMode = useAppSelector((state) => state.settings.debugMode);

  return (
    // This div is what React Flow measures for the node bounding box.
    <div className="w-full h-full flex items-center justify-center relative">
      {/* Expanded invisible hover area so handles are easier to grab */}
      <div
        className="absolute inset-0"
        style={{
          width: `${hoverAreaSize}px`,
          height: `${hoverAreaSize}px`,
          left: `-${hoverAreaSize / 2 - 50}px`,
          top: `-${hoverAreaSize / 2 - 50}px`,
          borderRadius: '50%',
          background: debugMode ? 'rgba(245,158,11,0.06)' : 'transparent',
          border: debugMode ? '2px dashed rgba(245,158,11,0.6)' : 'none',
          pointerEvents: 'all',
          cursor: 'pointer',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      {/* Node icon — sized to match the bounding box */}
      <div className="absolute z-10" 
          style={debugMode ? { 
            background: 'rgba(255, 256, 25, 0.1)',
            borderRadius: '50%',
          } : undefined }
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          >
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
              transition: 'opacity 0.2s ease-in-out, width 0.15s ease, height 0.15s ease',
              width: hoveredHandleId === handle.id ? 18 : 6,
              height: hoveredHandleId === handle.id ? 18 : 6,
            }}
            onMouseEnter={(e) => {
              e.stopPropagation();
              setHoveredHandleId(handle.id);
            }}
            onMouseLeave={(e) => {
              e.stopPropagation();
              setHoveredHandleId(null);
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
