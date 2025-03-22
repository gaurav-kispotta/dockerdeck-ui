import { Handle, Position, useStore } from '@xyflow/react'

import '@xyflow/react/dist/style.css';

interface RedisNodeProperties {
    id: string;
}

function RedisNode({ id }: RedisNodeProperties) {
  const label = useStore((s) => {
    const node = s.nodeLookup.get(id)

    if (!node) {
      return null
    }

    return `Position of node is ${node.position.x}:${node.position.y}`
  })
  return (
    <>
      <div>
        <img src='https://www.vectorlogo.zone/logos/redis/redis-icon.svg' />
      </div>
      <div>{id}</div>
      <div>{label}</div>
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
