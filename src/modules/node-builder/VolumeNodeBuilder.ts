import { IDockerVolume } from "../../interface/ast/IDockerVolume";
import { IUniqueColorBuilder } from "../../interface/node-builder/util/IUniqueColorBuilder";
import { DockerDeckNode } from "../../model/DockerDeckNode";
import BaseNodeBuilder from "./BaseNodeBuilder";

class VolumeNodeBuilder extends BaseNodeBuilder {
    private volumeAst: IDockerVolume;

    constructor(volumeAst: IDockerVolume, uniqueColorBuilder: IUniqueColorBuilder, width = 100, height = 100) {
        super(uniqueColorBuilder, width, height);
        this.volumeAst = volumeAst;
    }

    build(id: string, parentId: string): DockerDeckNode {
        const baseNode: DockerDeckNode = super.build(id, parentId);

        baseNode.data.label = "Volume: " + this.volumeAst.name + id;
        baseNode.extent = 'parent';

        return baseNode;
    }
}

export default VolumeNodeBuilder