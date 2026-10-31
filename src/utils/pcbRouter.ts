/** Pure, deterministic routing. Each canvas owns the returned frame; no global registry. */
import { buildBridgePath, segmentIntersect, type BridgePoint } from './edgeBridge';
export interface Point { x: number; y: number }
export interface NodeBounds extends Point { id: string; width: number; height: number }
export interface RoutingEdge { id: string; source: string; target: string }
export type Side = 'top' | 'right' | 'bottom' | 'left';
export interface Pin extends Point { nodeId: string; side: Side }
export interface Crossing extends Point { over: boolean; radius: number }
export interface PcbRoute {
  id: string; source: Pin; target: Pin; points: Point[]; crossings: Crossing[];
  path: string; hitPath: string; label: Point; blocked: boolean;
}
export interface LegacyBridge { path: string; hitPath: string; label: Point }
export interface RoutingFrame { routes: Map<string, PcbRoute>; bounds: NodeBounds[]; legacyBridges: Map<string, LegacyBridge> }
export const emptyRoutingFrame = (): RoutingFrame => ({ routes: new Map(), bounds: [], legacyBridges: new Map() });
const CLEARANCE = 16;
const STUB = 24;
const EPS = 0.01;
const compareId = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;
const same = (a: Point, b: Point) => Math.abs(a.x - b.x) < EPS && Math.abs(a.y - b.y) < EPS;
const distance = (a: Point, b: Point) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
export const routeSegments = (points: Point[]) => points.slice(1).map((end, i) => ({ start: points[i], end }));

function sideToward(a: NodeBounds, b: NodeBounds): Side {
  const dx = b.x + b.width / 2 - a.x - a.width / 2;
  const dy = b.y + b.height / 2 - a.y - a.height / 2;
  return Math.abs(dx) > Math.abs(dy) ? (dx >= 0 ? 'right' : 'left') : (dy >= 0 ? 'bottom' : 'top');
}
function exit(pin: Pin, bounds: NodeBounds[] = []): Point {
  let minDist = Infinity;
  for (const r of bounds) {
    if (r.id === pin.nodeId) continue;
    if (pin.side === 'right' && pin.y >= r.y - 4 && pin.y <= r.y + r.height + 4 && r.x >= pin.x) minDist = Math.min(minDist, r.x - pin.x);
    if (pin.side === 'left' && pin.y >= r.y - 4 && pin.y <= r.y + r.height + 4 && r.x + r.width <= pin.x) minDist = Math.min(minDist, pin.x - (r.x + r.width));
    if (pin.side === 'bottom' && pin.x >= r.x - 4 && pin.x <= r.x + r.width + 4 && r.y >= pin.y) minDist = Math.min(minDist, r.y - pin.y);
    if (pin.side === 'top' && pin.x >= r.x - 4 && pin.x <= r.x + r.width + 4 && r.y + r.height <= pin.y) minDist = Math.min(minDist, pin.y - (r.y + r.height));
  }
  const stub = minDist < STUB + CLEARANCE && minDist > 0 ? Math.max(2, Math.min(STUB, Math.floor((minDist - 1) / 2))) : STUB;
  return { x: pin.x + (pin.side === 'right' ? stub : pin.side === 'left' ? -stub : 0),
    y: pin.y + (pin.side === 'bottom' ? stub : pin.side === 'top' ? -stub : 0) };
}
export function segmentHitsInterior(a: Point, b: Point, r: NodeBounds, padding = 0): boolean {
  const left = r.x - padding, right = r.x + r.width + padding, top = r.y - padding, bottom = r.y + r.height + padding;
  if (Math.abs(a.x - b.x) < EPS) return a.x > left + EPS && a.x < right - EPS && Math.max(a.y, b.y) > top + EPS && Math.min(a.y, b.y) < bottom - EPS;
  if (Math.abs(a.y - b.y) < EPS) return a.y > top + EPS && a.y < bottom - EPS && Math.max(a.x, b.x) > left + EPS && Math.min(a.x, b.x) < right - EPS;
  return true;
}
function intersection(a: Point, b: Point, c: Point, d: Point): Point | null {
  if (Math.abs(a.y - b.y) < EPS && Math.abs(c.x - d.x) < EPS) {
    const p = { x: c.x, y: a.y };
    return p.x > Math.min(a.x, b.x) + EPS && p.x < Math.max(a.x, b.x) - EPS && p.y > Math.min(c.y, d.y) + EPS && p.y < Math.max(c.y, d.y) - EPS ? p : null;
  }
  if (Math.abs(a.x - b.x) < EPS && Math.abs(c.y - d.y) < EPS) return intersection(c, d, a, b);
  return null;
}
function overlap(a: Point, b: Point, c: Point, d: Point): number {
  if (Math.abs(a.x - b.x) < EPS && Math.abs(c.x - d.x) < EPS && Math.abs(a.x - c.x) < EPS)
    return Math.max(0, Math.min(Math.max(a.y, b.y), Math.max(c.y, d.y)) - Math.max(Math.min(a.y, b.y), Math.min(c.y, d.y)));
  if (Math.abs(a.y - b.y) < EPS && Math.abs(c.y - d.y) < EPS && Math.abs(a.y - c.y) < EPS)
    return Math.max(0, Math.min(Math.max(a.x, b.x), Math.max(c.x, d.x)) - Math.max(Math.min(a.x, b.x), Math.min(c.x, d.x)));
  return 0;
}
function simplify(points: Point[]): Point[] {
  const result: Point[] = [];
  for (const point of points) {
    if (result.length && same(result[result.length - 1], point)) continue;
    const a = result[result.length - 2], b = result[result.length - 1];
    if (a && ((a.x === b.x && b.x === point.x) || (a.y === b.y && b.y === point.y))) result.pop();
    result.push(point);
  }
  return result;
}
interface SearchEntry { key: number; x: number; y: number; dir: number; cost: number; score: number }
class MinHeap {
  entries: SearchEntry[] = [];
  push(entry: SearchEntry) {
    let index = this.entries.push(entry) - 1;
    while (index > 0) {
      const parent = (index - 1) >> 1;
      if (this.entries[parent].score <= entry.score) break;
      this.entries[index] = this.entries[parent]; index = parent;
    }
    this.entries[index] = entry;
  }
  pop(): SearchEntry | undefined {
    const first = this.entries[0], last = this.entries.pop();
    if (!last || !this.entries.length) return first;
    let index = 0;
    while (index * 2 + 1 < this.entries.length) {
      let child = index * 2 + 1;
      if (child + 1 < this.entries.length && this.entries[child + 1].score < this.entries[child].score) child++;
      if (this.entries[child].score >= last.score) break;
      this.entries[index] = this.entries[child]; index = child;
    }
    this.entries[index] = last; return first;
  }
}

function findCorridor(start: Point, end: Point, bounds: NodeBounds[], used: Point[][], lane: number): Point[] | null {
  const usedSegments = used.flatMap(routeSegments);
  for (const clearance of [CLEARANCE, 8, 4, 2]) {
    const xs = new Set([start.x, end.x]), ys = new Set([start.y, end.y]);
    const gutters = clearance === CLEARANCE ? [CLEARANCE, CLEARANCE + 12, CLEARANCE + 24] : [clearance, clearance + 8, CLEARANCE, CLEARANCE + 12, CLEARANCE + 24];
    for (const r of bounds) {
      for (const gutter of gutters) {
        xs.add(r.x - gutter); xs.add(r.x + r.width + gutter);
        ys.add(r.y - gutter); ys.add(r.y + r.height + gutter);
      }
    }
    // Independent lanes inside long open corridors; stable edge order chooses which is preferred.
    xs.add((start.x + end.x) / 2 + ((lane % 7) - 3) * 10);
    ys.add((start.y + end.y) / 2 + ((lane % 7) - 3) * 10);
    const xx = [...xs].sort((a, b) => a - b), yy = [...ys].sort((a, b) => a - b);
    const sx = xx.indexOf(start.x), sy = yy.indexOf(start.y), tx = xx.indexOf(end.x), ty = yy.indexOf(end.y);
    const key = (x: number, y: number, dir: number) => (y * xx.length + x) * 3 + dir;
    const heap = new MinHeap(), costs = new Map<number, number>(), previous = new Map<number, number>();
    const first = key(sx, sy, 0);
    heap.push({ key: first, x: sx, y: sy, dir: 0, cost: 0, score: distance(start, end) }); costs.set(first, 0);
    while (heap.entries.length) {
      const current = heap.pop()!;
      if (current.cost !== costs.get(current.key)) continue;
      if (current.x === tx && current.y === ty) {
        const path: Point[] = [];
        let at: number | undefined = current.key;
        while (at !== undefined) {
          const cell = Math.floor(at / 3); path.push({ x: xx[cell % xx.length], y: yy[Math.floor(cell / xx.length)] }); at = previous.get(at);
        }
        return path.reverse();
      }
      const a = { x: xx[current.x], y: yy[current.y] };
      for (const [dx, dy, dir] of [[-1, 0, 1], [1, 0, 1], [0, -1, 2], [0, 1, 2]]) {
        const x = current.x + dx, y = current.y + dy;
        if (x < 0 || y < 0 || x >= xx.length || y >= yy.length) continue;
        const b = { x: xx[x], y: yy[y] };
        if (bounds.some(r => segmentHitsInterior(a, b, r, clearance))) continue;
        let penalty = 0;
        for (const segment of usedSegments) {
          penalty += overlap(a, b, segment.start, segment.end) * 30;
          const crossing = intersection(a, b, segment.start, segment.end);
          if (crossing) penalty += Math.min(distance(crossing, a), distance(crossing, b), distance(crossing, segment.start), distance(crossing, segment.end)) < 12 ? 300 : 12;
        }
        const cost = current.cost + distance(a, b) + (current.dir && current.dir !== dir ? 18 : 0) + penalty;
        const next = key(x, y, dir);
        if (cost >= (costs.get(next) ?? Infinity)) continue;
        costs.set(next, cost); previous.set(next, current.key);
        heap.push({ key: next, x, y, dir, cost, score: cost + distance(b, end) });
      }
    }
  }
  return null;
}

/** Effective intervals are shared by path drawing and label placement. */
function segmentCrossings(start: Point, end: Point, crossings: Crossing[]) {
  const length = distance(start, end);
  const hits = crossings.filter(p => Math.abs(start.y - end.y) < EPS ? Math.abs(p.y - start.y) < EPS && p.x > Math.min(start.x, end.x) && p.x < Math.max(start.x, end.x) : Math.abs(p.x - start.x) < EPS && p.y > Math.min(start.y, end.y) && p.y < Math.max(start.y, end.y))
    .sort((a, b) => distance(start, a) - distance(start, b));
  const effective: { crossing: Crossing; at: number; from: number; to: number; radius: number }[] = [];
  for (const crossing of hits) {
    const at = distance(start, crossing);
    const r = crossing.over ? Math.min(crossing.radius, at - 0.5, length - at - 0.5)
      : Math.min(Math.max(crossing.radius, 4.5), at - 0.25, length - at - 0.25);
    if (r < 0.5) continue;
    const prev = effective.at(-1);
    if (prev && at - r < prev.to) {
      if (prev.crossing.over && crossing.over && (at - prev.at) / 2 >= 4) {
        const mid = (prev.at + at) / 2;
        const prevR = Math.min(prev.radius, mid - prev.at - 0.1);
        prev.from = prev.at - prevR; prev.to = prev.at + prevR; prev.radius = prevR;
        const curR = Math.min(r, at - mid - 0.1);
        effective.push({ crossing, at, from: at - curR, to: at + curR, radius: curR });
      } else {
        prev.crossing = { ...prev.crossing, over: false };
        prev.to = Math.max(prev.to, at + r); prev.radius = (prev.to - prev.from) / 2; prev.at = at;
      }
    } else effective.push({ crossing, at, from: at - r, to: at + r, radius: r });
  }
  return effective;
}

export function pathForRoute(points: Point[], crossings: Crossing[] = []): string {
  if (!points.length) return '';
  let path = `M ${points[0].x} ${points[0].y}`;
  for (const { start, end } of routeSegments(points)) {
    const length = distance(start, end);
    if (!length) continue;
    const dx = (end.x - start.x) / length, dy = (end.y - start.y) / length;
    for (const { crossing: p, from, to, radius } of segmentCrossings(start, end, crossings)) {
      const x1 = start.x + dx * from, y1 = start.y + dy * from, x2 = start.x + dx * to, y2 = start.y + dy * to;
      path += ` L ${x1} ${y1}`;
      path += p.over ? ` A ${radius} ${radius} 0 0 1 ${x2} ${y2}` : ` M ${x2} ${y2}`;
    }
    path += ` L ${end.x} ${end.y}`;
  }
  return path;
}

export function labelAnchor(points: Point[], crossings: Crossing[]): Point {
  let longest = -1, anchor = points[0] ?? { x: 0, y: 0 };
  for (const { start, end } of routeSegments(points)) {
    const length = distance(start, end), dx = (end.x - start.x) / length, dy = (end.y - start.y) / length;
    if (!length) continue;
    const excluded: { from: number; to: number }[] = [];
    for (const interval of segmentCrossings(start, end, crossings)) {
      const previous = excluded.at(-1);
      if (previous && interval.from <= previous.to) previous.to = Math.max(previous.to, interval.to);
      else excluded.push({ from: interval.from, to: interval.to });
    }
    const clear: [number, number][] = [];
    let cursor = 0;
    for (const interval of excluded) { if (interval.from > cursor) clear.push([cursor, interval.from]); cursor = Math.max(cursor, interval.to); }
    if (cursor < length) clear.push([cursor, length]);
    for (const [from, to] of clear) {
      if (to - from <= longest) continue;
      longest = to - from; const at = (from + to) / 2;
      anchor = { x: start.x + dx * at, y: start.y + dy * at };
    }
  }
  return anchor;
}

export function buildRoutingFrame(inputBounds: NodeBounds[], inputEdges: RoutingEdge[]): RoutingFrame {
  const bounds = [...inputBounds].sort((a, b) => compareId(a.id, b.id));
  const byId = new Map(bounds.map(b => [b.id, b]));
  const edges = [...inputEdges].filter(e => byId.has(e.source) && byId.has(e.target)).sort((a, b) => compareId(a.id, b.id));
  const groups = new Map<string, { edge: RoutingEdge; end: 'source' | 'target'; side: Side; rect: NodeBounds }[]>();
  for (const edge of edges) for (const end of ['source', 'target'] as const) {
    const rect = byId.get(edge[end])!, other = byId.get(edge[end === 'source' ? 'target' : 'source'])!;
    const preferred = sideToward(rect, other);
    const opposite: Record<Side, Side> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
    const sidePenalty = (side: Side) => {
      let minGap = Infinity;
      for (const r of bounds) {
        if (r.id === rect.id) continue;
        if ((side === 'left' || side === 'right') && r.y < rect.y + rect.height + CLEARANCE && r.y + r.height > rect.y - CLEARANCE) {
          if (side === 'right' && r.x + r.width > rect.x) minGap = Math.min(minGap, r.x - (rect.x + rect.width));
          if (side === 'left' && r.x < rect.x + rect.width) minGap = Math.min(minGap, rect.x - (r.x + r.width));
        }
        if ((side === 'top' || side === 'bottom') && r.x < rect.x + rect.width + CLEARANCE && r.x + r.width > rect.x - CLEARANCE) {
          if (side === 'bottom' && r.y + r.height > rect.y) minGap = Math.min(minGap, r.y - (rect.y + rect.height));
          if (side === 'top' && r.y < rect.y + rect.height) minGap = Math.min(minGap, rect.y - (r.y + r.height));
        }
      }
      return minGap < STUB + CLEARANCE ? (minGap < 20 ? 80 : 30) + (STUB + CLEARANCE - Math.max(0, minGap)) : 0;
    };
    // Spread high-degree nodes across adjacent sides before endpoint symbols collide.
    const score = (side: Side) => {
      const count = groups.get(JSON.stringify([rect.id, side]))?.length ?? 0;
      const size = side === 'top' || side === 'bottom' ? rect.width : rect.height;
      const capacity = Math.max(1, Math.floor((size - 24) / 12));
      return (side === preferred ? 0 : side === opposite[preferred] ? 4 : 1) + count / capacity * 2 + (count >= capacity ? 100 : 0) + sidePenalty(side);
    };
    const side = (['top', 'right', 'bottom', 'left'] as Side[]).sort((a, b) => score(a) - score(b))[0];
    const groupKey = JSON.stringify([rect.id, side]);
    const group = groups.get(groupKey) ?? []; group.push({ edge, end, side, rect }); groups.set(groupKey, group);
  }
  const pins = new Map<string, Pin>();
  for (const group of groups.values()) group.sort((a, b) => compareId(`${a.edge.id}:${a.end}`, `${b.edge.id}:${b.end}`)).forEach(({ edge, end, side, rect }, index) => {
    const horizontal = side === 'top' || side === 'bottom', size = horizontal ? rect.width : rect.height;
    const offset = 12 + (index + 1) * Math.max(0, size - 24) / (group.length + 1);
    pins.set(JSON.stringify([edge.id, end]), { nodeId: rect.id, side,
      x: rect.x + (horizontal ? offset : side === 'right' ? rect.width : 0),
      y: rect.y + (horizontal ? side === 'bottom' ? rect.height : 0 : offset) });
  });
  const routes = new Map<string, PcbRoute>(), used: Point[][] = [];
  edges.forEach((edge, index) => {
    const source = pins.get(JSON.stringify([edge.id, 'source']))!, target = pins.get(JSON.stringify([edge.id, 'target']))!;
    const from = exit(source, bounds), to = exit(target, bounds);
    const corridor = findCorridor(from, to, bounds, used, index);
    const points = simplify([source, ...(corridor ?? [from, { x: from.x, y: to.y }, to]), target]);
    const endpointOverlap = [byId.get(edge.source)!, byId.get(edge.target)!].some(endpoint => bounds.some(r => r.id !== endpoint.id &&
      r.x < endpoint.x + endpoint.width - EPS && r.x + r.width > endpoint.x + EPS && r.y < endpoint.y + endpoint.height - EPS && r.y + r.height > endpoint.y + EPS));
    const blocked = endpointOverlap || !corridor || routeSegments(points).some((segment, i, all) => bounds.some(r => (i === 0 && r.id === edge.source) || (i === all.length - 1 && r.id === edge.target) ? false : segmentHitsInterior(segment.start, segment.end, r)));
    routes.set(edge.id, { id: edge.id, source, target, points, crossings: [], path: '', hitPath: pathForRoute(points), label: points[0], blocked }); used.push(points);
  });
  const addCrossing = (list: Crossing[], point: Point, over: boolean, radius: number) => {
    if (radius < 0.5) return;
    const existing = list.find(p => distance(p, point) < EPS);
    if (existing) { existing.over = existing.over && over; existing.radius = Math.max(existing.radius, radius); }
    else list.push({ ...point, over, radius });
  };
  const entries = [...routes.values()];
  for (let i = 0; i < entries.length; i++) for (const b of entries.slice(i + 1)) {
    const a = entries[i];
    for (const sa of routeSegments(a.points)) for (const sb of routeSegments(b.points)) {
      const point = intersection(sa.start, sa.end, sb.start, sb.end);
      if (!point) continue;
      const distA = Math.min(distance(point, sa.start), distance(point, sa.end));
      const distB = Math.min(distance(point, sb.start), distance(point, sb.end));
      const [overA, overB] = distA < 6 && distB > distA ? [true, false] : distB < 6 && distA > distB ? [false, true] : [a.id > b.id, b.id > a.id];
      addCrossing(a.crossings, point, overA, Math.min(6, distA - 0.5));
      addCrossing(b.crossings, point, overB, Math.min(6, distB - 0.5));
    }
  }
  for (const route of routes.values()) { route.path = pathForRoute(route.points, route.crossings); route.label = labelAnchor(route.points, route.crossings); }
  // Legacy bridge geometry also has one canvas-local crossing pass, never per-edge registries.
  const legacyBridges = new Map<string, LegacyBridge>();
  for (const route of routes.values()) {
    const crossings: BridgePoint[] = [];
    for (const other of routes.values()) {
      if (route.id === other.id) continue;
      const point = segmentIntersect(route.source.x, route.source.y, route.target.x, route.target.y, other.source.x, other.source.y, other.target.x, other.target.y);
      if (!point) continue;
      const dx = other.target.x - other.source.x, dy = other.target.y - other.source.y, length = Math.hypot(dx, dy) || 1;
      crossings.push({ point, isOver: route.id > other.id, crossUx: dx / length, crossUy: dy / length });
    }
    legacyBridges.set(route.id, { path: buildBridgePath(route.source.x, route.source.y, route.target.x, route.target.y, crossings),
      hitPath: `M ${route.source.x} ${route.source.y} L ${route.target.x} ${route.target.y}`,
      label: { x: (route.source.x + route.target.x) / 2, y: (route.source.y + route.target.y) / 2 } });
  }
  return { routes, bounds, legacyBridges };
}
