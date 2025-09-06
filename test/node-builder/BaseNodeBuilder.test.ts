import { describe, it, expect, vi } from 'vitest';
import BaseNodeBuilder from '../../src/modules/node-builder/BaseNodeBuilder';
import { IUniqueColorBuilder } from '../../src/interface/node-builder/util/IUniqueColorBuilder';
import { DockerDeckNode } from '../../src/model/DockerDeckNode';

// Concrete test subclass since BaseNodeBuilder is abstract
class TestNodeBuilder extends BaseNodeBuilder {
  build(id: string, parentId: string): DockerDeckNode {
    return super.build(id, parentId);
  }
}

class MockColorBuilder implements IUniqueColorBuilder {
  generateUniqueColor(input: string | number): string { return `#mock-${input}`; }
  reset(): void { /* noop */ }
  hasColor(_input: string | number): boolean { return false; }
}

describe('BaseNodeBuilder', () => {
  it('builds a node with default dimensions and base properties', () => {
    const colorBuilder = new MockColorBuilder();
    const builder = new TestNodeBuilder(colorBuilder); // default 100x100

    const node = builder.build('node-1', 'root');

    expect(node.id).toBe('node-1');
    expect(node.parentId).toBe('root');
    expect(node.width).toBe(100);
    expect(node.height).toBe(100);
    expect(node.position).toEqual({ x: 0, y: 0 });
    expect(node.resizing).toBe(true);
    expect(node.style?.background).toBe('#mock-node-1');
    expect(node.style?.border).toBe('2px solid black');
    expect(node.data?.label).toBe('unknown');
    expect(node.type).toBe('unknown-type');
  });

  it('honors custom dimensions passed to constructor', () => {
    const colorBuilder = new MockColorBuilder();
    const builder = new TestNodeBuilder(colorBuilder, 220, 140);
    const node = builder.build('node-2', 'root');
    expect(node.width).toBe(220);
    expect(node.height).toBe(140);
  });

  it('delegates color generation to unique color builder', () => {
    const generateUniqueColor = vi.fn((input: string | number) => `#spy-${input}`);
    const colorBuilder: IUniqueColorBuilder = {
      generateUniqueColor,
      reset: vi.fn(),
      hasColor: vi.fn().mockReturnValue(false)
    };

    const builder = new TestNodeBuilder(colorBuilder);
    const node = builder.build('spy-node', 'root');

    expect(generateUniqueColor).toHaveBeenCalledTimes(1);
    expect(generateUniqueColor).toHaveBeenCalledWith('spy-node');
    expect(node.style?.background).toBe('#spy-spy-node');
  });
});
