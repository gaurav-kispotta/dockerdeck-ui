import Settings from "./settings/Settings";
import ToolBox from "./toolbox/ToolBox";

export default function SideBar() {
    const toolbox = ['A', 'B', 'C', 'D', 'E', 'F']
    return (
        <div className="flex flex-col items-center justify-center w-fit">
            <Settings />
            <ToolBox items={toolbox} />
        </div>
    )
}