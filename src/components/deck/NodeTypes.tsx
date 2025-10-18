import NodejsNode from "../nodes/NodejsNode";
import RedisNode from "../nodes/RedisNode";
import ServiceGroupNode from "../nodes/ServiceGroupNode";
import nodesConfig from "./config/NodesConfig.json";

const exportableNodeComponents = [];

function generateDockerDeckNodeComponents(nodesConfig: {
        "dockerImageName": string,
        "tag": string,
        "svgIconUrl": string
    }[]) {
    const nodeComponents: { [key: string]: React.FC<any> } = {};

    nodesConfig.forEach((node: any) => {

    });
    return nodeComponents;
}

export default {
    redis: RedisNode,
    nodejs: NodejsNode,
    group: ServiceGroupNode
}