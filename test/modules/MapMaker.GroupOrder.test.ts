import { describe, it, expect, beforeEach } from 'vitest';
import { buildLayeredAnnotationNodes } from '../../src/components/deck/LayeredAnnotationOverlay';
import MapMaker from '../../src/modules/MapMaker';
import { YamlDockerCompose } from '../../src/store/slices/uploadedFileSlice';
import { SettingsState } from '../../src/store/slices/settingsSlice';

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
            debugMode: false,
            viewMode: 'architecture',
            mapLayout: 'layered',
            edgeStyle: 'orthogonal',
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

    it('increases layer and same-row separation when nodeLevelPadding increases', async () => {
        sampleYaml.services.api = { image: 'node:20', networks: ['frontend'] };
        const compact = new MapMaker();
        await compact.buildMap3(sampleYaml, { ...defaultSettings, nodeLevelPadding: 20 });
        await mapMaker.buildMap3(sampleYaml, { ...defaultSettings, nodeLevelPadding: 100 });
        const layerGap = (map: MapMaker) => {
            const network = map.nodes.find(n => n.id === 'frontend')!;
            const service = map.nodes.find(n => n.id === 'web')!;
            return service.position.y - network.position.y - network.height!;
        };
        const serviceGap = (map: MapMaker) => {
            const services = map.nodes.filter(n => n.data?.nodeType === 'service').sort((a, b) => a.position.x - b.position.x);
            return services[1].position.x - services[0].position.x - Math.max(200, services[0].width!);
        };
        expect(layerGap(compact)).toBeGreaterThan(0);
        expect(layerGap(mapMaker)).toBeGreaterThan(layerGap(compact));
        expect(serviceGap(compact)).toBeGreaterThan(0);
        expect(serviceGap(mapMaker)).toBeGreaterThan(serviceGap(compact));
    });

    it('applies platformPadding as a graph-coordinate margin without changing relative spacing', async () => {
        const compact = new MapMaker();
        await compact.buildMap3(sampleYaml, { ...defaultSettings, platformPadding: 10 });
        await mapMaker.buildMap3(sampleYaml, { ...defaultSettings, platformPadding: 90 });
        expect(Math.min(...mapMaker.nodes.map(n => n.position.x))).toBe(90);
        expect(Math.min(...mapMaker.nodes.map(n => n.position.y))).toBe(90);
        for (const node of mapMaker.nodes) {
            const before = compact.nodes.find(n => n.id === node.id)!;
            expect(node.position.x - before.position.x).toBe(80);
            expect(node.position.y - before.position.y).toBe(80);
        }
    });

    it.each([50, 200])('keeps multirow categories disjoint at node size %i', async (nodeSize) => {
        const services = Object.fromEntries(Array.from({ length: 8 }, (_, i) => [
            `service-${i}`, { image: 'alpine', networks: [`network-${i}`], volumes: [`volume-${i}:/data`] }
        ]));
        const networks = Object.fromEntries(Array.from({ length: 8 }, (_, i) => [`network-${i}`, {}]));
        const volumes = Object.fromEntries(Array.from({ length: 8 }, (_, i) => [`volume-${i}`, {}]));
        await mapMaker.buildMap3({ services, networks, volumes }, { ...defaultSettings, nodeSize, nodeLevelPadding: 10 });
        expect(mapMaker.nodes).toHaveLength(24);
        for (let i = 0; i < mapMaker.nodes.length; i++) {
            const a = mapMaker.nodes[i];
            for (const b of mapMaker.nodes.slice(i + 1)) {
                const separated = a.position.x + Math.max(200, a.width!) <= b.position.x ||
                    b.position.x + Math.max(200, b.width!) <= a.position.x ||
                    a.position.y + Math.max(80, a.height!) <= b.position.y ||
                    b.position.y + Math.max(80, b.height!) <= a.position.y;
                expect(separated, `${a.id} overlaps ${b.id}`).toBe(true);
            }
        }
        const bounds = (type: string) => {
            const nodes = mapMaker.nodes.filter(n => n.data?.nodeType === type);
            return { top: Math.min(...nodes.map(n => n.position.y)), bottom: Math.max(...nodes.map(n => n.position.y + Math.max(80, n.height!))) };
        };
        const bands = buildLayeredAnnotationNodes(mapMaker.nodes);
        for (const band of bands) {
            const children = mapMaker.nodes.filter(n => n.data?.nodeType === band.data.layerType);
            for (const child of children) {
                expect(band.position.x).toBeLessThan(child.position.x);
                expect(band.position.y).toBeLessThan(child.position.y);
                expect(band.position.x + band.width!).toBeGreaterThan(child.position.x + Math.max(200, child.width!));
                expect(band.position.y + band.height!).toBeGreaterThan(child.position.y + Math.max(80, child.height!));
            }
        }
        for (let i = 1; i < bands.length; i++) {
            expect(bands[i - 1].position.y + bands[i - 1].height!).toBeLessThan(bands[i].position.y);
        }
        expect(bounds('network').bottom).toBeLessThan(bounds('service').top);
        expect(bounds('service').bottom).toBeLessThan(bounds('volume').top);
    });

    it('handles empty network and volume categories without non-finite positions', async () => {
        await mapMaker.buildMap3({ services: { solo: { image: 'alpine' } } }, defaultSettings);
        expect(mapMaker.nodes).toHaveLength(1);
        expect(mapMaker.nodes[0].position).toEqual({ x: defaultSettings.platformPadding, y: defaultSettings.platformPadding });
    });
});
