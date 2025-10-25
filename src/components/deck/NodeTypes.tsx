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
            // Extract the label from props data or use id as fallback
            const serviceId = (props.data?.label as string) || props.id || '';
            
            return (
                <DockerDeckNode
                    dockerServiceId={serviceId}
                    dockerImageName={nodeConfig.dockerImageName}
                    dockerIconUrl={nodeConfig.dockerIconUrl}
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

// Export all node types including legacy ones and generated ones
export default {
    // Legacy node types for backward compatibility
    redis: RedisNode,
    nodejs: NodejsNode,
    group: ServiceGroupNode,
    // Dynamically generated node types from config
    ...generatedNodeTypes
}