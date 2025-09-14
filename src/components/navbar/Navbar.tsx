import { Layout, Upload, Button, Dropdown, Avatar, Badge, Space, Typography, Tag } from 'antd'
import { UploadOutlined, ShoppingCartOutlined, UserOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { useFileUpload } from "../../context/ReduxAppContext"
import { ThemeToggle } from '../theme/ThemeToggle'
import { useState } from 'react'
import packageJson from '../../../package.json'

const { Header } = Layout
const { Title } = Typography

export function Navbar() {
    const { setContent } = useFileUpload()
    const [fileName, setFileName] = useState<string | null>(null)

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
                    setFileName(file.name)
                } catch (error) {
                    console.error('Error reading file:', error)
                    setFileName(null)
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
        <div className="px-6 flex items-center justify-between h-16 theme-transition ">
            <div className="flex-none">
                <Title level={3} className="text-gray-900 dark:text-gray-100">
                    docker deck<sup className="text-xs text-blue-500 ml-1">
                        <Tag color="blue">alpha</Tag>
                        <Tag color="green" className="ml-1">v{packageJson.version}</Tag>
                    </sup>
                </Title>
            </div>
            <div className="flex-grow flex justify-center items-center">
                <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />} className="w-full max-w-xs">
                        {fileName ? fileName : "Upload Docker Compose"}
                    </Button>
                </Upload>
            </div>
            <div className="flex-none">
                <Space size="middle">
                    <ThemeToggle />
                </Space>
            </div>
        </div>
    )
}