import React from 'react'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { setPlatformPadding, setNodeLevelPadding, setNodeSize } from '../../../store/settingsSlice'

export default function Settings() {
  const dispatch = useAppDispatch()
  const { platformPadding, nodeLevelPadding, nodeSize } = useAppSelector((state) => state.settings)

  const handlePlatformPaddingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setPlatformPadding(parseInt(e.target.value)))
  }

  const handleNodeLevelPaddingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setNodeLevelPadding(parseInt(e.target.value)))
  }

  const handleNodeSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setNodeSize(parseInt(e.target.value)))
  }

  return (
    <div style={{ padding: 24, maxWidth: 400 }}>
      <h2>Layout Settings</h2>
      <div style={{ marginBottom: 24 }}>
        <label htmlFor="platform-padding">
          Platform Padding: {platformPadding}px
          <input
            id="platform-padding"
            type="range"
            min={10}
            max={200}
            value={platformPadding}
            onChange={handlePlatformPaddingChange}
            style={{ width: '100%', marginTop: 8 }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8em', color: '#666' }}>
            <span>10px</span>
            <span>200px</span>
          </div>
        </label>
      </div>
      <div style={{ marginBottom: 24 }}>
        <label htmlFor="node-level-padding">
          Node Level Padding: {nodeLevelPadding}px
          <input
            id="node-level-padding"
            type="range"
            min={10}
            max={150}
            value={nodeLevelPadding}
            onChange={handleNodeLevelPaddingChange}
            style={{ width: '100%', marginTop: 8 }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8em', color: '#666' }}>
            <span>10px</span>
            <span>150px</span>
          </div>
        </label>
      </div>
      <div style={{ marginBottom: 24 }}>
        <label htmlFor="node-size">
          Node Size: {nodeSize}px
          <input
            id="node-size"
            type="range"
            min={50}
            max={200}
            value={nodeSize}
            onChange={handleNodeSizeChange}
            style={{ width: '100%', marginTop: 8 }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8em', color: '#666' }}>
            <span>50px</span>
            <span>200px</span>
          </div>
        </label>
      </div>
    </div>
  )
}
