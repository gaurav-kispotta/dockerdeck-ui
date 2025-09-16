import { Radio, Space, Tag, Tooltip, Typography } from 'antd'
import { ApartmentOutlined, GlobalOutlined, LayoutOutlined } from '@ant-design/icons'
import { useAppSelector } from "../../store/hooks"
import { useViewer } from "../../hooks/useReduxHooks"

const { Text } = Typography

export default function StatusBar() {
    const { yamlObject } = useAppSelector((state) => state.uploadedFile)
    const { isViewerVisible, toggleViewer } = useViewer()

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
                <Radio.Group block value={isViewerVisible ? "yaml-view" : "map-view"} onChange={toggleViewer} optionType="button"
                    buttonStyle="solid" size='small'>
                    <Radio value="yaml-view">
                        <Tooltip placement="topRight" title="Docker Compose YAML view" >
                            <LayoutOutlined />
                        </Tooltip>
                    </Radio>
                    <Radio value="map-view">
                        <Tooltip placement="topRight" title="Docker Compose Map view" >
                            <ApartmentOutlined />
                        </Tooltip>
                    </Radio>
                </Radio.Group>
            </div>
        </Space>
    )
}