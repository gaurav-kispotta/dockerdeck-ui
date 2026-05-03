import { IMapBuildStage } from '../../../interface/map-builder/IMapBuildStage';
import { MapBuildContext } from '../../../interface/map-builder/MapBuildContext';
import { DockerDeckNode } from '../../../model/DockerDeckNode';
import { DockerDeckEdge } from '../../../model/DockerDeckEdge';

export class AssemblyStage implements IMapBuildStage {
    async execute(context: MapBuildContext): Promise<MapBuildContext> {
        context.finalNodes = context.positionedNodes.map((node) => ({
            ...node,
            parentId: undefined,
            parentNode: undefined,
        })) as DockerDeckNode[];

        // Use rawEdges for final assembly (matches original behavior — valid edges filter only warns)
        context.finalEdges = context.rawEdges.map((edge) => ({
            ...edge,
            id: edge.id,
            source: edge.source,
            target: edge.target,
            type: edge.type || 'default',
            animated: edge.animated || false,
            style: edge.style || { stroke: '#999', strokeWidth: 2 },
        })) as DockerDeckEdge[];

        return context;
    }
}
