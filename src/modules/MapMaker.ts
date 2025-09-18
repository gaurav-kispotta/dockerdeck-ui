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
import { ElkJsLayoutOptions } from "./layout-engine/ElkJsLayoutOption";
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

    // First find the groups and then find its each child nodes
    // then build Elkjs Node mapping and get the plotted layout
    // then flatten the nodes to get its actual positions
    public async buildMap4(yamlObject: YamlDockerCompose, settings?: SettingsState, dispatch?: AppDispatch) {
        /**
         * IMPORTANT: HERE IS THE DOCKER COMPOSE SPECIFICATION
         * 
         * https://github.com/compose-spec/compose-spec/blob/main/spec.md
         */

        const astBuilder = new DockerComposeAstBuilder(yamlObject);
        const dockerComposeAst = astBuilder.buildAst();

        // Store the AST in Redux state if dispatch is provided
        if (dispatch) {
            dispatch(setAstObject(dockerComposeAst));
        }

        // Calculate node dimensions based on settings
        const nodeWidth = settings ? settings.nodeSize : 100; // Direct use
        const nodeHeight = settings ? settings.nodeSize : 100; // Direct use

        // Calculate spacing based on settings
        const nodeSpacing = settings ? settings.nodeLevelPadding : 100; // Direct use

        const serviceGroupNode = new GroupNodeBuilder(new UniqueColorBuilder(), nodeWidth, nodeHeight, settings)
        const networkGroupNode = new GroupNodeBuilder(new UniqueColorBuilder(), nodeWidth, nodeHeight, settings)
        const volumeGroupNode = new GroupNodeBuilder(new UniqueColorBuilder(), nodeWidth, nodeHeight, settings)

        dockerComposeAst.services.forEach(s => {
            const typeNodeBuilder = new ServiceNodeBuilder(s, new UniqueColorBuilder(), nodeWidth, nodeHeight)
            const serviceNode = typeNodeBuilder.build(s.name, 'services')

            serviceNode.layoutOptions = new ElkJsLayoutOptions()
                .setCustomOption({ 
                    'elk.spacing.nodeNode': nodeSpacing.toString(),
                    'elk.algorithm': 'org.eclipse.elk.box',
                })
                .build();

            serviceGroupNode.pushChild(serviceNode)
        });

        dockerComposeAst.networks?.forEach(n => {
            const typeNodeBuilder = new NetworkNodeBuilder(n, new UniqueColorBuilder(), nodeWidth, nodeHeight)
            const networkNode = typeNodeBuilder.build(n.name, 'networks')

            networkNode.layoutOptions = new ElkJsLayoutOptions()
                .setCustomOption({
                    'elk.spacing.nodeNode': nodeSpacing.toString(),
                    'elk.algorithm': 'org.eclipse.elk.box',
                })
                .build();

            networkGroupNode.pushChild(networkNode)
        });

        dockerComposeAst.volumes?.forEach(v => {
            const typeNodeBuilder = new VolumeNodeBuilder(v, new UniqueColorBuilder(), nodeWidth, nodeHeight)
            const volumeNode = typeNodeBuilder.build(v.name, 'volumes')

            volumeNode.layoutOptions = new ElkJsLayoutOptions()
                .setCustomOption({
                    'elk.spacing.nodeNode': nodeSpacing.toString(),
                    'elk.algorithm': 'org.eclipse.elk.box',
                })
                .build();

            volumeGroupNode.pushChild(volumeNode)
        });

        const dockerDeckRoot: DockerDeckNode[] = [
                networkGroupNode.build('networks', ''),
                serviceGroupNode.build('services', ''),
                volumeGroupNode.build('volumes', '')
            ]

        // Add positional priorities to ensure networks->services->volumes order (top to bottom)
        dockerDeckRoot[0].layoutOptions = {
            ...dockerDeckRoot[0].layoutOptions,
            'elk.priority': '1', // Highest priority for networks (top)
            'elk.position': '(0,0)' // Start at top
        };
        dockerDeckRoot[1].layoutOptions = {
            ...dockerDeckRoot[1].layoutOptions,
            'elk.priority': '2' // Medium priority for services (middle)
        };
        dockerDeckRoot[2].layoutOptions = {
            ...dockerDeckRoot[2].layoutOptions,
            'elk.priority': '3' // Lowest priority for volumes (bottom)
        };

        // Build edges using the EdgeBuilder
        const edgeBuilder = new EdgeBuilder(dockerComposeAst);
        const generatedEdges = edgeBuilder.getAllEdges();

    const layoutEngine = new DagreLayoutEngine(settings);

        const plottedElements = await layoutEngine.layout(dockerDeckRoot, generatedEdges)

        // Flatten nodes for React Flow (which expects flat array with parentNode references)
        const flattenNodes = (nodes: DockerDeckNode[]): DockerDeckNode[] => {
            const result: DockerDeckNode[] = [];
            
            for (const node of nodes) {
                // Add the parent node (but remove children array since React Flow doesn't use it)
                const parentNode = { ...node };
                delete parentNode.children;
                result.push(parentNode);
                
                // Add all children nodes
                if (node.children && node.children.length > 0) {
                    result.push(...flattenNodes(node.children as DockerDeckNode[]));
                }
            }
            
            return result;
        };

        // Map the plotted elements to the internal node and edge structures
        this.nodes = flattenNodes(plottedElements.nodes as DockerDeckNode[])
        this.edges = plottedElements.edges as DockerDeckEdge[]

        console.log('All nodes:', this.nodes)
        console.log('All edges:', this.edges)
    }

    public async buildMap3(yamlObject: YamlDockerCompose, settings?: SettingsState, dispatch?: AppDispatch) {
        // Hierarchical layout strategy: networks -> services -> volumes with proper edges
        const astBuilder = new DockerComposeAstBuilder(yamlObject);
        const dockerComposeAst = astBuilder.buildAst();

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

        // Build network nodes and add to network group
        dockerComposeAst.networks?.forEach(n => {
            const typeNodeBuilder = new NetworkNodeBuilder(n, new UniqueColorBuilder(), nodeWidth, nodeHeight)
            const networkNode = typeNodeBuilder.build(n.name, 'networks')
            networkGroupNode.pushChild(networkNode)
        });

        // Build service nodes and add to service group
        dockerComposeAst.services.forEach(s => {
            const typeNodeBuilder = new ServiceNodeBuilder(s, new UniqueColorBuilder(), nodeWidth, nodeHeight)
            const serviceNode = typeNodeBuilder.build(s.name, 'services')
            serviceGroupNode.pushChild(serviceNode)
        });

        // Build volume nodes and add to volume group
        dockerComposeAst.volumes?.forEach(v => {
            const typeNodeBuilder = new VolumeNodeBuilder(v, new UniqueColorBuilder(), nodeWidth, nodeHeight)
            const volumeNode = typeNodeBuilder.build(v.name, 'volumes')
            volumeGroupNode.pushChild(volumeNode)
        });

        // Create flat node arrays for horizontal layering
        const allNodes: DockerDeckNode[] = [];
        const networkNodes = networkGroupNode.build('networks', '').children || [];
        const serviceNodes = serviceGroupNode.build('services', '').children || [];
        const volumeNodes = volumeGroupNode.build('volumes', '').children || [];

        // Add all nodes to flat array
        allNodes.push(...(networkNodes as DockerDeckNode[]));
        allNodes.push(...(serviceNodes as DockerDeckNode[]));
        allNodes.push(...(volumeNodes as DockerDeckNode[]));

        // Build edges using the EdgeBuilder to connect related nodes
        const edgeBuilder = new EdgeBuilder(dockerComposeAst);
        const generatedEdges = edgeBuilder.getAllEdges();

        // Use Dagre layout engine with flat structure
        const layoutEngine = new DagreLayoutEngine(settings);
        const plottedElements = await layoutEngine.layout(allNodes, generatedEdges);

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

        // Map the plotted elements to the internal node and edge structures (already flat)
        this.nodes = plottedElements.nodes as DockerDeckNode[]
        this.edges = plottedElements.edges as DockerDeckEdge[]

        console.log('All nodes:', this.nodes)
        console.log('All edges:', this.edges)
    }
}