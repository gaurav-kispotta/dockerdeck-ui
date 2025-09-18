import { Position } from '@xyflow/react'
import BaseNode from './BaseNode'

import '@xyflow/react/dist/style.css';

function NodejsNode() {
  const handles = [
    { type: 'source' as const, position: Position.Bottom, id: 'a' },
    { type: 'source' as const, position: Position.Left, id: 'b' },
  ];

  return (
    <BaseNode handles={handles} hoverAreaSize={200}>
      <div>
        <img src='https://www.vectorlogo.zone/logos/nodejs/nodejs-icon.svg' />
      </div>
    </BaseNode>
  )
}

export default NodejsNode
