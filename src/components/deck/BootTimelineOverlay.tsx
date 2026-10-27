import type { Node } from '@xyflow/react';

// ── Shared layout constants ──────────────────────────────────────────────────
export const RANK_GAP    = 320;  // horizontal px between boot ranks
export const NODE_W      = 200;  // service node width (flow units)
export const NODE_H      = 80;   // service node height (flow units)
export const NODE_V_GAP  = 120;  // vertical gap between nodes in same rank

const LANE_PAD   = 32;   // extra vertical padding inside each lane band
const LABEL_H    = 28;   // space reserved at top of lane for the step label
const RAIL_MARGIN = 16;  // gap between rail bottom and lane-band top
const RAIL_H     = 22;   // height of the rail node (flow units)
const RAIL_X_PAD = 80;   // extra width on each side for START/READY badges

/**
 * Computes topological rank (0-based boot stage) for each service node
 * from depends_on edges. Roots (no dependencies) = rank 0.
 */
export function computeBootRanks(
    nodeIds: string[],
    depEdges: { source: string; target: string }[]
): Map<string, number> {
    const inDegree  = new Map<string, number>();
    const dependents = new Map<string, string[]>();

    for (const id of nodeIds) {
        inDegree.set(id, 0);
        dependents.set(id, []);
    }

    for (const e of depEdges) {
        if (inDegree.has(e.source) && inDegree.has(e.target)) {
            inDegree.set(e.source, (inDegree.get(e.source) ?? 0) + 1);
            dependents.get(e.target)!.push(e.source);
        }
    }

    const ranks = new Map<string, number>();
    const queue: string[] = [];

    for (const id of nodeIds) {
        if ((inDegree.get(id) ?? 0) === 0) queue.push(id);
    }

    while (queue.length > 0) {
        const id = queue.shift()!;
        const r  = ranks.get(id) ?? 0;
        for (const dep of dependents.get(id) ?? []) {
            const nr = r + 1;
            if (nr > (ranks.get(dep) ?? 0)) ranks.set(dep, nr);
            const rem = (inDegree.get(dep) ?? 1) - 1;
            inDegree.set(dep, rem);
            if (rem === 0) queue.push(dep);
        }
        if (!ranks.has(id)) ranks.set(id, 0);
    }

    for (const id of nodeIds) {
        if (!ranks.has(id)) ranks.set(id, 0);
    }

    return ranks;
}

/**
 * Positions service nodes in a left-to-right timeline layout.
 * Returns a map of nodeId → { x, y } in flow coordinates.
 */
export function computeTimelinePositions(
    serviceNodeIds: string[],
    depEdges: { source: string; target: string }[]
): Map<string, { x: number; y: number }> {
    const ranks  = computeBootRanks(serviceNodeIds, depEdges);
    const byRank = new Map<number, string[]>();

    for (const [id, rank] of ranks) {
        if (!byRank.has(rank)) byRank.set(rank, []);
        byRank.get(rank)!.push(id);
    }

    const maxRank   = Math.max(...ranks.values(), 0);
    const positions = new Map<string, { x: number; y: number }>();

    for (let r = 0; r <= maxRank; r++) {
        const group  = byRank.get(r) ?? [];
        const totalH = group.length * NODE_H + (group.length - 1) * (NODE_V_GAP - NODE_H);
        const startY = -totalH / 2;

        group.forEach((id, i) => {
            positions.set(id, {
                x: r * RANK_GAP,
                y: startY + i * NODE_V_GAP,
            });
        });
    }

    return positions;
}

/**
 * Builds ReactFlow annotation nodes for the boot-order timeline:
 *  - one `boot-lane-band` node per rank column
 *  - one `boot-timeline-rail` node spanning all columns
 *
 * All nodes are non-draggable, non-selectable, non-connectable.
 */
export function buildBootAnnotationNodes(
    serviceNodeIds: string[],
    depEdges: { source: string; target: string }[],
    servicePositions: Map<string, { x: number; y: number }>
): Node[] {
    if (serviceNodeIds.length === 0) return [];

    const ranks  = computeBootRanks(serviceNodeIds, depEdges);
    const maxRank = Math.max(...ranks.values(), 0);

    const byRank = new Map<number, string[]>();
    for (const [id, r] of ranks) {
        if (!byRank.has(r)) byRank.set(r, []);
        byRank.get(r)!.push(id);
    }

    interface RankGeo {
        r:        number;
        laneX:    number;
        laneY:    number;
        laneW:    number;
        laneH:    number;
        centerX:  number;
    }

    const rankGeos: RankGeo[] = [];
    let globalMinLaneY = Infinity;

    for (let r = 0; r <= maxRank; r++) {
        const group = byRank.get(r) ?? [];
        if (group.length === 0) continue;

        const ys   = group.map(id => servicePositions.get(id)?.y ?? 0);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        const laneX = r * RANK_GAP - 20;
        const laneY = minY - LANE_PAD - LABEL_H;
        const laneW = NODE_W + 40;
        const laneH = (maxY - minY) + NODE_H + LANE_PAD * 2 + LABEL_H;

        rankGeos.push({ r, laneX, laneY, laneW, laneH, centerX: r * RANK_GAP + NODE_W / 2 });
        if (laneY < globalMinLaneY) globalMinLaneY = laneY;
    }

    if (rankGeos.length === 0) return [];

    // Rail sits above all lane bands
    const railCenterY  = globalMinLaneY - RAIL_MARGIN - RAIL_H / 2;
    const railNodeY    = railCenterY - RAIL_H / 2;
    const firstCenterX = rankGeos[0].centerX;
    const lastCenterX  = rankGeos[rankGeos.length - 1].centerX;
    const railNodeX    = firstCenterX - RAIL_X_PAD;
    const railNodeW    = (lastCenterX - firstCenterX) + RAIL_X_PAD * 2;

    const tickPositions = rankGeos.map(g => g.centerX - railNodeX);

    const annotations: Node[] = [];

    // ── Lane bands ────────────────────────────────────────────────────────────
    for (const { r, laneX, laneY, laneW, laneH } of rankGeos) {
        const isFirst = r === 0;
        const label   = isFirst ? 'Step 1 · Boots first' : `Step ${r + 1}`;
        // connector runs from lane-band top up to the rail tick
        const connectorLen = laneY - (railCenterY);

        annotations.push({
            id:          `__boot-lane-${r}`,
            type:        'boot-lane-band',
            position:    { x: laneX, y: laneY },
            data:        { rank: r, stepLabel: label, width: laneW, height: laneH, isFirst, connectorLen: Math.max(connectorLen, 0) },
            draggable:   false,
            selectable:  false,
            focusable:   false,
            connectable: false,
            zIndex:      -1,   // below edges (z=0) and service nodes (z=1)
            width:       laneW,
            height:      laneH,
            style:       { width: laneW, height: laneH, pointerEvents: 'none' },
        } as Node);
    }

    // ── Timeline rail ─────────────────────────────────────────────────────────
    annotations.push({
        id:          '__boot-rail',
        type:        'boot-timeline-rail',
        position:    { x: railNodeX, y: railNodeY },
        data:        {
            totalWidth:    railNodeW,
            railHeight:    RAIL_H,
            tickPositions,
            firstTick:     tickPositions[0],
            lastTick:      tickPositions[tickPositions.length - 1],
        },
        draggable:   false,
        selectable:  false,
        focusable:   false,
        connectable: false,
        zIndex:      2,   // above service nodes (z=1) and edges (z=0)
        width:       railNodeW,
        height:      RAIL_H,
        style:       { width: railNodeW, height: RAIL_H, pointerEvents: 'none' },
    } as Node);

    return annotations;
}
