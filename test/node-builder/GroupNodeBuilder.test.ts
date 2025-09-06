import { describe, it, expect } from 'vitest';
import GroupNodeBuilder from '../../src/modules/node-builder/GroupNodeBuilder';
import { IUniqueColorBuilder } from '../../src/interface/node-builder/util/IUniqueColorBuilder';
import { DockerDeckNode } from '../../src/model/DockerDeckNode';

class MockColorBuilder implements IUniqueColorBuilder {
  generateUniqueColor(input: string | number): string { return `#mock-${input}`; }
  reset(): void { /* noop */ }
  hasColor(_input: string | number): boolean { return true; }
}

describe('GroupNodeBuilder', () => {
  it('builds a group node with default dimensions and empty children', () => {
    const colorBuilder = new MockColorBuilder();
    const builder = new GroupNodeBuilder(colorBuilder); // defaults 100x100

    const node = builder.build('group-1', 'parent-root');

    expect(node.id).toBe('group-1');
    expect(node.parentId).toBe('parent-root');
    expect(node.width).toBe(100);
    expect(node.height).toBe(100);
    expect(node.style?.background).toBe('#mock-group-1');
    expect(node.data?.label).toBe('Group: group-1');
    expect(Array.isArray(node.children)).toBe(true);
    expect(node.children?.length).toBe(0);
  });

  it('applies provided dimensions', () => {
    const colorBuilder = new MockColorBuilder();
    const builder = new GroupNodeBuilder(colorBuilder, 200, 180);
    const node = builder.build('group-2', 'parent-root');
    expect(node.width).toBe(200);
    expect(node.height).toBe(180);
  });

  it('sets provided children via setChildren before build', () => {
    const colorBuilder = new MockColorBuilder();
    const builder = new GroupNodeBuilder(colorBuilder);

    const childA: DockerDeckNode = { id: 'child-a', position: { x: 0, y: 0 }, data: { label: 'A' }, type: 'child-type' } as DockerDeckNode;
    const childB: DockerDeckNode = { id: 'child-b', position: { x: 10, y: 10 }, data: { label: 'B' }, type: 'child-type' } as DockerDeckNode;
    const childC: DockerDeckNode = { id: 'child-c', position: { x: 20, y: 20 }, data: { label: 'C' }, type: 'child-type' } as DockerDeckNode;

    builder.pushChildren([childA, childB]);
    builder.pushChild(childC);
    const node = builder.build('group-children', 'parent-root');

    expect(node.children).toBeDefined();
    expect(node.children?.length).toBe(3);
    expect(node.children?.[0].id).toBe('child-a');
    expect(node.children?.[1].id).toBe('child-b');
    expect(node.children?.[2].id).toBe('child-c');
  });
});
