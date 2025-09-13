import uniqolor from "uniqolor";
import { IUniqueColorBuilder } from "../../../interface/node-builder/util/IUniqueColorBuilder";

class UniqueColorBuilder implements IUniqueColorBuilder {
    generateUniqueColor(input: string | number): string {
        return this.getUniqueColor(input.toString())
    }
    reset(): void {
        this.getUniqueColor('')
    }
    hasColor(input: string | number): boolean {
        return this.getUniqueColor(input.toString()) !== undefined
    }
    getUniqueColor(key: string): string {
        let rgbColor = uniqolor(key, { format: 'rgb' }).color
        rgbColor = rgbColor.replace('rgb(', '').replace(')', '')
        return `rgba(${rgbColor}, 0.4)`
    }
}

export default UniqueColorBuilder