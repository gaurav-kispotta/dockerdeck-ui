import { useAppDispatch, useAppSelector } from '../../hooks/useReduxHooks';
import { clearSelection } from '../../store/slices/selectionSlice';
import { parseResourceId } from '../../utils/resourceIdentity';
import { relationshipPresentation } from '../../utils/relationshipPresentation';
import { useRoutingFrame } from './RoutingContext';
import { T } from '../../styles/tokens';

export default function ConnectionDetails() {
  const id = useAppSelector(s => s.selection.selectedEdgeId);
  const edge = useAppSelector(s => s.dockerdeck.edges.find(e => e.id === id));
  const dark = useAppSelector(s => s.theme.isDark);
  const dispatch = useAppDispatch();
  const frame = useRoutingFrame();
  if (!edge) return null;
  const presentation = relationshipPresentation(edge.data?.connectionType, dark);
  const source = parseResourceId(edge.source)?.name ?? edge.source, target = parseResourceId(edge.target)?.name ?? edge.target;
  const details = edge.data?.connectionType === 'service-to-service' ? `Networks: ${(edge.data.sharedNetworks as string[] ?? []).join(', ')}` :
    edge.data?.connectionType === 'volume' ? `Mount: ${String(edge.data.internalPath ?? '')}` : presentation.description;
  return <section aria-label="Connection details" style={{ flexShrink: 0, padding: '7px 12px', background: dark ? T.bg1 : T.lbg1,
    borderTop: `1px solid ${presentation.color}`, color: dark ? T.text : '#0B0E14', fontSize: 12, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
    <strong>{presentation.label}</strong>
    <span>{source} {edge.data?.connectionType === 'service-to-service' ? '↔' : '→'} {target}</span>
    <span>{details}</span>
    {frame.routes.get(edge.id)?.blocked && <span role="status">No clear route: separate overlapping cards.</span>}
    <button type="button" onClick={() => dispatch(clearSelection())} aria-label="Clear connection selection" style={{ marginLeft: 'auto' }}>Clear · Esc</button>
  </section>;
}
