import { Edge, Node } from "@xyflow/react";
import { YamlDockerCompose } from "../context/UploadedFileContext";
import { JSONPath } from "jsonpath-plus";
import { getLayoutedElements } from '../utils/layoutHelper'

export default class MapMaker {
    public nodes: Node[] = []
    public edges: Edge[] = []

    public buildMap(yamlObject: YamlDockerCompose) {
        delete yamlObject['version']

        const hashMap: { 
            networks: string[],
            services: string[],
            volumes: string[]
        } = {
            networks: [],
            services: [],
            volumes: []
        }

        let layoutNodes: any = []

        layoutNodes.push({
            id: 'network-group',
            data: { label: 'Network'},
            position: { x: 100, y: 100 },
            style: { backgroundColor: 'rgba(255, 0, 0, 0.2)', width: 1000, height: 1000 },
            type: 'group'
        })

        layoutNodes.push({
            id: 'volume-group',
            data: { label: 'Volume'},
            position: { x: 300, y: 100 },
            style: { backgroundColor: 'rgba(0, 255, 0, 0.2)', width: 500, height: 300},
            type: 'group'
        })

        layoutNodes.push({
            id: 'service-group',
            data: { label: 'Service'},
            position: { x: 300, y: 100 },
            style: { backgroundColor: 'rgba(0, 0, 255, 0.2)', width: 300, height: 500},
            type: 'group'
        })

        const layoutA = getLayoutedElements(layoutNodes, this.edges, 'TB')

        if (true){

            this.edges = layoutA.edges
            this.nodes = layoutA.nodes
        }


        layoutNodes = []

        const pathNetwork = JSONPath({ path: '$.networks', json: yamlObject })

        const networkNodesKeys =  Object.keys(pathNetwork[0])
        if (networkNodesKeys.length > 0) {
            hashMap.networks.push(...networkNodesKeys)

            hashMap.networks.forEach((network) => {
                layoutNodes.push({
                    id: network,
                    position: { x: 0, y: 0},
                    data: { label: 'network: ' + network },
                    //type: 'nodejs',
                    resizing: true,
                    parentId: 'network-group',
                    extent:'parent'
                })
            });
        }

        

        const volumeNodes = yamlObject.volumes
        if (volumeNodes) {
            const volumeNames = Object.keys(volumeNodes)
            hashMap.volumes.push(...volumeNames)

            hashMap.volumes.forEach((volume) => {
                layoutNodes.push({
                    id: volume,
                    position: { x: 0, y: 0},
                    data: { label: 'volume:' + volume },
                    //type: 'nodejs',
                    resizing: true,
                    parentId: 'volume-group',
                    extent:'parent'
                })
            });
        }

        const pathService = JSONPath({ path: '$.services', json: yamlObject })
        const serviceNodes = Object.keys(pathService[0])
        if (serviceNodes.length > 0) {
            hashMap.services.push(...serviceNodes)

            hashMap.services.forEach((service) => {
                layoutNodes.push({
                    id: service,
                    position: { x: 0, y: 0},
                    data: { label: 'services: '+service },
                    //type: 'nodejs',
                    resizing: true
                })

                const serviceNetworks = JSONPath({ path: `$.services.${ service }.networks`, json: yamlObject })

                serviceNetworks.forEach((serviceNwk: string[]) => {
                    serviceNwk.forEach(element => {
                        this.edges.push({
                            id: `edge-sn-${ service }-${ element }`,
                            source: service,
                            target: element,
                            animated: true
                        })
                    });
                })

                const serviceVolumes = JSONPath({ path: `$.services.${ service }.volumes`, json: yamlObject })

                serviceVolumes.forEach((volumes: string[]) => {
                    volumes.forEach(element => {
                        this.edges.push({
                            id: `edge-sv-${ service }-${ element }`,
                            source: service,
                            target: element.split(':')[0],
                            animated: true
                        })
                    })
                })

                console.log(serviceVolumes)
            });
        }

        const layouted = getLayoutedElements(layoutNodes, this.edges, 'TB')

        if (true) {

            this.nodes.push(...layouted.nodes)
            this.edges.push(...layouted.edges)
        }
        
        console.log(layouted)
        
    }
}