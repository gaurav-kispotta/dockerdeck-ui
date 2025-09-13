import { useContextMenu } from "react-contexify";
import DesignDeck from "../deck/DesignDeck";
//import SideBar from "../sidebar/SideBar";
import { useUploadFileContext } from "../../context/UploadedFileContext";
import SideBar from "../sidebar/SideBar";
import DockerComposeViewer from "../viewer/DockerComposeViewer";
import { useState } from "react";
//import MapMaker from "../../modules/MapMaker";
//import { Edge, Node } from "@xyflow/react";

const MENU_ID = "menu-id";

export default function Main() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isViewerOpen, setIsViewerOpen] = useState(true);
    
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

    const toggleViewer = () => {
        setIsViewerOpen(!isViewerOpen);
    };

    const handleViewerClose = () => {
        setIsViewerOpen(false);
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
            
            <div className="grow flex flex-col">
                {/* Main Content - Split into top and bottom */}
                <div className="flex flex-col h-full">
                    {/* Top half - Design Deck */}
                    <div 
                        id="docker-deck-ui" 
                        className={`${isViewerOpen && yamlObject ? 'h-1/2' : 'h-full'} bg-slate-50 transition-all duration-300`} 
                        onContextMenu={displayMenu}
                    >
                        { yamlObject && <DesignDeck clear={false} ></DesignDeck> }
                        { !yamlObject && (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-gray-500 text-lg">Please load a docker-compose.yaml.</div>
                            </div>
                        )}
                    </div>
                    
                    {/* Bottom half - Docker Compose Viewer */}
                    {yamlObject && isViewerOpen && (
                        <div className="h-1/2 border-t">
                            <DockerComposeViewer 
                                yamlObject={yamlObject} 
                                onClose={handleViewerClose}
                            />
                        </div>
                    )}
                    
                    {/* Show/Hide Viewer Toggle Button - only show when yamlObject exists */}
                    {yamlObject && (
                        <button
                            onClick={toggleViewer}
                            className="absolute bottom-4 right-4 z-10 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 border border-blue-400"
                            aria-label={isViewerOpen ? "Hide Docker Compose viewer" : "Show Docker Compose viewer"}
                        >
                            {isViewerOpen ? (
                                // Down arrow (hide)
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M7 10l5 5 5-5z"/>
                                </svg>
                            ) : (
                                // Up arrow (show)
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M7 14l5-5 5 5z"/>
                                </svg>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}