import uniqolor from "uniqolor";

class UniqueColorBuilder {
    getUniqueColor(key: string): string {
        let rgbColor = uniqolor(key, { format: 'rgb' }).color
        rgbColor = rgbColor.replace('rgb(', '').replace(')', '')
        return `rgba(${rgbColor}, 0.4)`
    }
}

export default UniqueColorBuilder