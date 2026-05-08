import { Modal, Slider, Switch, Select, Divider, Typography, Space, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../hooks/useReduxHooks';
import {
  setPlatformPadding, setNodeLevelPadding, setNodeSize,
  setShowDependencies, setDebugMode, setViewMode, setMapLayout, setEdgeStyle,
  type ViewMode, type MapLayout, type EdgeStyle,
} from '../../store/slices/settingsSlice';

const { Text, Title } = Typography;

const VIEW_MODE_OPTIONS: { label: string; value: ViewMode; description: string }[] = [
  { value: 'architecture', label: 'Architecture',  description: 'All edges, default layout' },
  { value: 'networks',     label: 'Networks',      description: 'Grouped by network' },
  { value: 'ports',        label: 'Ports',         description: 'External access / port mapping' },
  { value: 'volumes',      label: 'Volumes',       description: 'Storage – volume mounts' },
  { value: 'boot-order',   label: 'Boot Order',    description: 'Startup sequence (depends_on)' },
];

const MAP_LAYOUT_OPTIONS: { label: string; value: MapLayout; description: string }[] = [
  { value: 'layered', label: 'Layered',  description: 'Rows: networks → services → volumes' },
  { value: 'dagre',   label: 'Dagre',    description: 'Hierarchical graph layout' },
  { value: 'elk',     label: 'ELK Tree', description: 'Tree layout via ELK.js' },
];

const EDGE_STYLE_OPTIONS: { label: string; value: EdgeStyle; description: string }[] = [
  { value: 'orthogonal', label: 'Orthogonal', description: 'Circuit-board step routing with bridge arcs' },
  { value: 'bridge',     label: 'Bridge',     description: 'Straight lines with bridge arcs at crossings' },
  { value: 'bezier',     label: 'Bezier',     description: 'Classic smooth curved lines' },
  { value: 'smoothstep', label: 'Smooth Step', description: 'Right-angle turns with rounded corners' },
  { value: 'straight',   label: 'Straight',   description: 'Direct straight lines' },
];

function Row({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 32 }}>
      <Space size={4}>
        <Text>{label}</Text>
        {help && (
          <Tooltip title={help}>
            <QuestionCircleOutlined style={{ color: 'var(--ant-color-text-quaternary)', fontSize: 12 }} />
          </Tooltip>
        )}
      </Space>
      {children}
    </div>
  );
}

function SliderRow({ label, help, min, max, value, onChange, unit = 'px' }: {
  label: string; help?: string; min: number; max: number;
  value: number; onChange: (v: number) => void; unit?: string;
}) {
  return (
    <div>
      <Row label={label} help={help}>
        <Text type="secondary" style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 12 }}>
          {value}{unit}
        </Text>
      </Row>
      <Slider min={min} max={max} value={value} onChange={onChange}
        tooltip={{ formatter: (v) => `${v}${unit}` }} style={{ marginTop: 4 }} />
    </div>
  );
}

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const dispatch = useAppDispatch();
  const { platformPadding, nodeLevelPadding, nodeSize, showDependencies, debugMode, viewMode, mapLayout, edgeStyle } =
    useAppSelector((s) => s.settings);

  return (
    <Modal
      open={open}
      title="Settings"
      onCancel={onClose}
      onOk={onClose}
      okText="Done"
      cancelButtonProps={{ style: { display: 'none' } }}
      centered
      width={480}
    >
      <Space direction="vertical" size={0} style={{ width: '100%' }}>

        {/* ── View ─────────────────────────────────────── */}
        <Title level={5} style={{ marginTop: 8, marginBottom: 8 }}>View</Title>

        <Row label="View mode" help="Controls which edges and nodes are emphasised">
          <Select
            size="small"
            value={viewMode}
            onChange={(v) => dispatch(setViewMode(v))}
            style={{ width: 160 }}
            options={VIEW_MODE_OPTIONS.map((o) => ({ label: o.label, value: o.value, title: o.description }))}
          />
        </Row>

        <Row label="Show dependencies" help="Highlight depends_on relationships across services">
          <Switch size="small" checked={showDependencies}
            onChange={(v) => dispatch(setShowDependencies(v))} />
        </Row>

        <Divider style={{ margin: '12px 0' }} />

        {/* ── Layout ───────────────────────────────────── */}
        <Title level={5} style={{ marginBottom: 8 }}>Layout</Title>

        <Row label="Map layout" help="Choose how nodes are positioned on the canvas">
          <Select
            size="small"
            value={mapLayout}
            onChange={(v) => dispatch(setMapLayout(v))}
            style={{ width: 160 }}
            options={MAP_LAYOUT_OPTIONS.map((o) => ({ label: o.label, value: o.value, title: o.description }))}
          />
        </Row>

        <Row label="Edge style" help="Choose how connections between nodes are drawn">
          <Select
            size="small"
            value={edgeStyle}
            onChange={(v) => dispatch(setEdgeStyle(v))}
            style={{ width: 160 }}
            options={EDGE_STYLE_OPTIONS.map((o) => ({ label: o.label, value: o.value, title: o.description }))}
          />
        </Row>

        <SliderRow
          label="Platform padding" help="Outer padding around the entire graph"
          min={10} max={200} value={platformPadding}
          onChange={(v) => dispatch(setPlatformPadding(v))}
        />

        <SliderRow
          label="Node level padding" help="Padding between node groups / ranks"
          min={10} max={150} value={nodeLevelPadding}
          onChange={(v) => dispatch(setNodeLevelPadding(v))}
        />

        <SliderRow
          label="Node size" help="Base size used when calculating node dimensions"
          min={50} max={200} value={nodeSize}
          onChange={(v) => dispatch(setNodeSize(v))}
        />

        <Divider style={{ margin: '12px 0' }} />

        {/* ── Developer ────────────────────────────────── */}
        <Title level={5} style={{ marginBottom: 8 }}>Developer</Title>

        <Row label="Debug mode" help="Show debug overlay and AST inspector">
          <Switch size="small" checked={debugMode}
            onChange={(v) => dispatch(setDebugMode(v))} />
        </Row>

      </Space>
    </Modal>
  );
}
