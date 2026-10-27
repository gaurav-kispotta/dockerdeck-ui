import { ReactNode, useEffect } from 'react'
import { ConfigProvider } from 'antd'
import { useAppSelector, useAppDispatch } from '../hooks/useReduxHooks'
import { updateSystemTheme, initializeTheme } from '../store/slices/themeSlice'
import AppModal from '../components/modals/AppModal'
import { ModalProvider } from './ModalContext'
import { antThemeConfig } from '../styles/tokens'

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
      <ConfigProvider theme={antThemeConfig(isDark)}>
        <AppModal />
        {children}
      </ConfigProvider>
    </ModalProvider>
  )
}

