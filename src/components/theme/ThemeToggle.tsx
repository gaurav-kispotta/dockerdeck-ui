import { Button, Dropdown } from 'antd'
import { SunOutlined, MoonOutlined, DesktopOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { setThemeMode } from '../../store/themeSlice'
import type { ThemeMode } from '../../store/themeSlice'

export const ThemeToggle = () => {
  const dispatch = useAppDispatch()
  const { themeMode } = useAppSelector((state) => state.theme)

  const handleSetThemeMode = (mode: ThemeMode) => {
    dispatch(setThemeMode(mode))
  }

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
      onClick: () => handleSetThemeMode('light'),
    },
    {
      key: 'dark',
      icon: <MoonOutlined />,
      label: 'Dark',
      onClick: () => handleSetThemeMode('dark'),
    },
    {
      key: 'system',
      icon: <DesktopOutlined />,
      label: 'System',
      onClick: () => handleSetThemeMode('system'),
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
