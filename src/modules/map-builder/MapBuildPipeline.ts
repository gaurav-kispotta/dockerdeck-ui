import { IMapBuildStage } from '../../interface/map-builder/IMapBuildStage';
import { MapBuildContext } from '../../interface/map-builder/MapBuildContext';

export class MapBuildPipeline {
    constructor(private readonly stages: IMapBuildStage[]) {}

    async execute(context: MapBuildContext): Promise<MapBuildContext> {
        let ctx = context;
        for (const stage of this.stages) {
            ctx = await stage.execute(ctx);
        }
        return ctx;
    }
}
