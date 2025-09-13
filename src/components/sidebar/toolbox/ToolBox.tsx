import { Card } from 'antd'
import ToolBoxItem from "./ToolBoxItem"

type ToolBoxProp = {
    items: string[]
}

export default function ToolBox({ items }: ToolBoxProp) {
    return (
        <Card title="Toolbox" size="small" className="m-4 theme-transition">
            <div className="grid grid-cols-3 gap-3">
                {
                    items.map(t => (
                        <ToolBoxItem key={t}></ToolBoxItem>
                    ))
                }
            </div>
        </Card>
    )
}