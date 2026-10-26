import type { Node } from '@xyflow/react';
import type { LayerType } from '../nodes/annotations/architecture/LayeredGroupBandNode';

import { CARD_WIDTH, CARD_HEIGHT, LAYER_PAD_X, LAYER_PAD_TOP, LAYER_PAD_BOTTOM } from '../../constants/graphLayout';

const LAYER_TYPES: LayerType[] = ['network', 'service', 'volume'];

/**
 * Builds ReactFlow annotation nodes that frame each node-type layer
 * (networks / services / volumes) in the Layered map layout.
 *
 * Positions are derived directly from the current Redux node positions,
 * so they stay accurate regardless of centering offsets.
 *
 * All annotation nodes are: non-draggable, non-selectable, non-focusable.
 */
export function buildLayeredAnnotationNodes(nodes: Node[]): Node[] {
    const annotations: Node[] = [];

    for (const layerType of LAYER_TYPES) {
        const group = nodes.filter(n => n.data?.nodeType === layerType);
        if (group.length === 0) continue;

        const minX = Math.min(...group.map(n => n.position.x));
        const maxX = Math.max(...group.map(n => n.position.x + Math.max(CARD_WIDTH, n.measured?.width ?? n.width ?? 0)));
        const minY = Math.min(...group.map(n => n.position.y));
        const maxY = Math.max(...group.map(n => n.position.y + Math.max(CARD_HEIGHT, n.measured?.height ?? n.height ?? 0)));

        const bandX = minX - LAYER_PAD_X;
        const bandY = minY - LAYER_PAD_TOP;
        const bandW = maxX - minX + LAYER_PAD_X * 2;
        const bandH = maxY - minY + LAYER_PAD_TOP + LAYER_PAD_BOTTOM;

        annotations.push({
            id:          `__layer-${layerType}`,
            type:        'layered-group-band',
            position:    { x: bandX, y: bandY },
            data:        { layerType, width: bandW, height: bandH },
            draggable:   false,
            selectable:  false,
            focusable:   false,
            connectable: false,
            zIndex:      -1,
            width:       bandW,
            height:      bandH,
            style:       { width: bandW, height: bandH, pointerEvents: 'none' },
        } as Node);
    }

    return annotations;
}
