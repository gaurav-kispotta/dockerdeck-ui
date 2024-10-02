import {
    ReactFlow, addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    Background,
    Controls,
    type Node,
    type Edge,
} from '@xyflow/react'
import RedisNode from './nodes/RedisNode'
import { useCallback, useState, useEffect } from 'react'
import { getLayoutedElements } from '../utils/layoutHelper'

import '@xyflow/react/dist/style.css'
import { IDesignElement } from '../interface/IDesignElements'
import NodejsNode from './nodes/NodejsNode'

const nodeTypes = { redis: RedisNode, nodejs: NodejsNode }

interface DesignDeckProperties extends IDesignElement {

}

function DesignDeck({ nodes: propNodes, edges: propEdges }: DesignDeckProperties) {
    const [nodes, setNodes] = useState<Node[]>(propNodes)
    const [edges, setEdges] = useState<Edge[]>(propEdges)

    const onNodesChange = useCallback(
        (changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [setNodes],
    );
    const onEdgesChange = useCallback(
        (changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [setEdges],
    );
    const onConnect = useCallback(
        (connection: any) => setEdges((eds) => addEdge(connection, eds)),
        [setEdges],
    );

    useEffect(() => {
        const layoutServiceNodes = getLayoutedElements(nodes, edges, 'LR')

        setNodes(layoutServiceNodes.nodes)
        setEdges(layoutServiceNodes.edges)
    }, [])

    return (
        <ReactFlow
            nodeTypes={nodeTypes}
            fitView
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodes={nodes}
            edges={edges}
            colorMode={'system'}
            className='overview'
            
        >
            <Background className='bg-slate-600' color='gray'/>
            <Controls position={'bottom-right'} orientation={'horizontal'}/>
        </ReactFlow>
    )
}

export default DesignDeck