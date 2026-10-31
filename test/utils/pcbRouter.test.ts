import { describe, expect, it, vi } from 'vitest';
import { buildRoutingFrame, pathForRoute, labelAnchor, segmentHitsInterior, routeSegments, type NodeBounds } from '../../src/utils/pcbRouter';
import selection, { selectEdge, selectNode, clearSelection } from '../../src/store/slices/selectionSlice';
vi.mock('../../src/utils/analytics', () => ({ logInteractionEvent: vi.fn(), AnalyticsEvent: { NODE_SELECTED: 'node_selected' } }));

const a: NodeBounds = { id: 'service:data', x: 0, y: 0, width: 200, height: 64 };
const b: NodeBounds = { id: 'service:data.to-data_1', x: 500, y: 0, width: 200, height: 64 };
const blocker: NodeBounds = { id: 'network:data', x: 250, y: -40, width: 200, height: 150 };
const edges = ['depends_on', 'service-to-service', 'volume:mount1', 'volume:mount2'].map(kind => ({ id: `edge:${kind}`, source: a.id, target: b.id }));
const serialize = (frame: ReturnType<typeof buildRoutingFrame>) => JSON.stringify([...frame.routes]);

describe('canvas-scoped PCB routing', () => {
  it('assigns stable separated boundary pins and obstacle-safe lanes, independent of node/edge input order', () => {
    const frame = buildRoutingFrame([a, b, blocker], edges);
    expect(serialize(buildRoutingFrame([blocker, b, a], [...edges].reverse()))).toBe(serialize(frame));
    expect(new Set([...frame.routes.values()].map(r => `${r.source.x}:${r.source.y}`)).size).toBe(4);
    expect(new Set([...frame.routes.values()].map(r => `${r.target.x}:${r.target.y}`)).size).toBe(4);
    for (const route of frame.routes.values()) {
      expect(route.blocked).toBe(false);
      expect(route.points[0]).toEqual(route.source);
      expect(route.points.at(-1)).toEqual(route.target);
      for (const segment of routeSegments(route.points)) for (const rect of [a, b, blocker])
        expect(segmentHitsInterior(segment.start, segment.end, rect), `${route.id} enters ${rect.id}`).toBe(false);
      expect(routeSegments(route.points).some(({ start, end }) =>
        Math.abs(start.x - end.x) < 0.01 ? route.label.x === start.x && route.label.y >= Math.min(start.y, end.y) && route.label.y <= Math.max(start.y, end.y) :
          route.label.y === start.y && route.label.x >= Math.min(start.x, end.x) && route.label.x <= Math.max(start.x, end.x))).toBe(true);
    }
  });

  it('never shares routing state between frames with identical IDs and different positions, or after cleanup', () => {
    const first = buildRoutingFrame([a, b], edges), saved = serialize(first);
    const second = buildRoutingFrame([{ ...a, y: 300 }, { ...b, y: 600 }], edges);
    expect(serialize(second)).not.toBe(saved);
    expect(buildRoutingFrame([], []).routes.size).toBe(0);
    expect(serialize(first)).toBe(saved);
  });

  it('adapts to actual tall card dimensions and dragging an obstacle', () => {
    const before = buildRoutingFrame([a, b], edges);
    const after = buildRoutingFrame([{ ...a, height: 120 }, b, blocker], edges);
    expect(serialize(after)).not.toBe(serialize(before));
    for (const route of after.routes.values()) {
      expect(route.blocked).toBe(false);
      expect(routeSegments(route.points).some(s => segmentHitsInterior(s.start, s.end, blocker))).toBe(false);
    }
  });

  it('makes explicit a fully overlapped endpoint failure instead of claiming a clear corridor', () => {
    const frame = buildRoutingFrame([a, { ...b, x: a.x, y: a.y }], edges);
    expect([...frame.routes.values()].some(r => r.blocked)).toBe(true);
  });

  it('renders crossings as bridges/gaps while preserving endpoints near corners', () => {
    const points = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }];
    for (const at of [2, 5, 10, 50, 95, 98]) {
      const crossing = { x: at, y: 0, radius: 6, over: true };
      const over = pathForRoute(points, [crossing]), under = pathForRoute(points, [{ ...crossing, over: false }]);
      expect(over).toContain(' A ');
      expect(under.match(/ M /g)).toHaveLength(1);
      expect(over).toMatch(/^M 0 0/);
      expect(over).toMatch(/L 100 100$/);
      expect(under).toMatch(/L 100 100$/);
    }
    const label = labelAnchor(points, [{ x: 50, y: 0, radius: 6, over: true }]);
    expect(label).toEqual({ x: 100, y: 50 });
  });

  it('assigns one deterministic bridge and one gap at a real perpendicular route crossing', () => {
    const bounds = [
      { id: 'left', x: 0, y: 100, width: 200, height: 64 },
      { id: 'right', x: 600, y: 100, width: 200, height: 64 },
      { id: 'top', x: 300, y: -200, width: 200, height: 64 },
      { id: 'bottom', x: 300, y: 400, width: 200, height: 64 },
    ];
    const frame = buildRoutingFrame(bounds, [{ id: 'a-horizontal', source: 'left', target: 'right' }, { id: 'b-vertical', source: 'top', target: 'bottom' }]);
    const horizontal = frame.routes.get('a-horizontal')!, vertical = frame.routes.get('b-vertical')!;
    expect(horizontal.crossings).toHaveLength(1);
    expect(vertical.crossings).toHaveLength(1);
    expect(horizontal.crossings[0]).toMatchObject({ x: vertical.crossings[0].x, y: vertical.crossings[0].y, over: false });
    expect(vertical.crossings[0].over).toBe(true);
    expect(vertical.path).toContain(' A ');
    expect(horizontal.path).toContain(' M ');
  });

  it.each([false, true])('anchors labels on actual remaining wire when crossing exclusion intervals overlap (over=%s)', over => {
    const points = [{ x: 0, y: 0 }, { x: 40, y: 0 }];
    const crossings = [12, 18, 24, 30].map(x => ({ x, y: 0, radius: 6, over }));
    const label = labelAnchor(points, crossings);
    expect(label).toEqual({ x: 3, y: 0 }); // actual first visible span is 0..6, never the removed 6..18
    expect(pathForRoute(points, crossings)).toContain('L 6 0');
    const reversed = labelAnchor([...points].reverse(), [...crossings].reverse());
    expect(reversed.y).toBe(0);
    expect([3, 21, 38]).toContain(reversed.x);
  });

  it('handles a dense 12-service fan without entering cards or merging endpoint pins', () => {
    const targets = Array.from({ length: 12 }, (_, i) => ({ id: `service:target${i}`, x: 500 + (i % 3) * 280, y: Math.floor(i / 3) * 160 - 250, width: 200, height: 64 }));
    const fan = targets.map(target => ({ id: `dependency:${target.id}`, source: a.id, target: target.id }));
    const frame = buildRoutingFrame([a, ...targets], fan);
    expect(frame.routes.size).toBe(12);
    expect(new Set([...frame.routes.values()].map(r => `${r.source.x}:${r.source.y}`)).size).toBe(12);
    for (const route of frame.routes.values()) expect(route.blocked, route.id).toBe(false);
  });

  it('preserves gaps/bridges across 10px and 12px gutter crossings and near-corner intersections', () => {
    const seg = [{ x: 0, y: 0 }, { x: 100, y: 0 }];
    const gutter12 = pathForRoute(seg, [{ x: 20, y: 0, radius: 6, over: false }, { x: 32, y: 0, radius: 6, over: false }]);
    expect(gutter12.match(/ M /g)).toHaveLength(2);
    const gutter10Over = pathForRoute(seg, [{ x: 20, y: 0, radius: 6, over: true }, { x: 30, y: 0, radius: 6, over: true }]);
    expect(gutter10Over.match(/ A /g)).toHaveLength(2);
    // Near-corner intersection: when route A turns 2px from the crossing and route B has 50px clearance, B opens the gap.
    const bounds = [
      { id: 'a-src', x: 0, y: 0, width: 100, height: 56 },
      { id: 'a-tgt', x: 400, y: 200, width: 100, height: 56 },
      { id: 'b-src', x: 200, y: -150, width: 100, height: 56 },
      { id: 'b-tgt', x: 200, y: 350, width: 100, height: 56 },
    ];
    const frame = buildRoutingFrame(bounds, [{ id: 'edge:a', source: 'a-src', target: 'a-tgt' }, { id: 'edge:b', source: 'b-src', target: 'b-tgt' }]);
    const ra = frame.routes.get('edge:a')!, rb = frame.routes.get('edge:b')!;
    expect(ra.crossings.length).toBeGreaterThan(0);
    expect(rb.crossings.length).toBeGreaterThan(0);
    expect(ra.crossings[0].over !== rb.crossings[0].over).toBe(true);
  });

  it('routes cleanly when a dragged service card sits 5px from a neighbor card', () => {
    const draggedBounds: NodeBounds[] = [
      { id: 'service:api', x: 100, y: 349, width: 200, height: 56 },
      { id: 'service:worker', x: 456, y: 388, width: 200, height: 56 },
      { id: 'service:db', x: 661, y: 349, width: 200, height: 56 },
      { id: 'network:front', x: 260, y: 120, width: 200, height: 56 },
      { id: 'volume:data', x: 456, y: 560, width: 200, height: 56 },
    ];
    const draggedEdges = [
      { id: 'dep:api:db', source: 'service:api', target: 'service:db' },
      { id: 'dep:db:worker', source: 'service:db', target: 'service:worker' },
      { id: 'dep:api:worker', source: 'service:api', target: 'service:worker' },
      { id: 'net:worker:front', source: 'service:worker', target: 'network:front' },
      { id: 'vol:worker:data', source: 'service:worker', target: 'volume:data' },
    ];
    const frame = buildRoutingFrame(draggedBounds, draggedEdges);
    for (const route of frame.routes.values()) {
      expect(route.blocked, `${route.id} should not be blocked`).toBe(false);
      for (const segment of routeSegments(route.points)) {
        for (const rect of draggedBounds) {
          expect(segmentHitsInterior(segment.start, segment.end, rect), `${route.id} hits ${rect.id}`).toBe(false);
        }
      }
    }
  });

  it('prevents false junctions across all perpendicular crossings and after dragging in a 14-node 63-edge graph', () => {
    const strokesPoint = (d: string, px: number, py: number, halfWidth = 3) => {
      const tokens = d.trim().split(/\s+/);
      let i = 0, cx = 0, cy = 0;
      while (i < tokens.length) {
        const cmd = tokens[i++];
        if (cmd === 'M') { cx = Number(tokens[i++]); cy = Number(tokens[i++]); }
        else if (cmd === 'L') {
          const nx = Number(tokens[i++]), ny = Number(tokens[i++]);
          const l2 = (nx - cx) ** 2 + (ny - cy) ** 2;
          const t = l2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - cx) * (nx - cx) + (py - cy) * (ny - cy)) / l2));
          if (Math.hypot(px - (cx + t * (nx - cx)), py - (cy + t * (ny - cy))) <= halfWidth) return true;
          cx = nx; cy = ny;
        } else if (cmd === 'A') {
          const rx = Number(tokens[i++]); i += 4;
          const nx = Number(tokens[i++]), ny = Number(tokens[i++]);
          const mx = (cx + nx) / 2, my = (cy + ny) / 2;
          const ux = (nx - cx) / (2 * rx || 1), uy = (ny - cy) / (2 * rx || 1);
          const inArcHalf = (px - mx) * uy + (py - my) * -ux >= 0;
          const dist = inArcHalf ? Math.abs(Math.hypot(px - mx, py - my) - rx) : Math.min(Math.hypot(px - cx, py - cy), Math.hypot(px - nx, py - ny));
          if (dist <= halfWidth) return true;
          cx = nx; cy = ny;
        }
      }
      return false;
    };
    const services = ['gateway', 'worker', 'db', 'api', 'auth', 'scheduler', 'billing', 'search', 'metrics'];
    const networks = ['front', 'back', 'mesh'];
    const volumes = ['cache', 'data'];
    const baseBounds: NodeBounds[] = [
      ...networks.map((n, i) => ({ id: `network:${n}`, x: 380 + i * 280, y: 100, width: 200, height: 56 })),
      ...services.slice(0, 5).map((s, i) => ({ id: `service:${s}`, x: 100 + i * 280, y: 348, width: 200, height: 56 })),
      ...services.slice(5).map((s, i) => ({ id: `service:${s}`, x: 240 + i * 280, y: 508, width: 200, height: 56 })),
      ...volumes.map((v, i) => ({ id: `volume:${v}`, x: 520 + i * 280, y: 756, width: 200, height: 56 })),
    ];
    const denseEdges: { id: string; source: string; target: string }[] = [];
    for (let i = 0; i < services.length; i++) {
      for (let j = i + 1; j < services.length; j++) denseEdges.push({ id: `dep:${services[i]}:${services[j]}`, source: `service:${services[i]}`, target: `service:${services[j]}` });
      for (const n of networks) if (denseEdges.length < 54) denseEdges.push({ id: `net:${services[i]}:${n}`, source: `service:${services[i]}`, target: `network:${n}` });
    }
    for (let i = 0; i < services.length; i++) for (const v of volumes)
      if (denseEdges.length < 63) denseEdges.push({ id: `vol:${services[i]}:${v}`, source: `service:${services[i]}`, target: `volume:${v}` });
    expect(baseBounds).toHaveLength(14);
    expect(denseEdges).toHaveLength(63);

    for (const [dx, dy] of [[0, 0], [75, 47], [75, 52], [76, 52], [80, 50]]) {
      const bounds = baseBounds.map(n => n.id === 'service:worker' ? { ...n, x: n.x + dx, y: n.y + dy } : n);
      const frame = buildRoutingFrame(bounds, denseEdges);
      for (const route of frame.routes.values()) {
        expect(route.blocked, `${route.id} at drag (${dx},${dy})`).toBe(false);
        for (const seg of routeSegments(route.points)) for (const rect of bounds)
          expect(segmentHitsInterior(seg.start, seg.end, rect), `${route.id} hits ${rect.id}`).toBe(false);
      }
      const list = [...frame.routes.values()];
      let crossingCount = 0;
      for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
        const ra = list[i], rb = list[j];
        for (const sa of routeSegments(ra.points)) for (const sb of routeSegments(rb.points)) {
          const horizA = Math.abs(sa.start.y - sa.end.y) < 0.01 && Math.abs(sb.start.x - sb.end.x) < 0.01;
          const horizB = Math.abs(sa.start.x - sa.end.x) < 0.01 && Math.abs(sb.start.y - sb.end.y) < 0.01;
          if (!horizA && !horizB) continue;
          const h = horizA ? sa : sb, v = horizA ? sb : sa;
          const x = v.start.x, y = h.start.y;
          if (x <= Math.min(h.start.x, h.end.x) + 0.01 || x >= Math.max(h.start.x, h.end.x) - 0.01) continue;
          if (y <= Math.min(v.start.y, v.end.y) + 0.01 || y >= Math.max(v.start.y, v.end.y) - 0.01) continue;
          crossingCount++;
          expect(strokesPoint(ra.path, x, y, 3) && strokesPoint(rb.path, x, y, 3),
            `${ra.id} x ${rb.id} at (${x},${y}) dx=${dx} dy=${dy} sa=${JSON.stringify(sa)} sb=${JSON.stringify(sb)} ca=${JSON.stringify(ra.crossings)} cb=${JSON.stringify(rb.crossings)}`).toBe(false);
        }
      }
      expect(crossingCount).toBeGreaterThan(50);
    }
  });
});

describe('connection focus state', () => {
  it('highlights both endpoints and supports clear/node selection without stale edge or AST selection', () => {
    const state = selection(undefined, selectEdge({ id: 'edge:dependency', source: a.id, target: b.id }));
    expect(state.selectedEdgeId).toBe('edge:dependency');
    expect(state.connectedNodeIds).toEqual([a.id, b.id]);
    expect(state.connectedEdgeIds).toEqual(['edge:dependency']);
    expect(state.selectedAstNodeKey).toBeNull();
    expect(selection(state, clearSelection())).toMatchObject({ selectedEdgeId: null, connectedEdgeIds: [], connectedNodeIds: [] });
    expect(selection(state, selectNode({ nodeId: a.id, connectedNodeIds: [], connectedEdgeIds: [] })).selectedEdgeId).toBeNull();
  });
});
