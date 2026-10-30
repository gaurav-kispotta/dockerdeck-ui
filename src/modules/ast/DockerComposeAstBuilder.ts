import { YamlDockerCompose } from '../../store/slices/uploadedFileSlice';
import { IDockerNetwork } from '../../interface/ast/IDockerNetwork';
import { IDockerService } from '../../interface/ast/IDockerService';
import { IDockerVolume } from '../../interface/ast/IDockerVolume';
import { JsonPathParser } from '../JsonPathParser';

export interface IDockerComposeAst {
    services: IDockerService[];
    networks?: IDockerNetwork[];
    volumes?: IDockerVolume[];
}

export type ComposePort = IDockerService['ports'][number];

/** Normalize Compose short and long port syntax into the AST's host/container shape. */
export function normalizeComposePort(rawPort: unknown): ComposePort {
    const diagnostic = (message: string): ComposePort => ({ internal: 0, external: 0, diagnostic: message });
    const numberValue = (value: unknown): number | null => {
        const number = typeof value === 'number' ? value : Number(value);
        return Number.isInteger(number) && number > 0 && number <= 65535 ? number : null;
    };
    const make = (published: unknown, target: unknown, hostIp?: unknown, protocol?: unknown): ComposePort => {
        const internal = numberValue(target);
        const external = numberValue(published ?? target);
        if (internal === null || external === null) return diagnostic(`Unsupported port value: target=${String(target)}, published=${String(published)}`);
        const result: ComposePort = { internal, external };
        if (hostIp !== undefined && hostIp !== null && hostIp !== '') result.hostIp = String(hostIp);
        if (protocol !== undefined && protocol !== null && protocol !== '') result.protocol = String(protocol).toLowerCase();
        return result;
    };

    if (typeof rawPort === 'number') return make(undefined, rawPort);
    if (rawPort && typeof rawPort === 'object') {
        const value = rawPort as Record<string, unknown>;
        return make(value.published, value.target, value.host_ip ?? value.hostIp, value.protocol);
    }
    if (typeof rawPort !== 'string') return diagnostic(`Unsupported port definition: ${String(rawPort)}`);

    const [withoutProtocol, protocol] = rawPort.trim().split('/', 2);
    if (!withoutProtocol) return diagnostic('Empty port definition');
    if (withoutProtocol.includes('[') || withoutProtocol.includes(']')) return diagnostic(`Unsupported IPv6 port definition: ${rawPort}`);
    const parts = withoutProtocol.split(':');
    if (parts.some(part => part.includes('-'))) return diagnostic(`Port ranges are unsupported: ${rawPort}`);
    if (parts.length === 1) return make(undefined, parts[0], undefined, protocol);
    if (parts.length === 2) return make(parts[0], parts[1], undefined, protocol);
    if (parts.length === 3) return make(parts[1], parts[2], parts[0], protocol);
    return diagnostic(`Unsupported port definition: ${rawPort}`);
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

            // Extract depends_on and normalize to array of strings
            const extractDependsOn = (dependsOnValue: any): string[] => {
                if (!dependsOnValue) return [];
                if (Array.isArray(dependsOnValue)) return dependsOnValue;
                if (typeof dependsOnValue === 'object') return Object.keys(dependsOnValue);
                if (typeof dependsOnValue === 'string') return [dependsOnValue];
                return [];
            };

            const service: IDockerService = {
                name: serviceName,
                image: { name: imageName, tag: imageTag },
                containerName: rawService.container_name || serviceName, // default to service name if not set
                ports: Array.isArray(rawService.ports) ? rawService.ports.map(normalizeComposePort) : [],
                volumes: rawService.volumes?.map((volumeMapping: string) => {
                    const [external, internal] = volumeMapping.split(':');
                    return { internal, external };
                }) || [],
                networks: Array.isArray(rawService.networks) ? rawService.networks : [],
                dependsOn: extractDependsOn(rawService.depends_on),
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
