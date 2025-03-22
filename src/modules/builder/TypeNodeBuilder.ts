import { IDesignElement } from "../../interface/IDesignElements";
import { IPathParser } from "../../interface/IPathParser";
import BaseNodeBuilder from "./BaseNodeBuilder";

class TypeNodeBuilder extends BaseNodeBuilder {
    constructor(pathParser: IPathParser) {
        super(pathParser)
    }

    build(id: string, parentId: string): IDesignElement {
        const element = super.buildBasicNode(id, parentId);
        this.applyUniqueColor();
        return element;
    }
}

export default TypeNodeBuilder