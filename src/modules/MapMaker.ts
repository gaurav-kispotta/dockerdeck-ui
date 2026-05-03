import { Node } from "@xyflow/react";
import { YamlDockerCompose } from "../store/slices/uploadedFileSlice";
import uniqolor from 'uniqolor';
import { DockerDeckNode } from "../model/DockerDeckNode";
import { DockerDeckEdge } from "../model/DockerDeckEdge";
import { SettingsState } from "../store/slices/settingsSlice";
import { AppDispatch } from "../store/store";
import { IDockerComposeAst } from "./ast/DockerComposeAstBuilder";
import { MapBuildContext } from "../interface/map-builder/MapBuildContext";
import { MapBuildPipelineFactory } from "./map-builder/MapBuildPipelineFactory";

export type GroupNode = Node & { children: Node[] }
export type AnyArrayOrUndefined = any[] | undefined
export type GroupMap = { [key: string]: Node[] }

export const fromNodeToGroupNode = (nodes: Node[]): GroupNode[] => {
    return nodes.map(n => ({ ...n, children: [] }))
}

export const fromGroupNodeToNode = (groupNodes: GroupNode[]): Node[] => {
    return groupNodes.map(gn => ({ ...gn }))
}

export const customUniqueColour = (name: string): string => {
    let rgbColor = uniqolor(name, { format: 'rgb' }).color
    rgbColor = rgbColor.replace('rgb(', '').replace(')', '')
    return `rgba(${rgbColor}, 0.4)`
}

export default class MapMaker {
    public nodes: DockerDeckNode[] = []
    public edges: DockerDeckEdge[] = []

    public async buildMap3(
        yamlObject: YamlDockerCompose,
        settings?: SettingsState,
        // Retained with _ prefix for call-site compatibility — dispatch is no longer called here.
        // Callers should dispatch setAstObject(ast) using the Promise return value.
        _dispatch?: AppDispatch
    ): Promise<IDockerComposeAst | undefined> {
        try {
            const initialContext: MapBuildContext = {
                yamlObject,
                settings,
                ast: undefined,
                networkNodes: [],
                serviceNodes: [],
                volumeNodes: [],
                allNodes: [],
                rawEdges: [],
                validEdges: [],
                laidOutNodes: [],
                positionedNodes: [],
                networkLayerY: 0,
                serviceLayerY: 0,
                volumeLayerY: 0,
                finalNodes: [],
                finalEdges: [],
            };

            const pipeline = MapBuildPipelineFactory.createDefault(settings);
            const result = await pipeline.execute(initialContext);

            this.nodes = result.finalNodes;
            this.edges = result.finalEdges;
            return result.ast;
        } catch (error) {
            console.error('Error in MapMaker.buildMap3:', error);
            this.nodes = [];
            this.edges = [];
            throw error;
        }
    }
}
