import type { Node } from '@xyflow/react';
import type { LayerType } from '../nodes/annotations/architecture/LayeredGroupBandNode';

// Layout constants — match PositioningStage.ts values
const CARD_W    = 200;
const CARD_H    = 80;
const PAD_X     = 48;   // horizontal padding beyond node edges
const PAD_Y_TOP = 44;   // top padding (includes space for the label badge)
const PAD_Y_BOT = 24;   // bottom padding

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

        const xs = group.map(n => n.position?.x ?? 0);
        const ys = group.map(n => n.position?.y ?? 0);

        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        const bandX = minX - PAD_X;
        const bandY = minY - PAD_Y_TOP;
        const bandW = (maxX - minX) + CARD_W + PAD_X * 2;
        const bandH = (maxY - minY) + CARD_H + PAD_Y_TOP + PAD_Y_BOT;

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
