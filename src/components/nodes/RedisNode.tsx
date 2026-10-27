import { NodeProps, Position } from '@xyflow/react'
import IconNode from './IconNode'

import '@xyflow/react/dist/style.css';

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

function RedisNode(props: NodeProps) {
    const label = (props.data?.label as string) || props.id || '';

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
        <IconNode
            handles={handles}
            hoverAreaSize={140}
            label={<span style={labelStyle}>{label}</span>}
        >
            {/* Circle — exactly fills the node bounding box */}
            <div style={circleStyle}>
                <img
                    src="https://www.vectorlogo.zone/logos/redis/redis-icon.svg"
                    style={{ width: iconSize, height: iconSize, objectFit: 'contain', display: 'block' }}
                />
            </div>
        </IconNode>
    );
}

export default RedisNode
