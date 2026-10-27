import { IDockerNetwork } from "../../interface/ast/IDockerNetwork";
import { IUniqueColorBuilder } from "../../interface/node-builder/util/IUniqueColorBuilder";
import { DockerDeckNode } from "../../model/DockerDeckNode";
import BaseNodeBuilder from "./BaseNodeBuilder";

class NetworkNodeBuilder extends BaseNodeBuilder {
    private networkAst: IDockerNetwork;

    constructor(networkAst: IDockerNetwork, uniqueColorBuilder: IUniqueColorBuilder, width = 180, height = 72) {
        super(uniqueColorBuilder, width, height);
        this.networkAst = networkAst;
    }

    build(id: string, parentId: string): DockerDeckNode {
        const baseNode: DockerDeckNode = super.build(id, parentId);

        baseNode.data.label = this.networkAst.name || id;
        baseNode.data.nodeType = 'network';
        baseNode.extent = 'parent';
        baseNode.type = "unknown-type";
        baseNode.style = {};

        return baseNode;
    }
}

export default NetworkNodeBuilder