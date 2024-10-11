import { useState } from "react";
import GlobalContextMenu from "../components/context-menu/GlobalContextMenu";
import { FileContentType, UploadedFileContext } from "./UploadedFileContext";
import { getYamlObjects } from "../utils/yamlHelper";

interface AppContextProp {
    children: any
}

export default function AppContext({ children }: AppContextProp) {
    const [fileContent, setFileContentYaml] = useState<FileContentType>('default-empty');

    const setFileContent = (fc: FileContentType) => {
        const yamlObject = getYamlObjects(fc.toString() || '')
        setFileContentYaml(yamlObject);
    }

    return (
        <UploadedFileContext.Provider value={{ fileContent, setFileContent}}>
            { children }
            <GlobalContextMenu></GlobalContextMenu>
        </UploadedFileContext.Provider>
    )
}