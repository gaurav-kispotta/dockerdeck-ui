import { Edge } from "@xyflow/react";

export type DockerDeckEdge = Edge & { 
    path: string[];
    sources: string[];
    targets: string[];
};