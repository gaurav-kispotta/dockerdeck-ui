import { IUniqueColorBuilder } from "../../interface/node-builder/util/IUniqueColorBuilder";
import { INodeBuilder } from "../../interface/node-builder/INodeBuilder";
import { DockerDeckNode } from "../../model/DockerDeckNode";

abstract class BaseNodeBuilder implements INodeBuilder {
  width: number;
  height: number;
  uniqueColorBuilder: IUniqueColorBuilder;

  constructor(
    uniqueColorBuilder: IUniqueColorBuilder,
    width = 100,
    height = 100,
  ) {
    this.uniqueColorBuilder = uniqueColorBuilder;
    this.width = width;
    this.height = height;
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
        label: 'unknown',
      },
      type: 'unknown-type',
      resizing: true,
      parentId: _parentId,
      width: this.width,
      height: this.height,
    };

    return node;
  }
}

export default BaseNodeBuilder;
