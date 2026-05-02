import { Upload, Button, Space, Typography, Tag } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { useFileUpload } from "../../hooks/useFileUpload"
import { ThemeToggle } from '../theme/ThemeToggle'
import { useState } from 'react'
import packageJson from '../../../package.json'
import MemoryStatus from '../status/MemoryStatus'

const { Title } = Typography

export function Navbar() {
    const { uploadFile } = useFileUpload()
    const [fileName, setFileName] = useState<string | null>(null)

    async function handleChange(info: any) {
        const { file } = info

        if (file.status !== 'uploading') {
            const actualFile: File = file.originFileObj || file
            if (actualFile) {
                setFileName(file.name)
                await uploadFile(actualFile, file.name)
            }
        }
    }

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
                <Upload className="electron-no-drag" {...uploadProps}>
                    <Button icon={<UploadOutlined />} className="w-full max-w-xs">
                        {fileName ? fileName : "Upload Docker Compose"}
                    </Button>
                </Upload>
            </div>
            <div className="flex-none electron-no-drag">
                <Space size="middle">
                    <MemoryStatus />
                    <ThemeToggle />
                </Space>
            </div>
        </div>
    )
}