/**
 * Orthogonal (step) edge router — circuit-diagram style.
 *
 * Each edge component calls computeEdgeRoute() with the EXACT handle positions
 * provided by ReactFlow's EdgeProps (sourceX/Y, targetX/Y).  Those coordinates
 * are guaranteed to sit on the node boundary, so routes always connect perfectly.
 *
 * Lane assignment prevents parallel edges from the same source from stacking:
 *  • Same-source, same-direction edges are sorted by target cross-axis position
 *  • Each gets a unique exit-Y (or exit-X) offset → they fan out cleanly
 *  • The vertical mid-segment X is also spread so no two share the same lane
 */

import { Position } from '@xyflow/react';

export type Pt = { x: number; y: number };
export type Route = [Pt, Pt, Pt, Pt]; // exactly 4 waypoints

const LANE = 20;  // px between parallel lanes

// ─── Per-edge registration ────────────────────────────────────────────────────

export interface EdgeEntry {
  id: string;
  sx: number; sy: number;
  tx: number; ty: number;
  srcPos: Position; // 'right' | 'left' | 'top' | 'bottom'
}

// Module-level flat registry — all OrthogonalEdge instances write here
export const edgeReg = new Map<string, EdgeEntry>();
const listeners = new Set<() => void>();
let broadcastTimer: ReturnType<typeof setTimeout> | null = null;

function broadcast() {
  if (broadcastTimer !== null) return;
  broadcastTimer = setTimeout(() => {
    broadcastTimer = null;
    listeners.forEach(fn => fn());
  }, 0);
}

export function regEdge(entry: EdgeEntry) {
  const prev = edgeReg.get(entry.id);
  if (prev && prev.sx === entry.sx && prev.sy === entry.sy &&
      prev.tx === entry.tx && prev.ty === entry.ty) return;
  edgeReg.set(entry.id, entry);
  broadcast();
}

export function unregEdge(id: string) {
  if (edgeReg.has(id)) { edgeReg.delete(id); broadcast(); }
}

export function subscribeReg(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// ─── Lane assignment ──────────────────────────────────────────────────────────

/**
 * For a given edge, find all registered edges that share the same source node
 * boundary (same sourceX for H-exits, same sourceY for V-exits) and direction.
 * Sort them, return this edge's index and group size for lane offset computation.
 */
function laneIndex(entry: EdgeEntry): { idx: number; count: number } {
  const isH = entry.srcPos === Position.Right || entry.srcPos === Position.Left;

  const group = Array.from(edgeReg.values()).filter(e => {
    if (e.srcPos !== entry.srcPos) return false;
    // Same source boundary point ±1px tolerance
    return isH
      ? Math.abs(e.sx - entry.sx) < 2
      : Math.abs(e.sy - entry.sy) < 2;
  });

  // Sort by target cross-axis so lanes are ordered visually
  group.sort((a, b) => isH ? a.ty - b.ty : a.tx - b.tx);
  const idx = group.findIndex(e => e.id === entry.id);
  return { idx: Math.max(idx, 0), count: group.length };
}

// ─── Route computation ────────────────────────────────────────────────────────

/**
 * Compute the 4 waypoints for one orthogonal edge.
 * Call this from each OrthogonalEdge component using its own EdgeProps values.
 */
export function computeEdgeRoute(entry: EdgeEntry): Route {
  const { sx, sy, tx, ty, srcPos } = entry;
  const { idx, count } = laneIndex(entry);
  // Lane offset — stagger mid-segment only; start/end are always the exact handles
  const offset = count > 1 ? (idx - (count - 1) / 2) * LANE : 0;

  const isH = srcPos === Position.Right || srcPos === Position.Left;

  if (isH) {
    // H → V → H
    // Always start at exact handle (sx, sy); only the mid-column X is staggered
    const midX = (sx + tx) / 2 + offset;
    return [
      { x: sx,   y: sy },   // exact source handle
      { x: midX, y: sy },   // first bend
      { x: midX, y: ty },   // second bend
      { x: tx,   y: ty },   // exact target handle
    ];
  } else {
    // V → H → V
    // Always start at exact handle (sx, sy); only the mid-row Y is staggered
    const midY = (sy + ty) / 2 + offset;
    return [
      { x: sx, y: sy   },   // exact source handle
      { x: sx, y: midY },   // first bend
      { x: tx, y: midY },   // second bend
      { x: tx, y: ty   },   // exact target handle
    ];
  }
}

// ─── Path building ────────────────────────────────────────────────────────────

export type BridgePt = {
  px: number; py: number;
  isOver: boolean;
  crossHoriz: boolean;
};

/** Return the 3 axis-aligned segments of a 4-waypoint route */
export function routeSegments(route: Route) {
  return [
    { x1: route[0].x, y1: route[0].y, x2: route[1].x, y2: route[1].y },
    { x1: route[1].x, y1: route[1].y, x2: route[2].x, y2: route[2].y },
    { x1: route[2].x, y1: route[2].y, x2: route[3].x, y2: route[3].y },
  ];
}

const R = (n: number) => Math.round(n * 10) / 10;

/**
 * Build the SVG `d` string for an orthogonal route with rounded corners
 * and bridge arcs / gaps at crossing points.
 */
export function buildOrthogonalPath(
  route: Route,
  bridges: BridgePt[],
  cornerR = 8,
  bridgeR = 9
): string {
  const [p0, p1, p2, p3] = route;

  if (Math.abs(p0.x - p3.x) + Math.abs(p0.y - p3.y) < 2) {
    return `M ${R(p0.x)} ${R(p0.y)} L ${R(p3.x)} ${R(p3.y)}`;
  }

  // Effective corner radius — never exceed half of any segment length
  const cr = Math.min(
    cornerR,
    Math.abs(p1.x - p0.x) / 2, Math.abs(p1.y - p0.y) / 2,
    Math.abs(p2.x - p1.x) / 2, Math.abs(p2.y - p1.y) / 2,
    Math.abs(p3.x - p2.x) / 2, Math.abs(p3.y - p2.y) / 2
  );

  // Bridge points per segment
  const brsOnSeg = (ax: number, ay: number, bx: number, by: number) =>
    bridges.filter(b => {
      if (Math.abs(ay - by) < 0.5) // horizontal segment
        return Math.abs(b.py - ay) < 2 && inRange(b.px, ax, bx, bridgeR);
      else                          // vertical segment
        return Math.abs(b.px - ax) < 2 && inRange(b.py, ay, by, bridgeR);
    }).sort((a, b) => {
      const axis = Math.abs(ay - by) < 0.5;
      return axis ? (a.px - ax) * Math.sign(bx - ax) - (b.px - ax) * Math.sign(bx - ax)
                  : (a.py - ay) * Math.sign(by - ay) - (b.py - ay) * Math.sign(by - ay);
    });

  const drawSeg = (ax: number, ay: number, bx: number, by: number,
                   endGap: number, brs: BridgePt[]): string => {
    const dx = bx - ax, dy = by - ay;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 0.5) return '';
    const ux = dx / len, uy = dy / len;
    let out = '';
    for (const br of brs) {
      const t = (br.px - ax) * ux + (br.py - ay) * uy;
      if (t < bridgeR || t > len - endGap - bridgeR) continue;
      const ex = ax + ux * (t - bridgeR), ey = ay + uy * (t - bridgeR);
      const fx = ax + ux * (t + bridgeR), fy = ay + uy * (t + bridgeR);
      out += ` L ${R(ex)} ${R(ey)}`;
      if (br.isOver) out += ` A ${bridgeR} ${bridgeR} 0 0 1 ${R(fx)} ${R(fy)}`;
      else           out += ` M ${R(fx)} ${R(fy)}`;
    }
    out += ` L ${R(bx - ux * endGap)} ${R(by - uy * endGap)}`;
    return out;
  };

  // Signs for corner direction
  const sy1 = Math.sign(p2.y - p1.y) || 1;
  const sx2 = Math.sign(p3.x - p2.x) || 1;

  let d = `M ${R(p0.x)} ${R(p0.y)}`;
  d += drawSeg(p0.x, p0.y, p1.x, p1.y, cr, brsOnSeg(p0.x, p0.y, p1.x, p1.y));
  d += ` Q ${R(p1.x)} ${R(p1.y)} ${R(p1.x)} ${R(p1.y + sy1 * cr)}`;
  d += drawSeg(p1.x, p1.y + sy1 * cr, p2.x, p2.y, cr, brsOnSeg(p1.x, p1.y, p2.x, p2.y));
  d += ` Q ${R(p2.x)} ${R(p2.y)} ${R(p2.x + sx2 * cr)} ${R(p2.y)}`;
  d += drawSeg(p2.x + sx2 * cr, p2.y, p3.x, p3.y, 0, brsOnSeg(p2.x, p2.y, p3.x, p3.y));

  return d;
}

function inRange(v: number, a: number, b: number, margin: number): boolean {
  return v > Math.min(a, b) + margin && v < Math.max(a, b) - margin;
}
