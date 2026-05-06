import { useRef } from 'react';
import { useFileUpload } from '../../hooks/useFileUpload';
import { useAppSelector } from '../../hooks/useReduxHooks';
import packageJson from '../../../package.json';
import { T, themed } from '../../styles/tokens';

export function Navbar() {
  const { uploadFile } = useFileUpload();
  const { fileName, yamlObject } = useAppSelector((s) => s.uploadedFile);
  const isDark = useAppSelector((s) => s.theme.isDark);
  const th = themed(isDark);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const serviceCount = yamlObject?.services ? Object.keys(yamlObject.services).length : 0;
  const networkCount = yamlObject?.networks ? Object.keys(yamlObject.networks).length : 0;
  const volumeCount  = yamlObject?.volumes  ? Object.keys(yamlObject.volumes).length  : 0;

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    await uploadFile(file, file.name);
  }

  const chipMeta = yamlObject
    ? `· ${serviceCount} service${serviceCount !== 1 ? 's' : ''} · ${networkCount} network${networkCount !== 1 ? 's' : ''} · ${volumeCount} volume${volumeCount !== 1 ? 's' : ''}`
    : null;

  return (
    <div
      className="electron-drag"
      style={{
        height: 52,
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        background: th.bg1,
        borderBottom: `1px solid ${th.line}`,
        gap: 14,
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 26, height: 26, borderRadius: 7,
          background: `linear-gradient(135deg, ${T.cyan}, ${T.violet})`,
          display: 'grid', placeItems: 'center',
          color: '#0B0E14', fontWeight: 800, fontSize: 13, flexShrink: 0,
        }}>D</div>
        <div style={{ fontWeight: 700, color: th.text, letterSpacing: -0.2, fontSize: 14 }}>
          docker<span style={{ color: isDark ? T.cyan : T.violet }}>·</span>deck
        </div>
        <span style={{
          display: 'inline-flex', alignItems: 'center',
          padding: '2px 8px', borderRadius: 999, fontSize: 10, lineHeight: 1.4,
          border: `1px solid ${T.violet}55`, background: `${T.violet}11`, color: T.violet,
        }}>alpha</span>
        <span style={{
          display: 'inline-flex', alignItems: 'center',
          padding: '2px 8px', borderRadius: 999, fontSize: 10, lineHeight: 1.4,
          fontFamily: 'ui-monospace,Menlo,monospace',
          border: `1px solid ${T.green}55`, background: `${T.green}11`, color: T.green,
        }}>v{packageJson.version}</span>
      </div>

      {/* Centered file chip — acts as the upload trigger */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }} className="electron-no-drag">
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '6px 14px', borderRadius: 10,
            background: th.bg2, border: `1px solid ${th.line}`,
            fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 12,
            color: th.text, cursor: 'pointer',
            transition: 'border-color 0.15s',
            maxWidth: 520,
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = T.cyan + '88')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = th.line)}
        >
          <span style={{ color: T.cyan }}>↑</span>
          <span style={{ color: th.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>
            {fileName ?? 'Upload docker-compose.yml'}
          </span>
          {chipMeta && (
            <span style={{ color: th.textFaint, whiteSpace: 'nowrap' }}>{chipMeta}</span>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".yaml,.yml"
          style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} className="electron-no-drag">
        <IconBtn title="Validate">✓</IconBtn>
        <IconBtn title="Search">⌕</IconBtn>
        <div style={{ width: 1, height: 22, background: th.line, margin: '0 4px' }} />
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            height: 30, padding: '0 12px', borderRadius: 8,
            background: T.cyan, color: '#0B0E14', border: 'none',
            fontWeight: 600, fontSize: 12, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >↑ Upload</button>
      </div>
    </div>
  );
}

function IconBtn({ children, title, active }: { children: React.ReactNode; title?: string; active?: boolean }) {
  const isDark = useAppSelector((s) => s.theme.isDark);
  const th = themed(isDark);
  return (
    <button
      title={title}
      style={{
        width: 30, height: 30, display: 'grid', placeItems: 'center',
        background: active ? th.bg3 : 'transparent',
        border: `1px solid ${active ? th.line : 'transparent'}`,
        borderRadius: 8, color: active ? th.text : th.textDim,
        cursor: 'pointer', fontSize: 14,
        transition: 'color 0.15s, background 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.color = th.text; e.currentTarget.style.background = th.bg3; }}
      onMouseLeave={e => { e.currentTarget.style.color = active ? th.text : th.textDim; e.currentTarget.style.background = active ? th.bg3 : 'transparent'; }}
    >{children}</button>
  );
}
