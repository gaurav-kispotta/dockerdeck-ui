import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import type { ReactNode } from 'react';

const menuItems: MenuProps['items'] = [
    { key: 'add-network', label: 'Add Network' },
    { key: 'add-service', label: 'Add Service' },
    { type: 'divider' },
    { key: 'run', label: 'Run', disabled: true },
    { type: 'divider' },
    {
        key: 'build',
        label: 'Build',
        children: [
            { key: 'docker-compose', label: 'Docker Compose' },
            { key: 'docker-build', label: 'Docker Build' },
        ],
    },
];

export default function GlobalContextMenu({ children }: { children: ReactNode }) {
    return (
        <Dropdown menu={{ items: menuItems }} trigger={['contextMenu']}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative', overflow: 'hidden' }}>
                {children}
            </div>
        </Dropdown>
    );
}
