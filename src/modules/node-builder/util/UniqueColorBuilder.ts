import uniqolor from "uniqolor";
import { IUniqueColorBuilder } from "../../../interface/node-builder/util/IUniqueColorBuilder";

class UniqueColorBuilder implements IUniqueColorBuilder {
    generateUniqueColor(input: string | number): string {
        throw new Error("Method not implemented.");
    }
    reset(): void {
        throw new Error("Method not implemented.");
    }
    hasColor(input: string | number): boolean {
        throw new Error("Method not implemented.");
    }
    getUniqueColor(key: string): string {
        let rgbColor = uniqolor(key, { format: 'rgb' }).color
        rgbColor = rgbColor.replace('rgb(', '').replace(')', '')
        return `rgba(${rgbColor}, 0.4)`
    }
}

export default UniqueColorBuilder