import { YamlDockerCompose } from "../../context/UploadedFileContext";
import { IDesignElement } from "../../interface/IDesignElements";
import { INodeBuilder } from "../../interface/INodeBuilder";
import { IPathParser } from "../../interface/IPathParser";
import { DockerDeckNode } from "../../model/DockerDeckNode";
import UniqueColorBuilder from "./UniqueColorBuilder";

abstract class BaseNodeBuilder implements INodeBuilder {
    yamlObject: YamlDockerCompose = {}
    jsonPathParser: IPathParser
    uniqueColorBuilder = new UniqueColorBuilder()
    width = 100
    height = 100
    node: DockerDeckNode | undefined = undefined

    constructor(pathParser: IPathParser) {
        this.jsonPathParser = pathParser
    }
    build(_id: string, _parentId: string): IDesignElement {
        throw new Error("Method not allowed for Base Node.");
    }

    getTypeFromImage(id: string): string {
        if (this.jsonPathParser) {
            const image  = this.jsonPathParser.findPath(`$.services.${id}.image`)[0]
            return image.split(':')[0].split('/')[1]
        }

        return 'unknown-type'
    }

    buildBasicNode(id: string, parentId: string): any {
        this.node = {
                    id,
                    position: { x: 0, y: 0 },
                    style: { 
                        background: this.uniqueColorBuilder.getUniqueColor(id), 
                        border: '2px solid black'
                    },
                    data: { 
                        label: this.getTypeFromImage(id) + ': ' + id
                },
                    type: this.getTypeFromImage(id),
                    resizing: true,
                    parentId,
                    width: this.width,
                    height: this.height
                }
    }

    applyUniqueColor(): void {
        if (this.node && this.node.style) {
            this.node.style.background = this.uniqueColorBuilder.getUniqueColor(this.node.id)
        }
    }
}

export default BaseNodeBuilder