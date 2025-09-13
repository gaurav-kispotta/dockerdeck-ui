import { DockerDeckNode } from "../../model/DockerDeckNode";
import { DockerDeckEdge } from "../../model/DockerDeckEdge";

export interface ILayoutEngine {
    layout(nodes: DockerDeckNode[], edges: DockerDeckEdge[]): Promise<any>;
}