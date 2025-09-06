import { YamlDockerCompose } from '../../context/UploadedFileContext';
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
    networks?: IDockerNetwork[];
    volumes?: IDockerVolume[];
}

export class DockerComposeAstBuilder {
    private yamlObject: YamlDockerCompose;
    public ast: IDockerComposeAst = { services: [] };

    constructor(yamlObject: YamlDockerCompose) {
        // Shallow clone to avoid mutating caller's object
        this.yamlObject = { ...yamlObject };
        // We do not care about the compose version for the AST shape
        delete this.yamlObject.version;
    }

    buildAst() {
        const jsonPathParser = new JsonPathParser(this.yamlObject);
        const serviceNames = jsonPathParser.findKeys('$.services');

        if (serviceNames.length === 0) {
            throw new Error('No services found in the docker compose file. As per specification, services must be defined.');
        }

        serviceNames.forEach((serviceName: string) => {
            const rawService: any = (this.yamlObject.services as any)?.[serviceName] || {};
            const imageString: string = rawService.image || '';
            const lastColon = imageString.lastIndexOf(':');
            const imageName = lastColon === -1 ? imageString : imageString.substring(0, lastColon);
            const imageTag = lastColon === -1 ? 'latest' : imageString.substring(lastColon + 1);

            const service: IDockerService = {
                name: serviceName,
                image: { name: imageName, tag: imageTag },
                containerName: rawService.container_name || serviceName, // default to service name if not set
                ports: Array.isArray(rawService.ports) ? rawService.ports : [],
                volumes: Array.isArray(rawService.volumes) ? rawService.volumes : [],
                networks: Array.isArray(rawService.networks) ? rawService.networks : [],
            };
            this.ast.services.push(service);
        });

        // Networks
        const networkNames = this.yamlObject.networks ? Object.keys(this.yamlObject.networks) : [];
        if (networkNames.length) {
            this.ast.networks = networkNames.map(n => ({ name: n, driver: (this.yamlObject.networks as any)[n]?.driver || 'bridge', ipam: { driver: '', config: [] } }));
        }

        // Volumes
        const volumeNames = this.yamlObject.volumes ? Object.keys(this.yamlObject.volumes) : [];
        if (volumeNames.length) {
            this.ast.volumes = volumeNames.map(v => ({ name: v, driver: (this.yamlObject.volumes as any)[v]?.driver || 'local', driver_opts: {} }));
        }

        return this.ast;
    }
}