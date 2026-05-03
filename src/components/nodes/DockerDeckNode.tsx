import { Position } from '@xyflow/react'
import BaseNode from './BaseNode'

import '@xyflow/react/dist/style.css';

interface DockerDeckNodeProperties {
    dockerServiceId: string;
    dockerImageName: string;
    dockerIconUrl?: string;
}

const circleSize = 64;
const iconSize = 36;

const circleStyle: React.CSSProperties = {
    width: circleSize,
    height: circleSize,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.18)',
    backdropFilter: 'blur(6px)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.14), 0 1px 6px rgba(0,0,0,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
};

const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 500,
    textAlign: 'center',
    lineHeight: 1.3,
    color: 'inherit',
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
};

function DockerDeckNode({ dockerServiceId, dockerIconUrl }: DockerDeckNodeProperties) {
    const handles = [
        { type: 'source' as const, position: Position.Top,    id: 'a' },
        { type: 'source' as const, position: Position.Right,  id: 'b' },
        { type: 'source' as const, position: Position.Bottom, id: 'c' },
        { type: 'source' as const, position: Position.Left,   id: 'd' },
        { type: 'target' as const, position: Position.Top,    id: 'e' },
        { type: 'target' as const, position: Position.Right,  id: 'f' },
        { type: 'target' as const, position: Position.Bottom, id: 'g' },
        { type: 'target' as const, position: Position.Left,   id: 'h' },
    ];

    return (
        <BaseNode
            handles={handles}
            hoverAreaSize={140}
            className="relative"
            label={<span style={labelStyle}>{dockerServiceId}</span>}
        >
            {/* Circle — exactly fills the node bounding box */}
            <div style={circleStyle}>
                <img
                    src={dockerIconUrl}
                    style={{ width: iconSize, height: iconSize, objectFit: 'contain', display: 'block' }}
                />
            </div>
        </BaseNode>
    );
}

export default DockerDeckNode
