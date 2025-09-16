import { Slider, Typography, Space } from 'antd'
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

      <Space direction="vertical" size="small" className="w-full">
        <div>
          <Text strong className="dark:text-gray-200">Platform Padding: {platformPadding}px</Text>
          <Slider
            min={10}
            max={200}
            value={platformPadding}
            onChange={handlePlatformPaddingChange}
            tooltip={{ formatter: (value) => `${value}px` }}
          />
        </div>
        
        <div>
          <Text strong className="dark:text-gray-200">Node Level Padding: {nodeLevelPadding}px</Text>
          <Slider
            min={10}
            max={150}
            value={nodeLevelPadding}
            onChange={handleNodeLevelPaddingChange}
            tooltip={{ formatter: (value) => `${value}px` }}
          />
        </div>
        
        <div>
          <Text strong className="dark:text-gray-200">Node Size: {nodeSize}px</Text>
          <Slider
            min={50}
            max={200}
            value={nodeSize}
            onChange={handleNodeSizeChange}
            tooltip={{ formatter: (value) => `${value}px` }}
          />
        </div>
      </Space>

  )
}
