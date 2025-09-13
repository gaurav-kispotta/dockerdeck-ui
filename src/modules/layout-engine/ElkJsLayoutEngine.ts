import { ILayoutEngine } from "../../interface/layout-engine/ILayoutEngine";
import ELK, { ElkExtendedEdge, ElkNode, LayoutOptions } from 'elkjs/lib/elk.bundled.js';
import { DockerDeckNode } from "../../model/DockerDeckNode";
import { DockerDeckEdge } from "../../model/DockerDeckEdge";
import { ElkJsLayoutOptions } from "./ElkJsLayoutOption";

const customOptions: LayoutOptions = {
    'elk.algorithm': 'org.eclipse.elk.box',
    'elk.layered.spacing.nodeNodeBetweenLayers': '2',
    'elk.spacing.nodeNode': '20',
    'elk.box.packingMode': 'GROUP_DEC',
    'elk.childAreaWidth': '100',
    'elk.childAreaHeight': '100',
    //'elk.layered.unnecessaryBendpoints': 'false',
    'elk.aspectRatio': '1000',
    //'org.eclipse.elk.expandNodes': 'true',
    //'org.eclipse.elk.interactive': 'true',
    //'org.eclipse.elk.padding': '12',
    //'org.eclipse.elk.spacing.individual': 'spacing.portPort:45;,;spacing.nodeNode:50',
}

export class ElkJsLayoutEngine implements ILayoutEngine {
    elk = new ELK();
    layoutOptions = new ElkJsLayoutOptions().setCustomOption(customOptions);

    async layout(nodes: DockerDeckNode[], edges: DockerDeckEdge[]): Promise<{ nodes: DockerDeckNode[], edges: DockerDeckEdge[] }> {
        // Implement layout logic using ELK.js or any other layout library
        const graph: ElkNode = {
            id: "root",
            layoutOptions: this.layoutOptions.build() as LayoutOptions,
            children: nodes.map(node => ({
                ...node,
                width: node.width,
                height: node.height,

                // Add any other properties needed for layout
            })),
            edges: edges.map(edge => ({
                id: edge.id,
                sources: [edge.source],
                targets: [edge.target],
            } as ElkExtendedEdge))
        };

        const laidOutNodes = await this.elk.layout(graph);

        console.log('Laid out nodes:', laidOutNodes);

        function updateNodePosition(layoutNodes: ElkNode[], dockerDeckNodes: DockerDeckNode[]) {
            for (const child of layoutNodes) {
                for (const dockerDeckChild of dockerDeckNodes) {
                    if (child.id === dockerDeckChild.id) {
                        if (!dockerDeckChild.position) {
                            dockerDeckChild.position = { x: 0, y: 0 };
                        }
                        dockerDeckChild.position.x = child.x || 0;
                        dockerDeckChild.position.y = child.y || 0;
                        dockerDeckChild.width = child.width || 200;
                        dockerDeckChild.height = child.height || 200;
                    }

                    updateNodePosition(child.children || [], dockerDeckChild.children || []);
                }
            }
        }
        updateNodePosition(laidOutNodes?.children || [], nodes);

        return { nodes, edges };
    }
}