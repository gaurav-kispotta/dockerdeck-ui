/** Pure geometry utilities for edge bridge rendering */

export type Point = { x: number; y: number };

/** Standard line-segment intersection. Returns the intersection point or null. */
export function segmentIntersect(
  ax: number, ay: number, bx: number, by: number,  // segment 1: A→B
  cx: number, cy: number, dx: number, dy: number   // segment 2: C→D
): Point | null {
  const denom = (bx - ax) * (dy - cy) - (by - ay) * (dx - cx);
  if (Math.abs(denom) < 1e-8) return null; // parallel or collinear

  const t = ((cx - ax) * (dy - cy) - (cy - ay) * (dx - cx)) / denom;
  const u = ((cx - ax) * (by - ay) - (cy - ay) * (bx - ax)) / denom;

  // Exclude endpoints (tolerance 0.05) so bridges don't appear at shared nodes
  if (t > 0.05 && t < 0.95 && u > 0.05 && u < 0.95) {
    return { x: ax + t * (bx - ax), y: ay + t * (by - ay) };
  }
  return null;
}

export interface BridgePoint {
  point: Point;
  /** true = this edge passes OVER the other → render arc */
  isOver: boolean;
  /** direction of the crossing edge, for mask rendering */
  crossUx: number;
  crossUy: number;
}

const BRIDGE_R = 7; // px — bridge arc radius
const GAP_EXTRA = 2; // extra gap beyond the bridge radius

/**
 * Build a single SVG path `d` attribute for a straight edge from (x1,y1)→(x2,y2)
 * with bridge arcs ("over") or gaps ("under") at crossing points.
 */
export function buildBridgePath(
  x1: number, y1: number,
  x2: number, y2: number,
  crossings: BridgePoint[],
  r = BRIDGE_R
): string {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1 || crossings.length === 0) return `M ${x1} ${y1} L ${x2} ${y2}`;

  const ux = dx / len, uy = dy / len; // unit along our edge

  // Project each crossing point onto our edge and sort by distance from (x1,y1)
  const sorted = crossings
    .map(({ point, isOver, crossUx, crossUy }) => {
      const t = (point.x - x1) * ux + (point.y - y1) * uy;
      return { t, px: point.x, py: point.y, isOver, crossUx, crossUy };
    })
    .filter(({ t }) => t > r + GAP_EXTRA && t < len - r - GAP_EXTRA) // skip if too close to endpoints
    .sort((a, b) => a.t - b.t);

  if (sorted.length === 0) return `M ${x1} ${y1} L ${x2} ${y2}`;

  let d = `M ${f(x1)} ${f(y1)}`;

  for (const { px, py, isOver } of sorted) {
    const entryX = px - r * ux, entryY = py - r * uy;
    const exitX  = px + r * ux, exitY  = py + r * uy;

    d += ` L ${f(entryX)} ${f(entryY)}`;

    if (isOver) {
      // Clockwise arc (sweep=1) — arcs "above" in SVG space for left→right edges
      d += ` A ${r} ${r} 0 0 1 ${f(exitX)} ${f(exitY)}`;
    } else {
      // Gap: lift pen (M), creating a visual break
      d += ` M ${f(exitX + ux * GAP_EXTRA)} ${f(exitY + uy * GAP_EXTRA)}`;
    }
  }

  d += ` L ${f(x2)} ${f(y2)}`;
  return d;
}

/** For "over" crossings, generate a background-color mask segment
 *  that hides the "under" edge at the crossing, creating the bridge illusion. */
export function buildMaskSegments(
  crossings: BridgePoint[],
  r = BRIDGE_R
): Array<{ x1: number; y1: number; x2: number; y2: number }> {
  return crossings
    .filter(c => c.isOver)
    .map(({ point, crossUx, crossUy }) => {
      const half = r + 2;
      return {
        x1: point.x - half * crossUx,
        y1: point.y - half * crossUy,
        x2: point.x + half * crossUx,
        y2: point.y + half * crossUy,
      };
    });
}

const f = (n: number) => Math.round(n * 10) / 10; // 1-decimal rounding for SVG
