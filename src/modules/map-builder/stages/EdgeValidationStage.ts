import { IMapBuildStage } from '../../../interface/map-builder/IMapBuildStage';
import { MapBuildContext } from '../../../interface/map-builder/MapBuildContext';

export class EdgeValidationStage implements IMapBuildStage {
    async execute(context: MapBuildContext): Promise<MapBuildContext> {
        const nodeIdSet = new Set(context.allNodes.map((n) => n.id));
        const invalidEdges = context.rawEdges.filter(
            (e) => !nodeIdSet.has(e.source) || !nodeIdSet.has(e.target)
        );
        if (invalidEdges.length > 0) {
            console.warn('EdgeValidationStage: invalid edges found (source/target not in nodes):', invalidEdges);
        }
        context.validEdges = context.rawEdges.filter(
            (e) => nodeIdSet.has(e.source) && nodeIdSet.has(e.target)
        );
        return context;
    }
}
