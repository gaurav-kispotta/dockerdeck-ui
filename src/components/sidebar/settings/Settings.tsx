import { Slider, Typography, Space, Switch, Tooltip, Select } from 'antd'
import { useAppDispatch, useAppSelector } from '../../../hooks/useReduxHooks'
import { setPlatformPadding, setNodeLevelPadding, setNodeSize, setShowDependencies, setMapLayout, MapLayout } from '../../../store/slices/settingsSlice'
import { QuestionCircleOutlined } from '@ant-design/icons';

const { Text } = Typography

const MAP_LAYOUT_OPTIONS: { value: MapLayout; label: string; description: string }[] = [
  { value: 'layered', label: 'Layered', description: 'Rows: networks → services → volumes' },
  { value: 'dagre',   label: 'Dagre',   description: 'Hierarchical graph layout (Dagre)' },
  { value: 'elk',     label: 'ELK Tree', description: 'Tree layout via ELK.js' },
];

export default function Settings() {
  const dispatch = useAppDispatch()
  const { platformPadding, nodeLevelPadding, nodeSize, showDependencies, mapLayout } = useAppSelector((state) => state.settings)

  const handlePlatformPaddingChange = (value: number) => {
    dispatch(setPlatformPadding(value))
  }

  const handleNodeLevelPaddingChange = (value: number) => {
    dispatch(setNodeLevelPadding(value))
  }

  const handleNodeSizeChange = (value: number) => {
    dispatch(setNodeSize(value))
  }

  const handleShowDependenciesChange = (checked: boolean) => {
    dispatch(setShowDependencies(checked))
  }

  const handleMapLayoutChange = (value: MapLayout) => {
    dispatch(setMapLayout(value))
  }

  return (
      <Space direction="vertical" size="small" className="w-full">
        <div>
          <div className="flex items-center mb-1">
            <Text strong className="dark:text-gray-200 mr-1">Map Layout</Text>
            <Tooltip title="Choose how nodes are positioned on the canvas">
              <QuestionCircleOutlined className="text-gray-400" />
            </Tooltip>
          </div>
          <Select
            value={mapLayout}
            onChange={handleMapLayoutChange}
            className="w-full"
            options={MAP_LAYOUT_OPTIONS.map(o => ({
              value: o.value,
              label: (
                <div>
                  <span className="font-medium">{o.label}</span>
                  <span className="text-xs text-gray-400 ml-1">— {o.description}</span>
                </div>
              ),
            }))}
          />
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Text strong className="dark:text-gray-200 mr-1">Show dependencies</Text>
            <Tooltip title="Show service dependencies (depends_on) and highlight dependency relationships">
              <QuestionCircleOutlined className="text-gray-400" />
            </Tooltip>
          </div>
          <Switch
            checked={showDependencies}
            onChange={handleShowDependenciesChange}
            size="small"
          />
        </div>
        
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
