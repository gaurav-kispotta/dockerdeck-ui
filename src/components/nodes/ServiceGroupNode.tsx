import { Handle, Position, useStore } from '@xyflow/react'

import '@xyflow/react/dist/style.css';

interface ServiceGroupNodeProperties {
    id: string;
}

function ServiceGroupNode({ id }: ServiceGroupNodeProperties) {
    const label = useStore((s) => {
        const node = s.nodeLookup.get(id)

        if (!node) {
            return null
        }

        return `Position of node is ${node.position.x}:${node.position.y}`
    })
    return (
        <>
            <div>{id}</div>
            <div>{label}</div>
        </>
    )
}

export default ServiceGroupNode
