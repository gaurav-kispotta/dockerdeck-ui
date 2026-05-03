import { IMapBuildStage } from '../../../interface/map-builder/IMapBuildStage';
import { MapBuildContext } from '../../../interface/map-builder/MapBuildContext';
import { IDockerComposeAst } from '../../ast/DockerComposeAstBuilder';
import { DockerDeckNode } from '../../../model/DockerDeckNode';
import NetworkNodeBuilder from '../../node-builder/NetworkNodeBuilder';
import ServiceNodeBuilder from '../../node-builder/ServiceNodeBuilder';
import VolumeNodeBuilder from '../../node-builder/VolumeNodeBuilder';
import UniqueColorBuilder from '../../node-builder/util/UniqueColorBuilder';

// Descriptor pairing an AST accessor with a node builder factory — OCP extension point.
// To add a new node type (secrets, configs, etc.), provide an extra INodeCategoryHandler
// without modifying this class.
interface INodeCategoryHandler<TAstItem> {
    getItems: (ast: IDockerComposeAst) => TAstItem[] | undefined;
    buildNode: (item: TAstItem, nodeWidth: number, nodeHeight: number) => DockerDeckNode;
    pushToContext: (context: MapBuildContext, nodes: DockerDeckNode[]) => void;
}

function buildNetworkHandler(): INodeCategoryHandler<any> {
    return {
        getItems: (ast) => ast.networks,
        buildNode: (network, nodeWidth, nodeHeight) => {
            const builder = new NetworkNodeBuilder(network, new UniqueColorBuilder(), nodeWidth, nodeHeight);
            return builder.build(network.name, '');
        },
        pushToContext: (context, nodes) => { context.networkNodes = nodes; },
    };
}

function buildServiceHandler(): INodeCategoryHandler<any> {
    return {
        getItems: (ast) => ast.services,
        buildNode: (service, nodeWidth, nodeHeight) => {
            const builder = new ServiceNodeBuilder(service, new UniqueColorBuilder(), nodeWidth, nodeHeight);
            const node = builder.build(service.name, '');
            if (service.dependsOn && service.dependsOn.length > 0) {
                node.data = { ...node.data, dependsOn: service.dependsOn };
            }
            return node;
        },
        pushToContext: (context, nodes) => { context.serviceNodes = nodes; },
    };
}

function buildVolumeHandler(): INodeCategoryHandler<any> {
    return {
        getItems: (ast) => ast.volumes,
        buildNode: (volume, nodeWidth, nodeHeight) => {
            const builder = new VolumeNodeBuilder(volume, new UniqueColorBuilder(), nodeWidth, nodeHeight);
            return builder.build(volume.name, '');
        },
        pushToContext: (context, nodes) => { context.volumeNodes = nodes; },
    };
}

export class NodeBuildStage implements IMapBuildStage {
    private readonly extraHandlers: INodeCategoryHandler<any>[];

    constructor(extraHandlers: INodeCategoryHandler<any>[] = []) {
        this.extraHandlers = extraHandlers;
    }

    async execute(context: MapBuildContext): Promise<MapBuildContext> {
        const ast = context.ast!;
        const nodeSize = context.settings?.nodeSize ?? 100;
        const nodeWidth = nodeSize;
        const nodeHeight = nodeSize;

        const allHandlers: INodeCategoryHandler<any>[] = [
            buildNetworkHandler(),
            buildServiceHandler(),
            buildVolumeHandler(),
            ...this.extraHandlers,
        ];

        for (const handler of allHandlers) {
            const items = handler.getItems(ast);
            if (!items || items.length === 0) continue;

            const builtNodes: DockerDeckNode[] = [];

            for (const item of items) {
                try {
                    builtNodes.push(handler.buildNode(item, nodeWidth, nodeHeight));
                } catch (error) {
                    console.error('NodeBuildStage: error building node for item:', item, error);
                }
            }

            handler.pushToContext(context, builtNodes);
        }

        context.allNodes = [
            ...context.networkNodes,
            ...context.serviceNodes,
            ...context.volumeNodes,
        ];

        return context;
    }
}
