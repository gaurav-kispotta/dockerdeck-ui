import { describe, it, expect, beforeEach } from 'vitest';
import { DockerComposeAstBuilder, IDockerComposeAst } from '../../../src/modules/ast/DockerComposeAstBuilder';
import { YamlDockerCompose } from '../../../src/context/UploadedFileContext';

describe('DockerComposeAstBuilder', () => {
    let yamlObject: YamlDockerCompose;
    let astBuilder: DockerComposeAstBuilder;

    beforeEach(() => {
        yamlObject = {
            version: '3.8',
            services: {
                web: {
                    image: 'nginx:latest',
                    ports: ['80:8080', '443:8443'],
                    networks: ['frontend'],
                    volumes: ['web-content:/usr/share/nginx/html'],
                    environment: {
                        NODE_ENV: 'production',
                        DEBUG: 'false'
                    },
                    container_name: 'web-container'
                },
                api: {
                    image: 'node:20-alpine',
                    ports: ['3000:3000'],
                    networks: ['frontend', 'backend'],
                    volumes: ['api-data:/app/data'],
                    depends_on: ['db']
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
        
        astBuilder = new DockerComposeAstBuilder(yamlObject);
    });

    describe('constructor', () => {
        it('should initialize with yaml object and remove version', () => {
            expect(astBuilder.ast).toEqual({ services: [] });
            
            // Should create a shallow copy without version
            const originalHasVersion = 'version' in yamlObject;
            expect(originalHasVersion).toBe(true); // Original should still have version
        });

        it('should not mutate the original yaml object', () => {
            const originalYaml = { ...yamlObject };
            new DockerComposeAstBuilder(yamlObject);
            
            expect(yamlObject).toEqual(originalYaml);
        });
    });

    describe('buildAst', () => {
        it('should build complete AST from yaml object', () => {
            const ast = astBuilder.buildAst();
            
            expect(ast.services).toHaveLength(3);
            expect(ast.networks).toHaveLength(2);
            expect(ast.volumes).toHaveLength(3);
        });

        it('should parse service with complete configuration', () => {
            const ast = astBuilder.buildAst();
            const webService = ast.services.find(s => s.name === 'web');
            
            expect(webService).toBeDefined();
            expect(webService!.name).toBe('web');
            expect(webService!.image.name).toBe('nginx');
            expect(webService!.image.tag).toBe('latest');
            expect(webService!.containerName).toBe('web-container');
            expect(webService!.ports).toEqual([
                { internal: 80, external: 8080 },
                { internal: 443, external: 8443 }
            ]);
            expect(webService!.volumes).toEqual([
                { internal: '/usr/share/nginx/html', external: 'web-content' }
            ]);
            expect(webService!.networks).toEqual(['frontend']);
        });

        it('should parse service without tag and default to latest', () => {
            const yamlWithoutTag = {
                ...yamlObject,
                services: {
                    web: {
                        image: 'nginx',
                        ports: ['80:8080']
                    }
                }
            };
            
            const builder = new DockerComposeAstBuilder(yamlWithoutTag);
            const ast = builder.buildAst();
            const webService = ast.services[0];
            
            expect(webService.image.name).toBe('nginx');
            expect(webService.image.tag).toBe('latest');
        });

        it('should parse service with custom tag', () => {
            const ast = astBuilder.buildAst();
            const apiService = ast.services.find(s => s.name === 'api');
            
            expect(apiService!.image.name).toBe('node');
            expect(apiService!.image.tag).toBe('20-alpine');
        });

        it('should default container name to service name when not specified', () => {
            const ast = astBuilder.buildAst();
            const apiService = ast.services.find(s => s.name === 'api');
            const dbService = ast.services.find(s => s.name === 'db');
            
            expect(apiService!.containerName).toBe('api');
            expect(dbService!.containerName).toBe('db');
        });

        it('should handle empty ports array', () => {
            const yamlWithoutPorts = {
                ...yamlObject,
                services: {
                    worker: {
                        image: 'worker:latest'
                    }
                }
            };
            
            const builder = new DockerComposeAstBuilder(yamlWithoutPorts);
            const ast = builder.buildAst();
            const workerService = ast.services[0];
            
            expect(workerService.ports).toEqual([]);
        });

        it('should handle empty volumes array', () => {
            const yamlWithoutVolumes = {
                ...yamlObject,
                services: {
                    worker: {
                        image: 'worker:latest'
                    }
                }
            };
            
            const builder = new DockerComposeAstBuilder(yamlWithoutVolumes);
            const ast = builder.buildAst();
            const workerService = ast.services[0];
            
            expect(workerService.volumes).toEqual([]);
        });

        it('should handle empty networks array', () => {
            const yamlWithoutNetworks = {
                ...yamlObject,
                services: {
                    worker: {
                        image: 'worker:latest'
                    }
                }
            };
            
            const builder = new DockerComposeAstBuilder(yamlWithoutNetworks);
            const ast = builder.buildAst();
            const workerService = ast.services[0];
            
            expect(workerService.networks).toEqual([]);
        });

        it('should handle networks as non-array', () => {
            const yamlWithObjectNetworks = {
                ...yamlObject,
                services: {
                    web: {
                        image: 'nginx:latest',
                        networks: { frontend: { aliases: ['web'] } }
                    }
                }
            };
            
            const builder = new DockerComposeAstBuilder(yamlWithObjectNetworks);
            const ast = builder.buildAst();
            const webService = ast.services[0];
            
            expect(webService.networks).toEqual([]);
        });

        it('should parse networks with default driver', () => {
            const ast = astBuilder.buildAst();
            
            expect(ast.networks).toHaveLength(2);
            expect(ast.networks![0].name).toBe('frontend');
            expect(ast.networks![0].driver).toBe('bridge');
            expect(ast.networks![1].name).toBe('backend');
            expect(ast.networks![1].driver).toBe('bridge');
        });

        it('should handle networks without driver (default to bridge)', () => {
            const yamlWithoutNetworkDriver = {
                ...yamlObject,
                networks: {
                    custom: {}
                }
            };
            
            const builder = new DockerComposeAstBuilder(yamlWithoutNetworkDriver);
            const ast = builder.buildAst();
            
            expect(ast.networks![0].name).toBe('custom');
            expect(ast.networks![0].driver).toBe('bridge');
        });

        it('should parse volumes with default driver', () => {
            const ast = astBuilder.buildAst();
            
            expect(ast.volumes).toHaveLength(3);
            expect(ast.volumes![0].name).toBe('web-content');
            expect(ast.volumes![0].driver).toBe('local');
            expect(ast.volumes![1].name).toBe('api-data');
            expect(ast.volumes![1].driver).toBe('local');
        });

        it('should handle volumes without driver (default to local)', () => {
            const yamlWithoutVolumeDriver = {
                ...yamlObject,
                volumes: {
                    'custom-volume': {}
                }
            };
            
            const builder = new DockerComposeAstBuilder(yamlWithoutVolumeDriver);
            const ast = builder.buildAst();
            
            expect(ast.volumes![0].name).toBe('custom-volume');
            expect(ast.volumes![0].driver).toBe('local');
        });

        it('should handle yaml without networks section', () => {
            const yamlWithoutNetworks = {
                ...yamlObject,
                networks: undefined
            };
            
            const builder = new DockerComposeAstBuilder(yamlWithoutNetworks);
            const ast = builder.buildAst();
            
            expect(ast.networks).toBeUndefined();
        });

        it('should handle yaml without volumes section', () => {
            const yamlWithoutVolumes = {
                ...yamlObject,
                volumes: undefined
            };
            
            const builder = new DockerComposeAstBuilder(yamlWithoutVolumes);
            const ast = builder.buildAst();
            
            expect(ast.volumes).toBeUndefined();
        });

        it('should throw error when no services are defined', () => {
            const yamlWithoutServices = {
                version: '3.8',
                services: {}
            };
            
            const builder = new DockerComposeAstBuilder(yamlWithoutServices);
            
            expect(() => builder.buildAst()).toThrow('No services found in the docker compose file. As per specification, services must be defined.');
        });

        it('should handle empty image string', () => {
            const yamlWithEmptyImage = {
                ...yamlObject,
                services: {
                    web: {
                        image: '',
                        ports: ['80:8080']
                    }
                }
            };
            
            const builder = new DockerComposeAstBuilder(yamlWithEmptyImage);
            const ast = builder.buildAst();
            const webService = ast.services[0];
            
            expect(webService.image.name).toBe('');
            expect(webService.image.tag).toBe('latest');
        });

        it('should handle image with multiple colons', () => {
            const yamlWithComplexImage = {
                ...yamlObject,
                services: {
                    web: {
                        image: 'registry.example.com:5000/my-app:v1.2.3',
                        ports: ['80:8080']
                    }
                }
            };
            
            const builder = new DockerComposeAstBuilder(yamlWithComplexImage);
            const ast = builder.buildAst();
            const webService = ast.services[0];
            
            expect(webService.image.name).toBe('registry.example.com:5000/my-app');
            expect(webService.image.tag).toBe('v1.2.3');
        });

        it('should parse port mappings correctly', () => {
            const ast = astBuilder.buildAst();
            const webService = ast.services.find(s => s.name === 'web');
            
            expect(webService!.ports).toEqual([
                { internal: 80, external: 8080 },
                { internal: 443, external: 8443 }
            ]);
        });

        it('should parse volume mappings correctly', () => {
            const ast = astBuilder.buildAst();
            const webService = ast.services.find(s => s.name === 'web');
            
            expect(webService!.volumes).toEqual([
                { internal: '/usr/share/nginx/html', external: 'web-content' }
            ]);
        });

        it('should handle complex volume mappings', () => {
            const yamlWithComplexVolumes = {
                ...yamlObject,
                services: {
                    web: {
                        image: 'nginx:latest',
                        volumes: [
                            'web-data:/var/www/html:ro',
                            'logs:/var/log/nginx:rw'
                        ]
                    }
                }
            };
            
            const builder = new DockerComposeAstBuilder(yamlWithComplexVolumes);
            const ast = builder.buildAst();
            const webService = ast.services[0];
            
            // The current implementation splits on first colon only, so mode flags are stripped
            expect(webService.volumes).toEqual([
                { internal: '/var/www/html', external: 'web-data' },
                { internal: '/var/log/nginx', external: 'logs' }
            ]);
        });
    });

    describe('edge cases', () => {
        it('should handle services with minimal configuration', () => {
            const minimalYaml = {
                version: '3.8',
                services: {
                    simple: {
                        image: 'alpine'
                    }
                }
            };
            
            const builder = new DockerComposeAstBuilder(minimalYaml);
            const ast = builder.buildAst();
            const service = ast.services[0];
            
            expect(service.name).toBe('simple');
            expect(service.image.name).toBe('alpine');
            expect(service.image.tag).toBe('latest');
            expect(service.containerName).toBe('simple');
            expect(service.ports).toEqual([]);
            expect(service.volumes).toEqual([]);
            expect(service.networks).toEqual([]);
        });

        it('should handle missing service properties gracefully', () => {
            const yamlWithMissingProps = {
                version: '3.8',
                services: {
                    web: {
                        // No image property
                    }
                }
            };
            
            const builder = new DockerComposeAstBuilder(yamlWithMissingProps);
            const ast = builder.buildAst();
            const service = ast.services[0];
            
            expect(service.image.name).toBe('');
            expect(service.image.tag).toBe('latest');
        });
    });
});
