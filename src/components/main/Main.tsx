import { useContextMenu } from "react-contexify";
import { Button, Empty, Layout, Typography } from 'antd'
import { LeftOutlined, RightOutlined, UpOutlined, DownOutlined } from '@ant-design/icons'
import DesignDeck from "../deck/DesignDeck";
//import SideBar from "../sidebar/SideBar";
import { useUploadFileContext } from "../../context/UploadedFileContext";
import SideBar from "../sidebar/SideBar";
import DockerComposeViewer from "../viewer/DockerComposeViewer";
import { useState } from "react";
//import MapMaker from "../../modules/MapMaker";
//import { Edge, Node } from "@xyflow/react";

const { Content, Sider } = Layout
const { Text } = Typography

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
        <Layout className='h-full relative'>
            {/* Sidebar */}
            <Sider 
                width="15%" 
                collapsed={!isSidebarOpen}
                collapsedWidth={0}
                className=" transition-all duration-300 bg-white dark:bg-gray-800"
            >
                <SideBar></SideBar>
            </Sider>
            
            {/* Toggle Button */}
            <Button
                onClick={toggleSidebar}
                className="absolute top-4 z-10 shadow-lg"
                style={{ 
                    left: isSidebarOpen ? 'calc(15% - 1rem)' : '0.5rem',
                    transition: 'left 0.3s ease'
                }}
                icon={isSidebarOpen ? <LeftOutlined /> : <RightOutlined />}
                shape="circle"
                size="middle"
            />
            
            <Content className="flex flex-col">
                {/* Main Content - Split into top and bottom */}
                <div className="flex flex-col h-full">
                    {/* Top half - Design Deck */}
                    <div 
                        id="docker-deck-ui" 
                        className={`${isViewerOpen && yamlObject ? 'h-1/2' : 'h-full'} bg-slate-50 dark:bg-slate-900 transition-all duration-300`} 
                        onContextMenu={displayMenu}
                    >
                        { yamlObject && <DesignDeck clear={false} ></DesignDeck> }
                        { !yamlObject && (
                            <div className="flex items-center justify-center h-full">
                                
                                <Empty description={
                                    <Text strong className="text-gray-500 dark:text-gray-400 text-lg">Please load a docker-compose.yaml or .yml file</Text>
                                } />
                            </div>
                        )}
                    </div>
                    
                    {/* Bottom half - Docker Compose Viewer */}
                    {yamlObject && isViewerOpen && (
                        <div className="h-1/2 border-t border-gray-200 dark:border-gray-700">
                            <DockerComposeViewer 
                                yamlObject={yamlObject} 
                                onClose={handleViewerClose}
                            />
                        </div>
                    )}
                    
                    {/* Show/Hide Viewer Toggle Button - only show when yamlObject exists */}
                    {yamlObject && (
                        <Button
                            onClick={toggleViewer}
                            className="absolute bottom-4 right-4 z-10 shadow-lg"
                            icon={isViewerOpen ? <DownOutlined /> : <UpOutlined />}
                            shape="circle"
                            type="primary"
                            size="large"
                        />
                    )}
                </div>
            </Content>
        </Layout>
    )
}