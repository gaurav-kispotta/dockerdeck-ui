import { useMemo } from 'react';
import { Tabs, Tag, Button, Typography, Empty, Space, Divider, Badge } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../../hooks/useReduxHooks';
import { clearSelection } from '../../store/slices/selectionSlice';
import { T } from '../../styles/tokens';
import { getIconUrl, VOLUME_ICON } from '../../utils/nodeIcons';

const { Text, Title } = Typography;

export default function InspectorPanel() {
  const { selectedNodeId, connectedNodeIds } = useAppSelector((s) => s.selection);
  const { yamlObject, astObject } = useAppSelector((s) => s.uploadedFile);
  const dispatch = useAppDispatch();

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

  const tabItems = service ? [
    {
      key: 'overview',
      label: 'Overview',
      children: <OverviewTab service={service} rawService={rawService} connectedNodeIds={connectedNodeIds} />,
    },
    {
      key: 'env',
      label: 'Env',
      children: <EnvTab rawService={rawService} />,
    },
    {
      key: 'volumes',
      label: 'Volumes',
      children: <VolumesTab service={service} />,
    },
    {
      key: 'raw',
      label: 'Raw',
      children: <RawTab name={selectedNodeId!} rawService={rawService} />,
    },
  ] : [];

  return (
    <div style={{
      width: visible ? 320 : 0,
      minWidth: visible ? 320 : 0,
      borderLeft: '1px solid var(--ant-color-border)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      transition: 'width 0.25s ease, min-width 0.25s ease',
      flexShrink: 0,
    }}>
      {visible && (
        <>
          {/* Header */}
          <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--ant-color-border)' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: `${T.cyan}1F`, border: `1px solid ${T.cyan}44`,
              display: 'grid', placeItems: 'center', overflow: 'hidden',
            }}>
              {service && <img src={getIconUrl(service.image.name)} style={{ width: 22, height: 22, objectFit: 'contain' }} />}
              {isVolume && <img src={VOLUME_ICON} style={{ width: 20, height: 20, objectFit: 'contain', opacity: 0.8 }} />}
              {isNetwork && <Text style={{ color: T.violet, fontSize: 16 }}>⌗</Text>}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <Text strong ellipsis style={{ fontSize: 14, display: 'block' }}>{selectedNodeId}</Text>
              {service && (
                <Text type="secondary" style={{ fontSize: 11, fontFamily: 'ui-monospace,Menlo,monospace' }}>
                  {service.image.name}:{service.image.tag}
                </Text>
              )}
              {isNetwork && <Text type="secondary" style={{ fontSize: 11 }}>Network</Text>}
              {isVolume  && <Text type="secondary" style={{ fontSize: 11 }}>Volume</Text>}
            </div>

            <Space size={4}>
              {service && <Badge status="success" text={<Text style={{ fontSize: 10 }}>running</Text>} />}
              <Button
                type="text"
                size="small"
                icon={<CloseOutlined />}
                onClick={() => dispatch(clearSelection())}
                title="Close inspector"
              />
            </Space>
          </div>

          {/* Tabs (services only) or plain body */}
          {service ? (
            <Tabs
              defaultActiveKey="overview"
              size="small"
              style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
              tabBarStyle={{ margin: 0, padding: '0 12px' }}
              items={tabItems}
            />
          ) : (
            <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 18 }}>
              {isNetwork && <NetworkView name={selectedNodeId!} astObject={astObject} />}
              {isVolume && !service && <VolumeView name={selectedNodeId!} />}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function OverviewTab({ service, rawService, connectedNodeIds }: { service: any; rawService: any; connectedNodeIds: string[] }) {
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', height: '100%' }}>
      {/* Ports */}
      {service.ports?.length > 0 && (
        <Section label="PORTS">
          <Space wrap size={4}>
            {service.ports.map((p: any, i: number) => (
              <Tag key={i} style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11 }}>{p.internal}:{p.external}</Tag>
            ))}
          </Space>
        </Section>
      )}

      {/* Depends On */}
      {service.dependsOn?.length > 0 && (
        <Section label="DEPENDS ON">
          {service.dependsOn.map((dep: string) => (
            <div key={dep} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 7, background: 'var(--ant-color-fill-quaternary)', marginBottom: 6 }}>
              <Text style={{ color: T.rose }}>↳</Text>
              <Text style={{ fontSize: 12, fontFamily: 'ui-monospace,Menlo,monospace' }}>{dep}</Text>
              <div style={{ flex: 1 }} />
              <Tag color="red" style={{ fontSize: 10, margin: 0 }}>service_started</Tag>
            </div>
          ))}
        </Section>
      )}

      {/* Networks */}
      {service.networks?.length > 0 && (
        <Section label="NETWORKS">
          {service.networks.map((net: string) => (
            <div key={net} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 7, background: 'var(--ant-color-fill-quaternary)', marginBottom: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 3, background: T.violet, flexShrink: 0 }} />
              <Text style={{ fontSize: 12 }}>{net}</Text>
            </div>
          ))}
        </Section>
      )}

      {/* Connected nodes */}
      {connectedNodeIds.length > 0 && (
        <Section label="CONNECTED">
          <Space wrap size={4}>
            {connectedNodeIds.map(id => (
              <Tag key={id} color="cyan" style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11 }}>{id}</Tag>
            ))}
          </Space>
        </Section>
      )}

      {/* Image */}
      <Section label="IMAGE">
        <Tag style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11 }}>{service.image.name}:{service.image.tag}</Tag>
      </Section>
    </div>
  );
}

function EnvTab({ rawService }: { rawService: any }) {
  const env = rawService.environment;
  if (!env) return <Empty description="No environment variables defined" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: 24 }} />;
  const entries: string[] = Array.isArray(env) ? env : Object.entries(env).map(([k, v]) => `${k}=${v}`);
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto', height: '100%' }}>
      {entries.map((entry, i) => {
        const eqIdx = entry.indexOf('=');
        const key   = eqIdx === -1 ? entry : entry.slice(0, eqIdx);
        const val   = eqIdx === -1 ? '' : entry.slice(eqIdx + 1);
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '5px 8px', borderRadius: 6, background: 'var(--ant-color-fill-quaternary)' }}>
            <Text style={{ fontSize: 11, fontFamily: 'ui-monospace,Menlo,monospace', color: T.cyan, flexShrink: 0 }}>{key}</Text>
            {val && <Text type="secondary" style={{ fontSize: 11, fontFamily: 'ui-monospace,Menlo,monospace', wordBreak: 'break-all' }}>{val}</Text>}
          </div>
        );
      })}
    </div>
  );
}

function VolumesTab({ service }: { service: any }) {
  if (!service.volumes?.length) return <Empty description="No volume mounts" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: 24 }} />;
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto', height: '100%' }}>
      {service.volumes.map((v: any, i: number) => (
        <div key={i} style={{ padding: '8px 10px', borderRadius: 8, background: 'var(--ant-color-fill-quaternary)', border: `1px solid ${T.amber}33` }}>
          <Text style={{ fontSize: 11.5, fontFamily: 'ui-monospace,Menlo,monospace', color: T.amber, display: 'block' }}>{v.external}</Text>
          <Text type="secondary" style={{ fontSize: 10.5, fontFamily: 'ui-monospace,Menlo,monospace', display: 'block', marginTop: 2 }}>→ {v.internal}</Text>
        </div>
      ))}
    </div>
  );
}

function RawTab({ name, rawService }: { name: string; rawService: any }) {
  const yaml = toYamlLike(name, rawService);
  return (
    <div style={{ padding: 16, height: '100%', overflowY: 'auto' }}>
      <pre style={{
        margin: 0, padding: 12, borderRadius: 8,
        background: 'var(--ant-color-bg-container)',
        border: '1px solid var(--ant-color-border)',
        fontSize: 10.5, lineHeight: 1.7,
        fontFamily: 'ui-monospace,Menlo,monospace',
        overflow: 'auto', whiteSpace: 'pre-wrap',
      }}>{yaml}</pre>
    </div>
  );
}

function NetworkView({ name, astObject }: { name: string; astObject: any }) {
  const net = astObject?.networks?.find((n: any) => n.name === name);
  const attachedServices = astObject?.services?.filter((s: any) => s.networks?.includes(name)) ?? [];
  return (
    <>
      <Section label="NETWORK">
        <div style={{ padding: '8px 10px', borderRadius: 8, background: 'var(--ant-color-fill-quaternary)', border: `1px solid ${T.violet}33` }}>
          <Text strong style={{ fontSize: 12, color: T.violet, display: 'block' }}>{name}</Text>
          <Text type="secondary" style={{ fontSize: 11, fontFamily: 'ui-monospace,Menlo,monospace', display: 'block', marginTop: 2 }}>
            driver: {(net as any)?.driver ?? 'bridge'}
          </Text>
        </div>
      </Section>
      {attachedServices.length > 0 && (
        <Section label={`ATTACHED SERVICES · ${attachedServices.length}`}>
          {attachedServices.map((s: any) => (
            <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 7, background: 'var(--ant-color-fill-quaternary)', marginBottom: 6 }}>
              <img src={getIconUrl(s.image.name)} style={{ width: 14, height: 14, objectFit: 'contain' }} />
              <Text style={{ fontSize: 12 }}>{s.name}</Text>
            </div>
          ))}
        </Section>
      )}
    </>
  );
}

function VolumeView({ name }: { name: string }) {
  return (
    <Section label="VOLUME">
      <div style={{ padding: '8px 10px', borderRadius: 8, background: 'var(--ant-color-fill-quaternary)', border: `1px solid ${T.amber}33` }}>
        <Text strong style={{ fontSize: 12, color: T.amber, fontFamily: 'ui-monospace,Menlo,monospace', display: 'block' }}>{name}</Text>
        <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 2 }}>Named volume</Text>
      </div>
    </Section>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Text type="secondary" style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, display: 'block', marginBottom: 8, textTransform: 'uppercase' as const }}>
        {label}
      </Text>
      {children}
    </div>
  );
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

