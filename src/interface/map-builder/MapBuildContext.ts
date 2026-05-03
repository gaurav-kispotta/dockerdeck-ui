import { IDockerComposeAst } from '../../modules/ast/DockerComposeAstBuilder';
import { DockerDeckNode } from '../../model/DockerDeckNode';
import { DockerDeckEdge } from '../../model/DockerDeckEdge';
import { YamlDockerCompose } from '../../store/slices/uploadedFileSlice';
import { SettingsState } from '../../store/slices/settingsSlice';

export interface MapBuildContext {
    readonly yamlObject: YamlDockerCompose;
    readonly settings: SettingsState | undefined;

    // Stage 1 — AstBuildStage
    ast: IDockerComposeAst | undefined;

    // Stage 2 — NodeBuildStage
    networkNodes: DockerDeckNode[];
    serviceNodes: DockerDeckNode[];
    volumeNodes: DockerDeckNode[];
    allNodes: DockerDeckNode[];

    // Stage 3 — EdgeBuildStage
    rawEdges: DockerDeckEdge[];

    // Stage 4 — EdgeValidationStage (orphan-warned subset; rawEdges used for final assembly)
    validEdges: DockerDeckEdge[];

    // Stage 5 — LayoutStage
    laidOutNodes: DockerDeckNode[];

    // Stage 6 — PositioningStage
    positionedNodes: DockerDeckNode[];
    networkLayerY: number;
    serviceLayerY: number;
    volumeLayerY: number;

    // Stage 7 — AssemblyStage
    finalNodes: DockerDeckNode[];
    finalEdges: DockerDeckEdge[];
}
