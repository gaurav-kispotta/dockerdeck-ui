import { describe, it, expect, beforeEach, vi } from 'vitest';
import MapMaker from '../../src/modules/MapMaker';
import { YamlDockerCompose } from '../../src/context/UploadedFileContext';
import { SettingsState } from '../../src/store/settingsSlice';

// Mock the dependencies
vi.mock('../../src/modules/layout-engine/ElkJsLayoutEngine', () => ({
    ElkJsLayoutEngine: vi.fn().mockImplementation(() => ({
        layout: vi.fn().mockImplementation(async (nodes) => {
            // Return nodes in the same order they were passed in
            return {
                nodes: nodes.map((node, index) => ({
                    ...node,
                    position: { x: 0, y: index * 300 } // Simulate vertical layout
                })),
                edges: []
            };
        })
    }))
}));

vi.mock('../../src/modules/ast/DockerComposeAstBuilder', () => ({
    DockerComposeAstBuilder: vi.fn().mockImplementation(() => ({
        buildAst: vi.fn().mockReturnValue({
            services: [
                {
                    name: 'web',
                    image: { name: 'nginx', tag: 'latest' },
                    containerName: 'web',
                    ports: [{ internal: 80, external: 8080 }],
                    volumes: [{ internal: '/usr/share/nginx/html', external: 'web-content' }],
                    networks: ['frontend'],
                    environment: { NODE_ENV: 'production' },
                    depends_on: []
                }
            ],
            networks: [
                {
                    name: 'frontend',
                    driver: 'bridge'
                }
            ],
            volumes: [
                {
                    name: 'web-content',
                    driver: 'local'
                }
            ]
        })
    }))
}));

describe('MapMaker Group Ordering', () => {
    let mapMaker: MapMaker;
    let sampleYaml: YamlDockerCompose;
    let defaultSettings: SettingsState;

    beforeEach(() => {
        mapMaker = new MapMaker();
        sampleYaml = {
            version: '3.7',
            services: {
                web: {
                    image: 'nginx:latest',
                    ports: ['8080:80'],
                    volumes: ['web-content:/usr/share/nginx/html'],
                    networks: ['frontend']
                }
            },
            networks: {
                frontend: {
                    driver: 'bridge'
                }
            },
            volumes: {
                'web-content': {}
            }
        };
        defaultSettings = {
            platformPadding: 100,
            nodeLevelPadding: 50,
            nodeSize: 100
        };
    });

    it('should create groups in the correct order: networks, services, volumes', async () => {
        await mapMaker.buildMap3(sampleYaml, defaultSettings);
        
        const rootGroups = mapMaker.nodes.filter(node => 
            node.type === 'group' && !node.parentNode
        );
        
        // Should have exactly 3 root groups
        expect(rootGroups.length).toBe(3);
        
        // Check the IDs are in the correct order
        expect(rootGroups[0].id).toBe('networks');
        expect(rootGroups[1].id).toBe('services');
        expect(rootGroups[2].id).toBe('volumes');
        
        // Check that networks appears first (lowest Y position)
        expect(rootGroups[0].position?.y).toBeLessThan(rootGroups[1].position?.y || Infinity);
        
        // Check that services appears between networks and volumes
        expect(rootGroups[1].position?.y).toBeLessThan(rootGroups[2].position?.y || Infinity);
        
        console.log('Group positions:', rootGroups.map(g => ({ id: g.id, y: g.position?.y })));
    });

    it('should set correct layout priorities for groups', async () => {
        await mapMaker.buildMap3(sampleYaml, defaultSettings);
        
        const rootGroups = mapMaker.nodes.filter(node => 
            node.type === 'group' && !node.parentNode
        );
        
        // Check priority values
        const networksGroup = rootGroups.find(g => g.id === 'networks');
        const servicesGroup = rootGroups.find(g => g.id === 'services');
        const volumesGroup = rootGroups.find(g => g.id === 'volumes');
        
        expect(networksGroup?.layoutOptions?.['elk.priority']).toBe('1');
        expect(servicesGroup?.layoutOptions?.['elk.priority']).toBe('2');
        expect(volumesGroup?.layoutOptions?.['elk.priority']).toBe('3');
    });
});
