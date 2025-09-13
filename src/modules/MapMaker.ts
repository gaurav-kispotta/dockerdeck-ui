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
import { ElkJsLayoutEngine } from "./layout-engine/ElkJsLayoutEngine";
import { DockerDeckEdge } from "../model/DockerDeckEdge";
import { ElkJsLayoutOptions } from "./layout-engine/ElkJsLayoutOption";
import { SettingsState } from "../store/settingsSlice";
import EdgeBuilder from "./node-builder/EdgeBuilder";

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
    public async buildMap3(yamlObject: YamlDockerCompose, settings?: SettingsState) {
        /**
         * IMPORTANT: HERE IS THE DOCKER COMPOSE SPECIFICATION
         * 
         * https://github.com/compose-spec/compose-spec/blob/main/spec.md
         */

        const astBuilder = new DockerComposeAstBuilder(yamlObject);
        const dockerComposeAst = astBuilder.buildAst();

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
                serviceGroupNode.build('services', ''),
                networkGroupNode.build('networks', ''),
                volumeGroupNode.build('volumes', '')
            ]

        // Build edges using the EdgeBuilder
        const edgeBuilder = new EdgeBuilder(dockerComposeAst);
        const generatedEdges = edgeBuilder.getAllEdges();

        const layoutEngine = new ElkJsLayoutEngine(settings);

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
}