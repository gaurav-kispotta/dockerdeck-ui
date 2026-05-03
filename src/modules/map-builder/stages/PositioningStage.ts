import { IMapBuildStage } from '../../../interface/map-builder/IMapBuildStage';
import { MapBuildContext } from '../../../interface/map-builder/MapBuildContext';

export class PositioningStage implements IMapBuildStage {
    async execute(context: MapBuildContext): Promise<MapBuildContext> {
        const nodeSize = context.settings?.nodeSize ?? 100;
        const spacing = context.settings ? context.settings.nodeLevelPadding * 3 : 300;

        const networkY = 0;
        const serviceY = networkY + spacing;
        const volumeY = serviceY + spacing;

        // Store raw layer Y values before centering — AssemblyStage uses these for group container nodes
        context.networkLayerY = networkY;
        context.serviceLayerY = serviceY;
        context.volumeLayerY = volumeY;

        const networkNodeIds = new Set(context.networkNodes.map((n) => n.id));
        const serviceNodeIds = new Set(context.serviceNodes.map((n) => n.id));
        const volumeNodeIds = new Set(context.volumeNodes.map((n) => n.id));

        const placedNetworks = context.laidOutNodes.filter((n) => networkNodeIds.has(n.id));
        const placedServices = context.laidOutNodes.filter((n) => serviceNodeIds.has(n.id));
        const placedVolumes = context.laidOutNodes.filter((n) => volumeNodeIds.has(n.id));

        const positionLayer = (nodes: typeof placedNetworks, layerY: number) => {
            nodes.forEach((n, index) => {
                const centerX = (index * (nodeSize + 50)) - ((nodes.length - 1) * (nodeSize + 50)) / 2;
                n.position = { x: centerX, y: layerY };
            });
        };

        positionLayer(placedNetworks, networkY);
        positionLayer(placedServices, serviceY);
        positionLayer(placedVolumes, volumeY);

        // Center the entire layout on the canvas origin
        const allPlaced = [...placedNetworks, ...placedServices, ...placedVolumes];
        if (allPlaced.length > 0) {
            const minX = Math.min(...allPlaced.map((n) => n.position?.x ?? 0));
            const maxX = Math.max(...allPlaced.map((n) => (n.position?.x ?? 0) + nodeSize));
            const minY = Math.min(...allPlaced.map((n) => n.position?.y ?? 0));
            const maxY = Math.max(...allPlaced.map((n) => (n.position?.y ?? 0) + nodeSize));

            const centerOffsetX = -(maxX - minX) / 2;
            const centerOffsetY = -(maxY - minY) / 2;

            allPlaced.forEach((n) => {
                if (n.position) {
                    n.position.x += centerOffsetX;
                    n.position.y += centerOffsetY;
                }
            });
        }

        context.positionedNodes = context.laidOutNodes;
        return context;
    }
}
