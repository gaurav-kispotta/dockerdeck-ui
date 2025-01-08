import { Edge, MarkerType, Node } from "@xyflow/react";
import { YamlDockerCompose } from "../context/UploadedFileContext";
import { getLayedOutElements } from "../utils/elkjsLayoutHelper";
import * as uuid from 'uuid'
import { JsonPathParser } from "./JsonPathParser";
import { LayoutOptions } from "elkjs/lib/elk.bundled";
import uniqolor from 'uniqolor';

export type GroupNode = Node & { children: Node[] }
export type AnyArrayOrUndefined = any[] | undefined
export type GroupMap = { [key:string]: Node[] }

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

    private buildGroupNode(id: string,
        label: string,
        backgroundColor = 'rgba(255, 0, 0, 0.2)',
        width = 1000,
        height = 700,
        children: Node[] = []
    ): GroupNode {
        return {
            id,
            data: { label },
            position: { x: 0, y: 0 },
            style: { backgroundColor, border: '2px solid black' },
            type: 'group',
            height,
            width,
            children,
        }
    }

    private buildTypeNode(id: string,
        type: string | undefined,
        parentId: string | undefined = undefined,
        width = 100,
        height = 100,
        backgroundColor = 'rgba(255, 0, 0, 0.2)',
    ): Node {
        const ret: Node = {
            id,
            position: { x: 0, y: 0 },
            //style: { backgroundColor, border: '2px solid black' },
            data: { label: type + ': ' + id },
            type,
            resizing: true,
            parentId,
            extent: 'parent',
            width,
            height
        }

        if (parentId) {
            ret['parentId'] = parentId
            ret['extent'] = 'parent'
        }
        return ret
    }

    private buildEdge(sourceId: string, targetId: string, label = undefined, markerColor = '#FF0072'): Edge {
        return {
            id: `edge-sn-${sourceId}-${targetId}-${uuid.v7()}`,
            source: sourceId,
            target: targetId,
            animated: true,
            markerStart: {
                type: MarkerType.ArrowClosed,
                width: 10,
                height: 10,
                color: markerColor,
            },
            markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 10,
                height: 10,
                color: markerColor,
            },
            zIndex: 5,
            //type: 'smoothstep',
            label: label ? label : `from-${sourceId}-${targetId}`
        }
    }

    public async buildMap(yamlObject: YamlDockerCompose) {
        this.nodes = []
        delete yamlObject['version']

        const jsonPathParser = new JsonPathParser(yamlObject);

        const groups = jsonPathParser.findKeys('$');

        const allTypeNodes: Node[] = []
        const allGroupNodes: Node[] = []

        // Strategy:
        // 1. Build all "Type Nodes"
        // 2. Build all "Group Nodes"
        // 3. Build all "Edges"
        // 4. Plot all of these using the ElkJS layout engine

        // BUILDING

         // Building all "Group Nodes"
        groups.map((g: string) => {
            const childrenNodes: Node[] = []
            if (false) {
                const nodes = jsonPathParser.findKeys(`$.${g}`)

                nodes.map((n: string) => {
                    const image = jsonPathParser.findJson(`$.${g}.${n}.image`)
                    childrenNodes.push(this.buildTypeNode(n, image, g))
                })
            }
            const gn = this.buildGroupNode(g, `${g}-group`)
            allGroupNodes.push(...fromGroupNodeToNode([gn]))
        })

        // Building all "Type Nodes"
        groups.map((g: string) => {
            const nodes = jsonPathParser.findKeys(`$.${g}`)

            return nodes.map((n: string) => {
                const image = jsonPathParser.findJson(`$.${g}.${n}.image`)
                allTypeNodes.push(this.buildTypeNode(n, image, g))
            })
        })

        // PLOTTING

        // Plotting all "Type Nodes"
        const plottedElements1: any = []
        const allPlottableGroupNodes = fromNodeToGroupNode(allTypeNodes)
        const promiseNodeType = groups.map(async (g: string) => {
            const filteredByParent = allPlottableGroupNodes.filter((gn: GroupNode) => gn.parentId === g)
            const customLayoutOptions = { 
                'elk.spacing.nodeNode': '50',
                'elk.algorithm': 'org.eclipse.elk.box',
            }
            const plottedElements = await getLayedOutElements(filteredByParent, this.edges, customLayoutOptions)
            return plottedElements
        })

        const allNodeTypes = await Promise.all(promiseNodeType)

        plottedElements1.push(...allNodeTypes.reduce((accumulator, val) => {
            return accumulator.concat(val?.nodes as never[])
        }, []))

        // Plotting all "Group Nodes"
        const allTypeGroupNodes = fromNodeToGroupNode(allGroupNodes)
        const customLayoutOptions = {
            'elk.algorithm': 'org.eclipse.elk.box',
            'elk.layered.spacing.nodeNodeBetweenLayers': '100',
            'elk.spacing.nodeNode': '100',
            'elk.box.packingMode': 'GROUP_DEC',
            'elk.childAreaWidth': '100',
            'elk.childAreaHeight': '20',
            'elk.layered.unnecessaryBendpoints': 'false',
            'elk.aspectRatio': '4'
        }
        const plottedElements2 = await getLayedOutElements(allTypeGroupNodes, this.edges)

        function updateNodePositions(
            nodes: Node[],
            plottedElements: any
        ): Node[] {
            const retNode: Node[] = []
            for (let i = 0; i < nodes.length; i++) {
                const filteredNode = plottedElements?.nodes?.filter((n: Node) => n.id === nodes[i].id);
                if (filteredNode && filteredNode[0] && filteredNode[0].position) {
                    nodes[i].position = { 
                        x: filteredNode[0].position?.x ?? 0,
                        y: filteredNode[0].position?.y ?? 0
                    };

                    retNode.push(nodes[i])
                }
            }

            return retNode
        }
        
        // Combine all group nodes and type nodes to Node[]
        this.nodes.push(...updateNodePositions(allGroupNodes, plottedElements2))
        this.nodes.push(...updateNodePositions(allTypeNodes, { nodes: plottedElements1 }))
        
        const testNode = this.buildTypeNode('root', undefined, 'volumes', 100, 100, 'rgba(0, 255, 0, 0.2)');
        testNode.position = { x: 600, y: 600 }
        this.nodes.push(testNode)
    }

    public async buildMap2(yamlObject: YamlDockerCompose) {
        delete yamlObject['version']
        const jsonPathParser = new JsonPathParser(yamlObject);

        const groups = jsonPathParser.findKeys('$');

        const gNodes = groups.map((g: string) => {
            const childrenNodes: Node[] = []
            const nodes = jsonPathParser.findKeys(`$.${g}`)

            const networks = jsonPathParser.findKeys(`$.networks`)
            const volumes = jsonPathParser.findKeys(`$.volumes`)

            nodes.map((n: string) => {
                const nImage = jsonPathParser.findJson(`$.services.${n}.image`)
                const nPorts = jsonPathParser.findJson(`$.services.${n}.ports`)
                const nVolumes = jsonPathParser.findJson(`$.services.${n}.volumes`)
                const nNetworks = jsonPathParser.findJson(`$.services.${n}.networks`)

                nNetworks?.map((nn: string) => {
                    const foundNetwork = networks.find((ntwk: string) => ntwk === nn)
                    if (foundNetwork) {
                        this.edges.push(this.buildEdge(n, foundNetwork))
                    }
                })

                childrenNodes.push(this.buildTypeNode(n, 'redis', g, 100, 100, customUniqueColour(nImage + n)))
            })

            const gn = this.buildGroupNode(g, `${g}-group`, customUniqueColour(g), 1000, 1000, childrenNodes)
            return gn
        })

        const customOptions: LayoutOptions = {
            'elk.algorithm': 'org.eclipse.elk.box',
            'elk.layered.spacing.nodeNodeBetweenLayers': '200',
            'elk.spacing.nodeNode': '200',
            'elk.box.packingMode': 'GROUP_DEC',
            //'elk.childAreaWidth': '100',
            //'elk.childAreaHeight': '150',
            //'elk.layered.unnecessaryBendpoints': 'false',
            //'elk.aspectRatio': '100',
            //'org.eclipse.elk.expandNodes': 'true',
            //'org.eclipse.elk.interactive': 'true',
            'org.eclipse.elk.padding': '12',
            //'org.eclipse.elk.spacing.individual': 'spacing.portPort:45;,;spacing.nodeNode:50',
        }

        const plottedElements = await getLayedOutElements(gNodes, this.edges, customOptions)

        const mappedChildNodes = fromGroupNodeToNode(plottedElements?.nodes as GroupNode[])
        const childNodes = plottedElements?.nodes?.flatMap((n: any) => n?.children) || []
        this.nodes.push(...mappedChildNodes, ...childNodes)
    }
}