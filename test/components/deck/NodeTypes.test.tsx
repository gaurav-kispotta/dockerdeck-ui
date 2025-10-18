import { describe, it, expect } from 'vitest';
import nodeTypes from '../../../src/components/deck/NodeTypes';
import nodesConfig from '../../../src/components/deck/config/NodesConfig.json';

describe('NodeTypes', () => {
  it('should have legacy node types', () => {
    expect(nodeTypes.redis).toBeDefined();
    expect(nodeTypes.nodejs).toBeDefined();
    expect(nodeTypes.group).toBeDefined();
  });

  it('should generate node types for all docker images in config', () => {
    // Check that all docker images from config are available as node types
    nodesConfig.forEach((config) => {
      expect(nodeTypes[config.dockerImageName]).toBeDefined();
      expect(typeof nodeTypes[config.dockerImageName]).toBe('function');
    });
  });

  it('should have at least 34 generated node types from config (excluding legacy overlaps)', () => {
    // Redis appears in both legacy and config, so it's overridden by the generated one
    const generatedKeys = Object.keys(nodeTypes).filter(
      key => !['nodejs', 'group'].includes(key) // Only exclude truly non-config legacy types
    );
    expect(generatedKeys.length).toBeGreaterThanOrEqual(34);
  });

  it('should have specific docker image node types', () => {
    expect(nodeTypes.mysql).toBeDefined();
    expect(nodeTypes.postgres).toBeDefined();
    expect(nodeTypes.mongodb).toBeDefined();
    expect(nodeTypes.nginx).toBeDefined();
    expect(nodeTypes.node).toBeDefined();
  });
});
