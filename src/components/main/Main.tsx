import DesignDeck from '../deck/DesignDeck';
import ViewModeTabs from '../deck/ViewModeTabs';
import { useAppSelector } from '../../hooks/useReduxHooks';
import DockerComposeViewer from '../viewer/DockerComposeViewer';
import OutlinePanel from '../outline/OutlinePanel';
import InspectorPanel from '../inspector/InspectorPanel';
import GlobalContextMenu from '../context-menu/GlobalContextMenu';
import { T, themed } from '../../styles/tokens';
import { Splitter } from 'antd';

export default function Main() {
  const { yamlObject, isViewerVisible } = useAppSelector((s) => s.uploadedFile);
  const isDark = useAppSelector((s) => s.theme.isDark);
  const th = themed(isDark);

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden">
      {/* Left outline panel — only when file loaded */}
      {yamlObject && <OutlinePanel />}

      {/* Center — canvas + optional yaml viewer, wrapped with context menu */}
      <GlobalContextMenu>
        {yamlObject ? (
          <>
            {/* View mode tabs — Architecture / Networks / Ports / Storage / Boot Order */}
            <ViewModeTabs />

            <Splitter layout="vertical" className="flex-1 flex flex-col">
              <Splitter.Panel style={{ position: 'relative' }}>
                <DesignDeck clear={false} />
              </Splitter.Panel>
              {isViewerVisible && (
                <Splitter.Panel size="40%">
                  <DockerComposeViewer />
                </Splitter.Panel>
              )}
            </Splitter>
          </>
        ) : (
          <EmptyCanvas isDark={isDark} th={th} />
        )}
      </GlobalContextMenu>

      {/* Right inspector panel — slides in on selection */}
      <InspectorPanel />
    </div>
  );
}

function EmptyCanvas({ isDark, th }: { isDark: boolean; th: ReturnType<typeof themed> }) {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center gap-5"
      style={{
        background: th.bg0,
        backgroundImage: `radial-gradient(circle at 1px 1px, ${isDark ? T.line : T.lline} 1px, transparent 0)`,
        backgroundSize: '22px 22px',
      }}
    >
      <div
        className="w-16 h-16 rounded-[18px] grid place-items-center text-[32px]"
        style={{
          background: `linear-gradient(135deg, ${T.cyan}22, ${T.violet}22)`,
          border: `1px solid ${T.cyan}44`,
        }}
      >🐳</div>
      <div className="text-center">
        <div className="text-[20px] font-bold tracking-[-0.3px]" style={{ color: th.text }}>
          Drop a docker-compose file
        </div>
        <div className="text-[13px] mt-1.5" style={{ color: th.textDim }}>
          Click <span style={{ color: T.cyan, fontFamily: 'ui-monospace,Menlo,monospace' }}>↑ Upload</span> in the header to get started
        </div>
      </div>
      <div
        className="px-4 py-2.5 rounded-[10px] text-[11.5px] max-w-[420px] text-center leading-[1.6]"
        style={{
          background: isDark ? `${T.amber}0D` : '#FFFBF0',
          border: `1px solid ${T.amber}44`,
          color: th.textDim,
        }}
      >
        ⚠ Your file is never uploaded — all parsing happens locally in your browser.
        Anonymous usage analytics are collected via Firebase Analytics.
      </div>
    </div>
  );
}
