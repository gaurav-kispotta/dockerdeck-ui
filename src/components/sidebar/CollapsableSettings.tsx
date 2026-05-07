import { Collapse } from 'antd';

interface CollapsableSettingsProps {
    title?: string;
}

function CollapsableSettings({ title }: CollapsableSettingsProps) {
    return (
        <Collapse
            defaultActiveKey={['1']}
            items={[{
                key: '1',
                label: title ?? 'How do I create an account?',
                children: (
                    <p style={{ fontSize: 13, margin: 0 }}>
                        Click the &quot;Sign Up&quot; button in the top right corner and follow the registration process.
                    </p>
                ),
            }]}
        />
    );
}

export default CollapsableSettings;
