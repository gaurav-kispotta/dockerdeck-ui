import { MapBuildContext } from './MapBuildContext';

export interface IMapBuildStage {
    execute(context: MapBuildContext): Promise<MapBuildContext>;
}
