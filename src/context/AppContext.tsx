import { useState } from "react";
import GlobalContextMenu from "../components/context-menu/GlobalContextMenu";
import { FileContentType, UploadedFileContext } from "./UploadedFileContext";
import { getYamlObjects } from "../utils/yamlHelper";
import YamlObjectTransformer from "../modules/YamlObjectTransformer";

interface AppContextProp {
    children: any
}

export default function AppContext({ children }: AppContextProp) {
    const [yamlObject, setYamlObject] = useState<object | null>(null);

    function setContent(fc: FileContentType) {
        const yt = new YamlObjectTransformer()
        const yamlObject = yt.yamlToObjects(fc.toString())
        console.log(yamlObject)
        setYamlObject(yamlObject)
    }

    return (
        <UploadedFileContext.Provider value={{ yamlObject, setContent }}>
            {children}
            <GlobalContextMenu></GlobalContextMenu>
        </UploadedFileContext.Provider>
    )
}