import { createContext, useContext } from "react";

export type FileContentType = string | ArrayBuffer

export type UploadedFileContextType = {
    fileContent: FileContentType,
    yamlObject?: object,
    setFileContent: (fileContent: FileContentType) => void
}
export const UploadedFileContext = createContext<UploadedFileContextType>({
    fileContent: '',
    yamlObject: {},
    setFileContent: () => {}
});

export const useUploadFileContext = () => useContext(UploadedFileContext);


/**
 * Uploading concepts:
 * 1. Read its content to a state object
 * 2. Convert the yaml to json object
 * 3. Convert the json object to Nodes & Edges
 */