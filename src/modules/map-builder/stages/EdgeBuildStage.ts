import { IMapBuildStage } from '../../../interface/map-builder/IMapBuildStage';
import { MapBuildContext } from '../../../interface/map-builder/MapBuildContext';
import { IDockerComposeAst } from '../../ast/DockerComposeAstBuilder';
import { DockerDeckEdge } from '../../../model/DockerDeckEdge';
import { EdgeBuilder } from '../../node-builder/EdgeBuilder';

type EdgeBuilderFactory = (ast: IDockerComposeAst) => { getAllEdges(opts: { showDependencyEdges?: boolean }): DockerDeckEdge[] };

export class EdgeBuildStage implements IMapBuildStage {
    private readonly edgeBuilderFactory: EdgeBuilderFactory;

    constructor(edgeBuilderFactory?: EdgeBuilderFactory) {
        this.edgeBuilderFactory = edgeBuilderFactory ?? ((ast) => new EdgeBuilder(ast));
    }

    async execute(context: MapBuildContext): Promise<MapBuildContext> {
        const edgeBuilder = this.edgeBuilderFactory(context.ast!);
        context.rawEdges = edgeBuilder.getAllEdges({
            showDependencyEdges: context.settings?.showDependencies,
        });
        return context;
    }
}
