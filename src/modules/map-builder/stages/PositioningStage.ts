import { IMapBuildStage } from '../../../interface/map-builder/IMapBuildStage';
import { MapBuildContext } from '../../../interface/map-builder/MapBuildContext';

// Actual rendered dimensions from DockerDeckNode (hardcoded 200px wide, ~80px tall)
const CARD_W = 200;
const CARD_H = 80;
const H_STEP = 260;   // card width + 60px gap — gives breathing room between cards
const V_STEP = 200;   // vertical gap between layers (card height + 120px breathing room)

export class PositioningStage implements IMapBuildStage {
    async execute(context: MapBuildContext): Promise<MapBuildContext> {

        const networkLayerY = 0;
        const serviceLayerY = networkLayerY + CARD_H + V_STEP;
        const volumeLayerY  = serviceLayerY  + CARD_H + V_STEP;

        context.networkLayerY = networkLayerY;
        context.serviceLayerY = serviceLayerY;
        context.volumeLayerY  = volumeLayerY;

        const networkNodeIds = new Set(context.networkNodes.map(n => n.id));
        const serviceNodeIds = new Set(context.serviceNodes.map(n => n.id));
        const volumeNodeIds  = new Set(context.volumeNodes.map(n => n.id));

        const placedNetworks = context.laidOutNodes.filter(n => networkNodeIds.has(n.id));
        const placedServices = context.laidOutNodes.filter(n => serviceNodeIds.has(n.id));
        const placedVolumes  = context.laidOutNodes.filter(n => volumeNodeIds.has(n.id));

        /**
         * Position a row of nodes centred around x = 0.
         * For large service counts arrange in up to 2 rows so the graph
         * doesn't become an unreadably wide single strip.
         */
        const positionRow = (nodes: typeof placedNetworks, baseY: number) => {
            const cols = nodes.length > 5 ? Math.ceil(nodes.length / 2) : nodes.length;
            const rows = Math.ceil(nodes.length / cols);
            const rowH  = CARD_H + 60; // row-to-row gap when multi-row

            nodes.forEach((n, i) => {
                const col = i % cols;
                const row = Math.floor(i / cols);
                // Centre each row individually
                const rowCount = row < rows - 1 ? cols : nodes.length - row * cols;
                const rowOffsetX = (rowCount - 1) * H_STEP / 2;
                n.position = {
                    x: col * H_STEP - rowOffsetX,
                    y: baseY + row * rowH,
                };
            });
        };

        positionRow(placedNetworks, networkLayerY);
        positionRow(placedServices, serviceLayerY);
        positionRow(placedVolumes,  volumeLayerY);

        // Centre the whole graph around the canvas origin
        const allPlaced = [...placedNetworks, ...placedServices, ...placedVolumes];
        if (allPlaced.length > 0) {
            const minX = Math.min(...allPlaced.map(n => n.position?.x ?? 0));
            const maxX = Math.max(...allPlaced.map(n => (n.position?.x ?? 0) + CARD_W));
            const minY = Math.min(...allPlaced.map(n => n.position?.y ?? 0));
            const maxY = Math.max(...allPlaced.map(n => (n.position?.y ?? 0) + CARD_H));

            const cx = -(maxX - minX) / 2 - minX;
            const cy = -(maxY - minY) / 2 - minY;

            allPlaced.forEach(n => {
                if (n.position) {
                    n.position.x += cx;
                    n.position.y += cy;
                }
            });
        }

        context.positionedNodes = context.laidOutNodes;
        return context;
    }
}
