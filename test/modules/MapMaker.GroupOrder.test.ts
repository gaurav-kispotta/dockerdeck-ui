import { describe, it, expect, beforeEach } from 'vitest';
import MapMaker from '../../src/modules/MapMaker';
import { YamlDockerCompose } from '../../src/store/slices/uploadedFileSlice';
import { SettingsState } from '../../src/store/settingsSlice';

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
            nodeSize: 100,
            showDependencies: false,
        };
    });

    it('should not include synthetic group container nodes (networks/services/volumes) in the output', async () => {
        await mapMaker.buildMap3(sampleYaml, defaultSettings);

        const syntheticGroupIds = ['networks', 'services', 'volumes'];
        const syntheticNodes = mapMaker.nodes.filter(n => syntheticGroupIds.includes(n.id));

        expect(syntheticNodes.length).toBe(0);
    });

    it('should position network nodes above service nodes (lower Y)', async () => {
        await mapMaker.buildMap3(sampleYaml, defaultSettings);

        const networkNode = mapMaker.nodes.find(n => n.id === 'frontend');
        const serviceNode = mapMaker.nodes.find(n => n.id === 'web');

        expect(networkNode).toBeDefined();
        expect(serviceNode).toBeDefined();
        expect(networkNode!.position.y).toBeLessThan(serviceNode!.position.y);
    });

    it('should position service nodes above volume nodes (lower Y)', async () => {
        await mapMaker.buildMap3(sampleYaml, defaultSettings);

        const serviceNode = mapMaker.nodes.find(n => n.id === 'web');
        const volumeNode = mapMaker.nodes.find(n => n.id === 'web-content');

        expect(serviceNode).toBeDefined();
        expect(volumeNode).toBeDefined();
        expect(serviceNode!.position.y).toBeLessThan(volumeNode!.position.y);
    });

    it('should produce layer separation driven by nodeLevelPadding', async () => {
        await mapMaker.buildMap3(sampleYaml, defaultSettings);

        const networkNode = mapMaker.nodes.find(n => n.id === 'frontend');
        const serviceNode = mapMaker.nodes.find(n => n.id === 'web');

        // spacing = nodeLevelPadding * 3 = 50 * 3 = 150
        const expectedSpacing = defaultSettings.nodeLevelPadding * 3;
        const actualDiff = serviceNode!.position.y - networkNode!.position.y;
        expect(actualDiff).toBe(expectedSpacing);
    });
});
