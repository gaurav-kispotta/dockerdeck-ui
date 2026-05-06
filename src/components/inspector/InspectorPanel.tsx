import { useState, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '../../hooks/useReduxHooks';
import { clearSelection } from '../../store/slices/selectionSlice';
import { T, themed } from '../../styles/tokens';
import { getIconUrl, VOLUME_ICON } from '../../utils/nodeIcons';

type Tab = 'overview' | 'env' | 'volumes' | 'raw';

export default function InspectorPanel() {
  const isDark = useAppSelector((s) => s.theme.isDark);
  const th = themed(isDark);
  const { selectedNodeId, connectedNodeIds } = useAppSelector((s) => s.selection);
  const { yamlObject, astObject } = useAppSelector((s) => s.uploadedFile);
  const dispatch = useAppDispatch();
  const [tab, setTab] = useState<Tab>('overview');

  const service = useMemo(() => {
    if (!selectedNodeId || !astObject?.services) return null;
    return astObject.services.find(s => s.name === selectedNodeId) ?? null;
  }, [selectedNodeId, astObject]);

  const rawService: Record<string, any> = useMemo(() => {
    if (!selectedNodeId || !yamlObject?.services) return {};
    return (yamlObject.services as any)[selectedNodeId] ?? {};
  }, [selectedNodeId, yamlObject]);

  const isNetwork = useMemo(() => {
    if (!selectedNodeId || !astObject?.networks) return false;
    return astObject.networks.some(n => n.name === selectedNodeId);
  }, [selectedNodeId, astObject]);

  const isVolume = useMemo(() => {
    if (!selectedNodeId || !astObject?.volumes) return false;
    return astObject.volumes.some(v => v.name === selectedNodeId);
  }, [selectedNodeId, astObject]);

  const visible = !!selectedNodeId;

  return (
    <div style={{
      width: visible ? 320 : 0,
      minWidth: visible ? 320 : 0,
      background: th.bg1,
      borderLeft: `1px solid ${th.line}`,
      display: 'flex', flexDirection: 'column',
      fontFamily: 'Inter, system-ui, sans-serif',
      overflow: 'hidden',
      transition: 'width 0.25s ease, min-width 0.25s ease',
      flexShrink: 0,
    }}>
      {visible && (
        <>
          {/* Header */}
          <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${th.line}` }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: `${T.cyan}1F`, border: `1px solid ${T.cyan}44`,
              display: 'grid', placeItems: 'center', overflow: 'hidden',
            }}>
              {service && (
                <img src={getIconUrl(service.image.name)} style={{ width: 22, height: 22, objectFit: 'contain' }} />
              )}
              {isVolume && (
                <img src={VOLUME_ICON} style={{ width: 20, height: 20, objectFit: 'contain', opacity: 0.8 }} />
              )}
              {isNetwork && (
                <span style={{ color: T.violet, fontSize: 16 }}>⌗</span>
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: th.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selectedNodeId}
              </div>
              {service && (
                <div style={{ fontSize: 11, color: th.textFaint, fontFamily: 'ui-monospace,Menlo,monospace' }}>
                  {service.image.name}:{service.image.tag}
                </div>
              )}
              {isNetwork && <div style={{ fontSize: 11, color: th.textFaint }}>Network</div>}
              {isVolume  && <div style={{ fontSize: 11, color: th.textFaint }}>Volume</div>}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {service && (
                <StatusPill color={T.green}>● running</StatusPill>
              )}
              <button
                onClick={() => dispatch(clearSelection())}
                style={{ background: 'transparent', border: 'none', color: th.textDim, cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 2 }}
                title="Close inspector"
              >×</button>
            </div>
          </div>

          {/* Tabs */}
          {service && (
            <div style={{ display: 'flex', gap: 4, padding: '8px 12px', borderBottom: `1px solid ${th.line}` }}>
              {(['overview', 'env', 'volumes', 'raw'] as Tab[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    padding: '5px 10px', borderRadius: 7, fontSize: 11.5,
                    background: tab === t ? th.bg3 : 'transparent',
                    color: tab === t ? th.text : th.textDim,
                    border: `1px solid ${tab === t ? th.line : 'transparent'}`,
                    cursor: 'pointer', textTransform: 'capitalize',
                    transition: 'background 0.15s, color 0.15s',
                  }}
                >{t}</button>
              ))}
            </div>
          )}

          {/* Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 18 }}>
            {service && tab === 'overview' && (
              <OverviewTab service={service} rawService={rawService} connectedNodeIds={connectedNodeIds} isDark={isDark} />
            )}
            {service && tab === 'env' && (
              <EnvTab rawService={rawService} isDark={isDark} />
            )}
            {service && tab === 'volumes' && (
              <VolumesTab service={service} isDark={isDark} />
            )}
            {service && tab === 'raw' && (
              <RawTab name={selectedNodeId!} rawService={rawService} isDark={isDark} />
            )}
            {isNetwork && (
              <NetworkView name={selectedNodeId!} astObject={astObject} isDark={isDark} />
            )}
            {isVolume && !service && (
              <VolumeView name={selectedNodeId!} isDark={isDark} />
            )}
          </div>
        </>
      )}
    </div>
  );
}

function OverviewTab({ service, rawService, connectedNodeIds, isDark }: { service: any; rawService: any; connectedNodeIds: string[]; isDark: boolean }) {
  const th = themed(isDark);
  return (
    <>
      {/* Ports */}
      {service.ports?.length > 0 && (
        <Section label="PORTS" isDark={isDark}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {service.ports.map((p: any, i: number) => (
              <MonoPill key={i}>{p.internal}:{p.external}</MonoPill>
            ))}
          </div>
        </Section>
      )}

      {/* Depends On */}
      {service.dependsOn?.length > 0 && (
        <Section label="DEPENDS ON" isDark={isDark}>
          {service.dependsOn.map((dep: string) => (
            <div key={dep} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 8px', borderRadius: 7,
              background: th.bg2, marginBottom: 6,
            }}>
              <span style={{ color: T.rose }}>↳</span>
              <span style={{ fontSize: 12, fontFamily: 'ui-monospace,Menlo,monospace', color: th.text }}>{dep}</span>
              <div style={{ flex: 1 }} />
              <StatusPill color={T.rose}>service_started</StatusPill>
            </div>
          ))}
        </Section>
      )}

      {/* Networks */}
      {service.networks?.length > 0 && (
        <Section label="NETWORKS" isDark={isDark}>
          {service.networks.map((net: string) => (
            <div key={net} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 8px', borderRadius: 7,
              background: th.bg2, marginBottom: 6,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: 3, background: T.violet, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: th.text }}>{net}</span>
            </div>
          ))}
        </Section>
      )}

      {/* Connected nodes */}
      {connectedNodeIds.length > 0 && (
        <Section label="CONNECTED" isDark={isDark}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {connectedNodeIds.map(id => (
              <MonoPill key={id} color={T.cyan}>{id}</MonoPill>
            ))}
          </div>
        </Section>
      )}

      {/* Image info */}
      <Section label="IMAGE" isDark={isDark}>
        <MonoPill>{service.image.name}:{service.image.tag}</MonoPill>
      </Section>
    </>
  );
}

function EnvTab({ rawService, isDark }: { rawService: any; isDark: boolean }) {
  const th = themed(isDark);
  const env = rawService.environment;
  if (!env) return <EmptyState label="No environment variables defined" isDark={isDark} />;
  const entries: string[] = Array.isArray(env) ? env : Object.entries(env).map(([k, v]) => `${k}=${v}`);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {entries.map((entry, i) => {
        const eqIdx = entry.indexOf('=');
        const key   = eqIdx === -1 ? entry : entry.slice(0, eqIdx);
        const val   = eqIdx === -1 ? '' : entry.slice(eqIdx + 1);
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 8,
            padding: '5px 8px', borderRadius: 6, background: th.bg2,
          }}>
            <span style={{ fontSize: 11, fontFamily: 'ui-monospace,Menlo,monospace', color: T.cyan, minWidth: 0, flex: '0 0 auto' }}>{key}</span>
            {val && <span style={{ fontSize: 11, fontFamily: 'ui-monospace,Menlo,monospace', color: th.textDim, wordBreak: 'break-all' }}>{val}</span>}
          </div>
        );
      })}
    </div>
  );
}

function VolumesTab({ service, isDark }: { service: any; isDark: boolean }) {
  const th = themed(isDark);
  if (!service.volumes?.length) return <EmptyState label="No volume mounts" isDark={isDark} />;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {service.volumes.map((v: any, i: number) => (
        <div key={i} style={{ padding: '8px 10px', borderRadius: 8, background: th.bg2, border: `1px solid ${T.amber}33` }}>
          <div style={{ fontSize: 11.5, fontFamily: 'ui-monospace,Menlo,monospace', color: T.amber }}>{v.external}</div>
          <div style={{ fontSize: 10.5, fontFamily: 'ui-monospace,Menlo,monospace', color: th.textFaint, marginTop: 2 }}>→ {v.internal}</div>
        </div>
      ))}
    </div>
  );
}

function RawTab({ name, rawService, isDark }: { name: string; rawService: any; isDark: boolean }) {
  const th = themed(isDark);
  const yaml = toYamlLike(name, rawService);
  return (
    <pre style={{
      margin: 0, padding: 12, borderRadius: 8,
      background: themed(isDark).bg0 ?? '#0B0E14',
      border: `1px solid ${th.line}`,
      fontSize: 10.5, lineHeight: 1.7,
      fontFamily: 'ui-monospace,Menlo,monospace',
      color: th.textDim, overflow: 'auto', whiteSpace: 'pre-wrap',
    }}>{yaml}</pre>
  );
}

function NetworkView({ name, astObject, isDark }: { name: string; astObject: any; isDark: boolean }) {
  const th = themed(isDark);
  const net = astObject?.networks?.find((n: any) => n.name === name);
  const attachedServices = astObject?.services?.filter((s: any) => s.networks?.includes(name)) ?? [];
  return (
    <>
      <Section label="NETWORK" isDark={isDark}>
        <div style={{ padding: '8px 10px', borderRadius: 8, background: th.bg2, border: `1px solid ${T.violet}33` }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.violet }}>{name}</div>
          <div style={{ fontSize: 11, color: th.textFaint, fontFamily: 'ui-monospace,Menlo,monospace', marginTop: 2 }}>
            driver: {(net as any)?.driver ?? 'bridge'}
          </div>
        </div>
      </Section>
      {attachedServices.length > 0 && (
        <Section label={`ATTACHED SERVICES · ${attachedServices.length}`} isDark={isDark}>
          {attachedServices.map((s: any) => (
            <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 7, background: th.bg2, marginBottom: 6 }}>
              <img src={getIconUrl(s.image.name)} style={{ width: 14, height: 14, objectFit: 'contain' }} />
              <span style={{ fontSize: 12, color: th.text }}>{s.name}</span>
            </div>
          ))}
        </Section>
      )}
    </>
  );
}

function VolumeView({ name, isDark }: { name: string; isDark: boolean }) {
  const th = themed(isDark);
  return (
    <Section label="VOLUME" isDark={isDark}>
      <div style={{ padding: '8px 10px', borderRadius: 8, background: th.bg2, border: `1px solid ${T.amber}33` }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: T.amber, fontFamily: 'ui-monospace,Menlo,monospace' }}>{name}</div>
        <div style={{ fontSize: 11, color: th.textFaint, marginTop: 2 }}>Named volume</div>
      </div>
    </Section>
  );
}

function Section({ label, children, isDark }: { label: string; children: React.ReactNode; isDark: boolean }) {
  const th = themed(isDark);
  return (
    <div>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: th.textFaint, letterSpacing: 1.2, marginBottom: 8 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function MonoPill({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 999,
      border: `1px solid ${color ?? '#222A38'}`,
      background: color ? `${color}11` : 'transparent',
      color: color ?? '#8A93A6',
      fontFamily: 'ui-monospace,Menlo,monospace',
      fontSize: 11, lineHeight: 1.4,
    }}>{children}</span>
  );
}

function StatusPill({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 999,
      border: `1px solid ${color}55`, background: `${color}11`,
      color, fontSize: 10, lineHeight: 1.4, whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

function EmptyState({ label, isDark }: { label: string; isDark: boolean }) {
  const th = themed(isDark);
  return <div style={{ color: th.textFaint, fontSize: 12, textAlign: 'center', padding: '20px 0' }}>{label}</div>;
}

function toYamlLike(name: string, obj: Record<string, any>, indent = 0): string {
  if (!obj || typeof obj !== 'object') return String(obj ?? '');
  const pad = '  '.repeat(indent);
  let out = indent === 0 ? `${name}:\n` : '';
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined) continue;
    if (Array.isArray(v)) {
      out += `${pad}  ${k}:\n`;
      v.forEach(item => { out += `${pad}    - ${typeof item === 'object' ? JSON.stringify(item) : item}\n`; });
    } else if (typeof v === 'object') {
      out += `${pad}  ${k}:\n`;
      out += toYamlLike('', v, indent + 2);
    } else {
      out += `${pad}  ${k}: ${v}\n`;
    }
  }
  return out;
}
