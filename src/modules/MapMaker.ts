import { Node } from "@xyflow/react";
import { YamlDockerCompose } from "../context/UploadedFileContext";
import uniqolor from 'uniqolor';
import ServiceNodeBuilder from "./node-builder/ServiceNodeBuilder";
import UniqueColorBuilder from "./node-builder/util/UniqueColorBuilder";
import { DockerComposeAstBuilder } from "./ast/DockerComposeAstBuilder";
import GroupNodeBuilder from "./node-builder/GroupNodeBuilder";
import NetworkNodeBuilder from "./node-builder/NetworkNodeBuilder";
import VolumeNodeBuilder from "./node-builder/VolumeNodeBuilder";
import { DockerDeckNode } from "../model/DockerDeckNode";
import { DagreLayoutEngine } from "./layout-engine/DagreLayoutEngine";
import { DockerDeckEdge } from "../model/DockerDeckEdge";
import { SettingsState } from "../store/settingsSlice";
import EdgeBuilder from "./node-builder/EdgeBuilder";
import { AppDispatch } from "../store/store";
import { setAstObject } from "../store/uploadedFileSlice";

export type GroupNode = Node & { children: Node[] }
export type AnyArrayOrUndefined = any[] | undefined
export type GroupMap = { [key: string]: Node[] }

/**
 * Convert a list of nodes to a list of group nodes
 * @param nodes 
 * @returns GroupNode[]
 */
export const fromNodeToGroupNode = (nodes: Node[]): GroupNode[] => {
    return nodes.map(n => {
        return {
            ...n,
            children: []
        }
    })
}

/**
 * Convert a list of group nodes to a list of nodes
 * @param groupNodes 
 * @returns Node[]
 */
export const fromGroupNodeToNode = (groupNodes: GroupNode[]): Node[] => {
    return groupNodes.map(gn => {
        return {
            ...gn
        }
    })
}

export const customUniqueColour = (name: string): string => {
    let rgbColor = uniqolor(name, { format: 'rgb' }).color
    rgbColor = rgbColor.replace('rgb(', '').replace(')', '')
    return `rgba(${rgbColor}, 0.4)`
}

export default class MapMaker {
    public nodes: DockerDeckNode[] = []
    public edges: DockerDeckEdge[] = []

    public async buildMap3(yamlObject: YamlDockerCompose, settings?: SettingsState, dispatch?: AppDispatch) {
        try {
            console.log('buildMap3 started with yamlObject:', yamlObject);
            
            // Hierarchical layout strategy: networks -> services -> volumes with proper edges
            const astBuilder = new DockerComposeAstBuilder(yamlObject);
            const dockerComposeAst = astBuilder.buildAst();

            console.log('AST built successfully:', dockerComposeAst);

            // Store the AST in Redux state if dispatch is provided
            if (dispatch) {
                dispatch(setAstObject(dockerComposeAst));
            }

            // Calculate node dimensions based on settings
            const nodeWidth = settings ? settings.nodeSize : 100;
            const nodeHeight = settings ? settings.nodeSize : 100;

            // Create group builders for each category
            const serviceGroupNode = new GroupNodeBuilder(new UniqueColorBuilder(), nodeWidth, nodeHeight, settings)
            const networkGroupNode = new GroupNodeBuilder(new UniqueColorBuilder(), nodeWidth, nodeHeight, settings)
            const volumeGroupNode = new GroupNodeBuilder(new UniqueColorBuilder(), nodeWidth, nodeHeight, settings)

            console.log('Group builders created successfully');

            // Build network nodes and add to network group
            if (dockerComposeAst.networks && dockerComposeAst.networks.length > 0) {
                dockerComposeAst.networks.forEach(n => {
                    try {
                        const typeNodeBuilder = new NetworkNodeBuilder(n, new UniqueColorBuilder(), nodeWidth, nodeHeight)
                        const networkNode = typeNodeBuilder.build(n.name, '') // No parent for flat layout
                        networkGroupNode.pushChild(networkNode)
                    } catch (error) {
                        console.error('Error building network node:', n, error);
                    }
                });
            }

            // Build service nodes and add to service group
            if (dockerComposeAst.services && dockerComposeAst.services.length > 0) {
                dockerComposeAst.services.forEach(s => {
                    try {
                        const typeNodeBuilder = new ServiceNodeBuilder(s, new UniqueColorBuilder(), nodeWidth, nodeHeight)
                        const serviceNode = typeNodeBuilder.build(s.name, '') // No parent for flat layout
                        s.dependsOn?.forEach(_dep => {
                            serviceNode.data = {
                                ...serviceNode.data,
                                dependsOn: s.dependsOn
                            }
                        })
                        serviceGroupNode.pushChild(serviceNode)
                    } catch (error) {
                        console.error('Error building service node:', s, error);
                    }
                });
            }

            // Build volume nodes and add to volume group
            if (dockerComposeAst.volumes && dockerComposeAst.volumes.length > 0) {
                dockerComposeAst.volumes.forEach(v => {
                    try {
                        const typeNodeBuilder = new VolumeNodeBuilder(v, new UniqueColorBuilder(), nodeWidth, nodeHeight)
                        const volumeNode = typeNodeBuilder.build(v.name, '') // No parent for flat layout
                        volumeGroupNode.pushChild(volumeNode)
                    } catch (error) {
                        console.error('Error building volume node:', v, error);
                    }
                });
            }

            console.log('All nodes built successfully');

            console.log('All nodes built successfully');

            // Create flat node arrays for horizontal layering
            const allNodes: DockerDeckNode[] = [];
            const networkNodes = networkGroupNode.build('networks', '').children || [];
            const serviceNodes = serviceGroupNode.build('services', '').children || [];
            const volumeNodes = volumeGroupNode.build('volumes', '').children || [];

            

            // Add all nodes to flat array
            allNodes.push(...(networkNodes as DockerDeckNode[]));
            allNodes.push(...(serviceNodes as DockerDeckNode[]));
            allNodes.push(...(volumeNodes as DockerDeckNode[]));

            console.log('Flat node array created with', allNodes.length, 'nodes');

            // Build edges using the EdgeBuilder to connect related nodes
            const edgeBuilder = new EdgeBuilder(dockerComposeAst);
            const generatedEdges = edgeBuilder.getAllEdges({
            showDependencyEdges: settings?.showDependencies
        });

            console.log('Final nodes and edges count:', { nodes: allNodes.length, edges: generatedEdges.length });

            console.log('Edges generated:', generatedEdges.length);

            // Validate edge connectivity
            const nodeIdSet = new Set(allNodes.map(n => n.id));
            const invalidEdges = generatedEdges.filter(e => !nodeIdSet.has(e.source) || !nodeIdSet.has(e.target));
            if (invalidEdges.length > 0) {
                console.warn('Invalid edges found (source/target not in nodes):', invalidEdges);
            }

            // Use Dagre layout engine with flat structure
            const layoutEngine = new DagreLayoutEngine(settings);
            const plottedElements = await layoutEngine.layout(allNodes, generatedEdges);

            console.log('Layout engine completed successfully');

            console.log('Final layout complete - nodes:', this.nodes.length, 'edges:', this.edges.length);

            // Post-process to create horizontal layers: networks->services->volumes
            const spacing = settings ? settings.nodeLevelPadding * 3 : 300; // Layer separation
            const nodeMap = new Map<string, DockerDeckNode>();
            plottedElements.nodes.forEach(n => nodeMap.set(n.id, n));

            // Calculate layer positions
            let networkY = 0;
            let serviceY = networkY + spacing;
            let volumeY = serviceY + spacing;

            // Position networks horizontally at top
            const networkNodeIds = networkNodes.map(n => n.id);
            const placedNetworks = plottedElements.nodes.filter(n => networkNodeIds.includes(n.id));
            placedNetworks.forEach((n, index) => {
                const centerX = (index * (nodeWidth + 50)) - ((placedNetworks.length - 1) * (nodeWidth + 50)) / 2;
                n.position = { x: centerX, y: networkY };
            });

            // Position services horizontally in middle
            const serviceNodeIds = serviceNodes.map(n => n.id);
            const placedServices = plottedElements.nodes.filter(n => serviceNodeIds.includes(n.id));
            placedServices.forEach((n, index) => {
                const centerX = (index * (nodeWidth + 50)) - ((placedServices.length - 1) * (nodeWidth + 50)) / 2;
                n.position = { x: centerX, y: serviceY };
            });

            // Position volumes horizontally at bottom
            const volumeNodeIds = volumeNodes.map(n => n.id);
            const placedVolumes = plottedElements.nodes.filter(n => volumeNodeIds.includes(n.id));
            placedVolumes.forEach((n, index) => {
                const centerX = (index * (nodeWidth + 50)) - ((placedVolumes.length - 1) * (nodeWidth + 50)) / 2;
                n.position = { x: centerX, y: volumeY };
            });

            // Calculate overall bounds and center the entire layout
            const allPlacedNodes = [...placedNetworks, ...placedServices, ...placedVolumes];
            if (allPlacedNodes.length > 0) {
                // Find the bounds of the layout
                const minX = Math.min(...allPlacedNodes.map(n => n.position?.x || 0));
                const maxX = Math.max(...allPlacedNodes.map(n => (n.position?.x || 0) + nodeWidth));
                const minY = Math.min(...allPlacedNodes.map(n => n.position?.y || 0));
                const maxY = Math.max(...allPlacedNodes.map(n => (n.position?.y || 0) + nodeHeight));

                // Calculate layout dimensions and center offset
                const layoutWidth = maxX - minX;
                const layoutHeight = maxY - minY;
                
                // Center the layout (assuming viewport of reasonable size, can be adjusted)
                const centerOffsetX = -layoutWidth / 2;
                const centerOffsetY = -layoutHeight / 2;

                // Apply centering offset to all nodes
                allPlacedNodes.forEach(n => {
                    if (n.position) {
                        n.position.x += centerOffsetX;
                        n.position.y += centerOffsetY;
                    }
                });
            }

            console.log('Positioning completed successfully');

            // Map the plotted elements to the internal node and edge structures (already flat)
            this.nodes = plottedElements.nodes.map(node => ({
                ...node,
                parentId: undefined, // Remove any parentId for flat layout
                parentNode: undefined // Remove any parentNode for flat layout
            })) as DockerDeckNode[]
            
            // Ensure edges have the basic required properties for React Flow
            this.edges = generatedEdges.map(edge => ({
                ...edge,
                id: edge.id,
                source: edge.source,
                target: edge.target,
                type: edge.type || 'default', // Fallback to default if type is missing
                animated: edge.animated || false,
                style: edge.style || { stroke: '#999', strokeWidth: 2 }
            })) as DockerDeckEdge[]

            console.log('Final layout complete - nodes:', this.nodes.length, 'edges:', this.edges.length);
            
        } catch (error) {
            console.error('Error in buildMap3:', error);
            // Set empty arrays to prevent crashes
            this.nodes = [];
            this.edges = [];
            // Re-throw the error so the calling component can handle it
            throw error;
        }
    }
}