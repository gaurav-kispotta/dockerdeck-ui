import dagre from '@dagrejs/dagre'

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

export function getLayoutedElements(nodes: any, edges: any, direction = 'TB', nodeHeight = 300, nodeWidth = 300) {
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node: any) => {
        dagreGraph.setNode(node.id, {
            width: node?.style?.width + 10 || nodeWidth,
            height: node?.style?.height + 10 || nodeHeight
        });
    });

    edges.forEach((edge: any) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);



    const newNodes = nodes.map((node: any) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        const newNode = {
            ...node,
            targetPosition: isHorizontal ? 'left' : 'top',
            sourcePosition: isHorizontal ? 'right' : 'bottom',
            // We are shifting the dagre node position (anchor=center center) to the top left
            // so it matches the React Flow node anchor point (top left).
            position: {
                x: nodeWithPosition.x - (node?.style?.width + 10 || nodeWidth) / 2,
                y: nodeWithPosition.y - (node?.style?.height + 10 || nodeHeight) / 2,
            },
        };

        return newNode;
    });
    return { nodes: newNodes, edges };
};