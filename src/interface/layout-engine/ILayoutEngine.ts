import { Edge } from "@dagrejs/dagre";
import { LayoutOptions } from "elkjs";

export interface ILayoutEngine {
    layout(nodes: Node[], edges: Edge[], options?: LayoutOptions): Promise<any>;
}