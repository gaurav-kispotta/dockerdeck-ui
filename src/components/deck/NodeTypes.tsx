import React from "react";
import { NodeProps } from "@xyflow/react";
import NodejsNode from "../nodes/NodejsNode";
import RedisNode from "../nodes/RedisNode";
import ServiceGroupNode from "../nodes/ServiceGroupNode";
import DockerDeckNode from "../nodes/DockerDeckNode";
import nodesConfig from "./config/NodesConfig.json";

interface NodeConfig {
    dockerImageName: string;
    dockerTag: string;
    dockerIconUrl: string;
}

// Type for node components
type NodeComponent = React.ComponentType<NodeProps>;

// Generate node components dynamically from config
function generateDockerDeckNodeComponents(config: NodeConfig[]): Record<string, NodeComponent> {
    const nodeComponents: Record<string, NodeComponent> = {};

    config.forEach((nodeConfig: NodeConfig) => {
        // Create a component for each docker image in the config
        const NodeComponent: NodeComponent = (props: NodeProps) => {
            const serviceId = (props.data?.label as string) || props.id || '';
            const nodeType = (props.data?.nodeType as 'service' | 'network' | 'volume') || 'service';
            return (
                <DockerDeckNode
                    dockerServiceId={serviceId}
                    dockerImageName={nodeConfig.dockerImageName}
                    dockerIconUrl={nodeConfig.dockerIconUrl}
                    nodeType={nodeType}
                />
            );
        };
        
        // Set display name for debugging
        NodeComponent.displayName = `${nodeConfig.dockerImageName}Node`;
        
        // Register component with the docker image name as the key
        nodeComponents[nodeConfig.dockerImageName] = NodeComponent;
    });

    return nodeComponents;
}

// Generate all node types from config
const generatedNodeTypes = generateDockerDeckNodeComponents(nodesConfig);

const allNodeTypes: Record<string, NodeComponent> = {
    ...generatedNodeTypes,
};

// Falls back to unknown-type when image name is not registered
export default new Proxy(allNodeTypes, {
    get(target, prop: string) {
        return target[prop] ?? target['unknown-type'];
    },
});