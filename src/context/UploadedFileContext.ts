import { createContext, useContext } from "react";

export type FileContentType = string | ArrayBuffer;
export type YamlDockerCompose = {
    networks?: { [key: string]: {} },
    services?: { [key: string]: {} },
    volumes?: { [key: string]: {} },
    version?: string
}

export type UploadedFileContextType = {
    fileContent?: FileContentType,
    yamlObject?: YamlDockerCompose | null,
    setContent?: (fileContent: FileContentType) => void,
}
export const UploadedFileContext = createContext<UploadedFileContextType>({
    fileContent: '',
    setContent: () => {},
    yamlObject: {},
});

export const useUploadFileContext = () => useContext(UploadedFileContext);


/**
 * Uploading concepts:
 * 1. Read its content to a state object
 * 2. Convert the yaml to json object
 * 3. Convert the json object to Nodes & Edges
 */