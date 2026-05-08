import './App.css'
import { theme } from 'antd'
import { Navbar } from './components/navbar/Navbar'
import AppProvider from './context/ReduxAppContext'
import StatusBar from './components/status/StatusBar'
import Main from './components/main/Main'

function AppShell() {
  const { token } = theme.useToken();

  return (
    <div
      className="w-screen h-screen flex flex-col overflow-hidden"
      style={{
        background: token.colorBgLayout,
        color: token.colorText,
        fontFamily: token.fontFamily,
      }}
    >
      <Navbar />
      <div className="flex-1 flex min-h-0 overflow-hidden">
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
