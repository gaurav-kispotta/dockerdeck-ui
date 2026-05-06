import { useAppSelector, useAppDispatch } from '../../hooks/useReduxHooks';
import { useViewer } from '../../hooks/useReduxHooks';
import { setDebugMode, setShowDependencies } from '../../store/slices/settingsSlice';
import { T, themed } from '../../styles/tokens';

export default function StatusBar() {
  const isDark = useAppSelector((s) => s.theme.isDark);
  const th = themed(isDark);
  const { yamlObject } = useAppSelector((s) => s.uploadedFile);
  const { showDependencies, debugMode } = useAppSelector((s) => s.settings);
  const { isViewerVisible, toggleViewer } = useViewer();
  const dispatch = useAppDispatch();

  const serviceCount = yamlObject?.services ? Object.keys(yamlObject.services).length : 0;
  const networkCount = yamlObject?.networks ? Object.keys(yamlObject.networks).length : 0;
  const volumeCount  = yamlObject?.volumes  ? Object.keys(yamlObject.volumes).length  : 0;

  const firstNetwork = yamlObject?.networks ? Object.keys(yamlObject.networks)[0] : null;

  return (
    <div style={{
      height: 32, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 14,
      background: th.bg1, borderTop: `1px solid ${th.line}`,
      fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11,
      color: th.textDim, flexShrink: 0,
    }}>
      {/* Left — counters */}
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Dot color={T.cyan} /> Networks {networkCount}
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Dot color={T.violet} /> Services {serviceCount}
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Dot color={T.amber} /> Volumes {volumeCount}
      </span>

      <div style={{ flex: 1 }} />

      {/* Controls */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', userSelect: 'none' }}>
        <span style={{ color: showDependencies ? T.rose : th.textDim }}>↳ deps</span>
        <Toggle checked={showDependencies} color={T.rose} onChange={v => dispatch(setShowDependencies(v))} />
      </label>

      <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', userSelect: 'none' }}>
        <span style={{ color: debugMode ? T.amber : th.textDim }}>⬡ debug</span>
        <Toggle checked={debugMode} color={T.amber} onChange={v => dispatch(setDebugMode(v))} />
      </label>

      <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', userSelect: 'none' }}>
        <span style={{ color: isViewerVisible ? T.cyan : th.textDim }}>&lt;/&gt; yaml</span>
        <Toggle checked={isViewerVisible} color={T.cyan} onChange={() => toggleViewer()} />
      </label>

      <div style={{ width: 1, height: 14, background: th.line }} />

      {firstNetwork && <span>{firstNetwork}</span>}
      {firstNetwork && <span>·</span>}
      <span>made with ♥ in Bengaluru 🇮🇳</span>
    </div>
  );
}

function Dot({ color }: { color: string }) {
  return (
    <span style={{
      width: 7, height: 7, borderRadius: 999,
      background: color, display: 'inline-block',
      boxShadow: `0 0 0 2px ${color}22`,
    }} />
  );
}

function Toggle({ checked, color, onChange }: { checked: boolean; color: string; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: 28, height: 15, borderRadius: 999,
        background: checked ? color + 'AA' : '#33394A',
        border: `1px solid ${checked ? color : '#33394A'}`,
        cursor: 'pointer', position: 'relative', padding: 0,
        transition: 'background 0.2s, border-color 0.2s',
      }}
    >
      <span style={{
        position: 'absolute', top: 1.5, left: checked ? 14 : 2,
        width: 10, height: 10, borderRadius: 999,
        background: checked ? color : '#8A93A6',
        transition: 'left 0.2s, background 0.2s',
        display: 'block',
      }} />
    </button>
  );
}
