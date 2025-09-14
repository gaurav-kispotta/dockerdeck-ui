import { Collapse, CollapseProps } from "antd";
import Settings from "./settings/Settings";
import ToolBox from "./toolbox/ToolBox";
import CollapsableSettings from "./CollapsableSettings";

export default function SideBar() {
    const toolbox = ['A', 'B', 'C', 'D', 'E', 'F']
    const items: CollapseProps['items'] = [
        {
            key: 'settings',
            label: 'Settings',
            children: <Settings />,
        },
        {
            key: 'toolbox',
            label: 'Toolbox',
            children: <ToolBox items={toolbox} />,
        },
    ];
    return (
        <div className="flex flex-col w-full h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 space-y-4 overflow-y-auto">
            <Collapse
                    bordered={false}
                    items={items}
                    defaultActiveKey={['settings']}
                    destroyOnHidden={true}
                    expandIconPosition="end"
                    size="small"
                />
            <CollapsableSettings />
        </div>
    )
}