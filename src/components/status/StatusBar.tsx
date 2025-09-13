import { Space, Tag, Typography } from 'antd'
import { GlobalOutlined } from '@ant-design/icons'
import { useUploadFileContext } from "../../context/UploadedFileContext"

const { Text } = Typography

export default function StatusBar() {
    const { yamlObject } = useUploadFileContext()

    const networkCounter = () => {
        let counter = 0
        if (yamlObject && yamlObject.networks) {
            counter = Object.keys(yamlObject.networks).length || 0
        }
        return counter
    }
    
    return (
        <Space className="w-full justify-center">
            <Text type="secondary">Status:</Text>
            <Tag icon={<GlobalOutlined />} color="blue">
                Networks: {networkCounter()}
            </Tag>
        </Space>
    )
}