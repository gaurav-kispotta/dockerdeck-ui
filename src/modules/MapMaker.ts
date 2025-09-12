import { Edge, MarkerType, Node } from "@xyflow/react";
import { YamlDockerCompose } from "../context/UploadedFileContext";
import { getLayedOutElements } from "../utils/elkjsLayoutHelper";
import * as uuid from 'uuid'
import { JsonPathParser } from "./JsonPathParser";
import { LayoutOptions } from "elkjs/lib/elk.bundled";
import uniqolor from 'uniqolor';
import ServiceNodeBuilder from "./node-builder/ServiceNodeBuilder";
import UniqueColorBuilder from "./node-builder/util/UniqueColorBuilder";
import { DockerComposeAstBuilder } from "./ast/DockerComposeAstBuilder";
import GroupNodeBuilder from "./node-builder/GroupNodeBuilder";
import NetworkNodeBuilder from "./node-builder/NetworkNodeBuilder";
import VolumeNodeBuilder from "./node-builder/VolumeNodeBuilder";
import { DockerDeckNode } from "../model/DockerDeckNode";

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
    public nodes: Node[] = []
    public edges: Edge[] = []

    // First find the groups and then find its each child nodes
    // then build Elkjs Node mapping and get the plotted layout
    // then flatten the nodes to get its actual positions
    public async buildMap3(yamlObject: YamlDockerCompose) {
        /**
         * IMPORTANT: HERE IS THE DOCKER COMPOSE SPECIFICATION
         * 
         * https://github.com/compose-spec/compose-spec/blob/main/spec.md
         */

        const astBuilder = new DockerComposeAstBuilder(yamlObject);
        const dockerComposeAst = astBuilder.buildAst();

        const serviceGroupNode = new GroupNodeBuilder(new UniqueColorBuilder())
        const networkGroupNode = new GroupNodeBuilder(new UniqueColorBuilder())
        const volumeGroupNode = new GroupNodeBuilder(new UniqueColorBuilder())

        dockerComposeAst.services.forEach(s => {
            const typeNodeBuilder = new ServiceNodeBuilder(s, new UniqueColorBuilder())
            const serviceNode = typeNodeBuilder.build(s.name, 'services')
            serviceGroupNode.pushChild(serviceNode)
        });

        dockerComposeAst.networks?.forEach(n => {
            const typeNodeBuilder = new NetworkNodeBuilder(n, new UniqueColorBuilder())
            const networkNode = typeNodeBuilder.build(n.name, 'networks')
            networkGroupNode.pushChild(networkNode)
        });

        dockerComposeAst.volumes?.forEach(v => {
            const typeNodeBuilder = new VolumeNodeBuilder(v, new UniqueColorBuilder())
            const volumeNode = typeNodeBuilder.build(v.name, 'volumes')
            volumeGroupNode.pushChild(volumeNode)
        });

        const rootNode: DockerDeckNode = {
            id: 'root',
            parentId: undefined,
            width: 5000,
            height: 1000,
            position: { x: 0, y: 0 },
            data: { label: 'root' },
            children: [
                serviceGroupNode.build('services', ''),
                networkGroupNode.build('networks', ''),
                volumeGroupNode.build('volumes', '')
            ]
        }

        const root2 = [
                serviceGroupNode.build('services', ''),
                networkGroupNode.build('networks', ''),
                volumeGroupNode.build('volumes', '')
            ]

        const customOptions: LayoutOptions = {
            'elk.algorithm': 'org.eclipse.elk.box',
            'elk.layered.spacing.nodeNodeBetweenLayers': '200',
            'elk.spacing.nodeNode': '200',
            'elk.box.packingMode': 'GROUP_DEC',
            'elk.childAreaWidth': '100',
            'elk.childAreaHeight': '150',
            //'elk.layered.unnecessaryBendpoints': 'false',
            'elk.aspectRatio': '100',
            //'org.eclipse.elk.expandNodes': 'true',
            //'org.eclipse.elk.interactive': 'true',
            'org.eclipse.elk.padding': '12',
            //'org.eclipse.elk.spacing.individual': 'spacing.portPort:45;,;spacing.nodeNode:50',
        }

        const plottedElements = await getLayedOutElements([...(root2 as GroupNode[])], this.edges, customOptions)

        const mappedChildNodes = fromGroupNodeToNode(plottedElements?.nodes as GroupNode[])
        const childNodes = plottedElements?.nodes?.flatMap((n: any) => n?.children) || []

        // Recursively go through plottedElements for child nodes
        // and push the nodes to this.nodes
        const traverseChildren = (nodes: any[]) => {
            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                node.position = { x: node.x, y: node.y }; // Assign position from x and y
                this.nodes.push(node);
                if (node.children && Array.isArray(node.children)) {
                    traverseChildren(node.children);
                }
            }
        };

        traverseChildren(plottedElements?.nodes || [])
        //this.nodes.push(...mappedChildNodes, ...childNodes)

        console.log('All nodes:', this.nodes)
    }
}