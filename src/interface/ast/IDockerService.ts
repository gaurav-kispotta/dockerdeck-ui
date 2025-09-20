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
    }[];
    volumes: {
        internal: string;
        external: string;
    }[];
    networks: string[];
    dependsOn: string[];
}