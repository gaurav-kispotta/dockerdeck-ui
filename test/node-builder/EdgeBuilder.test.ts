import { describe, it, expect } from 'vitest';
import EdgeBuilder from '../../src/modules/node-builder/EdgeBuilder';
import { IDockerService } from '../../src/interface/ast/IDockerService';
import { IDockerNetwork } from '../../src/interface/ast/IDockerNetwork';
import { IDockerVolume } from '../../src/interface/ast/IDockerVolume';

interface IDockerComposeAst {
    services: IDockerService[];
    networks?: IDockerNetwork[];
    volumes?: IDockerVolume[];
}

describe('EdgeBuilder', () => {
    const mockService1: IDockerService = {
        name: 'web',
        image: { name: 'nginx', tag: 'latest' },
        containerName: 'web-container',
        ports: [{ internal: 80, external: 8080 }],
        volumes: [{ internal: '/usr/share/nginx/html', external: 'web-content' }],
        networks: ['frontend', 'backend'],
        dependsOn: []
    };

    const mockService2: IDockerService = {
        name: 'api',
        image: { name: 'node', tag: '20-alpine' },
        containerName: 'api-container',
        ports: [{ internal: 3000, external: 3000 }],
        volumes: [{ internal: '/app/data', external: 'api-data' }],
        networks: ['backend', 'database'],
        dependsOn: []
    };

    const mockService3: IDockerService = {
        name: 'db',
        image: { name: 'postgres', tag: '15' },
        containerName: 'db-container',
        ports: [{ internal: 5432, external: 5432 }],
        volumes: [{ internal: '/var/lib/postgresql/data', external: 'db-data' }],
        networks: ['database'],
        dependsOn: []
    };

    const mockNetworks: IDockerNetwork[] = [
        {
            name: 'frontend',
            driver: 'bridge',
            ipam: { driver: 'default', config: [] }
        },
        {
            name: 'backend',
            driver: 'bridge',
            ipam: { driver: 'default', config: [] }
        },
        {
            name: 'database',
            driver: 'bridge',
            ipam: { driver: 'default', config: [] }
        }
    ];

    const mockVolumes: IDockerVolume[] = [
        {
            name: 'web-content',
            driver: 'local',
            driver_opts: {}
        },
        {
            name: 'api-data',
            driver: 'local',
            driver_opts: {}
        },
        {
            name: 'db-data',
            driver: 'local',
            driver_opts: {}
        }
    ];

    const mockAst: IDockerComposeAst = {
        services: [mockService1, mockService2, mockService3],
        networks: mockNetworks,
        volumes: mockVolumes
    };

    describe('buildEdges', () => {
        it('creates edges between services and networks', () => {
            const edgeBuilder = new EdgeBuilder(mockAst);
            const edges = edgeBuilder.buildEdges();

            // Filter network edges
            const networkEdges = edges.filter(edge => edge.data?.connectionType === 'network');
            
            // Should have 5 network edges total:
            // web -> frontend, web -> backend, api -> backend, api -> database, db -> database
            expect(networkEdges).toHaveLength(5);

            // Check specific edges
            const webToFrontend = networkEdges.find(edge => 
                edge.source === 'web' && edge.target === 'frontend'
            );
            expect(webToFrontend).toBeDefined();
            expect(webToFrontend?.label).toBe('network');
            expect(webToFrontend?.style?.stroke).toBe('#10b981');

            const apiToBackend = networkEdges.find(edge =>
                edge.source === 'api' && edge.target === 'backend'
            );
            expect(apiToBackend).toBeDefined();
            expect(apiToBackend?.data?.serviceName).toBe('api');
            expect(apiToBackend?.data?.networkName).toBe('backend');
        });

        it('creates edges between services and volumes', () => {
            const edgeBuilder = new EdgeBuilder(mockAst);
            const edges = edgeBuilder.buildEdges();

            // Filter volume edges
            const volumeEdges = edges.filter(edge => edge.data?.connectionType === 'volume');
            
            // Should have 3 volume edges: web -> web-content, api -> api-data, db -> db-data
            expect(volumeEdges).toHaveLength(3);

            // Check specific edge
            const webToVolume = volumeEdges.find(edge =>
                edge.source === 'web' && edge.target === 'web-content'
            );
            expect(webToVolume).toBeDefined();
            expect(webToVolume?.label).toBe('volume');
            expect(webToVolume?.style?.stroke).toBe('#f59e0b');
            expect(webToVolume?.data?.serviceName).toBe('web');
            expect(webToVolume?.data?.volumeName).toBe('web-content');
        });
    });

    describe('buildServiceToServiceEdges', () => {
        it('creates edges between services that share networks', () => {
            const edgeBuilder = new EdgeBuilder(mockAst);
            const serviceToServiceEdges = edgeBuilder.buildServiceToServiceEdges();

            // Should have edges between services that share networks:
            // web <-> api (share backend), api <-> db (share database)
            expect(serviceToServiceEdges.length).toBeGreaterThan(0);

            // Check web to api edge (they share 'backend' network)
            const webToApi = serviceToServiceEdges.find(edge =>
                (edge.source === 'web' && edge.target === 'api') ||
                (edge.source === 'api' && edge.target === 'web')
            );
            expect(webToApi).toBeDefined();
            expect(webToApi?.data?.connectionType).toBe('service-to-service');
            expect(webToApi?.data?.sharedNetworks).toContain('backend');

            // Check api to db edge (they share 'database' network)
            const apiToDb = serviceToServiceEdges.find(edge =>
                (edge.source === 'api' && edge.target === 'db') ||
                (edge.source === 'db' && edge.target === 'api')
            );
            expect(apiToDb).toBeDefined();
            expect(apiToDb?.data?.sharedNetworks).toContain('database');
        });

        it('does not create duplicate service-to-service edges', () => {
            const edgeBuilder = new EdgeBuilder(mockAst);
            const serviceToServiceEdges = edgeBuilder.buildServiceToServiceEdges();

            // Get all edge IDs
            const edgeIds = serviceToServiceEdges.map(edge => edge.id);
            const uniqueEdgeIds = new Set(edgeIds);

            // Should not have duplicates
            expect(edgeIds.length).toBe(uniqueEdgeIds.size);
        });
    });

    describe('getAllEdges', () => {
        it('returns both infrastructure and service-to-service edges', () => {
            const edgeBuilder = new EdgeBuilder(mockAst);
            const allEdges = edgeBuilder.getAllEdges();

            const networkEdges = allEdges.filter(edge => edge.data?.connectionType === 'network');
            const volumeEdges = allEdges.filter(edge => edge.data?.connectionType === 'volume');
            const serviceToServiceEdges = allEdges.filter(edge => edge.data?.connectionType === 'service-to-service');

            expect(networkEdges.length).toBeGreaterThan(0);
            expect(volumeEdges.length).toBeGreaterThan(0);
            expect(serviceToServiceEdges.length).toBeGreaterThan(0);
            
            // Total should be sum of all types
            expect(allEdges.length).toBe(networkEdges.length + volumeEdges.length + serviceToServiceEdges.length);
        });
    });

    describe('extractVolumeName', () => {
        it('extracts named volume names correctly', () => {
            const edgeBuilder = new EdgeBuilder(mockAst);
            
            // Access private method through any for testing
            const extractVolumeName = (edgeBuilder as any).extractVolumeName.bind(edgeBuilder);
            
            expect(extractVolumeName('my-volume')).toBe('my-volume');
            expect(extractVolumeName('my-volume:ro')).toBe('my-volume');
        });

        it('returns null for bind mounts', () => {
            const edgeBuilder = new EdgeBuilder(mockAst);
            
            // Access private method through any for testing
            const extractVolumeName = (edgeBuilder as any).extractVolumeName.bind(edgeBuilder);
            
            expect(extractVolumeName('/host/path')).toBeNull();
            expect(extractVolumeName('C:/host/path')).toBeNull();
        });
    });

    describe('edge without networks or volumes', () => {
        it('handles services with no networks or volumes gracefully', () => {
            const serviceWithoutConnections: IDockerService = {
                name: 'standalone',
                image: { name: 'alpine', tag: 'latest' },
                containerName: 'standalone-container',
                ports: [],
                volumes: [],
                networks: []
            };

            const minimalAst: IDockerComposeAst = {
                services: [serviceWithoutConnections],
                networks: [],
                volumes: []
            };

            const edgeBuilder = new EdgeBuilder(minimalAst);
            const edges = edgeBuilder.buildEdges();

            expect(edges).toHaveLength(0);
        });
    });
});
