import { ILayoutEngine } from "../../interface/layout-engine/ILayoutEngine";
import { DockerDeckNode } from "../../model/DockerDeckNode";
import { DockerDeckEdge } from "../../model/DockerDeckEdge";
import { SettingsState } from "../../store/settingsSlice";
import { graphlib, layout as dagreLayout } from "@dagrejs/dagre";

/**
 * Dagre-based layout engine.
 * - Honors SettingsState for spacing and node sizing
 * - Supports compound (group) nodes via dagre compound graphs
 * - Produces positions relative to parent for React Flow grouping
 */
export class DagreLayoutEngine implements ILayoutEngine {
  private settings?: SettingsState;

  constructor(settings?: SettingsState) {
    this.settings = settings;
  }

  private getGraphOptions() {
    const spacing = this.settings ? this.settings.nodeLevelPadding * 2 : 200; // vertical/horizontal separation
    const padding = this.settings ? this.settings.platformPadding : 100; // graph margins
    return {
      // Top-to-bottom layout to mirror ELK 'DOWN'
      rankdir: "TB" as const,
      // separation between ranks (rows) and between nodes in same rank
      ranksep: spacing,
      nodesep: spacing,
      // outer margins
      marginx: padding,
      marginy: padding,
      // use tight tree ranker for compactness
      ranker: "tight-tree" as const,
    };
  }

  private getNodeDimensions(): { width: number; height: number } {
    const size = this.settings ? this.settings.nodeSize : 100;
    return { width: size, height: size };
  }

  async layout(
    nodes: DockerDeckNode[],
    edges: DockerDeckEdge[]
  ): Promise<{ nodes: DockerDeckNode[]; edges: DockerDeckEdge[] }> {
    // Prepare lookup maps and flatten all nodes (including nested)
    const idMap = new Map<string, DockerDeckNode>();
    const parentMap = new Map<string, string | undefined>();
    const allNodes: DockerDeckNode[] = [];

    const collect = (list: DockerDeckNode[], parentId?: string) => {
      for (const n of list) {
        idMap.set(n.id, n);
        parentMap.set(n.id, parentId);
        allNodes.push(n);
        if (n.children && n.children.length) collect(n.children as DockerDeckNode[], n.id);
      }
    };
    collect(nodes);

    // Create dagre graph with compound support
    const g = new graphlib.Graph({ compound: true });
    g.setGraph(this.getGraphOptions());
    g.setDefaultEdgeLabel(() => ({}));

    // Default node dimensions
    const defaultDims = this.getNodeDimensions();

    // Define all nodes and parent relationships
    for (const n of allNodes) {
      const width = n.width ?? defaultDims.width;
      const height = n.height ?? defaultDims.height;
      g.setNode(n.id, { width, height });
    }
    for (const n of allNodes) {
      const p = parentMap.get(n.id);
      if (p) g.setParent(n.id, p);
    }

    // Add edges
    for (const e of edges) {
      if (e.source && e.target) {
        g.setEdge(e.source, e.target);
      }
    }

    // Run layout
    dagreLayout(g);

  // Build absolute top-left positions from dagre (which uses center coords)
    const absTopLeft = new Map<string, { x: number; y: number; width: number; height: number }>();
    g.nodes().forEach((id) => {
      const n: any = g.node(id);
      if (!n) return;
      const width = n.width ?? defaultDims.width;
      const height = n.height ?? defaultDims.height;
      // dagre gives center-based positions
      const x = (n.x ?? 0) - width / 2;
      const y = (n.y ?? 0) - height / 2;
      absTopLeft.set(id, { x, y, width, height });
    });

    // Helper to get parent's absolute top-left
    const getParentAbsTopLeft = (id: string): { x: number; y: number } | null => {
      const pid = parentMap.get(id);
      if (!pid) return null;
      const p = absTopLeft.get(pid);
      return p ? { x: p.x, y: p.y } : null;
    };

    // Apply relative positions and dimensions back to DockerDeckNodes
    for (const id of g.nodes()) {
      const ddNode = idMap.get(id);
      const abs = absTopLeft.get(id);
      if (!ddNode || !abs) continue;

      const parentAbs = getParentAbsTopLeft(id);
      const relX = parentAbs ? abs.x - parentAbs.x : abs.x;
      const relY = parentAbs ? abs.y - parentAbs.y : abs.y;

      if (!ddNode.position) ddNode.position = { x: 0, y: 0 } as any;
      ddNode.position.x = relX;
      ddNode.position.y = relY;
      ddNode.width = abs.width;
      ddNode.height = abs.height;
    }

    return { nodes, edges };
  }
}
