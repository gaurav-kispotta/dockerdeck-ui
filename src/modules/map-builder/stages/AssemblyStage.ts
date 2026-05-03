import { IMapBuildStage } from '../../../interface/map-builder/IMapBuildStage';
import { MapBuildContext } from '../../../interface/map-builder/MapBuildContext';
import { DockerDeckNode } from '../../../model/DockerDeckNode';
import { DockerDeckEdge } from '../../../model/DockerDeckEdge';

export class AssemblyStage implements IMapBuildStage {
    async execute(context: MapBuildContext): Promise<MapBuildContext> {
        const groupContainerNodes: DockerDeckNode[] = [
            {
                id: 'networks',
                type: 'group',
                position: { x: 0, y: context.networkLayerY },
                data: { label: 'Networks' },
                parentNode: undefined,
                parentId: undefined,
                layoutOptions: { 'elk.priority': '1' },
            } as DockerDeckNode,
            {
                id: 'services',
                type: 'group',
                position: { x: 0, y: context.serviceLayerY },
                data: { label: 'Services' },
                parentNode: undefined,
                parentId: undefined,
                layoutOptions: { 'elk.priority': '2' },
            } as DockerDeckNode,
            {
                id: 'volumes',
                type: 'group',
                position: { x: 0, y: context.volumeLayerY },
                data: { label: 'Volumes' },
                parentNode: undefined,
                parentId: undefined,
                layoutOptions: { 'elk.priority': '3' },
            } as DockerDeckNode,
        ];

        const flatNodes = context.positionedNodes.map((node) => ({
            ...node,
            parentId: undefined,
            parentNode: undefined,
        })) as DockerDeckNode[];

        context.finalNodes = [...groupContainerNodes, ...flatNodes];

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
