import { Node } from "@xyflow/react";

export type DockerDeckNode = Node & { children?: Node[] } & {
    layoutOptions?: Record<string, any>
};