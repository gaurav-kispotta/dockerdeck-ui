import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { Position } from '@xyflow/react';
import { JSONPath } from 'jsonpath-plus';
import MapMaker from '../../src/modules/MapMaker';
import selectionReducer, { selectNode, selectAstNode } from '../../src/store/slices/selectionSlice';
import { resourceId, resourcePath, parseResourceId, relationshipId } from '../../src/utils/resourceIdentity';
import { edgeReg, regEdge, unregEdge } from '../../src/utils/orthogonalRouter';
import { settingsSlice } from '../../src/store/slices/settingsSlice';

vi.mock('../../src/utils/analytics', () => ({ logInteractionEvent: vi.fn(), AnalyticsEvent: { NODE_SELECTED: 'node_selected' } }));
const fixture = parse(readFileSync(new URL('../../qa/fixtures/resource-identity.yaml', import.meta.url), 'utf8'));

describe('typed Compose resource identity', () => {
  it.each(['data', 'data.to-data_1', 'a:b', 'a%3Ab', '__boot-rail', "a['b']", '数据'])('round trips original names without ambiguity: %s', name => {
    const ids = ['service', 'network', 'volume'].map(kind => resourceId(kind as 'service' | 'network' | 'volume', name));
    expect(new Set(ids).size).toBe(3);
    for (const id of ids) expect(parseResourceId(id)?.name).toBe(name);
    expect(resourceId('service', 'a:b')).not.toBe(resourceId('service', 'a%3Ab'));
  });

  it('does not guess untyped or malformed IDs', () => {
    for (const id of ['data', 'group:data', 'service:%xx', 'service:%64ata']) expect(parseResourceId(id)).toBeNull();
  });

  it('uses literal original Compose keys for punctuation-containing source paths', () => {
    expect(JSONPath({ path: `$[${JSON.stringify('services')}][${JSON.stringify('data.to-data_1')}]`, json: fixture })).toEqual([fixture.services['data.to-data_1']]);
    expect(JSONPath({ path: `$.${resourcePath('service', 'data.to-data_1')}`, json: fixture })).toEqual([fixture.services['data.to-data_1']]);
  });

  it('separates relationship kinds and delimiter-containing endpoint tuples', () => {
    expect(relationshipId('network', 'a:b', 'c')).not.toBe(relationshipId('network', 'a', 'b:c'));
    expect(relationshipId('network', 'service:data', 'network:data')).not.toBe(relationshipId('volume', 'service:data', 'volume:data'));
  });

  it('keeps all colliding resource kinds and repeated mounts distinct throughout the map pipeline and JSON export', async () => {
    const maker = new MapMaker();
    await maker.buildMap3(fixture);
    expect(maker.nodes).toHaveLength(6);
    expect(new Set(maker.nodes.map(n => n.id)).size).toBe(6);
    for (const kind of ['service', 'network', 'volume'] as const) {
      for (const name of ['data', 'data.to-data_1']) {
        expect(maker.nodes.find(n => n.id === resourceId(kind, name))?.data).toMatchObject({ label: name, resourceKind: kind, resourceName: name, nodeType: kind });
      }
    }
    expect(maker.edges).toHaveLength(9); // 3 memberships + 4 mounts + dependency + shared network
    expect(new Set(maker.edges.map(e => e.id)).size).toBe(9);
    const ids = new Set(maker.nodes.map(n => n.id));
    for (const edge of maker.edges) {
      expect(ids.has(edge.source)).toBe(true);
      expect(ids.has(edge.target)).toBe(true);
      expect(edge.sources).toEqual([edge.source]);
      expect(edge.targets).toEqual([edge.target]);
    }
    const exported = JSON.parse(JSON.stringify({ nodes: maker.nodes, edges: maker.edges }));
    expect(exported.nodes.map((n: any) => n.data.resourceName)).toEqual(maker.nodes.map(n => n.data.resourceName));
    expect(new Set(exported.nodes.map((n: any) => n.id)).size).toBe(6);
  });

  it('maps graph and outline selections to each exact AST kind and back, including child keys', async () => {
    const maker = new MapMaker();
    const ast = await maker.buildMap3(fixture);
    for (const kind of ['service', 'network', 'volume'] as const) {
      for (const [index, name] of ['data', 'data.to-data_1'].entries()) {
        const id = resourceId(kind, name);
        const graphSelected = selectionReducer(undefined, selectNode({ nodeId: id, connectedNodeIds: [], connectedEdgeIds: [], astObject: ast }));
        expect(graphSelected.selectedAstNodeKey).toBe(`${kind}-${index}`);
        expect(graphSelected.expandedAstKeys).toContain(`${kind}s`);
        for (const suffix of ['', '-image', '-ports-0']) {
          const astSelected = selectionReducer(graphSelected, selectAstNode({ astNodeKey: `${kind}-${index}${suffix}`, expandedKeys: [], astObject: ast }));
          expect(astSelected.selectedNodeId).toBe(id);
        }
      }
    }
    const selected = selectionReducer(undefined, selectNode({ nodeId: 'service:data', connectedNodeIds: [], connectedEdgeIds: [], astObject: ast }));
    expect(selectionReducer(selected, selectNode({ nodeId: 'network:missing', connectedNodeIds: [], connectedEdgeIds: [], astObject: ast })).selectedAstNodeKey).toBeNull();
    expect(selectionReducer(selected, selectAstNode({ astNodeKey: 'root', expandedKeys: [], astObject: ast })).selectedNodeId).toBeNull();
  });

  it('rebuilds view/layout variants with stable IDs, and routing unregister removes only the departed relationship', async () => {
    const maker = new MapMaker();
    await maker.buildMap3(fixture);
    const expected = maker.nodes.map(n => n.id).sort();
    for (const viewMode of ['architecture', 'networks', 'ports', 'volumes', 'boot-order'] as const) {
      await maker.buildMap3(fixture, { ...settingsSlice.getInitialState(), viewMode });
      expect(maker.nodes.map(n => n.id).sort()).toEqual(expected);
    }
    const edges = maker.edges.filter(e => e.source === 'service:data' && (e.target === 'network:data' || e.target === 'volume:data'));
    try {
      for (const e of edges) regEdge({ id: e.id, sx: 0, sy: 0, tx: 100, ty: 100, srcPos: Position.Right });
      expect(edges.every(e => edgeReg.has(e.id))).toBe(true);
      unregEdge(edges[0].id);
      expect(edgeReg.has(edges[0].id)).toBe(false);
      expect(edges.slice(1).every(e => edgeReg.has(e.id))).toBe(true);
    } finally { edges.forEach(e => unregEdge(e.id)); }
    expect(edges.some(e => edgeReg.has(e.id))).toBe(false);
  });
});
