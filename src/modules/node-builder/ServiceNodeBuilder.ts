import { IDockerService } from "../../interface/ast/IDockerService";
import { IUniqueColorBuilder } from "../../interface/node-builder/util/IUniqueColorBuilder";
import { DockerDeckNode } from "../../model/DockerDeckNode";
import BaseNodeBuilder from "./BaseNodeBuilder";

class ServiceNodeBuilder extends BaseNodeBuilder {
    private serviceAst: IDockerService;

    constructor(serviceAst: IDockerService, uniqueColorBuilder: IUniqueColorBuilder, width = 100, height = 100) {
        super(uniqueColorBuilder, width, height);
        this.serviceAst = serviceAst;
    }

    build(id: string, parentId: string): DockerDeckNode {
        const baseNode: DockerDeckNode = super.build(id, parentId);

        baseNode.data.label = "Service: " + this.serviceAst.image + id;
        baseNode.extent = 'parent';
        baseNode.type = "redis";
        baseNode.style = {}

        return baseNode;
    }
}

export default ServiceNodeBuilder