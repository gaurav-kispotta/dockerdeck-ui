import React, { useState, useMemo } from 'react';
import { Tree, Switch, Space, Card, Typography } from 'antd';
import { 
    ContainerOutlined, 
    ApiOutlined, 
    DatabaseOutlined, 
    SettingOutlined,
    AppstoreOutlined,
    ToolOutlined,
    LinkOutlined,
    FolderOutlined,
    FileOutlined
} from '@ant-design/icons';
import type { TreeDataNode } from 'antd';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { selectAstNode } from '../../store/selectionSlice';

const { Title } = Typography;

/**
 * Debug component to display the current AST object from Redux state as a Tree view
 * This component can be used to verify that the AST is being stored properly
 */
export const AstDebugViewer: React.FC = () => {
    const astObject = useAppSelector((state) => state.uploadedFile.astObject);
    const selection = useAppSelector((state) => state.selection);
    const dispatch = useAppDispatch();
    
    const [showLine, setShowLine] = useState<boolean>(true);
    const [showIcon, setShowIcon] = useState<boolean>(true);

    // Transform AST object into tree data
    const treeData: TreeDataNode[] = useMemo(() => {
        if (!astObject) return [];

        const nodes: TreeDataNode[] = [];

        // Root node for Docker Compose
        const rootNode: TreeDataNode = {
            title: 'Docker Compose',
            key: 'root',
            icon: <AppstoreOutlined />,
            children: []
        };

        // Services section
        if (astObject.services && astObject.services.length > 0) {
            const servicesNode: TreeDataNode = {
                title: `Services (${astObject.services.length})`,
                key: 'services',
                icon: <ContainerOutlined />,
                children: astObject.services.map((service, index) => ({
                    title: service.name,
                    key: `service-${index}`,
                    icon: <ContainerOutlined />,
                    children: [
                        {
                            title: `Image: ${service.image.name}:${service.image.tag}`,
                            key: `service-${index}-image`,
                            icon: <FileOutlined />
                        },
                        {
                            title: `Container: ${service.containerName}`,
                            key: `service-${index}-container`,
                            icon: <SettingOutlined />
                        },
                        ...(service.ports && service.ports.length > 0 ? [{
                            title: `Ports (${service.ports.length})`,
                            key: `service-${index}-ports`,
                            icon: <LinkOutlined />,
                            children: service.ports.flatMap((port, portIndex) => [
                                {
                                    title: `External: ${port.external}`,
                                    key: `service-${index}-port-${portIndex}-external`,
                                    icon: <ApiOutlined />
                                },
                                {
                                    title: `Internal: ${port.internal}`,
                                    key: `service-${index}-port-${portIndex}-internal`,
                                    icon: <ApiOutlined />
                                }
                            ])
                        }] : []),
                        ...(service.volumes && service.volumes.length > 0 ? [{
                            title: `Volumes (${service.volumes.length})`,
                            key: `service-${index}-volumes`,
                            icon: <DatabaseOutlined />,
                            children: service.volumes.map((volume, volumeIndex) => ({
                                title: `${volume.external}:${volume.internal}`,
                                key: `service-${index}-volume-${volumeIndex}`,
                                icon: <FolderOutlined />
                            }))
                        }] : []),
                        ...(service.networks && service.networks.length > 0 ? [{
                            title: `Networks (${service.networks.length})`,
                            key: `service-${index}-networks`,
                            icon: <ApiOutlined />,
                            children: service.networks.map((network, networkIndex) => ({
                                title: network,
                                key: `service-${index}-network-${networkIndex}`,
                                icon: <LinkOutlined />
                            }))
                        }] : [])
                    ]
                }))
            };
            rootNode.children!.push(servicesNode);
        }

        // Networks section
        if (astObject.networks && astObject.networks.length > 0) {
            const networksNode: TreeDataNode = {
                title: `Networks (${astObject.networks.length})`,
                key: 'networks',
                icon: <ApiOutlined />,
                children: astObject.networks.map((network, index) => ({
                    title: network.name,
                    key: `network-${index}`,
                    icon: <LinkOutlined />,
                    children: [
                        {
                            title: `Driver: ${network.driver}`,
                            key: `network-${index}-driver`,
                            icon: <ToolOutlined />
                        },
                        {
                            title: `IPAM Driver: ${network.ipam.driver || 'default'}`,
                            key: `network-${index}-ipam`,
                            icon: <SettingOutlined />
                        }
                    ]
                }))
            };
            rootNode.children!.push(networksNode);
        }

        // Volumes section
        if (astObject.volumes && astObject.volumes.length > 0) {
            const volumesNode: TreeDataNode = {
                title: `Volumes (${astObject.volumes.length})`,
                key: 'volumes',
                icon: <DatabaseOutlined />,
                children: astObject.volumes.map((volume, index) => ({
                    title: volume.name,
                    key: `volume-${index}`,
                    icon: <FolderOutlined />,
                    children: [
                        {
                            title: `Driver: ${volume.driver}`,
                            key: `volume-${index}-driver`,
                            icon: <ToolOutlined />
                        },
                        ...(Object.keys(volume.driver_opts || {}).length > 0 ? 
                            Object.entries(volume.driver_opts).map(([key, value], optIndex) => ({
                                title: `${key}: ${value}`,
                                key: `volume-${index}-opt-${optIndex}`,
                                icon: <SettingOutlined />
                            })) : []
                        )
                    ]
                }))
            };
            rootNode.children!.push(volumesNode);
        }

        nodes.push(rootNode);
        return nodes;
    }, [astObject]);

    const onSelect = (selectedKeys: React.Key[], info: any) => {
        console.log('AST Tree: Selected keys:', selectedKeys, 'info:', info);
        
        if (selectedKeys.length > 0) {
            const selectedKey = selectedKeys[0] as string;
            
            // Get all currently expanded keys from the tree state
            const allExpandedKeys = [...(selection.expandedAstKeys.length > 0 ? selection.expandedAstKeys : ['root', 'services'])];
            
            // Add the parent keys of the selected node to ensure it's visible
            const parentKeys = selectedKey.split('-').reduce((acc: string[], part: string, index: number) => {
                if (index === 0) {
                    acc.push(part);
                } else {
                    acc.push(acc[acc.length - 1] + '-' + part);
                }
                return acc;
            }, []);
            
            const newExpandedKeys = Array.from(new Set([...allExpandedKeys, ...parentKeys]));
            
            console.log('AST Tree: Dispatching selectAstNode with key:', selectedKey, 'expanded keys:', newExpandedKeys);
            
            dispatch(selectAstNode({
                astNodeKey: selectedKey,
                expandedKeys: newExpandedKeys,
                astObject
            }));
        }
    };

    const onExpand = (expandedKeys: React.Key[]) => {
        console.log('AST Tree: Expanded keys changed:', expandedKeys);
        // Update expanded keys while maintaining current selection
        if (selection.selectedAstNodeKey) {
            dispatch(selectAstNode({
                astNodeKey: selection.selectedAstNodeKey,
                expandedKeys: expandedKeys as string[],
                astObject
            }));
        }
    };

    if (!astObject) {
        return (
            <Card>
                <Title level={4}>Docker Compose AST Debug</Title>
                <p className="text-gray-600">No AST object available</p>
            </Card>
        );
    }

    return (
        <Card>
            <Title level={4}>Docker Compose AST Debug</Title>
            
            {/* Debug info */}
            {selection.selectedNodeId && (
                <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded">
                    <div className="text-sm">
                        <strong>Selected Graph Node:</strong> {selection.selectedNodeId}
                    </div>
                    {selection.selectedAstNodeKey && (
                        <div className="text-sm">
                            <strong>Selected AST Node:</strong> {selection.selectedAstNodeKey}
                        </div>
                    )}
                </div>
            )}
            
            <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
                <Space>
                    <span>Show Lines:</span>
                    <Switch checked={showLine} onChange={setShowLine} size="small" />
                    <span>Show Icons:</span>
                    <Switch checked={showIcon} onChange={setShowIcon} size="small" />
                </Space>
            </Space>

            <Tree
                showLine={showLine ? { showLeafIcon: true } : false}
                showIcon={showIcon}
                defaultExpandedKeys={['root', 'services']}
                expandedKeys={selection.expandedAstKeys.length > 0 ? selection.expandedAstKeys : ['root', 'services']}
                selectedKeys={selection.selectedAstNodeKey ? [selection.selectedAstNodeKey] : []}
                onSelect={onSelect}
                onExpand={onExpand}
                treeData={treeData}
                height={400}
                style={{ 
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px',
                    padding: '8px',
                    background: '#fafafa'
                }}
            />

            
        </Card>
    );
};

export default AstDebugViewer;
