import { IUniqueColorBuilder } from "../../interface/IUniqueColorBuilder";
import { IDesignElement } from "../../interface/IDesignElements";
import { INodeBuilder } from "../../interface/INodeBuilder";
import { IPathParser } from "../../interface/IPathParser";
import { DockerDeckNode } from "../../model/DockerDeckNode";

abstract class BaseNodeBuilder implements INodeBuilder {
  width: number;
  height: number;
  jsonPathParser: IPathParser;
  uniqueColorBuilder: IUniqueColorBuilder;

  constructor(
    pathParser: IPathParser,
    uniqueColorBuilder: IUniqueColorBuilder,
    width = 100,
    height = 100,
  ) {
    this.jsonPathParser = pathParser;
    this.uniqueColorBuilder = uniqueColorBuilder;
    this.width = width;
    this.height = height;
  }

  protected getTypeFromImage(serviceId: string): string {
    if (this.jsonPathParser) {
      const image = this.jsonPathParser.findPath(`$.services.${serviceId}.image`)[0];
      return image.split(":")[0].split("/")[1];
    }

    return "unknown-type";
  }

  build(_id: string, _parentId: string): DockerDeckNode {
    const node: DockerDeckNode = {
      id: _id,
      position: { x: 0, y: 0 },
      style: {
        background: this.uniqueColorBuilder.generateUniqueColor(_id),
        border: "2px solid black",
      },
      data: {
        label: this.getTypeFromImage(_id) + ": " + _id,
      },
      type: this.getTypeFromImage(_id),
      resizing: true,
      parentId: _parentId,
      width: this.width,
      height: this.height,
    };

    return node;
  }
}

export default BaseNodeBuilder;
