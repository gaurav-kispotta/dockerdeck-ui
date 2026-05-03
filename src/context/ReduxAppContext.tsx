import { ReactNode, useEffect } from 'react'
import { ConfigProvider, theme } from 'antd'
import { useAppSelector, useAppDispatch } from '../hooks/useReduxHooks'
import { updateSystemTheme, initializeTheme } from '../store/slices/themeSlice'
import GlobalContextMenu from '../components/context-menu/GlobalContextMenu'
import AppModal from '../components/modals/AppModal'
import { ModalProvider } from './ModalContext'

interface AppProviderProps {
  children: ReactNode
}

export default function AppProvider({ children }: AppProviderProps) {
  const dispatch = useAppDispatch()
  const { themeMode, isDark } = useAppSelector((state) => state.theme)

  useEffect(() => {
    dispatch(initializeTheme())
  }, [dispatch])

  useEffect(() => {
    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => dispatch(updateSystemTheme())
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [themeMode, dispatch])

  return (
    <ModalProvider>
      <ConfigProvider
        theme={{
          algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            colorPrimary: '#1890ff',
            borderRadius: 6,
          },
        }}
      >
        <AppModal />
        <GlobalContextMenu />
        {children}
      </ConfigProvider>
    </ModalProvider>
  )
}

