import { IUniqueColorBuilder } from "../../interface/node-builder/util/IUniqueColorBuilder";
import { DockerDeckNode } from "../../model/DockerDeckNode";
import BaseNodeBuilder from "./BaseNodeBuilder";

class GroupNodeBuilder extends BaseNodeBuilder {
    children: DockerDeckNode[];
    constructor(uniqueColorBuilder: IUniqueColorBuilder, width = 100, height = 100) {
        super(uniqueColorBuilder, width, height);
        this.children = [];
    }

    pushChild(child: DockerDeckNode): void {
        this.children.push(child);
    }

    pushChildren(children: DockerDeckNode[]): void {
        this.children.push(...children);
    }

    build(id: string, parentId: string): DockerDeckNode {
        const baseNode: DockerDeckNode = super.build(id, parentId);

        baseNode.data.label = "Group: " + id;
        baseNode.children = this.children;

        return baseNode;
    }
}

export default GroupNodeBuilder