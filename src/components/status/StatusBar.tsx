import { useUploadFileContext } from "../../context/UploadedFileContext"

export default function StatusBar() {
    const { yamlObject } = useUploadFileContext()

    const networkCounter = () => {
        let counter = 0
        if (yamlObject && yamlObject.networks) {
            counter = Object.keys(yamlObject.networks).length || 0
        }
        return counter
    }
    return (
        <div>
            Status: network:{ networkCounter() }
        </div>
    )
}