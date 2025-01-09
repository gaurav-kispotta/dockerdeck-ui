import { Handle, Position } from '@xyflow/react'

import '@xyflow/react/dist/style.css';

function RedisNode() {
  return (
    <>
      <div>
        <img src='https://www.vectorlogo.zone/logos/redis/redis-icon.svg' />
      </div>
      <Handle type="source" position={Position.Top} id="a" isConnectable={true} />
      <Handle type="source" position={Position.Right} id="b" isConnectable={true} />
      <Handle type="source" position={Position.Bottom} id="c" isConnectable={true} />
      <Handle type="source" position={Position.Left} id="d" isConnectable={true} />

      <Handle type="target" position={Position.Top} id="e" isConnectable={true} />
      <Handle type="target" position={Position.Right} id="f" isConnectable={true} />
      <Handle type="target" position={Position.Bottom} id="g" isConnectable={true} />
      <Handle type="target" position={Position.Left} id="h" isConnectable={true} />
    </>
  )
}

export default RedisNode
