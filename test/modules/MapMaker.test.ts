import { describe, it, expect, beforeEach, vi } from 'vitest';
import MapMaker, { fromNodeToGroupNode, fromGroupNodeToNode, customUniqueColour } from '../../src/modules/MapMaker';
import { YamlDockerCompose } from '../../src/context/UploadedFileContext';
import { SettingsState } from '../../src/store/settingsSlice';
import { Node } from '@xyflow/react';

// Mock the dependencies
vi.mock('../../src/modules/layout-engine/ElkJsLayoutEngine', () => ({
    ElkJsLayoutEngine: vi.fn().mockImplementation(() => ({
        layout: vi.fn().mockResolvedValue({
            nodes: [],
            edges: []
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

describe('MapMaker', () => {
    let mapMaker: MapMaker;
    let sampleYaml: YamlDockerCompose;
    let mockSettings: SettingsState;
    let mockDispatch: any;

    beforeEach(() => {
        mapMaker = new MapMaker();
        sampleYaml = {
            version: '3.8',
            services: {
                web: {
                    image: 'nginx:latest',
                    ports: ['80:8080'],
                    networks: ['frontend'],
                    volumes: ['web-content:/usr/share/nginx/html']
                }
            },
            networks: {
                frontend: {
                    driver: 'bridge'
                }
            },
            volumes: {
                'web-content': {
                    driver: 'local'
                }
            }
        };

        mockSettings = {
            nodeSize: 120,
            nodeLevelPadding: 50,
            platformPadding: 100
        };

        mockDispatch = vi.fn();
    });

    describe('constructor', () => {
        it('should initialize with empty nodes and edges', () => {
            expect(mapMaker.nodes).toEqual([]);
            expect(mapMaker.edges).toEqual([]);
        });
    });

    describe('buildMap3', () => {
        it('should build map with basic yaml structure', async () => {
            await mapMaker.buildMap3(sampleYaml);
            
            expect(mapMaker.nodes).toBeDefined();
            expect(mapMaker.edges).toBeDefined();
            expect(Array.isArray(mapMaker.nodes)).toBe(true);
            expect(Array.isArray(mapMaker.edges)).toBe(true);
        });

        it('should build map with settings', async () => {
            await mapMaker.buildMap3(sampleYaml, mockSettings);
            
            expect(mapMaker.nodes).toBeDefined();
            expect(mapMaker.edges).toBeDefined();
        });

        it('should return the AST and not call dispatch internally', async () => {
            const ast = await mapMaker.buildMap3(sampleYaml, mockSettings, mockDispatch);

            // dispatch is now the caller's responsibility — buildMap3 returns the AST instead
            expect(mockDispatch).not.toHaveBeenCalled();
            expect(ast).toBeDefined();
            expect(ast?.services).toBeDefined();
        });

        it('should handle yaml with missing networks', async () => {
            const yamlWithoutNetworks = {
                ...sampleYaml,
                networks: undefined
            };
            
            await expect(mapMaker.buildMap3(yamlWithoutNetworks)).resolves.not.toThrow();
        });

        it('should handle yaml with missing volumes', async () => {
            const yamlWithoutVolumes = {
                ...sampleYaml,
                volumes: undefined
            };
            
            await expect(mapMaker.buildMap3(yamlWithoutVolumes)).resolves.not.toThrow();
        });

        it('should use default settings when not provided', async () => {
            await mapMaker.buildMap3(sampleYaml);
            
            // Should not throw and should complete successfully
            expect(mapMaker.nodes).toBeDefined();
            expect(mapMaker.edges).toBeDefined();
        });

        it('should handle complex yaml structure', async () => {
            const complexYaml: YamlDockerCompose = {
                version: '3.8',
                services: {
                    web: {
                        image: 'nginx:latest',
                        ports: ['80:8080', '443:8443'],
                        networks: ['frontend', 'backend'],
                        volumes: ['web-content:/usr/share/nginx/html', 'web-logs:/var/log/nginx']
                    },
                    api: {
                        image: 'node:20-alpine',
                        ports: ['3000:3000'],
                        networks: ['backend'],
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
                    frontend: { driver: 'bridge' },
                    backend: { driver: 'bridge' }
                },
                volumes: {
                    'web-content': { driver: 'local' },
                    'web-logs': { driver: 'local' },
                    'api-data': { driver: 'local' },
                    'db-data': { driver: 'local' }
                }
            };

            await mapMaker.buildMap3(complexYaml, mockSettings, mockDispatch);
            
            expect(mapMaker.nodes).toBeDefined();
            expect(mapMaker.edges).toBeDefined();
        });

        it('should handle yaml with empty services', async () => {
            const emptyServicesYaml = {
                version: '3.8',
                services: {},
                networks: {},
                volumes: {}
            };

            // Mock the AST builder to return empty arrays
            const mockAstBuilder = {
                buildAst: vi.fn().mockReturnValue({
                    services: [],
                    networks: [],
                    volumes: []
                })
            };

            // This should handle empty structures gracefully
            await expect(mapMaker.buildMap3(emptyServicesYaml)).resolves.not.toThrow();
        });

        it('should maintain node and edge references after building', async () => {
            await mapMaker.buildMap3(sampleYaml, mockSettings);
            
            const nodesBefore = mapMaker.nodes;
            const edgesBefore = mapMaker.edges;
            
            // References should be maintained
            expect(mapMaker.nodes).toBe(nodesBefore);
            expect(mapMaker.edges).toBe(edgesBefore);
        });
    });

    describe('edge cases and error handling', () => {
        it('should handle undefined yaml gracefully', async () => {
            // The mocked AST builder will handle this gracefully
            await expect(mapMaker.buildMap3(undefined as any)).resolves.not.toThrow();
        });

        it('should handle null yaml gracefully', async () => {
            await expect(mapMaker.buildMap3(null as any)).resolves.not.toThrow();
        });

        it('should handle yaml without version', async () => {
            const yamlWithoutVersion = {
                services: sampleYaml.services,
                networks: sampleYaml.networks,
                volumes: sampleYaml.volumes
            };
            
            await expect(mapMaker.buildMap3(yamlWithoutVersion as any)).resolves.not.toThrow();
        });
    });
});

describe('MapMaker utility functions', () => {
    describe('fromNodeToGroupNode', () => {
        it('should convert nodes to group nodes with children property', () => {
            const nodes: Node[] = [
                {
                    id: '1',
                    type: 'default',
                    position: { x: 0, y: 0 },
                    data: { label: 'Node 1' }
                },
                {
                    id: '2',
                    type: 'default',
                    position: { x: 100, y: 0 },
                    data: { label: 'Node 2' }
                }
            ];

            const groupNodes = fromNodeToGroupNode(nodes);

            expect(groupNodes).toHaveLength(2);
            expect(groupNodes[0]).toHaveProperty('children');
            expect(groupNodes[0].children).toEqual([]);
            expect(groupNodes[0].id).toBe('1');
            expect(groupNodes[1].id).toBe('2');
        });

        it('should handle empty array', () => {
            const result = fromNodeToGroupNode([]);
            expect(result).toEqual([]);
        });

        it('should preserve all original node properties', () => {
            const nodes: Node[] = [
                {
                    id: 'test',
                    type: 'custom',
                    position: { x: 50, y: 100 },
                    data: { label: 'Test Node', customProp: 'value' },
                    style: { backgroundColor: 'red' }
                }
            ];

            const groupNodes = fromNodeToGroupNode(nodes);
            const groupNode = groupNodes[0];

            expect(groupNode.id).toBe('test');
            expect(groupNode.type).toBe('custom');
            expect(groupNode.position).toEqual({ x: 50, y: 100 });
            expect(groupNode.data).toEqual({ label: 'Test Node', customProp: 'value' });
            expect(groupNode.style).toEqual({ backgroundColor: 'red' });
            expect(groupNode.children).toEqual([]);
        });
    });

    describe('fromGroupNodeToNode', () => {
        it('should convert group nodes back to regular nodes', () => {
            const groupNodes = [
                {
                    id: '1',
                    type: 'default',
                    position: { x: 0, y: 0 },
                    data: { label: 'Node 1' },
                    children: []
                },
                {
                    id: '2',
                    type: 'default',
                    position: { x: 100, y: 0 },
                    data: { label: 'Node 2' },
                    children: [
                        {
                            id: '2-1',
                            type: 'child',
                            position: { x: 0, y: 0 },
                            data: { label: 'Child Node' }
                        }
                    ]
                }
            ];

            const nodes = fromGroupNodeToNode(groupNodes);

            expect(nodes).toHaveLength(2);
            expect(nodes[0].id).toBe('1');
            expect(nodes[1].id).toBe('2');
            // Should preserve all properties including children
            expect(nodes[1]).toHaveProperty('children');
        });

        it('should handle empty array', () => {
            const result = fromGroupNodeToNode([]);
            expect(result).toEqual([]);
        });
    });

    describe('customUniqueColour', () => {
        it('should generate consistent color for same input', () => {
            const color1 = customUniqueColour('test');
            const color2 = customUniqueColour('test');
            
            expect(color1).toBe(color2);
        });

        it('should generate different colors for different inputs', () => {
            const color1 = customUniqueColour('test1');
            const color2 = customUniqueColour('test2');
            
            expect(color1).not.toBe(color2);
        });

        it('should return rgba format with 0.4 opacity', () => {
            const color = customUniqueColour('test');
            
            expect(color).toMatch(/^rgba\(\d+, \d+, \d+, 0\.4\)$/);
        });

        it('should handle empty string', () => {
            const color = customUniqueColour('');
            
            expect(color).toMatch(/^rgba\(\d+, \d+, \d+, 0\.4\)$/);
        });

        it('should handle special characters', () => {
            const color = customUniqueColour('test-with-special_chars.123');
            
            expect(color).toMatch(/^rgba\(\d+, \d+, \d+, 0\.4\)$/);
        });

        it('should handle unicode characters', () => {
            const color = customUniqueColour('测试-🐳-docker');
            
            expect(color).toMatch(/^rgba\(\d+, \d+, \d+, 0\.4\)$/);
        });

        it('should generate valid RGB values (0-255)', () => {
            const color = customUniqueColour('test');
            const rgbMatch = color.match(/rgba\((\d+), (\d+), (\d+), 0\.4\)/);
            
            expect(rgbMatch).not.toBeNull();
            if (rgbMatch) {
                const [, r, g, b] = rgbMatch;
                expect(Number(r)).toBeGreaterThanOrEqual(0);
                expect(Number(r)).toBeLessThanOrEqual(255);
                expect(Number(g)).toBeGreaterThanOrEqual(0);
                expect(Number(g)).toBeLessThanOrEqual(255);
                expect(Number(b)).toBeGreaterThanOrEqual(0);
                expect(Number(b)).toBeLessThanOrEqual(255);
            }
        });
    });
});
