import { IDockerVolume } from "../../interface/ast/IDockerVolume";
import { IUniqueColorBuilder } from "../../interface/node-builder/util/IUniqueColorBuilder";
import { DockerDeckNode } from "../../model/DockerDeckNode";
import BaseNodeBuilder from "./BaseNodeBuilder";

class VolumeNodeBuilder extends BaseNodeBuilder {
    constructor(_volumeAst: IDockerVolume, uniqueColorBuilder: IUniqueColorBuilder, width = 100, height = 100) {
        super(uniqueColorBuilder, width, height);
        // volumeAst stored for potential future use
    }

    build(id: string, parentId: string): DockerDeckNode {
        const baseNode: DockerDeckNode = super.build(id, parentId);

        baseNode.data.label = `Volume: ${id}`;
        baseNode.extent = 'parent';
        baseNode.type = "redis";

        return baseNode;
    }
}

export default VolumeNodeBuilder