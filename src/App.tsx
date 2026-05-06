import './App.css'
import { Navbar } from './components/navbar/Navbar'
import AppProvider from './context/ReduxAppContext'
import StatusBar from './components/status/StatusBar'
import Main from './components/main/Main'
import GlobalContextMenu from './components/context-menu/GlobalContextMenu'
import { useAppSelector } from './hooks/useReduxHooks'
import { themed } from './styles/tokens'

function AppShell() {
  const isDark = useAppSelector((s) => s.theme.isDark);
  const th = themed(isDark);

  return (
    <div style={{
      width: '100vw', height: '100vh',
      display: 'flex', flexDirection: 'column',
      background: th.bg0, color: th.text,
      overflow: 'hidden',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
        <Main />
      </div>
      <StatusBar />
      <GlobalContextMenu />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

export default App
