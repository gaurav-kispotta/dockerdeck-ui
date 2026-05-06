import { useContextMenu } from 'react-contexify';
import DesignDeck from '../deck/DesignDeck';
import ViewModeTabs from '../deck/ViewModeTabs';
import { useAppSelector } from '../../hooks/useReduxHooks';
import DockerComposeViewer from '../viewer/DockerComposeViewer';
import OutlinePanel from '../outline/OutlinePanel';
import InspectorPanel from '../inspector/InspectorPanel';
import { logInteractionEvent, AnalyticsEvent } from '../../utils/analytics';
import { T, themed } from '../../styles/tokens';
import { Splitter } from 'antd';

const MENU_ID = 'menu-id';

export default function Main() {
  const { show } = useContextMenu({ id: MENU_ID });
  const { yamlObject, isViewerVisible } = useAppSelector((s) => s.uploadedFile);
  const isDark = useAppSelector((s) => s.theme.isDark);
  const th = themed(isDark);

  function displayMenu(e: any) {
    show({ event: e });
    logInteractionEvent(AnalyticsEvent.CONTEXT_MENU_OPENED, {
      component: 'main',
      action: 'context_menu_open',
      target: e.target?.tagName ?? 'unknown',
    });
  }

  return (
    <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
      {/* Left outline panel — only when file loaded */}
      {yamlObject && <OutlinePanel />}

      {/* Center — canvas + optional yaml viewer */}
      <div
        style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}
        onContextMenu={displayMenu}
      >
        {yamlObject ? (
          <>
            {/* View mode tabs — Architecture / Networks / Ports / Storage / Boot Order */}
            <ViewModeTabs />

            <Splitter layout="vertical" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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
      </div>

      {/* Right inspector panel — slides in on selection */}
      <InspectorPanel />
    </div>
  );
}

function EmptyCanvas({ isDark, th }: { isDark: boolean; th: ReturnType<typeof themed> }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 20, background: th.bg0,
      backgroundImage: `radial-gradient(circle at 1px 1px, ${isDark ? T.line : T.lline} 1px, transparent 0)`,
      backgroundSize: '22px 22px',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 18,
        background: `linear-gradient(135deg, ${T.cyan}22, ${T.violet}22)`,
        border: `1px solid ${T.cyan}44`,
        display: 'grid', placeItems: 'center', fontSize: 32,
      }}>🐳</div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: th.text, letterSpacing: -0.3 }}>
          Drop a docker-compose file
        </div>
        <div style={{ fontSize: 13, color: th.textDim, marginTop: 6 }}>
          Click <span style={{ color: T.cyan, fontFamily: 'ui-monospace,Menlo,monospace' }}>↑ Upload</span> in the header to get started
        </div>
      </div>
      <div style={{
        padding: '10px 16px', borderRadius: 10,
        background: isDark ? `${T.amber}0D` : '#FFFBF0',
        border: `1px solid ${T.amber}44`,
        fontSize: 11.5, color: th.textDim, maxWidth: 420, textAlign: 'center', lineHeight: 1.6,
      }}>
        ⚠ Your file is never uploaded — all parsing happens locally in your browser.
        Anonymous usage analytics are collected via Firebase Analytics.
      </div>
    </div>
  );
}
