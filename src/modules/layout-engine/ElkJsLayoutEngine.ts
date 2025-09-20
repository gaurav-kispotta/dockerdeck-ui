import { ILayoutEngine } from "../../interface/layout-engine/ILayoutEngine";
import ELK, { ElkExtendedEdge, ElkNode, LayoutOptions } from 'elkjs/lib/elk.bundled.js';
import { DockerDeckNode } from "../../model/DockerDeckNode";
import { DockerDeckEdge } from "../../model/DockerDeckEdge";
import { ElkJsLayoutOptions } from "./ElkJsLayoutOption";
import { SettingsState } from "../../store/settingsSlice";

export class ElkJsLayoutEngine implements ILayoutEngine {
    elk = new ELK();
    private settings?: SettingsState;

    constructor(settings?: SettingsState) {
        this.settings = settings;
    }

    private getBaseLayoutOptions(): LayoutOptions {
        const spacing = this.settings ? this.settings.nodeLevelPadding * 2 : 200; // Direct scaling
        const padding = this.settings ? this.settings.platformPadding : 100; // Direct use
        
        return {
            'elk.algorithm': 'org.eclipse.elk.mrtree',
            //'elk.box.packingMode': 'GROUP_DEC',
            'elk.direction': 'DOWN', // Ensure horizontal arrangement from left to right
            'elk.spacing.nodeNode': spacing.toString(),
            'elk.padding': `[top=${padding},left=${padding},bottom=${padding},right=${padding}]`,
            'org.eclipse.elk.expandNodes': 'true',
            'elk.aspectRatio': '1000' // Prefer more vertical arrangement
        };
    }

    private getNodeDimensions(): { width: number; height: number } {
        const size = this.settings ? this.settings.nodeSize : 100; // Direct use of setting value
        
        return {
            width: size,
            height: size
        };
    }

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

        // Get dynamic dimensions based on settings
        const dimensions = this.getNodeDimensions();

        const buildElkNode = (n: DockerDeckNode): ElkNode => {
            const elkNode: ElkNode = {
                id: n.id,
                width: n.width || dimensions.width,
                height: n.height || dimensions.height,
                layoutOptions: n.layoutOptions as LayoutOptions | undefined
            };
            if (n.children && n.children.length) {
                elkNode.children = (n.children as DockerDeckNode[]).map(c => buildElkNode(c));
            }
            return elkNode;
        };

        // Use dynamic layout options based on settings
        const rootOptions = this.getBaseLayoutOptions();
        const layoutOptions = new ElkJsLayoutOptions().setCustomOption(rootOptions);

        const graph: ElkNode = {
            id: 'root',
            layoutOptions: layoutOptions.build() as LayoutOptions,
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