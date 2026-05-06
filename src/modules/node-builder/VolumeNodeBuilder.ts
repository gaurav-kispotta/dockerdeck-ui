import { IDockerVolume } from "../../interface/ast/IDockerVolume";
import { IUniqueColorBuilder } from "../../interface/node-builder/util/IUniqueColorBuilder";
import { DockerDeckNode } from "../../model/DockerDeckNode";
import BaseNodeBuilder from "./BaseNodeBuilder";

class VolumeNodeBuilder extends BaseNodeBuilder {
    constructor(_volumeAst: IDockerVolume, uniqueColorBuilder: IUniqueColorBuilder, width = 200, height = 64) {
        super(uniqueColorBuilder, width, height);
        // volumeAst stored for potential future use
    }

    build(id: string, parentId: string): DockerDeckNode {
        const baseNode: DockerDeckNode = super.build(id, parentId);

        baseNode.data.label = id;
        baseNode.data.nodeType = 'volume';
        baseNode.extent = 'parent';
        baseNode.type = 'volume';
        baseNode.style = {};

        return baseNode;
    }
}

export default VolumeNodeBuilder