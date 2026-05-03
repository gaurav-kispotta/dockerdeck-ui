import { IMapBuildStage } from '../../../interface/map-builder/IMapBuildStage';
import { MapBuildContext } from '../../../interface/map-builder/MapBuildContext';
import { DockerComposeAstBuilder } from '../../ast/DockerComposeAstBuilder';

export class AstBuildStage implements IMapBuildStage {
    async execute(context: MapBuildContext): Promise<MapBuildContext> {
        const builder = new DockerComposeAstBuilder(context.yamlObject);
        context.ast = builder.buildAst();
        return context;
    }
}
