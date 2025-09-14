import {
    ReactFlow, addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    Background,
    Controls,
    type Node,
    type Edge,
    type NodeMouseHandler,
    MiniMap,
} from '@xyflow/react'
import { useCallback, useState, useEffect, useMemo } from 'react'

import '@xyflow/react/dist/style.css'
import { IDesignElement } from '../../interface/IDesignElements'
import nodeTypes from './NodeTypes'
import MapMaker from '../../modules/MapMaker'
import SimpleFloatingEdge from './SimpleFloatingEdge'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { selectNode, clearSelection } from '../../store/selectionSlice'

interface DesignDeckProperties extends IDesignElement {
    clear?: boolean
}

function DesignDeck({ clear = false }: DesignDeckProperties) {
    const [nodes, setNodes] = useState<Node[]>([])
    const [edges, setEdges] = useState<Edge[]>([])
    const { themeMode } = useAppSelector((state) => state.theme)

    const { yamlObject } = useAppSelector((state) => state.uploadedFile)
    const settings = useAppSelector((state) => state.settings)
    const selection = useAppSelector((state) => state.selection)
    const dispatch = useAppDispatch()

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

    const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
        // Find all connected edges and nodes
        const connectedEdgeIds: string[] = []
        const connectedNodeIds: string[] = []

        edges.forEach(edge => {
            if (edge.source === node.id || edge.target === node.id) {
                connectedEdgeIds.push(edge.id)
                if (edge.source === node.id) {
                    connectedNodeIds.push(edge.target)
                } else {
                    connectedNodeIds.push(edge.source)
                }
            }
        })

        dispatch(selectNode({
            nodeId: node.id,
            connectedNodeIds,
            connectedEdgeIds
        }))
    }, [dispatch, edges])

    const onPaneClick = useCallback(() => {
        dispatch(clearSelection())
    }, [dispatch])

    const edgeTypes = {
        default: SimpleFloatingEdge,
    };

    // Apply styling based on selection
    const styledNodes = useMemo(() => {
        if (!selection.selectedNodeId) return nodes

        return nodes.map(node => {
            const isSelected = node.id === selection.selectedNodeId
            const isConnected = selection.connectedNodeIds.includes(node.id)
            const isGrayed = !isSelected && !isConnected

            return {
                ...node,
                style: {
                    ...node.style,
                    opacity: isGrayed ? 0.3 : 1,
                    filter: isGrayed ? 'grayscale(100%)' : 'none',
                    transition: 'opacity 0.3s ease, filter 0.3s ease, box-shadow 0.3s ease',
                    boxShadow: isSelected 
                        ? '0 0 20px rgba(59, 130, 246, 0.6)' 
                        : isConnected 
                        ? '0 0 10px rgba(59, 130, 246, 0.4)' 
                        : 'none',
                },
                className: isSelected ? 'selected' : isConnected ? 'connected' : ''
            }
        })
    }, [nodes, selection])

    const styledEdges = useMemo(() => {
        if (!selection.selectedNodeId) return edges

        return edges.map(edge => {
            const isConnected = selection.connectedEdgeIds.includes(edge.id)
            const isGrayed = !isConnected

            return {
                ...edge,
                style: {
                    ...edge.style,
                    opacity: isGrayed ? 0.3 : 1,
                    strokeWidth: isConnected ? 6 : 2,
                    transition: 'opacity 0.3s ease, stroke-width 0.3s ease',
                    filter: isConnected ? 'drop-shadow(0px 0px 4px rgba(59, 130, 246, 0.5))' : 'none',
                },
                animated: isConnected ? true : edge.animated,
                className: isConnected ? 'highlighted' : ''
            }
        })
    }, [edges, selection])

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
            maker.buildMap3(yamlObject, settings)
                .then(() => {
                    setNodes(maker.nodes)
                    setEdges(maker.edges)
                })
        }
    }, [yamlObject, settings])

    return (
        <ReactFlow
            nodeTypes={nodeTypes}
            fitView
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodes={styledNodes}
            edges={styledEdges}
            edgeTypes={edgeTypes}
            colorMode={themeMode}
            className='overview'
            
        >
            <MiniMap nodeStrokeWidth={6} nodeStrokeColor="transparent" pannable={true} zoomable={true} />
            <Background />
            <Controls position={'bottom-left'} orientation={'horizontal'} />

        </ReactFlow>
    )
}

export default DesignDeck