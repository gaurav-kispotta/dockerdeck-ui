import { ILayoutEngine } from "../../interface/layout-engine/ILayoutEngine";
import ELK, { ElkExtendedEdge, ElkNode, LayoutOptions } from 'elkjs/lib/elk.bundled.js';
import { DockerDeckNode } from "../../model/DockerDeckNode";
import { DockerDeckEdge } from "../../model/DockerDeckEdge";
import { ElkJsLayoutOptions } from "./ElkJsLayoutOption";

// Base (root-level) layout options. Container/group nodes can supply their own via node.layoutOptions.
const rootOptions: LayoutOptions = {
    'elk.algorithm': 'org.eclipse.elk.box',
    'elk.box.packingMode': 'GROUP_DEC',
    'elk.spacing.nodeNode': '40',
    // Let ELK auto expand group nodes based on children.
    'org.eclipse.elk.expandNodes': 'true'
};

export class ElkJsLayoutEngine implements ILayoutEngine {
    elk = new ELK();
    layoutOptions = new ElkJsLayoutOptions().setCustomOption(rootOptions);

    async layout(nodes: DockerDeckNode[], edges: DockerDeckEdge[]): Promise<{ nodes: DockerDeckNode[], edges: DockerDeckEdge[] }> {
        // Create a quick lookup for all nodes (including nested) by id.
        const idMap = new Map<string, DockerDeckNode>();
        const collect = (list: DockerDeckNode[]) => {
            for (const n of list) {
                idMap.set(n.id, n);
                if (n.children && n.children.length) collect(n.children as DockerDeckNode[]);
            }
        };
        collect(nodes);

        // Only include true top-level nodes (no parentId) directly under root to prevent duplication.
        const topLevel = nodes.filter(n => !n.parentId);

        const buildElkNode = (n: DockerDeckNode): ElkNode => {
            const elkNode: ElkNode = {
                id: n.id,
                width: n.width,
                height: n.height,
                layoutOptions: n.layoutOptions as LayoutOptions | undefined
            };
            if (n.children && n.children.length) {
                elkNode.children = (n.children as DockerDeckNode[]).map(c => buildElkNode(c));
            }
            return elkNode;
        };

        const graph: ElkNode = {
            id: 'root',
            layoutOptions: this.layoutOptions.build() as LayoutOptions,
            children: topLevel.map(n => buildElkNode(n)),
            edges: edges.map(e => ({
                id: e.id,
                sources: [e.source],
                targets: [e.target]
            } as ElkExtendedEdge))
        };

        const laidOut = await this.elk.layout(graph);

        // Recursively apply positions (relative to parent for React Flow group support).
        const applyPositions = (elkNode: ElkNode) => {
            for (const child of elkNode.children || []) {
                const ddNode = idMap.get(child.id);
                if (ddNode) {
                    if (!ddNode.position) ddNode.position = { x: 0, y: 0 };
                    ddNode.position.x = child.x || 0;
                    ddNode.position.y = child.y || 0;
                    if (child.width) ddNode.width = child.width;
                    if (child.height) ddNode.height = child.height;
                }
                applyPositions(child);
            }
        };
        applyPositions(laidOut);

        return { nodes, edges };
    }
}