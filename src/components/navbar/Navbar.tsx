import { Layout, Upload, Button, Dropdown, Avatar, Badge, Space, Typography } from 'antd'
import { UploadOutlined, ShoppingCartOutlined, UserOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { useUploadFileContext } from "../../context/UploadedFileContext"
import { ThemeToggle } from '../theme/ThemeToggle'

const { Header } = Layout
const { Title } = Typography

export function Navbar() {
    const { setContent } = useUploadFileContext()

    const readFile = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (event) => {
                if (event.target?.result) {
                    resolve(event.target.result as string)
                } else {
                    reject(new Error("Error while reading file or file is empty"))
                }
            }
            reader.onerror = () => {
                reject(new Error("Error reading file"))
            }
            reader.readAsText(file)
        })
    }

    async function handleChange(info: any) {
        const { file } = info
        
        // For Ant Design Upload, we need to check file.status and handle accordingly
        if (file.status !== 'uploading') {
            const actualFile = file.originFileObj || file
            if (actualFile) {
                try {
                    console.log('Reading docker-compose file...')
                    const fileContent = await readFile(actualFile)
                    console.log('File loaded successfully')
                    setContent && setContent(fileContent)
                } catch (error) {
                    console.error('Error reading file:', error)
                }
            }
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
        maxCount: 1,
    }

    return (
        <Header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 flex items-center justify-between h-16 theme-transition">
            <div className="flex-1">
                <Title level={3} className="!mb-0 !text-gray-800 dark:!text-gray-200">docker deck</Title>
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
                    <ThemeToggle />
                    
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