import { describe, it, expect, vi } from 'vitest';
import ServiceNodeBuilder from '../../src/modules/node-builder/ServiceNodeBuilder';
import { IDockerService } from '../../src/interface/ast/IDockerService';
import { IUniqueColorBuilder } from '../../src/interface/node-builder/util/IUniqueColorBuilder';

class MockColorBuilder implements IUniqueColorBuilder {
  generateUniqueColor(input: string | number): string { return `#mock-${input}`; }
  reset(): void { /* noop */ }
  hasColor(_input: string | number): boolean { return true; }
}

describe('ServiceNodeBuilder', () => {
  const mockService: IDockerService = {
    name: 'api',
    image: { name: 'node', tag: '20-alpine' },
    containerName: 'api-container',
    ports: [{ internal: 3000, external: 3000 }],
    volumes: [{ internal: '/app', external: 'app-data' }],
    networks: ['default-net'],
    dependsOn: []
  };

  it('builds a service node with expected base properties', () => {
    const colorBuilder = new MockColorBuilder();
    const builder = new ServiceNodeBuilder(mockService, colorBuilder, 150, 120);
    const node = builder.build('service-api', 'parent-root');

    expect(node.id).toBe('service-api');
    expect(node.parentId).toBe('parent-root');
    expect(node.width).toBe(150);
    expect(node.height).toBe(120);
    expect(node.style).toEqual({}); // ServiceNodeBuilder sets style to empty object
    // Label currently concatenates string version of image object + id; verify format.
    expect(typeof node.data?.label).toBe('string');
    expect(node.extent).toBe('parent');
  });

  it('uses provided dimensions defaults when not overridden', () => {
    const colorBuilder = new MockColorBuilder();
    const builder = new ServiceNodeBuilder(mockService, colorBuilder);
    const node = builder.build('service-api', 'parent-root');

    expect(node.width).toBe(100);
    expect(node.height).toBe(100);
  });

  it('sets node type to the docker image name', () => {
    const colorBuilder = new MockColorBuilder();
    const builder = new ServiceNodeBuilder(mockService, colorBuilder);
    const node = builder.build('service-api', 'parent-root');

    // Node type should match the docker image name
    expect(node.type).toBe('node');
  });

  it('uses different image names for different services', () => {
    const redisService: IDockerService = {
      name: 'cache',
      image: { name: 'redis', tag: '7.2' },
      containerName: 'cache-container',
      ports: [{ internal: 6379, external: 6379 }],
      volumes: [],
      networks: ['default-net'],
      dependsOn: []
    };

    const colorBuilder = new MockColorBuilder();
    const builder = new ServiceNodeBuilder(redisService, colorBuilder);
    const node = builder.build('service-cache', 'parent-root');

    // Node type should be 'redis' for a Redis service
    expect(node.type).toBe('redis');
  });
});
