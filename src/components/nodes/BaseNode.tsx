import { Handle, Position } from '@xyflow/react'
import { useState, ReactNode } from 'react'

import '@xyflow/react/dist/style.css';

interface HandleConfig {
  type: 'source' | 'target';
  position: Position;
  id: string;
}

interface BaseNodeProps {
  children: ReactNode;
  handles?: HandleConfig[];
  hoverAreaSize?: number;
  className?: string;
}

function BaseNode({ 
  children, 
  handles = [], 
  hoverAreaSize = 200, 
  className = "relative" 
}: BaseNodeProps) {
  // Track hover state for showing handles
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div className={className}>
      {/* Invisible hover area - larger circle around the node */}
      <div 
        className="absolute inset-0"
        style={{
          width: `${hoverAreaSize}px`,
          height: `${hoverAreaSize}px`,
          borderRadius: '50%',
          transform: 'translate(-20px, -20px)', // Center the larger circle
          pointerEvents: 'all',
          cursor: 'pointer',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      
      {/* Actual node content */}
      <div className="relative z-10">
        {children}
        
        {/* Render all configured handles */}
        {handles.map((handle) => (
          <Handle 
            key={handle.id}
            type={handle.type}
            position={handle.position}
            id={handle.id}
            isConnectable={true}
            style={{ 
              opacity: isHovered ? 1 : 0, 
              transition: 'opacity 0.2s ease-in-out' 
            }} 
          />
        ))}
      </div>
    </div>
  )
}

export default BaseNode