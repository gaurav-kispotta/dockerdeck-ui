import { useContextMenu } from "react-contexify";
import DesignDeck from "../deck/DesignDeck";
//import SideBar from "../sidebar/SideBar";
import { useUploadFileContext } from "../../context/UploadedFileContext";
import SideBar from "../sidebar/SideBar";
import { useState } from "react";
//import MapMaker from "../../modules/MapMaker";
//import { Edge, Node } from "@xyflow/react";

const MENU_ID = "menu-id";

export default function Main() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    
    const { show } = useContextMenu({
        id: MENU_ID
    });
    const { yamlObject } = useUploadFileContext()

    function displayMenu(e: any) {
        // put whatever custom logic you need
        // you can even decide to not display the Menu
        show({
            event: e,
        });
    }

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className='flex flex-row h-full relative'>
            {/* Sidebar */}
            {isSidebarOpen && (<div className={`w-1/4 transition-all duration-300 overflow-hidden bg-slate-500`}>
                <div className="overflow-scroll h-full">
                    <SideBar></SideBar>
                </div>
            </div>)}
            
            {/* Toggle Button */}
            <button
                onClick={toggleSidebar}
                className="absolute top-4 left-2 z-10 bg-slate-600 hover:bg-slate-700 text-white p-2 rounded-md shadow-lg transition-all duration-200 border border-slate-400"
                style={{ 
                    left: isSidebarOpen ? 'calc(25% - 1rem)' : '0.5rem',
                    transition: 'left 0.3s ease'
                }}
                aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
                {isSidebarOpen ? (
                    // Left-pointing triangle (close)
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                    </svg>
                ) : (
                    // Right-pointing triangle (open)
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                    </svg>
                )}
            </button>
            
            {/* Main Content */}
            <div id="docker-deck-ui" className='grow bg-slate-50' onContextMenu={displayMenu}>
                { yamlObject && <DesignDeck clear={false} ></DesignDeck> }
                { !yamlObject && <>Please load a docker-compose.yaml.</>}
            </div>
        </div>
    )
}