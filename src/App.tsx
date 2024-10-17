import './App.css'
import { Navbar } from './components/navbar/Navbar'
import AppContext from './context/AppContext'
import StatusBar from './components/status/StatusBar'
import Main from './components/main/Main'

function App() {

  return (
    <>
      <AppContext>
        <div className='w-screen h-screen flex flex-col bg-gray-300'>
          <div className='flex-none w-full'>
            <Navbar></Navbar>
          </div>
          <div>tool bar </div>
          <div className='grow h-full bg-'>
            <Main></Main>
          </div>
          <div>
            <StatusBar />
          </div>
        </div>
      </AppContext>
    </>
  )
}

export default App
