import { Handle, Position } from '@xyflow/react'

import '@xyflow/react/dist/style.css';

interface RedisNodeProperties {
    id: string;
}

function RedisNode({ id }: RedisNodeProperties) {
  return (
    <div className="flex items-center justify-center h-full w-full rounded-full">
      <div className='flex flex-col items-center justify-center rounded-md p-2 relative'>
        <div>
          <img src='https://www.vectorlogo.zone/logos/redis/redis-icon.svg' />
        </div>
        <div className='absolute top-10 left-10'>{id}</div>

        <Handle type="source" position={Position.Top} id="a" isConnectable={true} />
        <Handle type="source" position={Position.Right} id="b" isConnectable={true} />
        <Handle type="source" position={Position.Bottom} id="c" isConnectable={true} />
        <Handle type="source" position={Position.Left} id="d" isConnectable={true} />

        <Handle type="target" position={Position.Top} id="e" isConnectable={true} />
        <Handle type="target" position={Position.Right} id="f" isConnectable={true} />
        <Handle type="target" position={Position.Bottom} id="g" isConnectable={true} />
        <Handle type="target" position={Position.Left} id="h" isConnectable={true} />
      </div>
    </div>
  )
}

export default RedisNode
