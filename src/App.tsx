import './App.css'
import DesignDeck from './components/deck/DesignDeck'
import * as samples from './utils/samples'
import { Navbar } from './components/navbar/Navbar'
import SideBar from './components/sidebar/SideBar'
import { useContextMenu } from 'react-contexify'
import AppContext from './context/AppContext'
import StatusBar from './components/status/StatusBar'

const MENU_ID = "menu-id";

function App() {
  const { show } = useContextMenu({
    id: MENU_ID
  });

  function displayMenu(e: any) {
    // put whatever custom logic you need
    // you can even decide to not display the Menu
    show({
      event: e,
    });
  }

  return (
    <>
      <AppContext>
        <div className='w-screen h-screen flex flex-col bg-gray-300'>
          <div className='flex-none w-full'>
            <Navbar></Navbar>
          </div>
          <div className='grow h-full bg-'>
            <div className='flex flex-row h-full'>
              <div className='w-1/4 overflow-scroll bg-slate-500'>
                <SideBar></SideBar>
              </div>
              <div className='grow bg-slate-50' onContextMenu={displayMenu}>
                <DesignDeck nodes={samples.nodes} edges={samples.edges}></DesignDeck>
              </div>
            </div>
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
