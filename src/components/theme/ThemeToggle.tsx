import { Button, Dropdown } from 'antd'
import { SunOutlined, MoonOutlined, DesktopOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { useTheme } from '../../context/ThemeContext'

export const ThemeToggle = () => {
  const { themeMode, setThemeMode } = useTheme()

  const getIcon = () => {
    switch (themeMode) {
      case 'light':
        return <SunOutlined />
      case 'dark':
        return <MoonOutlined />
      case 'system':
        return <DesktopOutlined />
      default:
        return <DesktopOutlined />
    }
  }

  const menuItems: MenuProps['items'] = [
    {
      key: 'light',
      icon: <SunOutlined />,
      label: 'Light',
      onClick: () => setThemeMode('light'),
    },
    {
      key: 'dark',
      icon: <MoonOutlined />,
      label: 'Dark',
      onClick: () => setThemeMode('dark'),
    },
    {
      key: 'system',
      icon: <DesktopOutlined />,
      label: 'System',
      onClick: () => setThemeMode('system'),
    },
  ]

  return (
    <Dropdown
      menu={{ items: menuItems, selectedKeys: [themeMode] }}
      placement="bottomRight"
      trigger={['click']}
    >
      <Button 
        type="text" 
        shape="circle" 
        icon={getIcon()}
        size="middle"
        className="flex items-center justify-center"
      />
    </Dropdown>
  )
}
