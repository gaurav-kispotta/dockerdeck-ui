import { Edge, Node } from '@xyflow/react';
import ELK, { ElkExtendedEdge, ElkNode, LayoutOptions } from 'elkjs/lib/elk.bundled.js';
import { GroupNode } from '../modules/MapMaker';

const elk = new ELK();

export const elkOptions: LayoutOptions = {
    'elk.algorithm': 'org.eclipse.elk.box',
    'elk.layered.spacing.nodeNodeBetweenLayers': '100',
    'elk.spacing.nodeNode': '100',
    'elk.box.packingMode': 'GROUP_DEC',
    'elk.childAreaWidth': '100',
    'elk.childAreaHeight': '20',
    'elk.layered.unnecessaryBendpoints': 'false',
    'elk.aspectRatio': '4'
};

export const getLayedOutElements = async (nodes: GroupNode[], edges: Edge[] | ElkExtendedEdge | undefined, customOptions: LayoutOptions | undefined = undefined) => {
    //const isHorizontal = options?.['elk.direction'] === 'RIGHT';
    const graph: ElkNode = {
        id: 'root',
        layoutOptions: customOptions || elkOptions,
        children: nodes.map((node: any) => ({
            ...node,
            // Adjust the target and source handle positions based on the layout
            // direction.
            //targetPosition: isHorizontal ? 'left' : 'top',
            //sourcePosition: isHorizontal ? 'right' : 'bottom',

            // Hardcode a width and height for elk to use when laying.
            layoutOptions: { 
                'elk.spacing.nodeNode': '150',
                'elk.algorithm': 'org.eclipse.elk.stress',
            },
            width: node?.width,
            height: node?.height,
        })),
        edges: edges as ElkExtendedEdge[] | undefined,
    };

    try {
        const layedOutGraph = await elk.layout(graph);

        // Prepare response that could be used for React Flow
        // React Flow expects a position property on the node instead of `x`
        // and `y` fields.
        return ({
            nodes: layedOutGraph?.children?.map((n: ElkNode) => ({
                ...n,
                position: { x: n.x, y: n.y },
                children: n.children?.map(c => ({
                    ...c,
                    position: { x: c.x, y: c.y },
                }))
            })),
            edges: layedOutGraph.edges,
        });
    } catch (e) {
        console.error(e);
    }
};