import ToolBox from "./toolbox/ToolBox";

export default function SideBar() {
    const toolbox = ['A', 'B', 'C', 'D', 'E', 'F']
    return (
        <div className="flex items-center justify-center">
            <ToolBox items={toolbox}></ToolBox>
        </div>
    )
}