export interface IDockerService {
    name: string;
    image: {
        name: string;
        tag: string;
    };
    containerName: string;
    ports: {
        internal: number;
        external: number;
        hostIp?: string;
        protocol?: string;
        diagnostic?: string;
    }[];
    volumes: {
        internal: string;
        external: string;
    }[];
    networks: string[];
    dependsOn: string[];
}
