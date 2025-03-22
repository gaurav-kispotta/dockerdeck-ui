import { JSONPath } from "jsonpath-plus";
import { IPathParser } from "../interface/IPathParser";

export class JsonPathParser implements IPathParser {
    yamlObject: object;

    constructor(yamlObject: object) {
        this.yamlObject = yamlObject
    }

    public findPath(path: string): string[] {
        const parsedObject = JSONPath({ path, json: this.yamlObject });
        return parsedObject[0] || []
    }

    public findKeys(path: string): string[] {
        const parsedObject = this.findPath(path)
        return Object.keys(parsedObject)
    }
}