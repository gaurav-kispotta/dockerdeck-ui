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

  it('handles a dense 12-service fan without entering cards or merging endpoint pins', () => {
    const targets = Array.from({ length: 12 }, (_, i) => ({ id: `service:target${i}`, x: 500 + (i % 3) * 280, y: Math.floor(i / 3) * 160 - 250, width: 200, height: 64 }));
    const fan = targets.map(target => ({ id: `dependency:${target.id}`, source: a.id, target: target.id }));
    const frame = buildRoutingFrame([a, ...targets], fan);
    expect(frame.routes.size).toBe(12);
    expect(new Set([...frame.routes.values()].map(r => `${r.source.x}:${r.source.y}`)).size).toBe(12);
    for (const route of frame.routes.values()) expect(route.blocked, route.id).toBe(false);
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
