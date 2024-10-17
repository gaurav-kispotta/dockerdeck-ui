export class FileReaderModule {
    fileReader = new FileReader()

    constructor() {
    }

    public onChangeOfFileInput(event: any) {
        return new Promise<string>((resolve: any, reject: any) => {
            this.fileReader.onload = (event) => {
                //console.log(event.target?.result)
                if (event.target?.result) {
                    resolve(event.target?.result)
                } else {
                    reject(new Error("Error while reading file or file is empty"))
                }
            }
    
            this.fileReader.readAsText(event.target.files[0])
        })
    }
}