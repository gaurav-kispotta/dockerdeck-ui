import { useContextMenu } from "react-contexify";
import { Button, ConfigProvider, Empty, Layout, Splitter, Typography } from 'antd'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import DesignDeck from "../deck/DesignDeck";
//import SideBar from "../sidebar/SideBar";
import { useAppSelector } from "../../hooks/useReduxHooks";
import SideBar from "../sidebar/SideBar";
import DockerComposeViewer from "../viewer/DockerComposeViewer";
import { useState, useEffect } from "react";
import { logInteractionEvent, AnalyticsEvent } from '../../utils/analytics'
//import MapMaker from "../../modules/MapMaker";
//import { Edge, Node } from "@xyflow/react";

const { Content, Sider } = Layout
const { Text } = Typography

const MENU_ID = "menu-id";

export default function Main() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    const { show } = useContextMenu({
        id: MENU_ID
    });
    const { yamlObject, isViewerVisible } = useAppSelector((state) => state.uploadedFile)

    // Automatically show/hide sidebar based on file loading state
    useEffect(() => {
        //setIsSidebarOpen(!!yamlObject);
    }, [yamlObject]);

    function displayMenu(e: any) {
        // put whatever custom logic you need
        // you can even decide to not display the Menu
        show({
            event: e,
        });
        
        // Log context menu opened
        logInteractionEvent(AnalyticsEvent.CONTEXT_MENU_OPENED, {
            component: 'main',
            action: 'context_menu_open',
            target: e.target?.tagName || 'unknown'
        });
    }

    const toggleSidebar = () => {
        // Only allow manual toggle when a file is loaded
        if (yamlObject) {
            const newState = !isSidebarOpen;
            setIsSidebarOpen(newState);
            
            // Log sidebar toggle
            logInteractionEvent(AnalyticsEvent.SIDEBAR_TOGGLED, {
                component: 'sidebar',
                action: 'toggle',
                newState: newState ? 'open' : 'closed'
            });
        }
    };

    return (
        <ConfigProvider theme={{
            components: {
                Splitter: {
                    splitBarSize: isViewerVisible || !yamlObject ? 5 : 0,
                    splitBarDraggableSize: 500
                }
            }
    }}>
        <Layout className='h-full relative'>
            {/* Sidebar */}
            <Sider 
                width="15%" 
                collapsed={!isSidebarOpen}
                collapsedWidth={0}
                className=" bg-white dark:bg-gray-800"
            >
                {isSidebarOpen && <SideBar></SideBar>}
            </Sider>
            
            {/* Toggle Button - Only show when file is loaded */}
            {yamlObject && (
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
            )}
            
            <Content className="flex flex-col">
                {/* Main Content - Split into top and bottom */}
                <Splitter layout="vertical">
                    <Splitter.Panel>
                        <div 
                            className="h-full w-full"
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
                    </Splitter.Panel>
                    { yamlObject && <Splitter.Panel size={isViewerVisible ? '50%' : '0%'} className="">
                        <div className="h-full w-full">
                            {/* Bottom half - Docker Compose Viewer */}
                            {yamlObject && isViewerVisible && (
                                <DockerComposeViewer />
                            )}
                        </div>
                    </Splitter.Panel> }
                </Splitter>
            </Content>
        </Layout>
        </ConfigProvider>
    )
}