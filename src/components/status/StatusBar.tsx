import { Space, Tag, Typography } from 'antd'
import { GlobalOutlined } from '@ant-design/icons'
import { useAppSelector } from "../../store/hooks"

const { Text } = Typography

export default function StatusBar() {
    const { yamlObject } = useAppSelector((state) => state.uploadedFile)

    const networkCounter = () => {
        let counter = 0
        if (yamlObject && yamlObject.networks) {
            counter = Object.keys(yamlObject.networks).length || 0
        }
        return counter
    }

    const serviceCounter = () => {
        let counter = 0
        if (yamlObject && yamlObject.services) {
            counter = Object.keys(yamlObject.services).length || 0
        }
        return counter
    }

    const volumeCounter = () => {
        let counter = 0
        if (yamlObject && yamlObject.volumes) {
            counter = Object.keys(yamlObject.volumes).length || 0
        }
        return counter
    }

    return (
        <Space className="flex w-full items-center justify-between" size="small">
            <div className="flex-1 flex items-center">
                <Tag icon={<GlobalOutlined />} color="blue">
                    Networks: {networkCounter()}
                </Tag>
                <Tag icon={<GlobalOutlined />} color="blue">
                    Services: {serviceCounter()}
                </Tag>
                <Tag icon={<GlobalOutlined />} color="blue">
                    Volumes: {volumeCounter()}
                </Tag>
            </div>
            <div className="flex-1 flex justify-center">
                <Text>made with ❤️ in Bengaluru 🇮🇳</Text>
            </div>
            <div className="flex-1 flex justify-end space-x-4">
                <Tag onClick={() => {}}><a>Docker: YAML</a></Tag>
            </div>
        </Space>
    )
}