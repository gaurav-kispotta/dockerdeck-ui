import {
    ReactFlow, addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    Background,
    Controls,
    type Node,
    type Edge,
} from '@xyflow/react'
import { useCallback, useState, useEffect } from 'react'

import '@xyflow/react/dist/style.css'
import { IDesignElement } from '../../interface/IDesignElements'
import nodeTypes from './NodeTypes'
import { useUploadFileContext } from '../../context/UploadedFileContext'
import MapMaker from '../../modules/MapMaker'

interface DesignDeckProperties extends IDesignElement {
    clear?: boolean
}

function DesignDeck({ nodes: propNodes, edges: propEdges, clear }: DesignDeckProperties) {
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

    const { yamlObject } = useUploadFileContext()

    useEffect(() => {
        if (clear) {
            setNodes([])
            setEdges([])
        }
    }, [clear])

    useEffect(() => {
        console.log(yamlObject)
        const maker = new MapMaker();
        if (yamlObject) {
            maker.buildMap(yamlObject)
            setNodes(maker.nodes)
            setEdges(maker.edges)
        }
    }, [yamlObject])

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