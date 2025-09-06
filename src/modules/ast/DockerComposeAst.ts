import { YamlDockerCompose } from '../../context/UploadedFileContext';
import TypeNodeBuilder from '../builder/TypeNodeBuilder';
import UniqueColorBuilder from '../builder/UniqueColorBuilder';
import { JsonPathParser } from '../JsonPathParser';

interface IDockerService {
    name: string;
    image: {
        name: string;
        tag: string;
    };
    containerName: string;
    ports: string[];
    volumes: string[];
    networks: string[];
}

interface IDockerNetwork {
    name: string;
    driver: string;
    ipam: {
        driver: string;
        config: {
            subnet: string;
            gateway: string;
        }[];
    };
}

interface IDockerVolume {
    name: string;
    driver: string;
    driver_opts: {
        [key: string]: string;
    };
}

interface IDockerComposeAst {
    services: IDockerService[];
    networks: IDockerNetwork[] | undefined;
    volumes: IDockerVolume[] | undefined;
}

interface Edge {
    from: string;
    to: string;
}

export class DockerComposeAstBuilder {
    private yamlObject: YamlDockerCompose;
    public ast: IDockerComposeAst = { services: [], networks: undefined, volumes: undefined };

    constructor(yamlObject: YamlDockerCompose) {
        // Clone to avoid mutating input
        this.yamlObject = yamlObject
        delete this.yamlObject['version'];
    }

    buildAst() {
        const nodes: Node[] = [];
        const jsonPathParser = new JsonPathParser(this.yamlObject);
        const typeNodeBuilder = new TypeNodeBuilder(jsonPathParser, new UniqueColorBuilder());

        const serviceKeys = jsonPathParser.findKeys('$.services');
        if (serviceKeys.length === 0) {
            throw new Error(
                'No services found in the docker compose file. As per specification, services must be defined.'
            );
        }
        const networkKeys = jsonPathParser.findKeys('$.networks');
        const volumeKeys = jsonPathParser.findKeys('$.volumes');

        serviceKeys.forEach((serviceName: string) => {
            const serviceImageType: string = jsonPathParser.findKeys(`$.services.${serviceName}.image`)[0];
            const serviceImageName = serviceImageType.split(':')[0];
            const serviceImageTag = serviceImageType.split(':')[1] || 'latest';
            const serviceContainerName = jsonPathParser.findKeys(`$.services.${serviceName}.container_name`)[0];
            const servicePorts = jsonPathParser.findKeys(`$.services.${serviceName}.ports`);
            const serviceVolumes = jsonPathParser.findKeys(`$.services.${serviceName}.volumes`);
            const serviceNetworks = jsonPathParser.findKeys(`$.services.${serviceName}.networks`);

            const service: IDockerService = {
                name: serviceName,
                image: {
                    name: serviceImageName,
                    tag: serviceImageTag
                },
                containerName: serviceContainerName,
                ports: servicePorts,
                volumes: serviceVolumes,
                networks: serviceNetworks
            }

            this.ast.services.push(service);
        });

        // Optionally, add nodes for networks and volumes
        networkKeys.forEach((networkKey: string) => {
            nodes.push({
                id: networkKey,
                type: 'network',
            });
        });

        volumeKeys.forEach((volumeKey: string) => {
            nodes.push({
                id: volumeKey,
                type: 'volume',
            });
        });

        this.ast = {
            nodes,
            edges: this.edges,
        };
        return this.ast;
    }

    private buildEdge(from: string, to: string): Edge {
        return { from, to };
    }
}