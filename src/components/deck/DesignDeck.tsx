import {
    ReactFlow, addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    Background,
    Controls,
    type Node,
    type Edge,
    type NodeMouseHandler,
    type EdgeMouseHandler,
    MiniMap,
    useReactFlow
} from '@xyflow/react'
import { useCallback, useState, useEffect, useMemo } from 'react'
import dagre from 'dagre'

import '@xyflow/react/dist/style.css'
import { IDesignElement } from '../../interface/IDesignElements'
import nodeTypes from './NodeTypes'
import MapMaker from '../../modules/MapMaker'
// import SimpleFloatingEdge from './SimpleFloatingEdge'
import SimpleEdge from './SimpleEdge'
import DownloadControls from './DownloadControls'
import { useAppSelector, useAppDispatch } from '../../hooks/useReduxHooks'
import { selectNode, clearSelection } from '../../store/slices/selectionSlice'
import { logInteractionEvent, AnalyticsEvent } from '../../utils/analytics'
import { setEdges, setNodes } from '../../store/slices/dockerdeckSlice'
import { setAstObject } from '../../store/slices/uploadedFileSlice'

interface DesignDeckProperties extends IDesignElement {
    clear?: boolean
}

// Inner component that has access to ReactFlow context
function FlowWithCentering({ nodes: propNodes }: { nodes: Node[] }) {
    const { getNode, setCenter, fitView } = useReactFlow();
    const selection = useAppSelector((state) => state.selection);
    const yamlObject = useAppSelector((state) => state.uploadedFile.yamlObject);
    const [hasNewFile, setHasNewFile] = useState(false);
    
    // Effect to detect when a new file is uploaded
    useEffect(() => {
        if (yamlObject) {
            setHasNewFile(true);
        }
    }, [yamlObject]);
    
    // Effect to fit view to complete graph when nodes are updated after a new file upload
    useEffect(() => {
        if (hasNewFile && propNodes.length > 0) {
            // Small delay to ensure nodes are fully rendered before fitting view
            const timeoutId = setTimeout(() => {
                fitView({ 
                    padding: 0.1, // 10% padding around the nodes
                    duration: 800, // Smooth animation
                    includeHiddenNodes: false 
                });
                setHasNewFile(false); // Reset flag after fitting view
            }, 100);
            
            return () => clearTimeout(timeoutId);
        }
    }, [hasNewFile, propNodes.length, fitView]);
    
    // Effect to center on node when selected from AST viewer
    useEffect(() => {
        // Only center if selection came from AST (indicated by empty connectedNodeIds)
        if (selection.selectedNodeId && selection.connectedNodeIds.length === 0) {
            const node = getNode(selection.selectedNodeId);
            if (node && node.position) {
                fitView({ nodes: [node], duration: 800, maxZoom: 1 }); // Fit view first (zoomed out, instant)
            }
        }
    }, [selection.selectedNodeId, selection.connectedNodeIds, getNode, setCenter, fitView]);

    return null; // This component only handles side effects
}

function DesignDeck({ clear = false }: DesignDeckProperties) {
    const { themeMode, isDark } = useAppSelector((state) => state.theme)

    const { yamlObject } = useAppSelector((state) => state.uploadedFile)
    const astObject = useAppSelector((state) => state.uploadedFile.astObject)
    const settings = useAppSelector((state) => state.settings)
    const selection = useAppSelector((state) => state.selection)

    const nodes = useAppSelector((state) => state.dockerdeck.nodes)
    const edges = useAppSelector((state) => state.dockerdeck.edges)

    const dispatch = useAppDispatch()

    const onNodesChange = useCallback(
        (changes: any) => dispatch(setNodes(applyNodeChanges(changes, nodes))),
        [dispatch, nodes],
    );
    const onEdgesChange = useCallback(
        (changes: any) => dispatch(setEdges(applyEdgeChanges(changes, edges))),
        [dispatch, edges],
    );
    const onConnect = useCallback(
        (connection: any) => dispatch(setEdges(addEdge(connection, edges))),
        [dispatch, edges],
    );

    // Function to calculate dependency tree layout using Dagre
    const getDependencyLayout = useCallback((nodes: Node[], dependencyEdges: Edge[]) => {
        const dagreGraph = new dagre.graphlib.Graph();
        dagreGraph.setDefaultEdgeLabel(() => ({}));
        dagreGraph.setGraph({ 
            rankdir: 'TB', // Top to bottom layout
            ranksep: 100,  // Vertical spacing between ranks
            nodesep: 100,  // Horizontal spacing between nodes
            marginx: 50,
            marginy: 50
        });
        
        // Add nodes to dagre graph
        nodes.forEach(node => {
            dagreGraph.setNode(node.id, { 
                width: node.measured?.width || 180, 
                height: node.measured?.height || 80 
            });
        });
        
        // Add only dependency edges to dagre graph
        dependencyEdges.forEach(edge => {
            if (edge.data?.connectionType === 'depends_on') {
                dagreGraph.setEdge(edge.source, edge.target);
            }
        });
        
        // Calculate layout
        dagre.layout(dagreGraph);
        
        // Apply calculated positions to nodes
        return nodes.map(node => {
            const nodeWithPosition = dagreGraph.node(node.id);
            
            if (nodeWithPosition) {
                return {
                    ...node,
                    position: {
                        x: nodeWithPosition.x - (nodeWithPosition.width / 2),
                        y: nodeWithPosition.y - (nodeWithPosition.height / 2)
                    }
                };
            }
            return node;
        });
    }, []);

    const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
        console.log('Graph: Clicked node:', node.id);
        
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

        console.log('Graph: Dispatching selectNode with nodeId:', node.id, 'astObject:', astObject);

        dispatch(selectNode({
            nodeId: node.id,
            connectedNodeIds,
            connectedEdgeIds,
            astObject
        }))
    }, [dispatch, edges, astObject])

    const onPaneClick = useCallback(() => {
        dispatch(clearSelection())
    }, [dispatch])

    const onEdgeClick: EdgeMouseHandler = useCallback((_event, edge) => {
        console.log('Graph: Clicked edge:', edge.id);
        
        // Log edge selection event
        logInteractionEvent(AnalyticsEvent.EDGE_SELECTED, {
            component: 'graph',
            action: 'edge_selected',
            edgeId: edge.id,
            edgeType: edge.type || 'default',
            connectionType: edge.data?.connectionType || 'unknown',
            source: edge.source,
            target: edge.target
        });
    }, [])

    // Use our safe simple edge that doesn't require specific handles
    const edgeTypes = {
        default: SimpleEdge,
    };

    // Apply styling based on selection and dependency mode
    const styledNodes = useMemo(() => {
        // In dependency mode, highlight nodes involved in dependency relationships
        if (settings.showDependencies) {
            // Find nodes involved in dependency edges
            const dependencyEdges = edges.filter(edge => 
                edge.data?.connectionType === 'depends_on'
            );
            
            const involvedNodeIds = new Set<string>();
            dependencyEdges.forEach(edge => {
                involvedNodeIds.add(edge.source);
                involvedNodeIds.add(edge.target);
            });

            return nodes.map(node => {
                const isInvolved = involvedNodeIds.has(node.id);
                
                return {
                    ...node,
                    style: {
                        ...node.style,
                        opacity: isInvolved ? 1 : 0.3,
                        filter: isInvolved ? 'none' : 'grayscale(100%)',
                        transition: 'opacity 0.3s ease, filter 0.3s ease, box-shadow 0.3s ease',
                        boxShadow: isInvolved 
                            ? '0 0 15px rgba(239, 68, 68, 0.5)' // Red glow for dependency nodes
                            : 'none',
                        border: isInvolved ? '2px solid #ef4444' : node.style?.border,
                        transform: 'none' // Prevent scaling to maintain alignment
                    },
                    className: isInvolved ? 'dependency-involved' : 'dependency-grayed'
                }
            });
        }

        // Regular selection-based styling
        if (!selection.selectedNodeId) return nodes

        return nodes.map(node => {
            const isSelected = node.id === selection.selectedNodeId
            const isConnected = selection.connectedNodeIds.includes(node.id)
            const isGrayed = !isSelected && !isConnected

            const nodeStyleLogic = () => {
                const selectedNodeStyle = 'selected rounded-full';
                if (isSelected) {
                    if (isDark) {
                        return 'selected-dark ' + selectedNodeStyle;
                    } else {
                        return 'selected-light ' + selectedNodeStyle;
                    }
                }
                if (isConnected) {
                    const connectedStyle = 'connected rounded-full shadow-lg';
                    if (isDark) {
                        return 'connected-dark ' + connectedStyle;
                    } else {
                        return 'connected-light ' + connectedStyle;
                    }
                }
                return '';
            }

            return {
                ...node,
                style: {
                    ...node.style,
                    opacity: isGrayed ? 0.3 : 1,
                    filter: isGrayed ? 'grayscale(100%)' : 'none',
                    transition: 'opacity 0.3s ease, filter 0.3s ease, box-shadow 0.3s ease',
                },
                className: nodeStyleLogic()
            }
        })
    }, [nodes, selection, settings.showDependencies, edges])

    const styledEdges = useMemo(() => {
        // In dependency mode, highlight dependency edges
        if (settings.showDependencies) {
            return edges.map(edge => {
                const isDependencyEdge = edge.data?.connectionType === 'depends_on';
                
                return {
                    ...edge,
                    style: {
                        ...edge.style,
                        opacity: isDependencyEdge ? 1 : 0.2, // Hide non-dependency edges
                        strokeWidth: isDependencyEdge ? 4 : 1,
                        transition: 'opacity 0.3s ease, stroke-width 0.3s ease',
                    },
                    animated: isDependencyEdge ? true : false,
                    className: isDependencyEdge ? 'dependency-edge' : 'grayed-edge'
                }
            });
        }

        // Regular selection-based styling
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
    }, [edges, selection, settings.showDependencies])

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
                .then((ast) => {
                    console.log('MapMaker completed successfully');
                    if (ast) dispatch(setAstObject(ast));

                    let finalNodes = maker.nodes;

                    if (settings.showDependencies) {
                        const dependencyEdges = maker.edges.filter(e =>
                            e.data?.connectionType === 'depends_on'
                        );
                        const serviceNodes = maker.nodes.filter(n =>
                            n.data?.nodeType === 'service'
                        );
                        if (dependencyEdges.length > 0 && serviceNodes.length > 0) {
                            const laidOut = getDependencyLayout(serviceNodes, dependencyEdges);
                            finalNodes = maker.nodes.map(node =>
                                laidOut.find(n => n.id === node.id) ?? node
                            );
                        }
                    }

                    dispatch(setNodes(finalNodes));
                    dispatch(setEdges(maker.edges));
                })
                .catch((error) => {
                    console.error('Error in MapMaker.buildMap3:', error);
                    // Set empty arrays to prevent rendering errors
                    dispatch(setNodes([]));
                    dispatch(setEdges([]));
                });
        }
    }, [yamlObject, settings, dispatch, getDependencyLayout])

    return (
        <ReactFlow
            nodeTypes={nodeTypes}
            fitView
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            nodes={styledNodes}
            edges={styledEdges}
            edgeTypes={edgeTypes}
            colorMode={themeMode}
            className='overview'
            
        >
            <FlowWithCentering nodes={nodes} />
            <DownloadControls />
            <MiniMap nodeStrokeWidth={6} nodeStrokeColor="transparent" pannable={true} zoomable={true} />
            <Background />
            <Controls position={'bottom-left'} orientation={'horizontal'} />

        </ReactFlow>
    )
}

export default DesignDeck