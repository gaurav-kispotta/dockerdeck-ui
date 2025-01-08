import { Handle, Position } from '@xyflow/react'

import '@xyflow/react/dist/style.css';

function RedisNode() {
  return (
    <>
      <div>
        <img src='https://www.vectorlogo.zone/logos/redis/redis-icon.svg' />
      </div>
      <Handle type="source" position={Position.Right} id="a" isConnectable={true} />
      <Handle type="target" position={Position.Right} id="b" isConnectable={true} />
    </>
  )
}

export default RedisNode
