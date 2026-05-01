import { Position } from '@xyflow/react'
import BaseNode from './BaseNode'

import '@xyflow/react/dist/style.css';

interface DockerDeckNodeProperties {
    dockerServiceId: string;
    dockerImageName: string;
    dockerIconUrl?: string;
}

function DockerDeckNode({ dockerServiceId, dockerImageName: _dockerImageName, dockerIconUrl }: DockerDeckNodeProperties) {
  const handles = [
    // Source handles
    { type: 'source' as const, position: Position.Top, id: 'a' },
    { type: 'source' as const, position: Position.Right, id: 'b' },
    { type: 'source' as const, position: Position.Bottom, id: 'c' },
    { type: 'source' as const, position: Position.Left, id: 'd' },
    
    // Target handles
    { type: 'target' as const, position: Position.Top, id: 'e' },
    { type: 'target' as const, position: Position.Right, id: 'f' },
    { type: 'target' as const, position: Position.Bottom, id: 'g' },
    { type: 'target' as const, position: Position.Left, id: 'h' },
  ];

  return (
    <BaseNode 
      handles={handles} 
      hoverAreaSize={140}
      className="flex items-center justify-center h-full w-full rounded-full"
    >
      <div className='flex flex-col items-center justify-center rounded-md p-2 relative'>
        <div>
          <img src={ dockerIconUrl } />
        </div>
        <div className='absolute top-10 left-10'>{dockerServiceId}</div>
      </div>
    </BaseNode>
  )
}

export default DockerDeckNode
