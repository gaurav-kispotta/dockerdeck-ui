import './App.css'
import { Layout } from 'antd'
import { Navbar } from './components/navbar/Navbar'
import AppContext from './context/AppContext'
import StatusBar from './components/status/StatusBar'
import Main from './components/main/Main'
import { ThemeProvider } from './context/ThemeContext'

const { Header, Content, Footer } = Layout

function App() {

  return (
    <>
      <ThemeProvider>
        <AppContext>
          <Layout className='w-screen h-screen'>
            <Header className='flex-none w-full px-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700' style={{ height: 'auto', lineHeight: 'normal' }}>
              <Navbar></Navbar>
            </Header>
            <Content className='grow h-full bg-gray-50 dark:bg-gray-900'>
              <Main></Main>
            </Content>
            <Footer className='p-2' style={{ height: 'auto' }}>
              <StatusBar />
            </Footer>
          </Layout>
        </AppContext>
      </ThemeProvider>
    </>
  )
}

export default App
