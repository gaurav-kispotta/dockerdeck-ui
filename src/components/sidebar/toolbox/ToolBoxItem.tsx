import { Button } from 'antd'
import { HeartOutlined } from '@ant-design/icons'

export default function ToolBoxItem() {
    return (
        <Button 
            className="flex items-center justify-center w-16 h-16" 
            draggable
            shape="round"
            size="large"
            icon={<HeartOutlined />}
        />
    )
}