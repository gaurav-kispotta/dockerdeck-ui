import { useUploadFileContext } from "../../context/UploadedFileContext"

export default function StatusBar() {
    const { fileContent } = useUploadFileContext()
    return (
        <div>
            Status: { fileContent.toString() }
        </div>
    )
}