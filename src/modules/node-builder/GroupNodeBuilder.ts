import { IUniqueColorBuilder } from "../../interface/node-builder/util/IUniqueColorBuilder";
import { DockerDeckNode } from "../../model/DockerDeckNode";
import { ElkJsLayoutOptions } from "../layout-engine/ElkJsLayoutOption";
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
        baseNode.type = "group";

        // Set parentNode on all children for React Flow
        this.children.forEach(child => {
            child.parentNode = id;
        });

        baseNode.layoutOptions = new ElkJsLayoutOptions()
            .setCustomOption({
                'elk.spacing.nodeNode': '100',
                'elk.algorithm': 'org.eclipse.elk.box',
            })
            .build();

        return baseNode;
    }
}

export default GroupNodeBuilder