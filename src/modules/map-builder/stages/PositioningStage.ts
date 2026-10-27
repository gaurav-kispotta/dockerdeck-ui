import { IMapBuildStage } from '../../../interface/map-builder/IMapBuildStage';
import { MapBuildContext } from '../../../interface/map-builder/MapBuildContext';

import { CARD_WIDTH, CARD_HEIGHT, LAYER_PAD_TOP, LAYER_PAD_BOTTOM } from '../../../constants/graphLayout';

export class PositioningStage implements IMapBuildStage {
    async execute(context: MapBuildContext): Promise<MapBuildContext> {
        const gap = context.settings?.nodeLevelPadding ?? 80;
        const padding = context.settings?.platformPadding ?? 100;
        const width = (node: MapBuildContext['laidOutNodes'][number]) => Math.max(CARD_WIDTH, node.width ?? 0);
        const height = (node: MapBuildContext['laidOutNodes'][number]) => Math.max(CARD_HEIGHT, node.height ?? 0);
        const layers = [context.networkNodes, context.serviceNodes, context.volumeNodes].map(category => {
            const ids = new Set(category.map(node => node.id));
            return context.laidOutNodes.filter(node => ids.has(node.id));
        });

        let nextY = padding;
        const layerYs: number[] = [];
        for (const nodes of layers) {
            layerYs.push(nextY);
            if (nodes.length === 0) continue;
            // Keep wide categories to at most two rows, centering each row.
            const cols = nodes.length > 5 ? Math.ceil(nodes.length / 2) : nodes.length;
            let rowY = nextY;
            for (let start = 0; start < nodes.length; start += cols) {
                const row = nodes.slice(start, start + cols);
                const rowWidth = row.reduce((sum, node) => sum + width(node), 0) + (row.length - 1) * gap;
                let x = -rowWidth / 2;
                for (const node of row) {
                    node.position = { x, y: rowY };
                    x += width(node) + gap;
                }
                rowY += Math.max(...row.map(height)) + gap;
            }
            // Reserve annotation label/footer space between categories as well.
            nextY = rowY + LAYER_PAD_TOP + LAYER_PAD_BOTTOM;
        }

        // Match other engines' graph-coordinate margins. ReactFlow fitView owns
        // viewport whitespace, so this margin does not control screen padding.
        const placed = layers.flat();
        if (placed.length > 0) {
            const minX = Math.min(...placed.map(node => node.position.x));
            placed.forEach(node => { node.position.x += padding - minX; });
        }
        [context.networkLayerY, context.serviceLayerY, context.volumeLayerY] = layerYs;
        context.positionedNodes = context.laidOutNodes;
        return context;
    }
}
