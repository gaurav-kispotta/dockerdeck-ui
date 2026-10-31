import { createContext, useContext, useMemo, useState, useEffect, type ReactNode } from 'react';
import { useStore } from '@xyflow/react';
import { buildRoutingFrame, emptyRoutingFrame, type NodeBounds, type RoutingEdge, type RoutingFrame } from '../../utils/pcbRouter';

const RoutingContext = createContext<RoutingFrame>(emptyRoutingFrame());
const RoutingWriter = createContext<(frame: RoutingFrame) => void>(() => {});
export const useRoutingFrame = () => useContext(RoutingContext);

export function RoutingProvider({ children }: { children: ReactNode }) {
  const [frame, setFrame] = useState(emptyRoutingFrame);
  return <RoutingWriter.Provider value={setFrame}><RoutingContext.Provider value={frame}>{children}</RoutingContext.Provider></RoutingWriter.Provider>;
}

/** Read actual rendered card boundaries from the four permanent source handles. */
function renderedBounds(node: any): NodeBounds {
  const handles = node.internals.handleBounds?.source ?? [];
  const at = (id: string, axis: 'x' | 'y') => {
    const handle = handles.find((h: any) => h.id === id);
    return handle ? handle[axis] + handle[axis === 'x' ? 'width' : 'height'] / 2 : undefined;
  };
  const left = at('d', 'x') ?? 0, right = at('b', 'x') ?? node.measured?.width ?? node.width ?? 200;
  const top = at('a', 'y') ?? 0, bottom = at('c', 'y') ?? node.measured?.height ?? node.height ?? 80;
  return { id: node.id, x: node.internals.positionAbsolute.x + left, y: node.internals.positionAbsolute.y + top,
    width: right - left, height: bottom - top };
}

/** One route/crossing computation per changed canvas geometry, independent of selection/zoom. */
export function RouteComputer() {
  const setFrame = useContext(RoutingWriter);
  const signature = useStore(state => JSON.stringify({
    bounds: [...state.nodeLookup.values()].filter(n => ['service', 'network', 'volume'].includes(String(n.data?.nodeType)))
      .map(renderedBounds).sort((a, b) => a.id.localeCompare(b.id)),
    edges: state.edges.map(({ id, source, target }) => ({ id, source, target })).sort((a, b) => a.id.localeCompare(b.id)),
  }));
  const frame = useMemo(() => {
    const input = JSON.parse(signature) as { bounds: NodeBounds[]; edges: RoutingEdge[] };
    return buildRoutingFrame(input.bounds, input.edges);
  }, [signature]);
  useEffect(() => { setFrame(frame); }, [frame, setFrame]);
  return null;
}
