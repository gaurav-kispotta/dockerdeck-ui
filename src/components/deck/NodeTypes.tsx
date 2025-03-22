import NodejsNode from "../nodes/NodejsNode";
import RedisNode from "../nodes/RedisNode";
import ServiceGroupNode from "../nodes/ServiceGroupNode";

export default {
    redis: RedisNode,
    nodejs: NodejsNode,
    group: ServiceGroupNode
}