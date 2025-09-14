import { describe, it, expect } from 'vitest';
import MapMaker from '../../src/modules/MapMaker';
import { YamlDockerCompose } from '../../src/context/UploadedFileContext';

describe('MapMaker Edge Integration', () => {
    const sampleYaml: YamlDockerCompose = {
        version: '3.8',
        services: {
            web: {
                image: 'nginx:latest',
                ports: ['80:8080'],
                networks: ['frontend'],
                volumes: ['web-content:/usr/share/nginx/html']
            },
            api: {
                image: 'node:20-alpine',
                ports: ['3000:3000'],
                networks: ['frontend', 'backend'],
                volumes: ['api-data:/app/data']
            },
            db: {
                image: 'postgres:15',
                ports: ['5432:5432'],
                networks: ['backend'],
                volumes: ['db-data:/var/lib/postgresql/data']
            }
        },
        networks: {
            frontend: {
                driver: 'bridge'
            },
            backend: {
                driver: 'bridge'
            }
        },
        volumes: {
            'web-content': {
                driver: 'local'
            },
            'api-data': {
                driver: 'local'
            },
            'db-data': {
                driver: 'local'
            }
        }
    };

    it.skip('should generate edges when building map', async () => {
        const mapMaker = new MapMaker();
        
        await mapMaker.buildMap3(sampleYaml);
        
        // Should have nodes
        expect(mapMaker.nodes.length).toBeGreaterThan(0);
        
        // Should have edges
        expect(mapMaker.edges.length).toBeGreaterThan(0);
        
        // Check for network edges
        const networkEdges = mapMaker.edges.filter(edge => 
            edge.data?.connectionType === 'network'
        );
        expect(networkEdges.length).toBeGreaterThan(0);
        
        // Check for volume edges  
        const volumeEdges = mapMaker.edges.filter(edge =>
            edge.data?.connectionType === 'volume'
        );
        expect(volumeEdges.length).toBeGreaterThan(0);
        
        // Check for service-to-service edges
        const serviceToServiceEdges = mapMaker.edges.filter(edge =>
            edge.data?.connectionType === 'service-to-service'  
        );
        expect(serviceToServiceEdges.length).toBeGreaterThan(0);
        
        console.log('Generated edges:', mapMaker.edges.length);
        console.log('Network edges:', networkEdges.length);
        console.log('Volume edges:', volumeEdges.length);
        console.log('Service-to-service edges:', serviceToServiceEdges.length);
    });

    it.skip('should create correct edge IDs', async () => {
        const mapMaker = new MapMaker();
        
        await mapMaker.buildMap3(sampleYaml);
        
        // Check that edge IDs follow expected format
        const networkEdge = mapMaker.edges.find(edge =>
            edge.id.includes('web-to-frontend')
        );
        expect(networkEdge).toBeDefined();
        
        const volumeEdge = mapMaker.edges.find(edge =>
            edge.id.includes('web-to-web-content')
        );
        expect(volumeEdge).toBeDefined();
    });
});
