import { IDockerNetwork } from "../../interface/ast/IDockerNetwork";
import { IUniqueColorBuilder } from "../../interface/node-builder/util/IUniqueColorBuilder";
import { DockerDeckNode } from "../../model/DockerDeckNode";
import BaseNodeBuilder from "./BaseNodeBuilder";

class NetworkNodeBuilder extends BaseNodeBuilder {
    private networkAst: IDockerNetwork;

    constructor(networkAst: IDockerNetwork, uniqueColorBuilder: IUniqueColorBuilder, width = 100, height = 100) {
        super(uniqueColorBuilder, width, height);
        this.networkAst = networkAst;
    }

    build(id: string, parentId: string): DockerDeckNode {
        const baseNode: DockerDeckNode = super.build(id, parentId);

        baseNode.data.label = `Network: ${this.networkAst.name}${id}`;
        baseNode.extent = 'parent';
        baseNode.type = "redis";
        baseNode.style = {};

        return baseNode;
    }
}

export default NetworkNodeBuilder