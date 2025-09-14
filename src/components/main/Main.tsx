import { useContextMenu } from "react-contexify";
import { Button, ConfigProvider, Empty, Layout, Splitter, Typography } from 'antd'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import DesignDeck from "../deck/DesignDeck";
//import SideBar from "../sidebar/SideBar";
import { useAppSelector } from "../../store/hooks";
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
    
    const { show } = useContextMenu({
        id: MENU_ID
    });
    const { yamlObject, isViewerVisible } = useAppSelector((state) => state.uploadedFile)

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