import { useAppSelector } from '../../../../hooks/useReduxHooks';
import { T } from '../../../../styles/tokens';
import BaseNode, { BaseNodeProps } from '../../BaseNode';

export default function PortsNode(props: BaseNodeProps) {
  const isDark    = useAppSelector((s) => s.theme.isDark);
  const astObject = useAppSelector((s) => s.uploadedFile.astObject);
  const ports     = astObject?.services?.find((s) => s.name === props.dockerServiceId)?.ports ?? [];

  return (
    <BaseNode {...props}>
      {ports.length > 0 ? (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 7, position: 'relative' }}>
          {ports.slice(0, 4).map((p, i) => (
            <span key={i} style={{
              fontSize: 9.5, padding: '1px 6px', borderRadius: 4,
              background: `${T.green}18`, color: T.green,
              border: `1px solid ${T.green}44`,
              fontFamily: 'ui-monospace,Menlo,monospace', lineHeight: 1.6,
            }}>
              {p.external}:{p.internal}
            </span>
          ))}
          {ports.length > 4 && (
            <span style={{ fontSize: 9.5, color: isDark ? T.textFaint : '#8A93A6', lineHeight: 1.8 }}>
              +{ports.length - 4}
            </span>
          )}
        </div>
      ) : (
        <div style={{
          marginTop: 6, fontSize: 9.5, color: isDark ? T.textFaint : '#A8B0BF',
          fontFamily: 'Inter, system-ui, sans-serif', fontStyle: 'italic', position: 'relative',
        }}>no exposed ports</div>
      )}
    </BaseNode>
  );
}
