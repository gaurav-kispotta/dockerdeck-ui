import './App.css'
import { Layout } from 'antd'
import { Navbar } from './components/navbar/Navbar'
import ReduxAppContext from './context/ReduxAppContext'
import StatusBar from './components/status/StatusBar'
import Main from './components/main/Main'
import { ReduxThemeProvider } from './components/theme/ReduxThemeProvider'
import DockerDeckErrorModal from './components/modals/ErrorModal'

const { Header, Content, Footer } = Layout

function App() {

  return (
    <>
      <ReduxThemeProvider>
        <ReduxAppContext>
          <DockerDeckErrorModal />
          <Layout className='w-screen h-screen'>
            <Header className='flex-none w-full  py-1 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 electron-drag'>
              <Navbar></Navbar>
            </Header>
            <Content className='grow h-full bg-gray-50 dark:bg-gray-900'>
              <Main></Main>
            </Content>
            <Footer className='p-2' style={{ height: 'auto' }}>
              <StatusBar />
            </Footer>
          </Layout>
        </ReduxAppContext>
      </ReduxThemeProvider>
    </>
  )
}

export default App
