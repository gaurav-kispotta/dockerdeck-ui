import { IUniqueColorBuilder } from "../../interface/node-builder/util/IUniqueColorBuilder";
import { DockerDeckNode } from "../../model/DockerDeckNode";
import { ElkJsLayoutOptions } from "../layout-engine/ElkJsLayoutOption";
import { SettingsState } from "../../store/settingsSlice";
import BaseNodeBuilder from "./BaseNodeBuilder";

class GroupNodeBuilder extends BaseNodeBuilder {
    children: DockerDeckNode[];
    private settings?: SettingsState;
    
    constructor(uniqueColorBuilder: IUniqueColorBuilder, width = 100, height = 100, settings?: SettingsState) {
        super(uniqueColorBuilder, width, height);
        this.children = [];
        this.settings = settings;
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
        baseNode.style = {
            backgroundColor: "transparent",
            border: "0px"
        };

        // Set parentNode on all children for React Flow
        this.children.forEach(child => {
            child.parentNode = id;
        });

        // Calculate dynamic spacing and padding based on settings
        const nodeSpacing = this.settings ? this.settings.nodeLevelPadding * 2 : 200; // Scale for group spacing
        const groupPadding = this.settings ? this.settings.platformPadding : 100; // Direct use

        baseNode.layoutOptions = new ElkJsLayoutOptions()
            .setCustomOption({
                'elk.spacing.nodeNode': nodeSpacing.toString(),
                'elk.algorithm': 'org.eclipse.elk.box',
                'elk.padding': `[top=${groupPadding},left=${groupPadding},bottom=${groupPadding},right=${groupPadding}]`,
            })
            .build();

        return baseNode;
    }
}

export default GroupNodeBuilder