/**
 * Module-level registry that each BridgeEdge writes its endpoints into.
 * All edges read from here to find pairwise intersections.
 *
 * Why module-level (not React state)?
 * - Edge components render in the same synchronous React batch.
 * - Using module state lets every edge see every other edge's latest endpoints
 *   without prop-drilling or context indirection.
 * - A debounced broadcast triggers one extra render pass after all edges
 *   have settled, ensuring bridges appear correctly.
 */

import { segmentIntersect, BridgePoint } from './edgeBridge';

interface Seg {
  sx: number; sy: number;
  tx: number; ty: number;
}

const registry = new Map<string, Seg>();
const listeners = new Set<() => void>();
let broadcastTimer: ReturnType<typeof setTimeout> | null = null;

function broadcast() {
  if (broadcastTimer !== null) return;
  broadcastTimer = setTimeout(() => {
    broadcastTimer = null;
    listeners.forEach(fn => fn());
  }, 0); // next microtask — after all edges in this batch have registered
}

export function registerEdge(id: string, sx: number, sy: number, tx: number, ty: number) {
  const existing = registry.get(id);
  if (
    existing &&
    existing.sx === sx && existing.sy === sy &&
    existing.tx === tx && existing.ty === ty
  ) return; // unchanged — skip
  registry.set(id, { sx, sy, tx, ty });
  broadcast();
}

export function unregisterEdge(id: string) {
  if (registry.has(id)) {
    registry.delete(id);
    broadcast();
  }
}

export function subscribeToRegistry(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * Compute all intersection points between edge `id` (with the given endpoints)
 * and every other registered edge.
 *
 * "Over/under" is determined deterministically by lexicographic edge ID order:
 *   higher string → drawn on top (over).
 */
export function getEdgeCrossings(
  id: string,
  sx: number, sy: number,
  tx: number, ty: number
): BridgePoint[] {
  const results: BridgePoint[] = [];

  for (const [otherId, other] of registry) {
    if (otherId === id) continue;

    const pt = segmentIntersect(sx, sy, tx, ty, other.sx, other.sy, other.tx, other.ty);
    if (!pt) continue;

    // Direction of the crossing edge (for mask rendering)
    const cdx = other.tx - other.sx;
    const cdy = other.ty - other.sy;
    const clen = Math.sqrt(cdx * cdx + cdy * cdy) || 1;

    results.push({
      point: pt,
      isOver: id > otherId, // lexicographic: higher ID = over
      crossUx: cdx / clen,
      crossUy: cdy / clen,
    });
  }

  return results;
}
