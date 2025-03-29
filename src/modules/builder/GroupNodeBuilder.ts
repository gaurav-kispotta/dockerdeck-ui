import { IDesignElement } from "../../interface/IDesignElements";
import { IPathParser } from "../../interface/IPathParser";
import { IUniqueColorBuilder } from "../../interface/IUniqueColorBuilder";
import { DockerDeckNode } from "../../model/DockerDeckNode";
import BaseNodeBuilder from "./BaseNodeBuilder";

class GroupNodeBuilder extends BaseNodeBuilder {
    constructor(pathParser: IPathParser, uniqueColorBuilder: IUniqueColorBuilder, width = 100, height = 100) {
        super(pathParser, uniqueColorBuilder, width, height);
    }

    getNodeChildren(node: DockerDeckNode): string[] {
        return [];
    }

    build(id: string, parentId: string): DockerDeckNode {
        const baseNode: DockerDeckNode = super.build(id, parentId);

        baseNode.data.label = "Group: " + id;
        baseNode.data.children = this.getNodeChildren(baseNode);

        return baseNode;
    }
}

export default GroupNodeBuilder