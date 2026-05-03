import { Radio, Tag, Tooltip, Typography, Switch } from 'antd'
import { ApartmentOutlined, GlobalOutlined, LayoutOutlined, ShareAltOutlined } from '@ant-design/icons'
import { useAppSelector, useAppDispatch } from "../../hooks/useReduxHooks"
import { useViewer } from "../../hooks/useReduxHooks"
import { setShowDependencies } from "../../store/slices/settingsSlice"

const { Text } = Typography

export default function StatusBar() {
    const { yamlObject } = useAppSelector((state) => state.uploadedFile)
    const { showDependencies } = useAppSelector((state) => state.settings)
    const { isViewerVisible, toggleViewer } = useViewer()
    const dispatch = useAppDispatch()

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

    const handleDependencyToggle = (checked: boolean) => {
        dispatch(setShowDependencies(checked))
    }

    return (
        <div className="flex w-full items-center">
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
            <div className="flex-1 flex justify-end items-center space-x-4">
                <div className="flex items-center space-x-2">
                    <ShareAltOutlined />
                    <Switch
                        checked={showDependencies}
                        onChange={handleDependencyToggle}
                        size="small"
                    />
                    <Tooltip placement="top" title="Show dependency relationships and restructure as dependency tree">
                        <Text className="text-sm">Show Dependencies</Text>
                    </Tooltip>
                </div>
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
        </div>
    )
}