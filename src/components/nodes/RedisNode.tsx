import { Handle, Position } from '@xyflow/react'

import '@xyflow/react/dist/style.css';

function RedisNode() {
  return (
    <>
      <div>
        <img src='https://www.vectorlogo.zone/logos/redis/redis-icon.svg' />
      </div>
      <Handle type="source" position={Position.Bottom} id="a" isConnectable={true} />
      <Handle type="source" position={Position.Left} id="b" isConnectable={true} />
    </>
  )
}

export default RedisNode
