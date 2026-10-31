import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Position, type EdgeProps } from '@xyflow/react';
import type { ComponentType } from 'react';
import StraightEdge from '../../../src/components/deck/edges/StraightEdge';
import SimpleEdge from '../../../src/components/deck/edges/SimpleEdge';
import SmoothStepEdge from '../../../src/components/deck/edges/SmoothStepEdge';
import BridgeEdge from '../../../src/components/deck/edges/BridgeEdge';
import OrthogonalEdge from '../../../src/components/deck/edges/OrthogonalEdge';
import SimpleFloatingEdge from '../../../src/components/deck/edges/SimpleFloatingEdge';
import RelationshipLegend from '../../../src/components/deck/RelationshipLegend';
import { RELATIONSHIP_KINDS, relationshipPresentation } from '../../../src/utils/relationshipPresentation';

const { harness } = vi.hoisted(() => ({ harness: { dark: false } }));
vi.mock('../../../src/hooks/useReduxHooks', () => ({
  useAppSelector: (selector: (state: any) => unknown) => selector({ theme: { isDark: harness.dark } }),
}));
vi.mock('@xyflow/react', async () => ({
  ...await vi.importActual('@xyflow/react'),
  EdgeLabelRenderer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Panel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useInternalNode: (id: string) => ({
    measured: { width: 200, height: 80 },
    internals: { positionAbsolute: { x: id === 'service:dependent' ? 0 : 300, y: 100 }, handleBounds: { source:
      ['top', 'right', 'bottom', 'left'].map(position => ({ position, width: 8, height: 8, x: 100, y: 40 })) } },
  }),
}));

const renderers: [string, ComponentType<EdgeProps>][] = [
  ['straight', StraightEdge], ['bezier', SimpleEdge], ['smoothstep', SmoothStepEdge],
  ['bridge', BridgeEdge], ['orthogonal', OrthogonalEdge], ['legacy floating', SimpleFloatingEdge],
];

describe('shared relationship presentation', () => {
  for (const dark of [false, true]) {
    for (const [name, Renderer] of renderers) {
      it.each(RELATIONSHIP_KINDS)(`${name} preserves %s symbols/patterns in ${dark ? 'dark' : 'light'} including selected legacy animation props`, kind => {
        harness.dark = dark;
        const p = relationshipPresentation(kind, dark);
        const props = {
          id: 'test-edge', source: 'service:dependent', target: 'service:prerequisite',
          sourceX: 200, sourceY: 140, targetX: 300, targetY: 140,
          sourcePosition: Position.Right, targetPosition: Position.Left,
          data: { connectionType: kind }, label: kind === 'service-to-service' ? 'communicates' : '/data',
          animated: true, markerEnd: 'url(#old-wrong-arrow)', style: { stroke: 'red', strokeDasharray: '1 1', strokeWidth: 4 },
        } as EdgeProps;
        const normal = renderToStaticMarkup(<Renderer {...props} />);
        const selected = renderToStaticMarkup(<Renderer {...props} selected />);
        for (const html of [normal, selected]) {
          expect(html).toContain(`data-relationship="${kind}"`);
          expect(html).toContain(`stroke="${p.color}"`);
          expect(html).toContain(`aria-label="${p.label}:`);
          expect(html).toContain('stroke="transparent" stroke-width="18"');
          if (name === 'bridge') expect(html).toMatch(/d="M\s*200[, ]140\s*L\s*300[, ]140"/); // endpoints stay at handles, never hidden under card centers
          expect(html.includes('data-double-gap="true"')).toBe(p.double);
          if (p.dash) expect(html).toContain(`stroke-dasharray="${p.dash}"`);
          else expect(html).not.toContain('stroke-dasharray=');
          if (p.start !== 'none') expect(html).toContain(`data-endpoint-symbol="${p.start}"`);
          if (p.end !== 'none') expect(html).toContain(`data-endpoint-symbol="${p.end}"`);
          expect(html).toContain('animation:none');
          expect(html).not.toMatch(/dashdraw|old-wrong-arrow|stroke="red"|communicates/);
          if (kind === 'service-to-service') {
            expect(html).not.toContain('data-endpoint-symbol="triangle"');
            expect(html).toContain('Inferred connectivity');
          }
        }
        expect(selected).toContain(p.label);
      });
    }
  }

  it.each([false, true])('persistent legend shows all four meanings without hovering (dark=%s)', dark => {
    harness.dark = dark;
    const html = renderToStaticMarkup(<RelationshipLegend />);
    expect(html).toContain('aria-label="Relationship legend"');
    for (const kind of RELATIONSHIP_KINDS) expect(html).toContain(relationshipPresentation(kind, dark).label);
    expect(html).toContain('(inferred)');
    expect(html).toContain('dependent → prerequisite');
    expect(html).toContain('Static configuration');
  });

  it('assigns neutral meaning to unknown connections', () => {
    expect(relationshipPresentation(undefined, false)).toMatchObject({ kind: 'unknown', label: 'Connection', start: 'none', end: 'none' });
  });

  const luminance = (color: string) => {
    const channels = color.replace('#', '').match(/../g)!.map(hex => parseInt(hex, 16) / 255)
      .map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };
  it.each(RELATIONSHIP_KINDS)('%s has at least 3:1 graphical contrast on actual canvas/card/legend theme backgrounds', kind => {
    for (const [dark, backgrounds] of [[false, ['#F6F7F9', '#FFFFFF', '#F2F4F8']], [true, ['#0B0E14', '#11151D', '#161B25']]] as const) {
      const foreground = luminance(relationshipPresentation(kind, dark).color);
      for (const background of backgrounds) {
        const backdrop = luminance(background);
        expect((Math.max(foreground, backdrop) + 0.05) / (Math.min(foreground, backdrop) + 0.05)).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('keeps relationship cues distinct when hue is unavailable', () => {
    const grayscaleCues = RELATIONSHIP_KINDS.map(kind => {
      const p = relationshipPresentation(kind, false);
      return [p.dash ?? 'solid', p.double, p.start, p.end].join('|');
    });
    expect(new Set(grayscaleCues).size).toBe(4);
  });
});
