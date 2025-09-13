import { Node } from "@xyflow/react";

export type DockerDeckNode = Node & { 
    children?: Node[];
    parentNode?: string;
} & {
    layoutOptions?: Record<string, any>
};