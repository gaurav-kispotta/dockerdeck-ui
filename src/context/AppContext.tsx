import { useState } from "react";
import GlobalContextMenu from "../components/context-menu/GlobalContextMenu";
import { FileContentType, UploadedFileContext } from "./UploadedFileContext";
import YamlObjectTransformer from "../modules/YamlObjectTransformer";

interface AppContextProp {
    children: any
}

export default function AppContext({ children }: AppContextProp) {
    const [yamlObject, setYamlObject] = useState<object | null>(null);

    function setContent(fc: FileContentType) {
        console.log('Processing uploaded file...')
        const yt = new YamlObjectTransformer()
        const yamlObject = yt.yamlToObjects(fc.toString())
        console.log('YAML object parsed:', yamlObject)
        setYamlObject(yamlObject)
    }

    return (
        <UploadedFileContext.Provider value={{ yamlObject, setContent }}>
            {children}
            <GlobalContextMenu></GlobalContextMenu>
        </UploadedFileContext.Provider>
    )
}