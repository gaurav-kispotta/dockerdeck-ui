import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import DesignDeck from './components/DesignDeck'
import * as samples from './utils/samples'
import { Navbar } from './components/Navbar'
import SideBar from './components/SideBar'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      {/* <Navbar></Navbar>
        <SideBar></SideBar> */}
      {/* <div style={{ width: '100vw', height: '100vh' }}>
        <DesignDeck nodes={samples.nodes} edges={samples.edges}></DesignDeck>
      </div> */}
      {/* <div className='w-screen h-screen grid place-items-stretch bg-gray-300'>
          <div className='grid grid-cols-6'>
            <div className='col-span-6'>
              <Navbar></Navbar>
            </div>
            <div className='size-full w-64 bg-slate-900'>
              <div className='bg-orange-400 w-10 h-10 text-black' draggable>
                test
              </div>
              <div className='bg-red-400 w-10 h-10 text-black' draggable>
                test
              </div>
              <div className='bg-green-400 w-10 h-10 text-black' draggable>
                test
              </div>
            </div>
            <div className='col-span-5 size-full h-full'>
              <DesignDeck nodes={samples.nodes} edges={samples.edges}></DesignDeck>
            </div>
            <div className="col-span-6 bg-orange-500">status</div>
          </div>
        </div> */}

      <div className='w-screen h-screen flex flex-col bg-gray-300'>
        <div className='flex-none w-full'>
          <Navbar></Navbar>
        </div>
        <div className='grow h-full bg-orange-300'>
          <div className='flex flex-row h-full'>
            <div className='w-1/4 overflow-scroll'>
              <div>tool 1</div>
            </div>
            <div className='grow bg-slate-50'>
              <DesignDeck nodes={samples.nodes} edges={samples.edges}></DesignDeck>
            </div>
          </div>
        </div>
        <div>
          status
        </div>
      </div>
    </>
  )
}

export default App
