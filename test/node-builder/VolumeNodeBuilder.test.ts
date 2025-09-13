import { describe, it, expect } from 'vitest';
import VolumeNodeBuilder from '../../src/modules/node-builder/VolumeNodeBuilder';
import { IUniqueColorBuilder } from '../../src/interface/node-builder/util/IUniqueColorBuilder';
import { IDockerVolume } from '../../src/interface/ast/IDockerVolume';

class MockColorBuilder implements IUniqueColorBuilder {
  generateUniqueColor(input: string | number): string { return `#mock-${input}`; }
  reset(): void { /* noop */ }
  hasColor(_input: string | number): boolean { return true; }
}

describe('VolumeNodeBuilder', () => {
  const mockVolume: IDockerVolume = {
    name: 'data',
    driver: 'local',
    driver_opts: { type: 'none', o: 'bind', device: '/var/lib/data' }
  };

  it('builds a volume node with expected properties and extent=parent', () => {
    const colorBuilder = new MockColorBuilder();
    const builder = new VolumeNodeBuilder(mockVolume, colorBuilder, 140, 115);
    const node = builder.build('volume-data', 'parent-root');

    expect(node.id).toBe('volume-data');
    expect(node.parentId).toBe('parent-root');
    expect(node.width).toBe(140);
    expect(node.height).toBe(115);
    expect(node.style?.background).toBe('#mock-volume-data');
    expect(node.data?.label).toBe('Volume: datavolume-data');
    expect(node.extent).toBe('parent');
  });

  it('uses default dimensions when not specified', () => {
    const colorBuilder = new MockColorBuilder();
    const builder = new VolumeNodeBuilder(mockVolume, colorBuilder);
    const node = builder.build('volume-data', 'parent-root');

    expect(node.width).toBe(100);
    expect(node.height).toBe(100);
  });
});
