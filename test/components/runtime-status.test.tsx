import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { parse } from 'yaml';
import { RuntimeStatus, type RuntimeObservation } from '../../src/components/runtime/RuntimeStatus';
import { DockerComposeAstBuilder } from '../../src/modules/ast/DockerComposeAstBuilder';
import InspectorPanel from '../../src/components/inspector/InspectorPanel';
import OutlinePanel from '../../src/components/outline/OutlinePanel';
import BaseNode from '../../src/components/nodes/BaseNode';
import type { RootState } from '../../src/store/store';

type RuntimeHarnessState = {
  theme: Pick<RootState['theme'], 'isDark'>;
  uploadedFile: Pick<RootState['uploadedFile'], 'yamlObject' | 'astObject'>;
  selection: Pick<RootState['selection'], 'selectedNodeId' | 'connectedNodeIds'>;
  settings: Pick<RootState['settings'], 'debugMode'>;
  dockerdeck: Pick<RootState['dockerdeck'], 'edges'>;
};

const { context } = vi.hoisted(() => ({ context: { state: undefined as RuntimeHarnessState | undefined } }));
vi.mock('../../src/hooks/useReduxHooks', () => ({
  useAppSelector: (selector: (state: RuntimeHarnessState) => unknown) => {
    if (!context.state) throw new Error('Initialize the runtime component harness before rendering.');
    return selector(context.state);
  },
  useAppDispatch: () => vi.fn(),
}));
// Handles need a browser canvas context; the service node itself is rendered normally.
vi.mock('@xyflow/react', () => ({
  Handle: () => null,
  Position: { Top: 'top', Right: 'right', Bottom: 'bottom', Left: 'left' },
}));

describe('runtime presentation', () => {
  it('renders neutral unknown with a connection explanation by default', () => {
    const html = renderToStaticMarkup(<RuntimeStatus />);
    expect(html).toContain('data-runtime-state="unknown"');
    expect(html).toContain('engine not connected');
    expect(html).toContain('>Unknown<');
    expect(html).not.toMatch(/Running|Healthy/);
  });

  it.each(['running', 'healthy', 'stopped', 'unhealthy', 'unknown'] as const)(
    'renders an observed %s with provenance and time', state => {
      const observation: RuntimeObservation = { state, source: 'engine:test', observedAt: '2026-10-26T10:00:00Z' };
      const html = renderToStaticMarkup(<RuntimeStatus observation={observation} />);
      expect(html).toContain(`data-runtime-state="${state}"`);
      expect(html).toContain('observed by engine:test at 2026-10-26T10:00:00Z');
    },
  );

  it.each([
    { source: '', observedAt: '2026-10-26T10:00:00Z' },
    { source: 'engine:test', observedAt: '' },
    { source: 'engine:test', observedAt: 'invalid' },
    { source: 'engine:test', observedAt: '2026-10-26T10:00:00' },
  ])('does not claim running without valid source and zoned observation time: %j', metadata => {
    const html = renderToStaticMarkup(<RuntimeStatus observation={{ state: 'running', ...metadata }} />);
    expect(html).toContain('data-runtime-state="unknown"');
    expect(html).not.toContain('>Running<');
  });

  it.each(['', '    healthcheck:\n      test: [CMD, "true"]\n', '    healthcheck:\n      disable: true\n'])(
    'keeps static Compose unknown in inspector, outline and node (healthcheck: %s)', healthcheck => {
      const yamlObject = parse(`services:\n  web:\n    image: nginx:latest\n${healthcheck}`);
      const astObject = new DockerComposeAstBuilder(yamlObject).buildAst();
      context.state = {
        theme: { isDark: false },
        uploadedFile: { yamlObject, astObject },
        selection: { selectedNodeId: 'web', connectedNodeIds: [] },
        settings: { debugMode: false },
        dockerdeck: { edges: [] },
      };
      const inspector = renderToStaticMarkup(<InspectorPanel />);
      for (const html of [inspector, renderToStaticMarkup(<OutlinePanel />), renderToStaticMarkup(<BaseNode dockerServiceId="web" dockerImageName="nginx" />)]) {
        expect(html).toContain('data-runtime-state="unknown"');
        expect(html).toContain('engine not connected');
        expect(html).not.toContain('data-runtime-state="running"');
        expect(html).not.toContain('data-runtime-state="healthy"');
      }
      if (healthcheck) {
        expect(inspector).toContain('HEALTHCHECK CONFIGURATION');
        expect(inspector).toContain(healthcheck.includes('disable: true') ? 'Disabled in Compose configuration.' : 'no health result has been observed.');
      } else {
        expect(inspector).not.toContain('HEALTHCHECK CONFIGURATION');
      }
      expect(renderToStaticMarkup(<BaseNode dockerServiceId="network" dockerImageName="" nodeType="network" />)).not.toContain('data-runtime-state');
    },
  );
});
