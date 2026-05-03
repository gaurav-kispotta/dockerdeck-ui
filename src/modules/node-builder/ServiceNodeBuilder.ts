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

        baseNode.data.label = id;
        baseNode.data.nodeType = 'service';
        baseNode.extent = 'parent';
        // Use the docker image name as the node type
        // This will map to the dynamically generated node types from NodesConfig.json
        baseNode.type = this.serviceAst.image.name || 'unknown-type'; // Fallback to 'unknown-type' if image name is missing
        baseNode.style = {}

        return baseNode;
    }
}

export default ServiceNodeBuilder