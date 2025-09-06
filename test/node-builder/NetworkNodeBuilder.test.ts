import { describe, it, expect } from 'vitest';
import NetworkNodeBuilder from '../../src/modules/node-builder/NetworkNodeBuilder';
import { IUniqueColorBuilder } from '../../src/interface/node-builder/util/IUniqueColorBuilder';
import { IDockerNetwork } from '../../src/interface/ast/IDockerNetwork';

class MockColorBuilder implements IUniqueColorBuilder {
  generateUniqueColor(input: string | number): string { return `#mock-${input}`; }
  reset(): void { /* noop */ }
  hasColor(_input: string | number): boolean { return true; }
}

describe('NetworkNodeBuilder', () => {
  const mockNetwork: IDockerNetwork = {
    name: 'frontend',
    driver: 'bridge',
    ipam: {
      driver: 'default',
      config: [ { subnet: '172.16.0.0/24', gateway: '172.16.0.1' } ]
    }
  };

  it('builds a network node with expected properties and extent=parent', () => {
    const colorBuilder = new MockColorBuilder();
    const builder = new NetworkNodeBuilder(mockNetwork, colorBuilder, 160, 110);
    const node = builder.build('network-frontend', 'parent-root');

    expect(node.id).toBe('network-frontend');
    expect(node.parentId).toBe('parent-root');
    expect(node.width).toBe(160);
    expect(node.height).toBe(110);
    expect(node.style?.background).toBe('#mock-network-frontend');
    expect(node.data?.label).toBe('Network: frontendnetwork-frontend');
    expect(node.extent).toBe('parent');
  });

  it('uses default dimensions when not specified', () => {
    const colorBuilder = new MockColorBuilder();
    const builder = new NetworkNodeBuilder(mockNetwork, colorBuilder);
    const node = builder.build('network-frontend', 'parent-root');

    expect(node.width).toBe(100);
    expect(node.height).toBe(100);
  });
});
