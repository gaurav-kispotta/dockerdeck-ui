import { IMapBuildStage } from '../../../interface/map-builder/IMapBuildStage';
import { MapBuildContext } from '../../../interface/map-builder/MapBuildContext';

/**
 * No-op positioning stage: passes layout-engine positions through unchanged.
 * Used when a graph layout engine (Dagre, ELK) handles positioning directly.
 */
export class PassthroughPositioningStage implements IMapBuildStage {
    async execute(context: MapBuildContext): Promise<MapBuildContext> {
        context.positionedNodes = context.laidOutNodes;
        return context;
    }
}
