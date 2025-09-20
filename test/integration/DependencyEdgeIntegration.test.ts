import { describe, it, expect } from 'vitest';
import { DockerComposeAstBuilder } from '../../src/modules/ast/DockerComposeAstBuilder';
import EdgeBuilder from '../../src/modules/node-builder/EdgeBuilder';

describe('Dependency Edge Integration', () => {
    it('extracts depends_on from YAML and creates dependency edges', () => {
        const yamlObject = {
            version: '3.8',
            services: {
                database: {
                    image: 'postgres:13',
                    ports: ['5432:5432'],
                    networks: ['backend']
                },
                api: {
                    image: 'node:16',
                    ports: ['3000:3000'],
                    depends_on: ['database'],
                    networks: ['backend']
                },
                web: {
                    image: 'nginx:latest',
                    ports: ['80:80'],
                    depends_on: ['api', 'database'],
                    networks: ['frontend', 'backend']
                }
            },
            networks: {
                frontend: { driver: 'bridge' },
                backend: { driver: 'bridge' }
            }
        };

        // Build AST
        const builder = new DockerComposeAstBuilder(yamlObject);
        const ast = builder.buildAst();

        // Check that depends_on was extracted correctly
        const databaseService = ast.services.find(s => s.name === 'database');
        const apiService = ast.services.find(s => s.name === 'api');
        const webService = ast.services.find(s => s.name === 'web');

        expect(databaseService?.dependsOn).toEqual([]);
        expect(apiService?.dependsOn).toEqual(['database']);
        expect(webService?.dependsOn).toEqual(['api', 'database']);

        // Build edges
        const edgeBuilder = new EdgeBuilder(ast);
        const edges = edgeBuilder.buildEdges();

        // Check dependency edges
        const dependencyEdges = edges.filter(e => e.data?.connectionType === 'depends_on');
        expect(dependencyEdges.length).toBe(3); // api->database, web->api, web->database

        // Check specific edges
        const apiToDatabaseEdge = dependencyEdges.find(e => 
            e.source === 'api' && e.target === 'database'
        );
        expect(apiToDatabaseEdge).toBeDefined();
        expect(apiToDatabaseEdge?.label).toBe('depends_on');

        const webToApiEdge = dependencyEdges.find(e => 
            e.source === 'web' && e.target === 'api'
        );
        expect(webToApiEdge).toBeDefined();

        const webToDatabaseEdge = dependencyEdges.find(e => 
            e.source === 'web' && e.target === 'database'
        );
        expect(webToDatabaseEdge).toBeDefined();
    });

    it('handles object form of depends_on', () => {
        const yamlObject = {
            version: '3.8',
            services: {
                database: {
                    image: 'postgres:13',
                },
                api: {
                    image: 'node:16',
                    depends_on: {
                        database: {
                            condition: 'service_healthy'
                        }
                    }
                }
            }
        };

        const builder = new DockerComposeAstBuilder(yamlObject);
        const ast = builder.buildAst();

        const apiService = ast.services.find(s => s.name === 'api');
        expect(apiService?.dependsOn).toEqual(['database']);

        const edgeBuilder = new EdgeBuilder(ast);
        const edges = edgeBuilder.buildEdges();
        const dependencyEdges = edges.filter(e => e.data?.connectionType === 'depends_on');
        expect(dependencyEdges.length).toBe(1);
    });
});