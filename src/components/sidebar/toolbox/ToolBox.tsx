import ToolBoxItem from "./ToolBoxItem"

type ToolBoxProp = {
    items: string[]
}

export default function ToolBox({ items }: ToolBoxProp) {
    return (
        <>
            <div className="grid sm:grid-cols-3 md:grid-cols-4 gap-5 m-5 ">
                {
                    items.map(t => (
                        <ToolBoxItem key={t}></ToolBoxItem>
                    ))
                }
            </div>
        </>
    )
}