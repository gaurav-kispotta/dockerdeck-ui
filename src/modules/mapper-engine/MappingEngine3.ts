import { YamlDockerCompose } from "../../store/slices/uploadedFileSlice";
import { ILayoutEngine } from "../../interface/layout-engine/ILayoutEngine";
import { IMappingEngine } from "../../interface/mapping-engine/IMappingEngine";
import { DockerDeckNode } from "../../model/DockerDeckNode";

export class MappingEngine3 implements IMappingEngine {
  map(_yamlObject: YamlDockerCompose, _LayoutEngine: ILayoutEngine): DockerDeckNode {
    // Implementation goes here

    return {} as DockerDeckNode;
  }
}
