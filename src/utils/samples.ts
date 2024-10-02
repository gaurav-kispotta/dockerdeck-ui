import { Edge, Node } from "@xyflow/react";

export const nodes: Node[] = [
    {
        id: 'redis0',
        position: { x: 0, y: 0},
        data: { label: 'A' },
        type: 'redis',
        resizing: true
    },
    {
        id: 'redis1',
        position: { x: 100, y: 100},
        data: { label: 'B' }
    },
    {
        id: 'redis2',
        position: { x: 150, y: 150},
        data: { label: 'C' }
    },
    {
        id: 'nodejs1',
        position: { x: 150, y: 150},
        data: { label: 'C' },
        type: 'nodejs',
    },
]

export const edges: Edge[] = [{
    id: '0-1',
    source: 'redis0',
    target: 'redis1',
    animated: true

},
{
    id: '1-2',
    source: 'redis1',
    target: 'redis2',
    animated: true

}
]