import { Layout, Upload, Button, Dropdown, Avatar, Badge, Space, Typography } from 'antd'
import { UploadOutlined, ShoppingCartOutlined, UserOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { useUploadFileContext } from "../../context/UploadedFileContext"
import { FileReaderModule } from "../../modules/FileReaderModule"

const { Header } = Layout
const { Title } = Typography

export function Navbar() {
    const { setContent } = useUploadFileContext()

    const fileReader = new FileReaderModule()

    async function handleChange(info: any) {
        if (info.file.status === 'done' || info.file.originFileObj) {
            const file = info.file.originFileObj || info.file
            // Create a mock event object that the FileReaderModule expects
            const mockEvent = {
                target: {
                    files: [file]
                }
            }
            const fileContent = await fileReader.onChangeOfFileInput(mockEvent)
            setContent && setContent(fileContent)
        }
    }

    const cartItems: MenuProps['items'] = [
        {
            key: '1',
            label: (
                <div className="p-4 w-52">
                    <div className="text-lg font-bold mb-2">8 Items</div>
                    <div className="text-blue-600 mb-4">Subtotal: $999</div>
                    <Button type="primary" block>View cart</Button>
                </div>
            ),
        },
    ]

    const userItems: MenuProps['items'] = [
        {
            key: '1',
            label: (
                <Space>
                    Profile
                    <Badge count="New" size="small" />
                </Space>
            ),
        },
        {
            key: '2',
            icon: <SettingOutlined />,
            label: 'Settings',
        },
        {
            key: '3',
            icon: <LogoutOutlined />,
            label: 'Logout',
        },
    ]

    const uploadProps = {
        accept: '.yaml,.yml',
        beforeUpload: () => false, // Prevent automatic upload
        onChange: handleChange,
        showUploadList: false,
    }

    return (
        <Header className="bg-white border-b border-gray-200 px-6 flex items-center justify-between h-16">
            <div className="flex-1">
                <Title level={3} className="!mb-0 !text-gray-800">docker deck</Title>
            </div>
            <div className="flex-grow max-w-xs mx-4">
                <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />} className="w-full">
                        Upload Docker Compose
                    </Button>
                </Upload>
            </div>
            <div className="flex-none">
                <Space size="middle">
                    <Dropdown menu={{ items: cartItems }} placement="bottomRight" trigger={['click']}>
                        <Button 
                            type="text" 
                            shape="circle" 
                            icon={
                                <Badge count={8} size="small">
                                    <ShoppingCartOutlined className="text-lg" />
                                </Badge>
                            }
                        />
                    </Dropdown>
                    
                    <Dropdown menu={{ items: userItems }} placement="bottomRight" trigger={['click']}>
                        <Avatar 
                            size="default" 
                            src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                            icon={<UserOutlined />}
                            className="cursor-pointer"
                        />
                    </Dropdown>
                </Space>
            </div>
        </Header>
    )
}