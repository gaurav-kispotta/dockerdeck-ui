import React, { Component } from 'react'

export default class Settings extends Component {
  render() {
    return (
    <div style={{ padding: 24, maxWidth: 400 }}>
      <h2>Settings</h2>
      <div style={{ marginBottom: 24 }}>
        <label htmlFor="platform-padding">
        Platform Padding: 
        <input
          id="platform-padding"
          type="range"
          min={0}
          max={100}
          defaultValue={50}
          style={{ width: '100%', marginTop: 8 }}
        />
        </label>
      </div>
      <div style={{ marginBottom: 24 }}>
        <label htmlFor="node-level-padding">
        Node Level Padding: 
        <input
          id="node-level-padding"
          type="range"
          min={0}
          max={100}
          defaultValue={50}
          style={{ width: '100%', marginTop: 8 }}
        />
        </label>
      </div>
      <div style={{ marginBottom: 24 }}>
        <label htmlFor="node-size">
        Node Size: 
        <input
          id="node-size"
          type="range"
          min={0}
          max={100}
          defaultValue={50}
          style={{ width: '100%', marginTop: 8 }}
        />
        </label>
      </div>
    </div>
    )
  }
}
