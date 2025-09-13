import { Card, Slider, Typography, Space } from 'antd'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { setPlatformPadding, setNodeLevelPadding, setNodeSize } from '../../../store/settingsSlice'

const { Text } = Typography

export default function Settings() {
  const dispatch = useAppDispatch()
  const { platformPadding, nodeLevelPadding, nodeSize } = useAppSelector((state) => state.settings)

  const handlePlatformPaddingChange = (value: number) => {
    dispatch(setPlatformPadding(value))
  }

  const handleNodeLevelPaddingChange = (value: number) => {
    dispatch(setNodeLevelPadding(value))
  }

  const handleNodeSizeChange = (value: number) => {
    dispatch(setNodeSize(value))
  }

  return (
    <Card title="Layout Settings" size="small" className="m-4">
      <Space direction="vertical" size="large" className="w-full">
        <div>
          <Text strong>Platform Padding: {platformPadding}px</Text>
          <Slider
            min={10}
            max={200}
            value={platformPadding}
            onChange={handlePlatformPaddingChange}
            tooltip={{ formatter: (value) => `${value}px` }}
          />
        </div>
        
        <div>
          <Text strong>Node Level Padding: {nodeLevelPadding}px</Text>
          <Slider
            min={10}
            max={150}
            value={nodeLevelPadding}
            onChange={handleNodeLevelPaddingChange}
            tooltip={{ formatter: (value) => `${value}px` }}
          />
        </div>
        
        <div>
          <Text strong>Node Size: {nodeSize}px</Text>
          <Slider
            min={50}
            max={200}
            value={nodeSize}
            onChange={handleNodeSizeChange}
            tooltip={{ formatter: (value) => `${value}px` }}
          />
        </div>
      </Space>
    </Card>
  )
}
