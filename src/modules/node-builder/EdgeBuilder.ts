import { DockerDeckEdge } from "../../model/DockerDeckEdge";
import { IDockerService } from "../../interface/ast/IDockerService";
import { IDockerNetwork } from "../../interface/ast/IDockerNetwork";
import { IDockerVolume } from "../../interface/ast/IDockerVolume";

interface IDockerComposeAst {
    services: IDockerService[];
    networks?: IDockerNetwork[];
    volumes?: IDockerVolume[];
}

interface IEdgeBuilderOptions {
    showDependencyEdges?: boolean;
}

export class EdgeBuilder {
    private ast: IDockerComposeAst;
    private edges: DockerDeckEdge[];

    constructor(ast: IDockerComposeAst) {
        this.ast = ast;
        this.edges = [];
    }

    /**
     * Build all edges based on the AST
     * Creates edges for:
     * 1. Service to Network connections
     * 2. Service to Volume connections
     * 3. Service depends_on connections (optional)
     */
    buildEdges(options: IEdgeBuilderOptions = {}): DockerDeckEdge[] {
        const { showDependencyEdges = true } = options;
        this.edges = [];
        
        // Build service to network edges
        this.buildServiceNetworkEdges();
        
        // Build service to volume edges
        this.buildServiceVolumeEdges();

        // Build service dependency edges (depends_on)
        if (showDependencyEdges) {
            this.buildServiceDependencyEdges();
        }

        return this.edges;
    }

    /**
     * Create edges between services and networks they are connected to
     */
    private buildServiceNetworkEdges(): void {
        this.ast.services.forEach(service => {
            service.networks.forEach(networkName => {
                // Check if the network exists in the AST
                const networkExists = this.ast.networks?.some(network => network.name === networkName);
                
                if (networkExists || this.shouldCreateImplicitNetwork(networkName)) {
                    const edge: DockerDeckEdge = {
                        id: `${service.name}-to-${networkName}`,
                        source: service.name,
                        target: networkName,
                        type: 'default', // Use default instead of smoothstep
                        animated: false, // Disable animation for now
                        style: {
                            stroke: '#10b981', // Green color for network connections
                            strokeWidth: 2,
                        },
                        label: 'network',
                        path: [`services.${service.name}`, `networks.${networkName}`],
                        sources: [service.name],
                        targets: [networkName],
                        data: {
                            connectionType: 'network',
                            serviceName: service.name,
                            networkName: networkName,
                        }
                    };
                    
                    this.edges.push(edge);
                }
            });
        });
    }

    /**
     * Create edges between services and volumes they mount
     */
    private buildServiceVolumeEdges(): void {
        this.ast.services.forEach(service => {
            service.volumes.forEach(volumeMapping => {
                // Extract volume name from the external path
                // Handle both named volumes and bind mounts
                const volumeName = this.extractVolumeName(volumeMapping.external);
                
                if (volumeName) {
                    // Check if it's a named volume (exists in the volumes section)
                    const isNamedVolume = this.ast.volumes?.some(volume => volume.name === volumeName);
                    
                    if (isNamedVolume) {
                        const edge: DockerDeckEdge = {
                            id: `${service.name}-to-${volumeName}`,
                            source: service.name,
                            target: volumeName,
                            type: 'default', // Use default instead of smoothstep
                            animated: false, // Disable animation for now
                            style: {
                                stroke: '#f59e0b', // Amber color for volume connections
                                strokeWidth: 2,
                            },
                            label: 'volume',
                            path: [`services.${service.name}`, `volumes.${volumeName}`],
                            sources: [service.name],
                            targets: [volumeName],
                            data: {
                                connectionType: 'volume',
                                serviceName: service.name,
                                volumeName: volumeName,
                                internalPath: volumeMapping.internal,
                                externalPath: volumeMapping.external,
                            }
                        };
                        
                        this.edges.push(edge);
                    }
                    // For bind mounts (host paths), we could create different edges
                    // but typically these aren't represented as separate nodes
                }
            });
        });
    }

    /**
     * Extract volume name from external path
     * Handles named volumes and returns null for bind mounts (absolute paths)
     */
    private extractVolumeName(externalPath: string): string | null {
        // If it starts with / or contains :/ it's likely a bind mount, not a named volume
        if (externalPath.startsWith('/') || externalPath.includes(':/')) {
            return null;
        }
        
        // Return the volume name (everything before any colon for read-only mounts)
        const volumeName = externalPath.split(':')[0];
        return volumeName;
    }

    /**
     * Determine if we should create an implicit network
     * Docker Compose creates a default network if none is specified
     */
    private shouldCreateImplicitNetwork(_networkName: string): boolean {
        // Docker Compose creates a default network named after the project
        // For now, we'll create edges for any network referenced by services
        return true;
    }

    /**
     * Create edges between services that share networks (service-to-service communication)
     */
    buildServiceToServiceEdges(): DockerDeckEdge[] {
        const serviceToServiceEdges: DockerDeckEdge[] = [];
        const serviceNetworkMap = new Map<string, string[]>();

        // Build a map of services to their networks
        this.ast.services.forEach(service => {
            serviceNetworkMap.set(service.name, service.networks);
        });

        // Find services that share networks
        this.ast.services.forEach(serviceA => {
            this.ast.services.forEach(serviceB => {
                if (serviceA.name !== serviceB.name) {
                    const sharedNetworks = this.findSharedNetworks(
                        serviceNetworkMap.get(serviceA.name) || [],
                        serviceNetworkMap.get(serviceB.name) || []
                    );

                    if (sharedNetworks.length > 0) {
                        // Create edge only if it doesn't already exist (avoid duplicates)
                        const edgeId = `${serviceA.name}-to-${serviceB.name}`;
                        const reverseEdgeId = `${serviceB.name}-to-${serviceA.name}`;
                        
                        const edgeExists = serviceToServiceEdges.some(edge => 
                            edge.id === edgeId || edge.id === reverseEdgeId
                        );

                        if (!edgeExists) {
                            const edge: DockerDeckEdge = {
                                id: `${serviceA.name}-to-${serviceB.name}`,
                                source: serviceA.name,
                                target: serviceB.name,
                                type: 'default', // Use default instead of smoothstep
                                animated: false,
                                style: {
                                    stroke: '#6366f1', // Indigo color for service-to-service connections
                                    strokeWidth: 1,
                                    strokeDasharray: '5,5', // Dashed line to differentiate
                                },
                                label: 'communicates',
                                path: [`services.${serviceA.name}`, `services.${serviceB.name}`],
                                sources: [serviceA.name],
                                targets: [serviceB.name],
                                data: {
                                    connectionType: 'service-to-service',
                                    sourceService: serviceA.name,
                                    targetService: serviceB.name,
                                    sharedNetworks: sharedNetworks,
                                }
                            };
                            
                            serviceToServiceEdges.push(edge);
                        }
                    }
                }
            });
        });

        return serviceToServiceEdges;
    }

    /**
     * Find networks that are shared between two services
     */
    private findSharedNetworks(networksA: string[], networksB: string[]): string[] {
        return networksA.filter(network => networksB.includes(network));
    }

    /**
     * Extract dependency service names from the service.
     * The AST builder should have already normalized depends_on to dependsOn array.
     */
    private extractDependsOnNames(service: IDockerService): string[] {
        return service.dependsOn || [];
    }

    /**
     * Create edges representing service dependencies using depends_on.
     * Direction: source service -> target dependency service.
     */
    private buildServiceDependencyEdges(): void {
        const serviceNames = new Set(this.ast.services.map(s => s.name));

        this.ast.services.forEach(service => {
            const dependencies = this.extractDependsOnNames(service);

            dependencies.forEach(depName => {
                if (!serviceNames.has(depName)) {
                    console.warn(`Dependency ${depName} not found as a service for ${service.name}`);
                    return;
                }

                const edgeId = `${service.name}-depends-on-${depName}`;
                const alreadyExists = this.edges.some(e => e.id === edgeId);
                if (alreadyExists) return;

                const edge: DockerDeckEdge = {
                    id: edgeId,
                    source: service.name,
                    target: depName,
                    type: 'default',
                    animated: true,
                    style: {
                        stroke: '#ef4444', // Red for dependency edges
                        strokeWidth: 3, // Make it thicker to be more visible
                        strokeDasharray: '10,5', // Add dashing for distinction
                    },
                    label: 'depends_on',
                    path: [`services.${service.name}.depends_on`, `services.${depName}`],
                    sources: [service.name],
                    targets: [depName],
                    data: {
                        connectionType: 'depends_on',
                        sourceService: service.name,
                        targetService: depName,
                    }
                };

                this.edges.push(edge);
            });
        });
    }

    /**
     * Get all edges (infrastructure + service-to-service)
     */
    getAllEdges(options: IEdgeBuilderOptions = {}): DockerDeckEdge[] {
        const infrastructureEdges = this.buildEdges(options);
        const serviceToServiceEdges = this.buildServiceToServiceEdges();
        
        return [...infrastructureEdges, ...serviceToServiceEdges];
    }
}

export default EdgeBuilder;
