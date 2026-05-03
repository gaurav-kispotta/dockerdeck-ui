import { YamlDockerCompose } from "../../store/slices/uploadedFileSlice";
import { DockerDeckNode } from "../../model/DockerDeckNode";
import { ILayoutEngine } from "../layout-engine/ILayoutEngine";

export interface IMappingEngine {
  map(yamlObject: YamlDockerCompose, layoutEngine: ILayoutEngine): DockerDeckNode;
}
