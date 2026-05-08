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
    <div
      className={`${visible ? 'w-[320px] min-w-[320px]' : 'w-0 min-w-0'} flex flex-col overflow-hidden transition-[width,min-width] duration-[250ms] ease-in-out shrink-0`}
    >
      {visible && (
        <>
          {/* Header */}
          <div className="px-4 py-3.5 flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-[10px] shrink-0 grid place-items-center overflow-hidden"
              style={{ background: `${T.cyan}1F`, border: `1px solid ${T.cyan}44` }}
            >
              {service && <img src={getIconUrl(service.image.name)} className="w-[22px] h-[22px] object-contain" />}
              {isVolume && <img src={VOLUME_ICON} className="w-5 h-5 object-contain opacity-80" />}
              {isNetwork && <Text className="text-base" style={{ color: T.violet }}>⌗</Text>}
            </div>

            <div className="flex-1 min-w-0">
              <Text strong ellipsis className="text-sm block">{selectedNodeId}</Text>
              {service && (
                <Text type="secondary" className="text-[11px] font-mono">
                  {service.image.name}:{service.image.tag}
                </Text>
              )}
              {isNetwork && <Text type="secondary" className="text-[11px]">Network</Text>}
              {isVolume  && <Text type="secondary" className="text-[11px]">Volume</Text>}
            </div>

            <Space size={4}>
              {service && <Badge status="success" text={<Text className="text-[10px]">running</Text>} />}
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
              className="flex-1 overflow-hidden flex flex-col"
              tabBarStyle={{ margin: 0, padding: '0 12px' }}
              items={tabItems}
            />
          ) : (
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-[18px]">
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
    <div className="p-4 flex flex-col gap-4 overflow-y-auto h-full">
      {/* Ports */}
      {service.ports?.length > 0 && (
        <Section label="PORTS">
          <Space wrap size={4}>
            {service.ports.map((p: any, i: number) => (
              <Tag key={i} className="font-mono text-[11px]">{p.internal}:{p.external}</Tag>
            ))}
          </Space>
        </Section>
      )}

      {/* Depends On */}
      {service.dependsOn?.length > 0 && (
        <Section label="DEPENDS ON">
          {service.dependsOn.map((dep: string) => (
            <div key={dep} className="flex items-center gap-2 px-2 py-1.5 rounded-[7px] bg-[var(--ant-color-fill-quaternary)] mb-1.5">
              <Text style={{ color: T.rose }}>↳</Text>
              <Text className="text-xs font-mono">{dep}</Text>
              <div className="flex-1" />
              <Tag color="red" style={{ fontSize: 10, margin: 0 }}>service_started</Tag>
            </div>
          ))}
        </Section>
      )}

      {/* Networks */}
      {service.networks?.length > 0 && (
        <Section label="NETWORKS">
          {service.networks.map((net: string) => (
            <div key={net} className="flex items-center gap-2 px-2 py-1.5 rounded-[7px] bg-[var(--ant-color-fill-quaternary)] mb-1.5">
              <span className="w-2 h-2 rounded-[3px] shrink-0" style={{ background: T.violet }} />
              <Text className="text-xs">{net}</Text>
            </div>
          ))}
        </Section>
      )}

      {/* Connected nodes */}
      {connectedNodeIds.length > 0 && (
        <Section label="CONNECTED">
          <Space wrap size={4}>
            {connectedNodeIds.map(id => (
              <Tag key={id} color="cyan" className="font-mono text-[11px]">{id}</Tag>
            ))}
          </Space>
        </Section>
      )}

      {/* Image */}
      <Section label="IMAGE">
        <Tag className="font-mono text-[11px]">{service.image.name}:{service.image.tag}</Tag>
      </Section>
    </div>
  );
}

function EnvTab({ rawService }: { rawService: any }) {
  const env = rawService.environment;
  if (!env) return <Empty description="No environment variables defined" image={Empty.PRESENTED_IMAGE_SIMPLE} className="p-6" />;
  const entries: string[] = Array.isArray(env) ? env : Object.entries(env).map(([k, v]) => `${k}=${v}`);
  return (
    <div className="p-4 flex flex-col gap-1 overflow-y-auto h-full">
      {entries.map((entry, i) => {
        const eqIdx = entry.indexOf('=');
        const key   = eqIdx === -1 ? entry : entry.slice(0, eqIdx);
        const val   = eqIdx === -1 ? '' : entry.slice(eqIdx + 1);
        return (
          <div key={i} className="flex items-start gap-2 px-2 py-[5px] rounded-md bg-[var(--ant-color-fill-quaternary)]">
            <Text className="text-[11px] font-mono shrink-0" style={{ color: T.cyan }}>{key}</Text>
            {val && <Text type="secondary" className="text-[11px] font-mono break-all">{val}</Text>}
          </div>
        );
      })}
    </div>
  );
}

function VolumesTab({ service }: { service: any }) {
  if (!service.volumes?.length) return <Empty description="No volume mounts" image={Empty.PRESENTED_IMAGE_SIMPLE} className="p-6" />;
  return (
    <div className="p-4 flex flex-col gap-1.5 overflow-y-auto h-full">
      {service.volumes.map((v: any, i: number) => (
        <div key={i} className="px-2.5 py-2 rounded-lg bg-[var(--ant-color-fill-quaternary)]" style={{ border: `1px solid ${T.amber}33` }}>
          <Text className="text-[11.5px] font-mono block" style={{ color: T.amber }}>{v.external}</Text>
          <Text type="secondary" className="text-[10.5px] font-mono block mt-0.5">→ {v.internal}</Text>
        </div>
      ))}
    </div>
  );
}

function RawTab({ name, rawService }: { name: string; rawService: any }) {
  const yaml = toYamlLike(name, rawService);
  return (
    <div className="p-4 h-full overflow-y-auto">
      <pre className="m-0 p-3 rounded-lg bg-[var(--ant-color-bg-container)] border border-[var(--ant-color-border)] text-[10.5px] leading-[1.7] font-mono overflow-auto whitespace-pre-wrap">
        {yaml}
      </pre>
    </div>
  );
}

function NetworkView({ name, astObject }: { name: string; astObject: any }) {
  const net = astObject?.networks?.find((n: any) => n.name === name);
  const attachedServices = astObject?.services?.filter((s: any) => s.networks?.includes(name)) ?? [];
  return (
    <>
      <Section label="NETWORK">
        <div className="px-2.5 py-2 rounded-lg bg-[var(--ant-color-fill-quaternary)]" style={{ border: `1px solid ${T.violet}33` }}>
          <Text strong className="text-xs block" style={{ color: T.violet }}>{name}</Text>
          <Text type="secondary" className="text-[11px] font-mono block mt-0.5">
            driver: {(net as any)?.driver ?? 'bridge'}
          </Text>
        </div>
      </Section>
      {attachedServices.length > 0 && (
        <Section label={`ATTACHED SERVICES · ${attachedServices.length}`}>
          {attachedServices.map((s: any) => (
            <div key={s.name} className="flex items-center gap-2 px-2 py-1.5 rounded-[7px] bg-[var(--ant-color-fill-quaternary)] mb-1.5">
              <img src={getIconUrl(s.image.name)} className="w-3.5 h-3.5 object-contain" />
              <Text className="text-xs">{s.name}</Text>
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
      <div className="px-2.5 py-2 rounded-lg bg-[var(--ant-color-fill-quaternary)]" style={{ border: `1px solid ${T.amber}33` }}>
        <Text strong className="text-xs font-mono block" style={{ color: T.amber }}>{name}</Text>
        <Text type="secondary" className="text-[11px] block mt-0.5">Named volume</Text>
      </div>
    </Section>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Text type="secondary" className="text-[10.5px] font-bold tracking-[1.2px] block mb-2 uppercase">
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
