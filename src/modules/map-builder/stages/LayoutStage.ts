import { IMapBuildStage } from '../../../interface/map-builder/IMapBuildStage';
import { MapBuildContext } from '../../../interface/map-builder/MapBuildContext';
import { ILayoutEngine } from '../../../interface/layout-engine/ILayoutEngine';
import { DockerDeckNode } from '../../../model/DockerDeckNode';

export class LayoutStage implements IMapBuildStage {
    constructor(private readonly layoutEngine: ILayoutEngine) {}

    async execute(context: MapBuildContext): Promise<MapBuildContext> {
        const result = await this.layoutEngine.layout(context.allNodes, context.rawEdges);
        context.laidOutNodes = result.nodes as DockerDeckNode[];
        return context;
    }
}
