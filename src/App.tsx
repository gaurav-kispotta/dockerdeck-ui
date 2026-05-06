import './App.css'
import { theme } from 'antd'
import { Navbar } from './components/navbar/Navbar'
import AppProvider from './context/ReduxAppContext'
import StatusBar from './components/status/StatusBar'
import Main from './components/main/Main'

function AppShell() {
  const { token } = theme.useToken();

  return (
    <div style={{
      width: '100vw', height: '100vh',
      display: 'flex', flexDirection: 'column',
      background: token.colorBgLayout,
      color: token.colorText,
      overflow: 'hidden',
      fontFamily: token.fontFamily,
    }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
        <Main />
      </div>
      <StatusBar />
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
