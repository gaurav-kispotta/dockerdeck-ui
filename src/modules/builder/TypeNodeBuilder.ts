import { IDesignElement } from "../../interface/IDesignElements";
import { IPathParser } from "../../interface/IPathParser";
import { IUniqueColorBuilder } from "../../interface/IUniqueColorBuilder";
import { DockerDeckNode } from "../../model/DockerDeckNode";
import BaseNodeBuilder from "./BaseNodeBuilder";

class TypeNodeBuilder extends BaseNodeBuilder {
    constructor(pathParser: IPathParser, uniqueColorBuilder: IUniqueColorBuilder, width = 100, height = 100) {
        super(pathParser, uniqueColorBuilder, width, height);
    }

    

    build(id: string, parentId: string): DockerDeckNode {
        const baseNode: DockerDeckNode = super.build(id, parentId);

        baseNode.data.label = "Type: " + super.getTypeFromImage(id) + id;
        baseNode.extent = 'parent';

        return baseNode;
    }
}

export default TypeNodeBuilder