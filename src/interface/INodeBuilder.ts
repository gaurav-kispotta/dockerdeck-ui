import { IDesignElement } from "./IDesignElements";

export interface INodeBuilder {
    build(id: string, parentId: string): IDesignElement;
}