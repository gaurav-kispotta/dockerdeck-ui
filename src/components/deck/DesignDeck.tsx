import {
    ReactFlow, addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    Background,
    BackgroundVariant,
    Controls,
    type Node,
    type Edge,
    type NodeMouseHandler,
    type EdgeMouseHandler,
    MiniMap,
    useReactFlow,
} from '@xyflow/react'
import { useCallback, useState, useEffect, useMemo } from 'react'
import dagre from 'dagre'

import '@xyflow/react/dist/style.css'
import { IDesignElement } from '../../interface/IDesignElements'
import nodeTypes from './NodeTypes'
import MapMaker from '../../modules/MapMaker'
import OrthogonalEdge, { RouteComputer } from './edges/OrthogonalEdge'
import BridgeEdge from './edges/BridgeEdge'
import SimpleEdge from './edges/SimpleEdge'
import SmoothStepEdge from './edges/SmoothStepEdge'
import StraightEdge from './edges/StraightEdge'
import { buildBootAnnotationNodes, computeTimelinePositions } from './BootTimelineOverlay'
import { buildLayeredAnnotationNodes } from './LayeredAnnotationOverlay'
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
    const { getNode, fitView } = useReactFlow();
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
    
    // Effect to fit view on the selected node
    useEffect(() => {
        if (!selection.selectedNodeId) return;
        const node = getNode(selection.selectedNodeId);
        if (node) {
            fitView({ nodes: [node], duration: 600, maxZoom: 1.5, padding: 0.35 });
        }
    }, [selection.selectedNodeId, getNode, fitView]);

    return null; // This component only handles side effects
}

function DesignDeck({ clear = false }: DesignDeckProperties) {
    const { themeMode } = useAppSelector((state) => state.theme)

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

    const edgeTypes = useMemo(() => {
        const edgeComponent = {
            orthogonal: OrthogonalEdge,
            bridge:     BridgeEdge,
            bezier:     SimpleEdge,
            smoothstep: SmoothStepEdge,
            straight:   StraightEdge,
        }[settings.edgeStyle ?? 'orthogonal'] ?? OrthogonalEdge;
        return { default: edgeComponent };
    }, [settings.edgeStyle]);

    // ── Boot-order timeline layout ────────────────────────────────────────────
    const bootOrderNodes = useMemo(() => {
        if (settings.viewMode !== 'boot-order') return null;
        const serviceNodes = nodes.filter(n => n.data?.nodeType === 'service');
        const depEdges = edges.filter(e => e.data?.connectionType === 'depends_on');
        if (serviceNodes.length === 0) return null;

        const positions = computeTimelinePositions(
            serviceNodes.map(n => n.id),
            depEdges,
        );

        // Reposition service nodes and lock them in place
        const positionedServices = serviceNodes.map(node => {
            const pos = positions.get(node.id);
            return {
                ...(pos ? { ...node, position: pos } : node),
                draggable:   false,
                selectable:  true,
                connectable: false,
                zIndex:      1,
            };
        });

        // Build annotation nodes (lane bands + rail)
        const annotations = buildBootAnnotationNodes(
            serviceNodes.map(n => n.id),
            depEdges,
            positions,
        );

        // Annotations first so they render behind service nodes
        return [...annotations, ...positionedServices];
    }, [nodes, edges, settings.viewMode]);

    // ── Layered-view group band annotations ───────────────────────────────────
    const layeredAnnotations = useMemo(() => {
        if (settings.mapLayout !== 'layered') return null;
        if (settings.viewMode !== 'architecture') return null;
        if (nodes.length === 0) return null;
        return buildLayeredAnnotationNodes(nodes);
    }, [nodes, settings.mapLayout, settings.viewMode]);

    // ── View-mode node filtering ──────────────────────────────────────────────
    const viewFilteredNodes = useMemo(() => {
        // In boot-order view: merge annotation nodes (not in original nodes)
        // with repositioned service nodes.
        let base: typeof nodes;
        if (bootOrderNodes) {
            const annotations = bootOrderNodes.filter(n => n.id.startsWith('__boot-'));
            const repositioned = nodes.map(n => bootOrderNodes.find(l => l.id === n.id) ?? n);
            base = [...annotations, ...repositioned];
        } else {
            base = nodes;
        }

        // Prepend layered-view band annotations (invisible to filter logic below)
        const layerBands = layeredAnnotations ?? [];

        return [...layerBands, ...base].filter(n => {
            const t = n.data?.nodeType as string | undefined;
            // Annotation nodes always pass through
            if (n.id.startsWith('__boot-')) return true;
            if (n.id.startsWith('__layer-')) return true;
            switch (settings.viewMode) {
                case 'ports':      return t !== 'volume';         // hide volume nodes
                case 'volumes':    return t !== 'network';        // hide network nodes
                case 'boot-order': return t === 'service';        // services only
                default:           return true;
            }
        });
    }, [nodes, bootOrderNodes, layeredAnnotations, settings.viewMode]);

    // Apply styling based on selection and dependency mode
    const styledNodes = useMemo(() => {
        const isAnnotation = (id: string) => id.startsWith('__boot-') || id.startsWith('__layer-');

        // showDependencies overlay
        if (settings.showDependencies) {
            const depIds = new Set<string>();
            edges.filter(e => e.data?.connectionType === 'depends_on')
                 .forEach(e => { depIds.add(e.source); depIds.add(e.target); });
            return viewFilteredNodes.map(n => {
                if (isAnnotation(n.id)) return n;
                return {
                    ...n,
                    style: { ...n.style, opacity: depIds.has(n.id) ? 1 : 0.25,
                             filter: depIds.has(n.id) ? 'none' : 'grayscale(100%)', transition: 'opacity 0.3s' },
                    className: depIds.has(n.id) ? 'dependency-involved' : 'dependency-grayed',
                };
            });
        }

        // View-mode node dimming (in ports view: fade services without exposed ports)
        if (settings.viewMode === 'ports') {
            const svcsWithPorts = new Set(
                astObject?.services?.filter(s => s.ports.length > 0).map(s => s.name) ?? []
            );
            return viewFilteredNodes.map(n => ({
                ...n,
                style: {
                    ...n.style,
                    opacity: n.data?.nodeType !== 'service' || svcsWithPorts.has(n.id) ? 1 : 0.35,
                    filter:  n.data?.nodeType !== 'service' || svcsWithPorts.has(n.id) ? 'none' : 'grayscale(80%)',
                    transition: 'opacity 0.3s, filter 0.3s',
                },
            }));
        }

        // Selection-based styling
        if (!selection.selectedNodeId) return viewFilteredNodes

        return viewFilteredNodes.map(node => {
            // Annotation nodes are never grayed
            if (isAnnotation(node.id)) return node;
            const isSelected = node.id === selection.selectedNodeId
            const isConnected = selection.connectedNodeIds.includes(node.id)
            const isGrayed = !isSelected && !isConnected
            return {
                ...node,
                style: {
                    ...node.style,
                    opacity: isGrayed ? 0.3 : 1,
                    filter: isGrayed ? 'grayscale(100%)' : 'none',
                    transition: 'opacity 0.3s, filter 0.3s',
                },
            }
        })
    }, [viewFilteredNodes, selection, settings.showDependencies, settings.viewMode, edges, astObject])

    // ── View-mode edge filtering + labelling ──────────────────────────────────
    const viewModeEdges = useMemo(() => {
        const vm = settings.viewMode;

        // showDependencies overlay always wins
        if (settings.showDependencies) {
            return edges.map(e => {
                const isDep = e.data?.connectionType === 'depends_on';
                return { ...e, style: { ...e.style, opacity: isDep ? 1 : 0.15, strokeWidth: isDep ? 3 : 1 }, animated: isDep };
            });
        }

        // Keep only edges whose endpoints exist in the filtered node set
        const visibleIds = new Set(viewFilteredNodes.map(n => n.id));
        let filtered = edges.filter(e => visibleIds.has(e.source) && visibleIds.has(e.target));

        switch (vm) {
            case 'networks':
                // Network edges prominent, others faded
                filtered = filtered.map(e => {
                    const isNet = e.data?.connectionType === 'network';
                    return { ...e, style: { ...e.style, opacity: isNet ? 1 : 0.08, strokeWidth: isNet ? 2.5 : 1 } };
                });
                break;

            case 'ports':
                // Fade all edges — the node badges carry the info
                filtered = filtered.map(e => ({ ...e, style: { ...e.style, opacity: 0.1 } }));
                break;

            case 'volumes': {
                // Volume edges prominent with mount-path labels; others faded
                filtered = filtered.map(e => {
                    const isVol = e.data?.connectionType === 'volume';
                    if (!isVol) return { ...e, style: { ...e.style, opacity: 0.08, strokeWidth: 1 } };
                    // Look up mount path from AST
                    const svcAst = astObject?.services?.find(s => s.name === e.source);
                    const volInfo = svcAst?.volumes?.find(v => v.external === e.target || e.target.startsWith(v.external));
                    return {
                        ...e,
                        label: volInfo?.internal ?? '',
                        style: { ...e.style, opacity: 1, strokeWidth: 2.5 },
                    };
                });
                break;
            }

            case 'boot-order':
                // Only depends_on edges
                filtered = filtered
                    .filter(e => e.data?.connectionType === 'depends_on')
                    .map(e => ({ ...e, style: { ...e.style, opacity: 1, strokeWidth: 2.5 }, animated: true }));
                break;

            default: // architecture — all edges at normal weight
                break;
        }

        // Selection overlay on top of view-mode filtering
        if (!selection.selectedNodeId) return filtered;
        return filtered.map(e => {
            const isConn = selection.connectedEdgeIds.includes(e.id);
            return {
                ...e,
                style: {
                    ...e.style,
                    opacity: isConn ? 1 : (e.style?.opacity as number ?? 1) * 0.4,
                    strokeWidth: isConn ? 4 : (e.style?.strokeWidth as number ?? 1.5),
                    filter: isConn ? 'drop-shadow(0 0 4px rgba(91,200,255,0.6))' : 'none',
                },
                animated: isConn ? true : e.animated,
            };
        });
    }, [edges, viewFilteredNodes, selection, settings.showDependencies, settings.viewMode, astObject])

    // Legacy alias kept so the ReactFlow render can use styledEdges name
    const styledEdges = viewModeEdges;

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
            <RouteComputer />
            <MiniMap nodeStrokeWidth={6} nodeStrokeColor="transparent" pannable zoomable />
            <Background variant={BackgroundVariant.Dots} gap={22} size={1} />
            <Controls position="bottom-left" orientation="horizontal" />
        </ReactFlow>
    )
}


export default DesignDeck