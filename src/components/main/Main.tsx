import { useContextMenu } from "react-contexify";
import DesignDeck from "../deck/DesignDeck";
import SideBar from "../sidebar/SideBar";
import { useUploadFileContext } from "../../context/UploadedFileContext";
import { useEffect, useState } from "react";
import MapMaker from "../../modules/MapMaker";
import { Edge, Node } from "@xyflow/react";

const MENU_ID = "menu-id";

export default function Main() {
    const { show } = useContextMenu({
        id: MENU_ID
    });
    const { yamlObject } = useUploadFileContext()
    const [map, setMap] = useState<{ nodes: Node[], edges: Edge[] } | null>(null)

    function displayMenu(e: any) {
        // put whatever custom logic you need
        // you can even decide to not display the Menu
        show({
            event: e,
        });
    }

    useEffect(() => {
        console.log(yamlObject)
        const maker = new MapMaker();
        if (yamlObject) {
            maker.buildMap(yamlObject)
                .then(() => {
                    setMap({ nodes: maker.nodes, edges: maker.edges })
                })
        }
    }, [yamlObject])

    return (
        <div className='flex flex-row h-full'>
            <div className='w-1/4 overflow-scroll bg-slate-500'>
                <SideBar></SideBar>
            </div>
            <div id="docker-deck-ui" className='grow bg-slate-50' onContextMenu={displayMenu}>
                { map && <DesignDeck nodes={map.nodes} edges={map.edges} clear={map!== null}></DesignDeck> }
                { !map && <>Please load a docker-compose.yaml.</>}
            </div>
        </div>
    )
}