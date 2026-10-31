import { useId } from 'react';
import { useAppSelector } from '../../hooks/useReduxHooks';
import { RELATIONSHIP_KINDS, relationshipPresentation } from '../../utils/relationshipPresentation';
import { RelationshipStroke } from './edges/RelationshipTrace';
import { T } from '../../styles/tokens';

export default function RelationshipLegend() {
  const dark = useAppSelector(s => s.theme.isDark);
  const prefix = `legend-${useId().replace(/:/g, '')}`;
  const background = dark ? T.bg1 : T.lbg1;
  return <aside aria-label="Relationship legend" style={{ padding: '7px 12px', flexShrink: 0, background,
      borderTop: `1px solid ${dark ? T.line : T.lline}`, color: dark ? T.text : '#0B0E14', fontSize: 11 }}>
      <div style={{ fontWeight: 600, marginBottom: 5 }}>Compose relationships</div>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: '5px 18px' }}>
        {RELATIONSHIP_KINDS.map(kind => {
          const p = relationshipPresentation(kind, dark);
          return <li key={kind} title={p.description} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <svg width="48" height="16" viewBox="0 0 48 16" aria-hidden="true">
              <RelationshipStroke path="M 7 8 L 41 8" prefix={`${prefix}-${kind}`} presentation={p} background={background} />
            </svg>
            <span>{p.label}{kind === 'service-to-service' ? ' (inferred)' : ''}</span>
          </li>;
        })}
      </ul>
      <div style={{ fontSize: 10, marginTop: 6 }}>Arrow: dependent → prerequisite · Static configuration</div>
    </aside>;
}
