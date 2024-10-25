import { JSONPath } from "jsonpath-plus";

export class JsonPathParser {
    yamlObject: object;

    constructor(yamlObject: object) {
        this.yamlObject = yamlObject
    }

    public findJson(path: string) {
        const parsedObject = JSONPath({ path, json: this.yamlObject });
        return parsedObject[0]
    }

    public findKeys(path: string) {
        const parsedObject = this.findJson(path)
        return Object.keys(parsedObject)
    }
}